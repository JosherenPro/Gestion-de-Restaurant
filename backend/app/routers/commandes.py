from fastapi import APIRouter, Depends, Body, Path, HTTPException
from sqlmodel import Session
from app.core.database import get_session
from typing import List

from app.services.commande_service import (
    create_commande,
    read_commande,
    list_commandes,
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
    commande_in: CommandeCreate = Body(...)
):
    return create_commande(session, commande_in)

@router.get("/{commande_id}", response_model=CommandeRead)
async def read_commande_endpoint(
    session: Session = Depends(get_session),
    commande_id: int = Path(...)
):
    commande = read_commande(session, commande_id)
    if not commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    return commande

@router.get("/", response_model=List[CommandeRead])
async def list_commandes_endpoint(
    session: Session = Depends(get_session)
):
    return list_commandes(session)

@router.put("/{commande_id}", response_model=CommandeRead)
async def update_commande_endpoint(
    session: Session = Depends(get_session),
    commande_id: int = Path(...),
    commande_in: CommandeUpdate = Body(...)
):
    commande = update_commande(session, commande_id, commande_in)
    if not commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    return commande

@router.delete("/{commande_id}", response_model=CommandeRead)
async def delete_commande_endpoint(
    session: Session = Depends(get_session),
    commande_id: int = Path(...)
):
    commande = delete_commande(session, commande_id)
    if not commande:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
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
    serveur_id: int,
    session: Session = Depends(get_session)
):
    """Valider une commande par un serveur."""
    try:
        commande = valider_commande(session, commande_id, serveur_id)
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
    cuisinier_id: int,
    session: Session = Depends(get_session)
):
    """Marque la commande comme prête."""
    try:
        commande = marquer_prete(session, commande_id, cuisinier_id)
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
