"""
Service de Chat IA utilisant Cerebras API avec Llama 3.3-70B
"""
import os
from typing import Optional, List
from cerebras.cloud.sdk import Cerebras

# Configuration du client Cerebras
def get_cerebras_client():
    api_key = os.environ.get("CEREBRAS_API_KEY")
    if not api_key:
        return None
    return Cerebras(api_key=api_key)


def format_plats_context(plats: List[dict]) -> str:
    """Formate la liste des plats pour le contexte de l'IA"""
    context_lines = []
    for plat in plats:
        line = f"- {plat['nom']}: {plat.get('description', 'Pas de description')}"
        if plat.get('prix'):
            line += f" | Prix: {plat['prix']} FCFA"
        if plat.get('categorie'):
            line += f" | Catégorie: {plat['categorie']}"
        if not plat.get('disponible', True):
            line += " | ⚠️ INDISPONIBLE"
        context_lines.append(line)
    return "\n".join(context_lines)


SYSTEM_PROMPT = """Tu es l'assistant virtuel du restaurant RestoDeluxe, un restaurant gastronomique offrant une cuisine de qualité. Tu réponds aux questions des clients sur les plats du menu de manière amicale, professionnelle et chaleureuse.

📋 MENU ACTUEL DU RESTAURANT:
{menu_context}

🎯 RÈGLES À SUIVRE:
1. Réponds TOUJOURS en français
2. Sois concis mais informatif (max 2-3 phrases par réponse)
3. Utilise des emojis pour rendre tes réponses plus chaleureuses 🍽️
4. Si on te demande des allergènes ou ingrédients que tu ne connais pas, dis-le honnêtement
5. Suggère des plats similaires quand c'est pertinent
6. Si le client hésite, recommande tes favoris du menu
7. Reste dans le contexte du restaurant - ne réponds pas aux questions hors sujet
8. Si un plat est indisponible, propose une alternative

💡 EXEMPLES DE RÉPONSES:
- "Le Poulet grillé est accompagné de légumes de saison 🍗 C'est l'un de nos best-sellers!"
- "Je vous recommande notre Attiéké, c'est un délice traditionnel ivoirien 🇨🇮"
- "Ce plat ne contient pas de gluten, vous pouvez le déguster en toute tranquillité ✨"
"""


async def get_ai_response(
    question: str, 
    plats: List[dict], 
    conversation_history: Optional[List[dict]] = None
) -> dict:
    """
    Obtient une réponse de l'IA Cerebras pour une question sur les plats
    
    Args:
        question: La question du client
        plats: Liste des plats du menu
        conversation_history: Historique de conversation optionnel
        
    Returns:
        dict avec 'response' et 'success'
    """
    client = get_cerebras_client()
    
    if not client:
        # Fallback si pas de clé API
        return {
            "success": False,
            "response": "🔧 Le service de chat IA n'est pas configuré. Veuillez contacter le restaurant directement pour vos questions.",
            "error": "API_KEY_MISSING"
        }
    
    try:
        # Formater le contexte du menu
        menu_context = format_plats_context(plats)
        system_prompt = SYSTEM_PROMPT.format(menu_context=menu_context)
        
        # Construire les messages
        messages = [{"role": "system", "content": system_prompt}]
        
        # Ajouter l'historique de conversation si présent
        if conversation_history:
            for msg in conversation_history[-6:]:  # Limiter à 6 derniers messages
                messages.append(msg)
        
        # Ajouter la question actuelle
        messages.append({"role": "user", "content": question})
        
        # Appeler Cerebras API
        completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b",
            max_completion_tokens=256,
            temperature=0.7,
            top_p=0.9,
            stream=False
        )
        
        ai_response = completion.choices[0].message.content
        
        return {
            "success": True,
            "response": ai_response,
            "model": "llama-3.3-70b"
        }
        
    except Exception as e:
        print(f"Erreur Cerebras API: {str(e)}")
        return {
            "success": False,
            "response": "😔 Désolé, je rencontre un problème technique. N'hésitez pas à demander à notre équipe!",
            "error": str(e)
        }


# Réponses de fallback pour les questions courantes (si API indisponible)
FALLBACK_RESPONSES = {
    "allergene": "Pour les informations sur les allergènes, veuillez consulter notre équipe en salle qui pourra vous renseigner précisément.",
    "vegetarien": "Nous proposons plusieurs options végétariennes. Regardez notre carte ou demandez conseil à nos serveurs!",
    "recommandation": "Je vous recommande nos plats signature! N'hésitez pas à demander les suggestions du chef à notre équipe.",
    "default": "Pour plus d'informations, notre équipe se fera un plaisir de vous aider!"
}


def get_fallback_response(question: str) -> str:
    """Retourne une réponse de fallback basée sur des mots-clés"""
    question_lower = question.lower()
    
    if any(word in question_lower for word in ["allergène", "allergie", "allergique", "gluten", "lactose"]):
        return FALLBACK_RESPONSES["allergene"]
    elif any(word in question_lower for word in ["végétarien", "vegetarien", "vegan", "légume"]):
        return FALLBACK_RESPONSES["vegetarien"]
    elif any(word in question_lower for word in ["recommande", "conseil", "suggère", "meilleur", "populaire"]):
        return FALLBACK_RESPONSES["recommandation"]
    
    return FALLBACK_RESPONSES["default"]
