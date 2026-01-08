import asyncio
import sys
import os
from pathlib import Path

# Ajouter le répertoire parent au path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.email_service import send_verification_email, conf
from fastapi_mail import FastMail, MessageSchema, MessageType

async def test_verbose_smtp():
    target_email = "josherenamah@gmail.com"
    print(f"--- Configuration details ---")
    print(f"SERVER: {conf.MAIL_SERVER}")
    print(f"PORT: {conf.MAIL_PORT}")
    print(f"USER: {conf.MAIL_USERNAME}")
    print(f"STARTTLS: {conf.MAIL_STARTTLS}")
    print(f"SSL_TLS: {conf.MAIL_SSL_TLS}")
    
    print(f"\n🚀 Sending test email to {target_email}...")
    
    message = MessageSchema(
        subject="DEBUG SMTP - Restaurant",
        recipients=[target_email],
        body="Ceci est un test de connexion SMTP.",
        subtype=MessageType.plain
    )
    
    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        print("✅ SUCCESS: Email sent successfully!")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_verbose_smtp())
