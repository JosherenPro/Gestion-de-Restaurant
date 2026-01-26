"""
Router pour le Chat IA - Questions sur les plats
"""
from fastapi import APIRouter, Depends, Body
from sqlmodel import Session
from pydantic import BaseModel
from typing import Optional, List

from app.core.database import get_session
from app.services.plat_service import list_plats
from app.services.chat_service import get_ai_response, get_fallback_response

router = APIRouter(
    prefix="/chat",
    tags=["Chat IA"]
)


class ChatMessage(BaseModel):
    role: str  # "user" ou "assistant"
    content: str


class ChatRequest(BaseModel):
    question: str
    plat_id: Optional[int] = None  # Si question spécifique à un plat
    conversation_history: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    success: bool
    response: str
    model: Optional[str] = None
    error: Optional[str] = None


@router.post("/", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest = Body(...),
    session: Session = Depends(get_session)
):
    """
    Endpoint pour le chat IA
    
    Envoie une question et reçoit une réponse de l'assistant IA
    basée sur le menu du restaurant
    """
    # Récupérer tous les plats pour le contexte
    plats_db = list_plats(session)
    
    # Convertir en dictionnaires pour le service
    plats_context = []
    for plat in plats_db:
        plat_dict = {
            "id": plat.id,
            "nom": plat.nom,
            "description": plat.description,
            "prix": plat.prix,
            "disponible": plat.disponible,
            "categorie": plat.categorie.nom if hasattr(plat, 'categorie') and plat.categorie else None
        }
        plats_context.append(plat_dict)
    
    # Convertir l'historique de conversation si présent
    history = None
    if request.conversation_history:
        history = [{"role": msg.role, "content": msg.content} for msg in request.conversation_history]
    
    # Obtenir la réponse de l'IA
    result = await get_ai_response(
        question=request.question,
        plats=plats_context,
        conversation_history=history
    )
    
    return ChatResponse(
        success=result.get("success", False),
        response=result.get("response", ""),
        model=result.get("model"),
        error=result.get("error")
    )


@router.get("/health")
async def chat_health():
    """Vérifier si le service de chat est opérationnel"""
    import os
    api_key = os.environ.get("CEREBRAS_API_KEY", "")
    has_key = bool(api_key and api_key != "csk-your-api-key-here")
    
    return {
        "service": "chat",
        "status": "operational" if has_key else "not_configured",
        "message": "Chat IA prêt" if has_key else "Clé API Cerebras non configurée"
    }
