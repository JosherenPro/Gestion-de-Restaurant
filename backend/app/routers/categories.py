from fastapi import APIRouter, Depends, Body, Path, HTTPException
from sqlmodel import Session
from app.core.database import get_session
from typing import List

from app.services.categorie_service import (
    create_categorie,
    read_categorie,
    list_categories,
    update_categorie,
    delete_categorie
)

from app.schemas.categorie import (
    CategorieCreate,
    CategorieRead,
    CategorieUpdate
)

from app.security.rbac import allow_gerant, allow_staff

router = APIRouter(
    prefix="/categories",
    tags=["Catégories"]
)

@router.post("/", response_model=CategorieRead, dependencies=[Depends(allow_gerant)])
async def create_categorie_endpoint(
    session: Session = Depends(get_session),
    categorie_in: CategorieCreate = Body(...)
):
    """Créer une nouvelle catégorie de menu."""
    return create_categorie(session, categorie_in)

@router.get("/{categorie_id}", response_model=CategorieRead)
async def read_categorie_endpoint(
    session: Session = Depends(get_session),
    categorie_id: int = Path(...)
):
    """Récupérer une catégorie par son ID."""
    categorie = read_categorie(session, categorie_id)
    if not categorie:
        raise HTTPException(status_code=404, detail="Catégorie non trouvée")
    return categorie

@router.get("/", response_model=List[CategorieRead])
async def list_categories_endpoint(
    session: Session = Depends(get_session)
):
    """Lister toutes les catégories."""
    return list_categories(session)

@router.put("/{categorie_id}", response_model=CategorieRead, dependencies=[Depends(allow_gerant)])
async def update_categorie_endpoint(
    session: Session = Depends(get_session),
    categorie_id: int = Path(...),
    categorie_in: CategorieUpdate = Body(...)
):
    """Mettre à jour une catégorie."""
    categorie = update_categorie(session, categorie_id, categorie_in)
    if not categorie:
        raise HTTPException(status_code=404, detail="Catégorie non trouvée")
    return categorie

@router.delete("/{categorie_id}", response_model=CategorieRead, dependencies=[Depends(allow_gerant)])
async def delete_categorie_endpoint(
    session: Session = Depends(get_session),
    categorie_id: int = Path(...)
):
    """Supprimer une catégorie."""
    categorie = delete_categorie(session, categorie_id)
    if not categorie:
        raise HTTPException(status_code=404, detail="Catégorie non trouvée")
    return categorie
