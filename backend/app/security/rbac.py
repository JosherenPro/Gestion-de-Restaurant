from fastapi import Depends, HTTPException, status
from app.models.utilisateur import Utilisateur
from app.security.auth import get_current_user
from typing import List

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: Utilisateur = Depends(get_current_user)):
        if user.role.lower() not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'avez pas les permissions nécessaires pour cette action."
            )
        return user

# Dépendances prêtes à l'emploi
allow_gerant = RoleChecker(["gerant"])
allow_staff = RoleChecker(["gerant", "serveur", "cuisinier"])
allow_authenticated = RoleChecker(["gerant", "serveur", "cuisinier", "client"])
allow_gerant_or_cuisinier = RoleChecker(["gerant", "cuisinier"])

