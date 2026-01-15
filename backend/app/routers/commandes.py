from fastapi import APIRouter, Depends, Body, Path, HTTPException
from sqlmodel import Session
from app.core.database import get_session
from typing import List

from app.services.commande_service import (
    create_commande,
    read_commande,
    list_commandes,
    list_commandes_by_client,
    update_commande,
    delete_commande,
    add_ligne_commande,
    valider_commande,
    transmettre_cuisine,
    marquer_prete,
    marquer_servie,
    valider_reception,
    marquer_payee
)
from app.services.personnel_service import (
    get_serveur_by_utilisateur_id,
    get_cuisinier_by_utilisateur_id
)
from app.services.client_service import get_client_by_utilisateur_id
from app.security.auth import get_current_user
from app.models.utilisateur import Utilisateur
from app.security.rbac import allow_staff

from app.schemas.commande import (
    CommandeCreate,
    CommandeRead,
    CommandeUpdate
)
from app.schemas.ligne_commande import LigneCommandeCreate, LigneCommandeRead

router = APIRouter(
    prefix="/commandes",
    tags=["Commandes"]
)

@router.post("/", response_model=CommandeRead)
async def create_commande_endpoint(
    session: Session = Depends(get_session),
    commande_in: CommandeCreate = Body(...),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Créer une commande (lie automatiquement au client si connecté)."""
    if current_user.role.upper() == "CLIENT":
        client = get_client_by_utilisateur_id(session, current_user.id)
        if not client:
            raise HTTPException(status_code=400, detail="Profil client manquant.")
        commande_in.client_id = client.id
        
    return create_commande(session, commande_in)

@router.get("/{commande_id}", response_model=CommandeRead)
async def read_commande_endpoint(
    session: Session = Depends(get_session),
    commande_id: int = Path(...),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Récupérer une commande par son ID (avec vérification de propriété)."""
    commande = read_commande(session, commande_id)
    if not commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
        
    # Vérification de propriété pour les clients
    if current_user.role.upper() == "CLIENT":
        client = get_client_by_utilisateur_id(session, current_user.id)
        if not client or commande.client_id != client.id:
            raise HTTPException(status_code=403, detail="Accès non autorisé à cette commande.")
            
    return commande

@router.get("/", response_model=List[CommandeRead])
async def list_commandes_endpoint(
    session: Session = Depends(get_session),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Lister les commandes (filtrées pour les clients, toutes pour le staff)."""
    if current_user.role.upper() == "CLIENT":
        client = get_client_by_utilisateur_id(session, current_user.id)
        if not client:
            return []
        return list_commandes_by_client(session, client.id)
        
    return list_commandes(session)

@router.put("/{commande_id}", response_model=CommandeRead)
async def update_commande_endpoint(
    session: Session = Depends(get_session),
    commande_id: int = Path(...),
    commande_in: CommandeUpdate = Body(...),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Mettre à jour une commande (avec vérification de propriété)."""
    db_commande = read_commande(session, commande_id)
    if not db_commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
        
    if current_user.role.upper() == "CLIENT":
        client = get_client_by_utilisateur_id(session, current_user.id)
        if not client or db_commande.client_id != client.id:
            raise HTTPException(status_code=403, detail="Action non autorisée sur cette commande.")

    commande = update_commande(session, commande_id, commande_in)
    return commande

@router.delete("/{commande_id}", response_model=CommandeRead)
async def delete_commande_endpoint(
    session: Session = Depends(get_session),
    commande_id: int = Path(...),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Supprimer une commande (avec vérification de propriété)."""
    db_commande = read_commande(session, commande_id)
    if not db_commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
        
    if current_user.role.upper() == "CLIENT":
        client = get_client_by_utilisateur_id(session, current_user.id)
        if not client or db_commande.client_id != client.id:
            raise HTTPException(status_code=403, detail="Action non autorisée sur cette commande.")

    commande = delete_commande(session, commande_id)
    return commande

@router.post("/{commande_id}/lignes", response_model=LigneCommandeRead)
async def add_ligne_commande_endpoint(
    commande_id: int,
    ligne_in: LigneCommandeCreate,
    session: Session = Depends(get_session)
):
    if ligne_in.commande_id != commande_id:
        raise HTTPException(status_code=400, detail="ID commande incohérent")
    return add_ligne_commande(session, ligne_in)

@router.post("/{commande_id}/valider", response_model=CommandeRead)
async def valider_commande_endpoint(
    commande_id: int,
    serveur_id: int | None = None,
    session: Session = Depends(get_session),
    current_user = Depends(allow_staff)
):
    """Valider une commande par un serveur."""
    try:
        final_serveur_id = serveur_id
        
        # Si aucun serveur_id n'est passé, on prend celui de l'utilisateur actuel
        # Ou si le serveur_id passé correspond à un utilisateur_id (cas du frontend actuel)
        if final_serveur_id is None or final_serveur_id == current_user.id:
            serveur = get_serveur_by_utilisateur_id(session, current_user.id)
            if not serveur:
                 raise HTTPException(status_code=403, detail="L'utilisateur actuel n'a pas de profil serveur")
            final_serveur_id = serveur.id

        commande = valider_commande(session, commande_id, final_serveur_id)
        if not commande:
            raise HTTPException(status_code=404, detail="Commande non trouvée")
        return commande
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{commande_id}/preparer", response_model=CommandeRead)
async def transmettre_cuisine_endpoint(
    commande_id: int,
    session: Session = Depends(get_session)
):
    """Envoie la commande en cuisine."""
    try:
        commande = transmettre_cuisine(session, commande_id)
        if not commande:
            raise HTTPException(status_code=404, detail="Commande non trouvée")
        return commande
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{commande_id}/prete", response_model=CommandeRead)
async def marquer_prete_endpoint(
    commande_id: int,
    cuisinier_id: int | None = None,
    session: Session = Depends(get_session),
    current_user = Depends(allow_staff)
):
    """Marque la commande comme prête."""
    try:
        final_cuisinier_id = cuisinier_id
        
        # Résolution automatique du cuisinier_id
        if final_cuisinier_id is None or final_cuisinier_id == current_user.id or final_cuisinier_id == 1: # 1 est souvent un mock
            cuisinier = get_cuisinier_by_utilisateur_id(session, current_user.id)
            if not cuisinier:
                 raise HTTPException(status_code=403, detail="L'utilisateur actuel n'a pas de profil cuisinier")
            final_cuisinier_id = cuisinier.id

        commande = marquer_prete(session, commande_id, final_cuisinier_id)
        if not commande:
            raise HTTPException(status_code=404, detail="Commande non trouvée")
        return commande
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{commande_id}/servir", response_model=CommandeRead)
async def marquer_servie_endpoint(
    commande_id: int,
    session: Session = Depends(get_session)
):
    """Marque la commande comme servie."""
    try:
        commande = marquer_servie(session, commande_id)
        if not commande:
            raise HTTPException(status_code=404, detail="Commande non trouvée")
        return commande
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{commande_id}/receptionner", response_model=CommandeRead)
async def valider_reception_endpoint(
    commande_id: int,
    session: Session = Depends(get_session)
):
    """Le client valide la réception."""
    try:
        commande = valider_reception(session, commande_id)
        if not commande:
            raise HTTPException(status_code=404, detail="Commande non trouvée")
        return commande
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{commande_id}/payee", response_model=CommandeRead)
async def marquer_payee_endpoint(
    commande_id: int = Path(...),
    methode: str = "especes",
    session: Session = Depends(get_session)
):
    """Marquer une commande comme payée (action serveur)."""
    commande = marquer_payee(session, commande_id, methode)
    if not commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    return commande
