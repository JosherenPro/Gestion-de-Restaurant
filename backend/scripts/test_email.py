"""
Script de test pour vérifier l'envoi d'emails de vérification.
Usage: python scripts/test_email.py
"""
import asyncio
import sys
from pathlib import Path

# Ajouter le répertoire parent au path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.email_service import send_verification_email
from app.core.config import settings
import secrets


async def test_email_sending():
    """Teste l'envoi d'un email de vérification."""
    
    print("=" * 60)
    print("TEST D'ENVOI D'EMAIL DE VÉRIFICATION")
    print("=" * 60)
    
    # Configuration actuelle
    print("\n📧 Configuration Email:")
    print(f"  - Serveur SMTP: {settings.MAIL_SERVER}")
    print(f"  - Port: {settings.MAIL_PORT}")
    print(f"  - Username: {settings.MAIL_USERNAME}")
    print(f"  - From: {settings.MAIL_FROM}")
    print(f"  - Frontend URL: {settings.FRONTEND_URL}")
    print(f"  - STARTTLS: {settings.MAIL_STARTTLS}")
    print(f"  - SSL/TLS: {settings.MAIL_SSL_TLS}")
    
    # Email de test
    test_email = input("\n✉️  Entrez l'adresse email de test: ").strip()
    
    if not test_email:
        print("❌ Aucune adresse email fournie. Arrêt du test.")
        return
    
    # Générer un token de test
    test_token = secrets.token_urlsafe(32)
    
    print(f"\n🔐 Token de test généré: {test_token[:20]}...")
    print(f"🔗 Lien de vérification: {settings.FRONTEND_URL}/auth/verify?token={test_token}")
    
    print("\n📤 Envoi de l'email en cours...")
    
    try:
        await send_verification_email(test_email, test_token)
        print("\n✅ Email envoyé avec succès!")
        print(f"📨 Vérifiez la boîte de réception de: {test_email}")
        print(f"\n💡 Si vous ne recevez pas l'email, vérifiez:")
        print("   1. Les paramètres SMTP dans votre fichier .env")
        print("   2. Le dossier spam/courrier indésirable")
        print("   3. Que le mot de passe d'application Gmail est correct")
        
    except Exception as e:
        print(f"\n❌ Erreur lors de l'envoi: {str(e)}")
        print("\n🔍 Détails de l'erreur:")
        import traceback
        traceback.print_exc()
        

if __name__ == "__main__":
    asyncio.run(test_email_sending())
