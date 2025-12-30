from sqlmodel import Session, select, func
from typing import List, Dict
from app.models.commande import Commande, CommandeStatus
from app.models.paiement import Paiement, PaymentStatus
from app.models.avis import Avis
from app.models.plat import Plat
from app.models.ligne_commande import LigneCommande
from app.schemas.stats import GlobalStats, DishPopularity, RevenueByPeriod

def get_global_stats(session: Session) -> GlobalStats:
    """Calcule les indicateurs clés globaux."""
    # Chiffre d'affaires (Somme des paiements réussis)
    ca_total = session.exec(select(func.sum(Paiement.montant)).where(Paiement.statut == PaymentStatus.REUSSI)).one() or 0.0
    
    # Nombre de commandes payées
    nb_commandes = session.exec(select(func.count(Commande.id)).where(Commande.status == CommandeStatus.PAYEE)).one() or 0
    
    # Note moyenne des avis
    moyenne_avis = session.exec(select(func.avg(Avis.note))).one() or 0.0
    
    return GlobalStats(
        chiffre_affaires_total=ca_total,
        nombre_commandes=nb_commandes,
        note_moyenne=round(moyenne_avis, 2)
    )

def get_top_plats(session: Session, limit: int = 5) -> List[DishPopularity]:
    """Récupère les plats les plus populaires par quantité vendue."""
    statement = (
        select(Plat.id, Plat.nom, func.sum(LigneCommande.quantite).label("total_vendu"))
        .join(LigneCommande, LigneCommande.plat_id == Plat.id)
        .join(Commande, LigneCommande.commande_id == Commande.id)
        .where(Commande.status == CommandeStatus.PAYEE)
        .group_by(Plat.id, Plat.nom)
        .order_by(func.sum(LigneCommande.quantite).desc())
        .limit(limit)
    )
    
    results = session.exec(statement).all()
    
    return [
        DishPopularity(plat_id=r[0], nom=r[1], quantite_vendue=r[2])
        for r in results
    ]

def get_revenue_by_period(session: Session) -> List[RevenueByPeriod]:
    """Récupère le revenu par jour sur les derniers jours (Simplifié)."""
    # Note: En production on utiliserait date_trunc en PostgreSQL
    # Ici on fait une agrégation simple
    statement = (
        select(func.date(Paiement.date_paiement), func.sum(Paiement.montant))
        .where(Paiement.statut == PaymentStatus.REUSSI)
        .group_by(func.date(Paiement.date_paiement))
        .order_by(func.date(Paiement.date_paiement).desc())
        .limit(7)
    )
    results = session.exec(statement).all()
    return [
        RevenueByPeriod(periode=str(r[0]), revenu=r[1])
        for r in results
    ]
