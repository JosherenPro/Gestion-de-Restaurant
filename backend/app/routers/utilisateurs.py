from fastapi import APIRouter, Depends, Body, Path, HTTPException, BackgroundTasks
from sqlmodel import Session
from app.core.database import get_session
from app.services.utilisateur_service import (
    delete_utilisateur,
    update_utilisateur,
    list_utilisateurs,
    read_utilisateur,
    create_utilisateur,
    get_utilisateur_by_email
)       
from app.schemas.utilisateur import (
    UtilisateurCreate,
    UtilisateurRead,
    UtilisateurUpdate
)

router = APIRouter(
    prefix="/utilisateurs",
    tags=["Utilisateurs"]
)

@router.post("/", response_model=UtilisateurRead)
async def create_utilisateur_endpoint(
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    utilisateur_in: UtilisateurCreate = Body(...)
):
    """
    Créer un nouvel utilisateur.
    """
    try:
        return create_utilisateur(session, utilisateur_in, background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{utilisateur_id}", response_model=UtilisateurRead)
async def read_utilisateur_endpoint(
    session: Session = Depends(get_session),
    utilisateur_id: int = Path(...)
) -> any:
    """
    Récupérer un utilisateur par son ID
    """
    utilisateur = read_utilisateur(session, utilisateur_id)
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return utilisateur


@router.get("/email/{email}", response_model=UtilisateurRead)
async def read_utilisateur_by_email_endpoint(
    session: Session = Depends(get_session),
    email: str = Path(...)
) -> any:
    """
    Récupérer un utilisateur par son email
    """
    utilisateur = get_utilisateur_by_email(session, email)
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return utilisateur


@router.delete("/{utilisateur_id}", response_model=UtilisateurRead)
async def delete_utilisateur_endpoint(
    session: Session = Depends(get_session),
    utilisateur_id: int = Path(...)
) -> any:
    """
    Supprimer un utilisateur
    """
    utilisateur = delete_utilisateur(session, utilisateur_id)
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return utilisateur


@router.put("/{utilisateur_id}", response_model=UtilisateurRead)
async def update_utilisateur_endpoint(
    session: Session = Depends(get_session),
    utilisateur_id: int = Path(...),
    utilisateur_in: UtilisateurUpdate = Body(...)
) -> any:
    """
    Mettre à jour un utilisateur
    """
    utilisateur = update_utilisateur(session, utilisateur_id, utilisateur_in)
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return utilisateur


@router.get("/", response_model=list[UtilisateurRead])
def list_utilisateurs_endpoint(
    session: Session = Depends(get_session)
) -> any:
    """
    Lire tous les utilisateurs
    """
    return list_utilisateurs(session)


