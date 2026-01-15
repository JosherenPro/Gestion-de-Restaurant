from sqlmodel import Session, select
from typing import List

from app.models.utilisateur import Utilisateur
from app.schemas.utilisateur import (
    UtilisateurCreate, UtilisateurUpdate, UtilisateurRead
)

from app.security.hashing import hash_password
import secrets
from fastapi import BackgroundTasks
from app.services.email_service import send_verification_email
from datetime import datetime, timedelta, timezone




def create_utilisateur(
    session: Session, 
    utilisateur_in: UtilisateurCreate,
    background_tasks: BackgroundTasks
) -> Utilisateur:
    """Creer un nouvel utilisateur dans la base de donnees.
    Si l'utilisateur existe déjà mais n'est pas vérifié, on met à jour ses informations.
    """
    clean_email = utilisateur_in.email.lower().strip()
    clean_phone = utilisateur_in.telephone.strip()
    
    print(f"📝 CREATE_USER [START]: Email={clean_email}, Phone={clean_phone}")
    
    # Verifier si l'email existe deja
    statement_email = select(Utilisateur).where(Utilisateur.email == clean_email)
    existing_user_email = session.exec(statement_email).first()
    
    # Verifier si le numero de telephone existe deja
    statement_phone = select(Utilisateur).where(Utilisateur.telephone == clean_phone)
    existing_user_phone = session.exec(statement_phone).first()

    # Si l'un ou l'autre existe, on vérifie s'il est vérifié
    existing_user = existing_user_email or existing_user_phone
    
    if existing_user:
        print(f"🔍 CREATE_USER [FOUND]: ID={existing_user.id}, Verified={existing_user.is_verified}")
        if existing_user.is_verified:
            if existing_user_email:
                print(f"❌ CREATE_USER [FAIL]: Email {clean_email} already verified.")
                raise ValueError("Cet email est déjà utilisé")
            else:
                print(f"❌ CREATE_USER [FAIL]: Phone {clean_phone} already verified.")
                raise ValueError("Ce numéro de téléphone est déjà utilisé")
        else:
            # L'utilisateur existe mais n'est pas vérifié, on le met à jour
            print(f"🔄 CREATE_USER [UPDATE]: Updating unverified User ID={existing_user.id}")
            utilisateur = existing_user
            utilisateur.nom = utilisateur_in.nom
            utilisateur.prenom = utilisateur_in.prenom
            utilisateur.email = clean_email
            utilisateur.telephone = clean_phone
            utilisateur.role = utilisateur_in.role
            utilisateur.hashed_password = hash_password(utilisateur_in.password)
            print(f"🛠️ CREATE_USER [UPDATED_FIELDS]: Email set to {utilisateur.email}")
    else:
        # Nouvel utilisateur
        print(f"✨ CREATE_USER [NEW]: Creating new user record")
        utilisateur = Utilisateur(
            nom=utilisateur_in.nom,
            prenom=utilisateur_in.prenom,
            email=clean_email,
            telephone=clean_phone,
            role=utilisateur_in.role,
            hashed_password=hash_password(utilisateur_in.password)
        )

    token = secrets.token_urlsafe(32)
    token_expires = datetime.now(timezone.utc) + timedelta(hours=24)
    
    utilisateur.is_verified = True
    utilisateur.verification_token = token
    utilisateur.verification_token_expires = token_expires
    
    # ajouter l'utilisateur a la session (ou le mettre à jour)
    session.add(utilisateur)
    session.commit()
    session.refresh(utilisateur)

    print(f"✅ CREATE_USER [SUCCESS]: ID={utilisateur.id}, Email={utilisateur.email}, PasswordHashPrefix={utilisateur.hashed_password[:10]}")

    # Envoyer l'email (asynchrone via BackgroundTasks)
    background_tasks.add_task(send_verification_email, utilisateur.email, token)

    return utilisateur


def read_utilisateur(session: Session, utilisateur_id: int) -> UtilisateurRead | None:
    """Recuperer un utilisateur par son ID."""
    utilisateur = session.get(Utilisateur, utilisateur_id)
    if not utilisateur:
        return None
    return UtilisateurRead.model_validate(utilisateur)


def get_utilisateur_by_email(session: Session, email: str) -> UtilisateurRead | None:
    statement = select(Utilisateur).where(Utilisateur.email == email)
    utilisateur = session.exec(statement).first()
    if utilisateur:
        return UtilisateurRead.model_validate(utilisateur)
    return None


def delete_utilisateur(session: Session, utilisateur_id: int) -> Utilisateur | None:
    """Supprimer un utilisateur par son ID."""
    utilisateur = session.get(Utilisateur, utilisateur_id)
    if utilisateur:
        session.delete(utilisateur)
        session.commit()
        return utilisateur
    return None


def update_utilisateur(
    session: Session,
    utilisateur_id: int,
    utilisateur_in: UtilisateurUpdate
) ->  UtilisateurRead | None:
    """Mettre a jour les infos sur un utilisateur."""
    utilisateur = session.get(Utilisateur, utilisateur_id)
    if not utilisateur: 
        return None

    updates = utilisateur_in.model_dump(exclude_unset=True)

    if "password" in updates:
        updates["hashed_password"] = hash_password(
            updates.pop("password")
        )

    utilisateur.sqlmodel_update(updates)
    
    session.add(utilisateur)
    session.commit()
    session.refresh(utilisateur)
    return utilisateur



def list_utilisateurs(session: Session, skip: int = 0, limit: int = 100) -> List[Utilisateur]:
    statement = select(Utilisateur).offset(skip).limit(limit)
    return session.exec(statement).all()


def verify_email_token(session: Session, token: str) -> bool:
    """Valide un jeton de vérification et active l'utilisateur."""
    statement = select(Utilisateur).where(Utilisateur.verification_token == token)
    utilisateur = session.exec(statement).first()
    
    if not utilisateur:
        return False
    
    # Vérifier que le token n'a pas expiré
    if utilisateur.verification_token_expires:
        # Simplification extrême : on enlève toute info de timezone des deux côtés
        expires_at = utilisateur.verification_token_expires.replace(tzinfo=None)
        now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
        
        if expires_at < now_utc:
            return False
    
    utilisateur.is_verified = True
    utilisateur.verification_token = None
    utilisateur.verification_token_expires = None
    session.add(utilisateur)
    session.commit()
    return True