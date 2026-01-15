from datetime import timedelta, datetime, timezone

from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends
from typing import Annotated
from fastapi import HTTPException, status
from pydantic import EmailStr

from sqlmodel import Session, select

from jose import jwt, JWTError

from app.core.config import settings
from app.core.database import get_session
from app.models.utilisateur import Utilisateur
from app.security.hashing import verify_password




oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")



def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def authentificate_user(session: Session, email: str, password: str) -> Utilisateur | None:
    """Vérifier les informations d'identification de l'utilisateur."""
    clean_email = email.lower().strip()
    print(f"🔑 AUTH [START]: Tentative pour {clean_email}...")
    
    statement = select(Utilisateur).where(Utilisateur.email == clean_email)
    utilisateur = session.exec(statement).first()
    
    if not utilisateur:
        print(f"❌ AUTH [FAIL]: Utilisateur {clean_email} non trouvé dans la DB.")
        return None
        
    is_password_correct = verify_password(password, utilisateur.hashed_password)
    if not is_password_correct:
        print(f"❌ AUTH [FAIL]: Mot de passe incorrect pour {clean_email}. HashPrefix={utilisateur.hashed_password[:10]}")
        return None
        
    if not utilisateur.active:
        print(f"❌ AUTH [FAIL]: Compte {clean_email} désactivé.")
        return None
        
    print(f"✅ AUTH [SUCCESS]: {clean_email} (ID={utilisateur.id}, Role={utilisateur.role}, Verified={utilisateur.is_verified})")
    return utilisateur


async def get_current_user(
        token: Annotated[str, Depends(oauth2_scheme)],
        session: Annotated[Session, Depends(get_session)]
    )-> Utilisateur:
    """Récupérer l'utilisateur actuel à partir du token JWT."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les identifiants.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    statement = select(Utilisateur).where(Utilisateur.email == email)
    utilisateur = session.exec(statement).first()

    if utilisateur is None:
        raise credentials_exception
    if not utilisateur.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé. Veuillez contacter l'administration."
        )
    if not utilisateur.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email non vérifié. Veuillez valider votre compte via le lien envoyé par mail."
        )
    return utilisateur
    