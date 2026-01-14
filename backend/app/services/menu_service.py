from app.models.menu import Menu, ContenuMenu
from app.schemas.menu import MenuCreate, MenuRead, MenuUpdate, ContenuMenuCreate
from sqlmodel import Session, select
from typing import List

def create_menu(session: Session, menu_in: MenuCreate) -> Menu:
    """Créer un nouveau menu."""
    menu = Menu.model_validate(menu_in)
    session.add(menu)
    session.commit()
    session.refresh(menu)
    return menu

def read_menu(session: Session, menu_id: int) -> MenuRead | None:
    """Récupérer un menu par son ID."""
    menu = session.get(Menu, menu_id)
    if not menu:
        return None
    return MenuRead.model_validate(menu)

def list_menus(session: Session, skip: int = 0, limit: int = 100) -> List[Menu]:
    """Lister tous les menus."""
    statement = select(Menu).offset(skip).limit(limit)
    return session.exec(statement).all()

def update_menu(session: Session, menu_id: int, menu_in: MenuUpdate) -> MenuRead | None:
    """Mettre à jour un menu."""
    db_menu = session.get(Menu, menu_id)
    if not db_menu:
        return None
    menu_data = menu_in.model_dump(exclude_unset=True)
    db_menu.sqlmodel_update(menu_data)
    session.add(db_menu)
    session.commit()
    session.refresh(db_menu)
    return db_menu

def delete_menu(session: Session, menu_id: int) -> Menu | None:
    """Supprimer un menu."""
    db_menu = session.get(Menu, menu_id)
    if not db_menu:
        return None
    session.delete(db_menu)
    session.commit()
    return db_menu

def add_plat_to_menu(session: Session, menu_id: int, plat_id: int) -> ContenuMenu:
    """Ajouter un plat à un menu."""
    contenu = ContenuMenu(menu_id=menu_id, plat_id=plat_id)
    session.add(contenu)
    session.commit()
    session.refresh(contenu)
    return contenu

def remove_plat_from_menu(session: Session, menu_id: int, plat_id: int) -> bool:
    """Retirer un plat d'un menu."""
    statement = select(ContenuMenu).where(ContenuMenu.menu_id == menu_id, ContenuMenu.plat_id == plat_id)
    contenu = session.exec(statement).first()
    if contenu:
        session.delete(contenu)
        session.commit()
        return True
    return False