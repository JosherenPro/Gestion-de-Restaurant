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
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Restaurant API")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://gestion-de-restaurant.onrender.com",
        "https://gestion-de-restaurant-five.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Monter le dossier static pour servir les images
# Utiliser le chemin absolu pour fonctionner correctement quel que soit le répertoire de travail
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
os.makedirs(os.path.join(STATIC_DIR, "uploads"), exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

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
