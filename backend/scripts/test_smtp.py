import asyncio
import sys
import os

# Ajout du dossier parent au path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.email_service import send_verification_email

async def test_smtp_connection():
    target_email = "josherenprofessional@gmail.com" # Email de test
    test_token = "TEST_TOKEN_SMTP"
    
    print(f"🚀 Tentative d'envoi d'un mail réel à {target_email}...")
    try:
        await send_verification_email(target_email, test_token)
        print("✅ Script terminé (vérifiez les logs ci-dessus pour confirmer le succès).")
    except Exception as e:
        print(f"❌ Échec critique du script : {e}")

if __name__ == "__main__":
    asyncio.run(test_smtp_connection())
