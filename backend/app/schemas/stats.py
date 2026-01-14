from pydantic import BaseModel
from typing import List

class GlobalStats(BaseModel):
    chiffre_affaires_total: float
    nombre_commandes: int
    nombre_clients: int
    note_moyenne: float | None = 0.0

class DishPopularity(BaseModel):
    plat_id: int
    nom: str
    quantite_vendue: int

class RevenueByPeriod(BaseModel):
    periode: str
    revenu: float

class StatsDashboard(BaseModel):
    global_kpis: GlobalStats
    top_plats: List[DishPopularity]
