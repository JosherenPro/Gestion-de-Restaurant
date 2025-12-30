from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Dict, Any

from app.core.database import get_session
from app.security.rbac import allow_gerant
from app.services import admin_service
from app.schemas.utilisateur import UtilisateurRead

router = APIRouter(
    prefix="/admin",
    tags=["Administration Système"],
    dependencies=[Depends(allow_gerant)]
)

@router.patch("/users/{user_id}/status", response_model=UtilisateurRead)
def update_user_status(
    user_id: int, 
    active: bool, 
    session: Session = Depends(get_session)
):
    """Activer ou désactiver un compte utilisateur."""
    user = admin_service.toggle_user_active_status(session, user_id, active)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    return user

@router.get("/summary", response_model=Dict[str, Any])
def get_system_summary(session: Session = Depends(get_session)):
    """Obtenir une vue d'ensemble du système (Statistiques globales)."""
    return admin_service.get_system_summary(session)

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, session: Session = Depends(get_session)):
    """Supprimer définitivement un utilisateur."""
    success = admin_service.delete_user_permanently(session, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    return None
