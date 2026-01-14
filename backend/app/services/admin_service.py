from sqlmodel import Session, select, func
from typing import Dict, Any

from app.models.utilisateur import Utilisateur
from app.models.client import Client
from app.models.personnel import Personnel
from app.models.commande import Commande
from app.models.table import RestaurantTable

def toggle_user_active_status(session: Session, user_id: int, active: bool) -> Utilisateur | None:
    """Active ou désactive un utilisateur."""
    user = session.get(Utilisateur, user_id)
    if not user:
        return None
    
    user.active = active
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def get_system_summary(session: Session) -> Dict[str, Any]:
    """Récupère un résumé global du système."""
    return {
        "total_utilisateurs": session.exec(select(func.count(Utilisateur.id))).one(),
        "total_clients": session.exec(select(func.count(Client.id))).one(),
        "total_personnel": session.exec(select(func.count(Personnel.id))).one(),
        "total_commandes": session.exec(select(func.count(Commande.id))).one(),
        "total_tables": session.exec(select(func.count(RestaurantTable.id))).one(),
    }

def delete_user_permanently(session: Session, user_id: int) -> bool:
    """Suppression définitive d'un utilisateur (Action critique)."""
    user = session.get(Utilisateur, user_id)
    if not user:
        return False
    
    session.delete(user)
    session.commit()
    return True
