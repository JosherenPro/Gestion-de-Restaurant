from app.models.table import RestaurantTable, TableStatus
from app.schemas.table import TableCreate, TableRead, TableUpdate

from sqlmodel import Session, select
from typing import List

def create_table(session: Session, table_in: TableCreate) -> RestaurantTable:
    """Créer une nouvelle table dans la base de données."""
    table = RestaurantTable(
        numero_table=table_in.numero_table,
        capacite=table_in.capacite,
        statut=table_in.statut,
        qr_code=table_in.qr_code
    )
    session.add(table)
    session.commit()
    session.refresh(table)
    return table


def read_table(session: Session, table_id: int) -> TableRead | None:
    """Récupérer une table par son ID."""
    table = session.get(RestaurantTable, table_id)
    if not table:
        return None
    return TableRead.model_validate(table)


def get_table_by_numero(session: Session, numero: str) -> TableRead | None:
    """Récupérer une table par son numéro."""
    statement = select(RestaurantTable).where(RestaurantTable.numero_table == numero)
    table = session.exec(statement).first()
    if table:
        return TableRead.model_validate(table)
    return None


def delete_table(session: Session, table_id: int) -> RestaurantTable | None:
    """Supprimer une table par son ID."""
    table = session.get(RestaurantTable, table_id)
    if table:
        session.delete(table)
        session.commit()
        return table 
    return None


def update_table(
    session: Session,
    table_id: int,
    table_in: TableUpdate
) -> TableRead | None:
    """Mettre à jour les informations sur une table."""
    table = session.get(RestaurantTable, table_id)
    if not table: 
        return None

    updates = table_in.model_dump(exclude_unset=True)
    table.sqlmodel_update(updates)
    
    session.add(table)
    session.commit()
    session.refresh(table)
    return table


def list_tables(session: Session, skip: int = 0, limit: int = 100) -> List[RestaurantTable]:
    """Lister toutes les tables."""
    statement = select(RestaurantTable).offset(skip).limit(limit)
    return session.exec(statement).all()

def occuper_table(session: Session, table_id: int) -> RestaurantTable | None:
    """Marquer une table comme occupée."""
    table = session.get(RestaurantTable, table_id)
    if not table:
        return None
    table.statut = TableStatus.OCCUPEE
    session.add(table)
    session.commit()
    session.refresh(table)
    return table

def liberer_table(session: Session, table_id: int) -> RestaurantTable | None:
    """Marquer une table comme libre."""
    table = session.get(RestaurantTable, table_id)
    if not table:
        return None
    table.statut = TableStatus.LIBRE
    session.add(table)
    session.commit()
    session.refresh(table)
    return table