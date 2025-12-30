from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session


from app.core.database import get_session
from app.security.auth import authentificate_user, create_access_token
from app.services.utilisateur_service import verify_email_token
from app.core.config import settings



router = APIRouter(
    prefix="/auth",
    tags=["Authentification"]
)


@router.post("/token")
async def login_for_access_token(
    session: Session = Depends(get_session),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """Genérer un token d'accès JWT pour l'utilisateur."""
    utilisateur = authentificate_user(session, form_data.username, form_data.password)

    if not utilisateur:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe invalide.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": utilisateur.email},
                                       expires_delta=access_token_expires)

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/verify")
def verify_email(token: str, session: Session = Depends(get_session)):
    """Confirmer l'inscription via le jeton de vérification."""
    success = verify_email_token(session, token)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Jeton de vérification invalide ou expiré."
        )
    return {"message": "Email vérifié avec succès. Vous pouvez maintenant vous connecter."}