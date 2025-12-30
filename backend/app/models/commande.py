from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone
from enum import Enum
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.avis import Avis
    from app.models.client import Client
    from app.models.cuisinier import Cuisinier
    from app.models.serveur import Serveur
    from app.models.table import RestaurantTable
    from app.models.ligne_commande import LigneCommande
    from app.models.paiement import Paiement


class CommandeStatus(str, Enum):
    EN_ATTENTE: str = "en_attente"
    APPROUVEE: str = "approuvee"
    EN_COURS: str = "en_cours"
    PRETE: str = "prete"
    SERVIE: str = "servie"
    RECEPTIONNEE: str = "receptionnee"
    PAYEE: str = "payee"
    LIVREE: str = "livree"
    ANNULEE: str = "annulee"


class CommandeBase(SQLModel):
    client_id: int = Field(foreign_key="client.id")
    table_id: int = Field(foreign_key="table.id")
    serveur_id: int | None = Field(default=None, foreign_key="serveur.id")
    cuisinier_id: int | None = Field(default=None, foreign_key="cuisinier.id")
    status: CommandeStatus = Field(default=CommandeStatus.EN_ATTENTE)
    montant_total: int
    type_commande: str
    notes: str | None = None


class Commande(CommandeBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    date_commande: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    table: "RestaurantTable" = Relationship(back_populates="commandes")
    lignes: List["LigneCommande"] = Relationship(back_populates="commande")
    paiement: "Paiement" = Relationship(back_populates="commande")
    serveur: "Serveur" = Relationship(back_populates="commandes")
    cuisinier: "Cuisinier" = Relationship(back_populates="commandes")
    client: "Client" = Relationship(back_populates="commandes")
    avis: "Avis" = Relationship(back_populates="commande")
