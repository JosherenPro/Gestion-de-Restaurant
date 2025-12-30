from fastapi import APIRouter, Depends, Body, HTTPException, Path

from sqlmodel import Session
from app.core.database import get_session

from app.schemas.table import TableRead, TableCreate, TableUpdate
from app.services.table_service import (
    create_table, 
    read_table, 
    get_table_by_numero,
    delete_table,
    update_table,
    list_tables,
    occuper_table,
    liberer_table
)

router = APIRouter(
    prefix="/tables",
    tags=["Tables"]
)



@router.post("/", response_model=TableRead)
async def create_table_endpoint(
    session: Session = Depends(get_session),
    table_in: TableCreate = Body(...)
)-> any:
    """
    Créer une table
    """
    return create_table(session, table_in)

@router.get("/{table_id}", response_model=TableRead)
async def read_table_endpoint(
    session: Session = Depends(get_session),
    table_id: int = Path(...)
)-> any:
    """
    Récupérer une table par son ID
    """
    table = read_table(session, table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Table non trouvée")
    return table

@router.get("/numero/{numero_table}", response_model=TableRead)
async def read_table_by_numero_endpoint(
    session: Session = Depends(get_session),
    numero_table: str = Path(...)
)-> any:
    """
    Récupérer une table par son numéro
    """
    table = get_table_by_numero(session, numero_table)
    if not table:
        raise HTTPException(status_code=404, detail="Table non trouvée")
    return table

@router.delete("/{table_id}", response_model=TableRead)
async def delete_table_endpoint(
    session: Session = Depends(get_session),
    table_id: int = Path(...)
) -> any:
    """
    Supprimer une table
    """
    table = delete_table(session, table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Table non trouvée")
    return table

@router.put("/{table_id}", response_model=TableRead)
async def update_table_endpoint(
    session: Session = Depends(get_session),
    table_id: int = Path(...),
    table_in: TableUpdate = Body(...)
) -> any:
    """
    Mettre à jour une table
    """
    table = update_table(session, table_id, table_in)
    if not table:
        raise HTTPException(status_code=404, detail="Table non trouvée")
    return table

@router.get("/", response_model=list[TableRead])
async def list_tables_endpoint(
    session: Session = Depends(get_session)
) -> any:
    """
    Lister toutes les tables
    """
    return list_tables(session)

@router.post("/{table_id}/occuper", response_model=TableRead)
async def occuper_table_endpoint(
    table_id: int = Path(...),
    session: Session = Depends(get_session)
):
    """Marquer une table comme occupée."""
    table = occuper_table(session, table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Table non trouvée")
    return table

@router.post("/{table_id}/liberer", response_model=TableRead)
async def liberer_table_endpoint(
    table_id: int = Path(...),
    session: Session = Depends(get_session)
):
    """Marquer une table comme libre."""
    table = liberer_table(session, table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Table non trouvée")
    return table

@router.get("/qr/{qr_code}", response_model=TableRead)
async def read_table_by_qr_endpoint(
    qr_code: str = Path(...),
    session: Session = Depends(get_session)
):
    """Récupérer une table par son code QR."""
    from sqlmodel import select
    from app.models.table import RestaurantTable
    
    statement = select(RestaurantTable).where(RestaurantTable.qr_code == qr_code)
    table = session.exec(statement).first()
    if not table:
        raise HTTPException(status_code=404, detail="Code QR non reconnu")
    return table

    