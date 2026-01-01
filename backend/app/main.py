from fastapi import FastAPI
import app.models
from app.routers import (
    utilisateurs,
    auth,
    clients,
    personnel,
    commandes,
    tables,
    menus,
    reservations,
    avis,
    paiements,
    plats,
    categories,
    stats,
    admin
)
from app.core.database import create_db_and_tables
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="Restaurant API")

# Monter le dossier static pour servir les images
os.makedirs("app/static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# Enregistrement des routers
app.include_router(utilisateurs.router)
app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(personnel.router)
app.include_router(commandes.router)
app.include_router(tables.router)
app.include_router(menus.router)
app.include_router(reservations.router)
app.include_router(avis.router)
app.include_router(paiements.router)
app.include_router(plats.router)
app.include_router(categories.router)
app.include_router(stats.router)
app.include_router(admin.router)
