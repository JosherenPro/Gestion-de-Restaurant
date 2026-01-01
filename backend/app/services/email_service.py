import logging
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from app.core.config import settings
from pydantic import EmailStr

# Configuration d'un logger simple
logger = logging.getLogger("app.email")
logger.setLevel(logging.INFO)

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=settings.USE_CREDENTIALS,
    VALIDATE_CERTS=settings.VALIDATE_CERTS
)

async def send_verification_email(email: str, token: str):
    """
    Envoie un véritable email de vérification via SMTP.
    """
    # Utiliser l'URL du backend pour la vérification
    verification_link = f"{settings.FRONTEND_URL}/auth/verify?token={token}"
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #333;">Bienvenue dans notre Restaurant !</h2>
        <p>Merci de vous être inscrit. Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{verification_link}" 
               style="background-color: #007bff; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
               Vérifier mon compte
            </a>
        </div>
        <p>Ou copiez ce lien dans votre navigateur :</p>
        <p><a href="{verification_link}">{verification_link}</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
        <p style="font-size: 12px; color: #777;">Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer cet email.</p>
    </div>
    """

    message = MessageSchema(
        subject="Vérification de votre compte - Restaurant",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        logger.info(f"Email de vérification envoyé avec succès à {email}")
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi de l'email à {email}: {str(e)}")
        # On ne bloque pas tout le processus si le mail échoue,
        # mais on prévient dans les logs.
        print(f"ERREUR SMTP : Impossible d'envoyer le mail à {email}. Erreur: {e}")
        # En mode dev, on réaffiche le lien au cas où l'envoi SMTP échoue
        print(f"Lien de repli : {verification_link}")
