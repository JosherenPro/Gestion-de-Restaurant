from fastapi import APIRouter, Depends, Body, Path, HTTPException
from sqlmodel import Session
from app.core.database import get_session

from app.services.menu_service import (
    delete_menu,
    update_menu,
    list_menus,
    read_menu,
    create_menu,
    add_plat_to_menu,
    remove_plat_from_menu
)       

from app.schemas.menu import (
    MenuCreate,
    MenuRead,
    MenuUpdate
)

router = APIRouter(
    prefix="/menus",
    tags=["Menus"]
)

@router.post("/", response_model=MenuRead)
async def create_menu_endpoint(
    session: Session = Depends(get_session),
    menu_in: MenuCreate = Body(...)
):
    return create_menu(session, menu_in)

@router.get("/{menu_id}", response_model=MenuRead)
async def read_menu_endpoint(
    session: Session = Depends(get_session),
    menu_id: int = Path(...)
):
    menu = read_menu(session, menu_id)
    if not menu:
        raise HTTPException(status_code=404, detail="Menu non trouvé")
    return menu

@router.get("/", response_model=list[MenuRead])
async def list_menus_endpoint(
    session: Session = Depends(get_session)
):
    return list_menus(session)

@router.put("/{menu_id}", response_model=MenuRead)
async def update_menu_endpoint(
    session: Session = Depends(get_session),
    menu_id: int = Path(...),
    menu_in: MenuUpdate = Body(...)
):
    menu = update_menu(session, menu_id, menu_in)
    if not menu:
        raise HTTPException(status_code=404, detail="Menu non trouvé")
    return menu

@router.delete("/{menu_id}", response_model=MenuRead)
async def delete_menu_endpoint(
    session: Session = Depends(get_session),
    menu_id: int = Path(...)
):
    menu = delete_menu(session, menu_id)
    if not menu:
        raise HTTPException(status_code=404, detail="Menu non trouvé")
    return menu

@router.post("/{menu_id}/plats/{plat_id}")
async def add_plat_to_menu_endpoint(
    menu_id: int,
    plat_id: int,
    session: Session = Depends(get_session)
):
    return add_plat_to_menu(session, menu_id, plat_id)

@router.delete("/{menu_id}/plats/{plat_id}")
async def remove_plat_from_menu_endpoint(
    menu_id: int,
    plat_id: int,
    session: Session = Depends(get_session)
):
    success = remove_plat_from_menu(session, menu_id, plat_id)
    if not success:
        raise HTTPException(status_code=404, detail="Association non trouvée")
    return {"message": "Plat retiré du menu"}
