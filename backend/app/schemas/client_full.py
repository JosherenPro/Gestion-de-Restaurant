from app.schemas.utilisateur import UtilisateurCreate, UtilisateurRead
from app.schemas.client import ClientRead

class ClientCreateFull(UtilisateurCreate):
    """Schema pour créer un utilisateur et un client en une seule fois."""
    pass

class ClientReadFull(ClientRead):
    """Schema pour lire un client avec ses infos utilisateur."""
    utilisateur: UtilisateurRead
