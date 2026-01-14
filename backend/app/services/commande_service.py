from app.models.commande import Commande, CommandeStatus
from app.models.ligne_commande import LigneCommande
from app.schemas.commande import CommandeCreate, CommandeRead, CommandeUpdate
from app.schemas.ligne_commande import LigneCommandeCreate
from sqlmodel import Session, select
from typing import List

def create_commande(session: Session, commande_in: CommandeCreate) -> Commande:
    """Créer une nouvelle commande."""
    commande = Commande.model_validate(commande_in)
    session.add(commande)
    session.commit()
    session.refresh(commande)
    return commande

def read_commande(session: Session, commande_id: int) -> CommandeRead | None:
    """Récupérer une commande par son ID."""
    commande = session.get(Commande, commande_id)
    if not commande:
        return None
    return CommandeRead.model_validate(commande)

def list_commandes(session: Session, skip: int = 0, limit: int = 100) -> List[Commande]:
    """Lister toutes les commandes."""
    statement = select(Commande).offset(skip).limit(limit)
    return session.exec(statement).all()

def update_commande(session: Session, commande_id: int, commande_in: CommandeUpdate) -> CommandeRead | None:
    """Mettre à jour une commande."""
    db_commande = session.get(Commande, commande_id)
    if not db_commande:
        return None
    commande_data = commande_in.model_dump(exclude_unset=True)
    db_commande.sqlmodel_update(commande_data)
    session.add(db_commande)
    session.commit()
    session.refresh(db_commande)
    return db_commande

def delete_commande(session: Session, commande_id: int) -> Commande | None:
    """Supprimer une commande."""
    db_commande = session.get(Commande, commande_id)
    if not db_commande:
        return None
    session.delete(db_commande)
    session.commit()
    return db_commande

def add_ligne_commande(session: Session, ligne_in: LigneCommandeCreate) -> LigneCommande:
    """Ajouter une ligne à une commande (récupère le prix si besoin)."""
    from app.models.plat import Plat
    
    ligne = LigneCommande.model_validate(ligne_in)
    
    # Si le prix_unitaire n'est pas fourni (ex: 0), on le récupère du plat
    if not ligne.prix_unitaire or ligne.prix_unitaire == 0:
        if ligne.plat_id:
            plat = session.get(Plat, ligne.plat_id)
            if plat:
                ligne.prix_unitaire = plat.prix
        elif ligne.menu_id:
            from app.models.menu import Menu
            menu = session.get(Menu, ligne.menu_id)
            if menu:
                ligne.prix_unitaire = menu.prix_fixe

    session.add(ligne)
    session.commit()
    session.refresh(ligne)
    # Re-calculer le montant total de la commande
    update_montant_total(session, ligne.commande_id)
    return ligne

def update_montant_total(session: Session, commande_id: int):
    """Calcule et met à jour le montant total d'une commande."""
    commande = session.get(Commande, commande_id)
    if commande:
        total = sum(l.prix_unitaire * l.quantite for l in commande.lignes)
        commande.montant_total = total
        session.add(commande)
        session.commit()

def valider_commande(session: Session, commande_id: int, serveur_id: int) -> Commande | None:
    """Valider une commande par un serveur."""
    commande = session.get(Commande, commande_id)
    if not commande:
        return None
    
    if commande.status != CommandeStatus.EN_ATTENTE:
        raise ValueError(f"Impossible de valider une commande avec le statut: {commande.status}")
    
    commande.status = CommandeStatus.APPROUVEE
    commande.serveur_id = serveur_id
    
    session.add(commande)
    session.commit()
    session.refresh(commande)
    return commande

def transmettre_cuisine(session: Session, commande_id: int) -> Commande | None:
    """Passer la commande en cuisine (APPROUVEE -> EN_COURS)."""
    commande = session.get(Commande, commande_id)
    if not commande:
        return None
    if commande.status != CommandeStatus.APPROUVEE:
        raise ValueError(f"Action invalide pour le statut: {commande.status}")
    
    commande.status = CommandeStatus.EN_COURS
    session.add(commande)
    session.commit()
    session.refresh(commande)
    return commande

def marquer_prete(session: Session, commande_id: int, cuisinier_id: int) -> Commande | None:
    """Marquer la commande comme prête (EN_COURS -> PRETE)."""
    commande = session.get(Commande, commande_id)
    if not commande:
        return None
    if commande.status != CommandeStatus.EN_COURS:
        raise ValueError(f"Action invalide pour le statut: {commande.status}")
    
    commande.status = CommandeStatus.PRETE
    commande.cuisinier_id = cuisinier_id
    session.add(commande)
    session.commit()
    session.refresh(commande)
    return commande

def marquer_servie(session: Session, commande_id: int) -> Commande | None:
    """Marquer la commande comme servie (PRETE -> SERVIE)."""
    commande = session.get(Commande, commande_id)
    if not commande:
        return None
    if commande.status != CommandeStatus.PRETE:
        raise ValueError(f"Action invalide pour le statut: {commande.status}")
    
    commande.status = CommandeStatus.SERVIE
    session.add(commande)
    session.commit()
    session.refresh(commande)
    return commande

def valider_reception(session: Session, commande_id: int) -> Commande | None:
    """Le client valide la réception de sa commande (SERVIE -> RECEPTIONNEE)."""
    commande = session.get(Commande, commande_id)
    if not commande:
        return None
    if commande.status != CommandeStatus.SERVIE:
        raise ValueError(f"Action invalide pour le statut: {commande.status}")
    
    commande.status = CommandeStatus.RECEPTIONNEE
    session.add(commande)
    session.commit()
    session.refresh(commande)
    return commande

def marquer_payee(session: Session, commande_id: int, methode: str = "especes") -> Commande | None:
    """Marquer une commande comme payée par un serveur."""
    from app.models.paiement import Paiement, PaymentStatus, PaymentMethod
    commande = session.get(Commande, commande_id)
    if not commande:
        return None
    
    # Mettre à jour le statut de la commande
    commande.status = CommandeStatus.PAYEE
    
    # Mettre à jour le statut de toutes les lignes de commande
    for ligne in commande.lignes:
        ligne.statut = "payee"
        session.add(ligne)
        
    session.add(commande)
    
    # Créer le record de paiement
    paiement = Paiement(
        commande_id=commande.id,
        montant=commande.montant_total,
        methode_paiement=PaymentMethod(methode),
        statut=PaymentStatus.REUSSI
    )
    session.add(paiement)
    
    session.commit()
    session.refresh(commande)
    return commande
