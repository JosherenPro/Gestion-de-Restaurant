from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.database import get_session
from typing import List
from app.schemas.stats import GlobalStats, DishPopularity, RevenueByPeriod, StatsDashboard
from app.services.stats_service import get_global_stats, get_top_plats, get_revenue_by_period

from app.security.rbac import allow_gerant

router = APIRouter(
    prefix="/stats",
    tags=["Statistiques"],
    dependencies=[Depends(allow_gerant)]
)

@router.get("/global", response_model=GlobalStats)
async def read_global_stats(session: Session = Depends(get_session)):
    """Récupérer les indicateurs clés de performance (KPIs)."""
    return get_global_stats(session)

@router.get("/top-plats", response_model=List[DishPopularity])
async def read_top_plats(limit: int = 5, session: Session = Depends(get_session)):
    """Récupérer le top des plats les plus vendus."""
    return get_top_plats(session, limit)

@router.get("/revenue", response_model=List[RevenueByPeriod])
async def read_revenue_stats(session: Session = Depends(get_session)):
    """Récupérer l'évolution du chiffre d'affaires."""
    return get_revenue_by_period(session)

@router.get("/dashboard", response_model=StatsDashboard)
async def read_dashboard(session: Session = Depends(get_session)):
    """Récupérer une vue d'ensemble combinée pour le tableau de bord."""
    return StatsDashboard(
        global_kpis=get_global_stats(session),
        top_plats=get_top_plats(session)
    )
