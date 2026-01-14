import asyncio
import os
from dotenv import load_dotenv

# Charge les variables d'environnement
load_dotenv("/home/eren/Downloads/Gestion-de-Restaurant/backend/.env")

from app.services.email_service import send_verification_email
from app.core.config import settings

async def main():
    print(f"Testing email sending...")
    print(f"SMTP Server: {settings.MAIL_SERVER}:{settings.MAIL_PORT}")
    print(f"Username: {settings.MAIL_USERNAME}")
    print(f"Frontend URL: {settings.FRONTEND_URL}")
    
    try:
        # Envoi à l'adresse de l'admin pour le test
        target_email = settings.MAIL_USERNAME
        print(f"Sending test email to {target_email}...")
        
        await send_verification_email(target_email, "TEST_TOKEN_12345")
        
        print("Done. Check your inbox.")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
