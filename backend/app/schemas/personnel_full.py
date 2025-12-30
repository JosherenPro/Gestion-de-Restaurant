from app.schemas.utilisateur import UtilisateurCreate
from app.schemas.personnel import PersonnelRead
from app.schemas.gerant import GerantRead
from app.schemas.serveur import ServeurRead
from app.schemas.cuisinier import cuisinierRead

class PersonnelCreateFull(UtilisateurCreate):
    """Schema de base pour tout personnel."""
    pass

class GerantCreateFull(UtilisateurCreate):
    pass

class ServeurCreateFull(UtilisateurCreate):
    pass

class CuisinierCreateFull(UtilisateurCreate):
    pass
