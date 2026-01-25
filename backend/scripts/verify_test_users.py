import sys
import os

# Add the parent directory to sys.path to allow imports from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlmodel import Session, select
from app.core.database import engine
from app.models.utilisateur import Utilisateur
from app.models.client import Client
from app.models.personnel import Personnel
from app.models.gerant import Gerant
from app.models.serveur import Serveur
from app.models.cuisinier import Cuisinier
from app.security.hashing import verify_password


def verify_test_users():
    """
    Vérifie que tous les utilisateurs de test existent dans la base de données
    et que leurs mots de passe correspondent.
    """
    test_users = [
        {
            "email": "client@test.com",
            "password": "client123",
            "role": "client",
            "nom": "Dupont"
        },
        {
            "email": "client2@test.com",
            "password": "client123",
            "role": "client",
            "nom": "Leroy"
        },
        {
            "email": "gerant@test.com",
            "password": "gerant123",
            "role": "gerant",
            "nom": "Martin"
        },
        {
            "email": "serveur@test.com",
            "password": "serveur123",
            "role": "serveur",
            "nom": "Bernard"
        },
        {
            "email": "cuisinier@test.com",
            "password": "cuisinier123",
            "role": "cuisinier",
            "nom": "Roux"
        }
    ]

    print("🔍 Vérification des utilisateurs de test dans la base de données...\n")
    print("="*70)
    
    all_valid = True
    
    with Session(engine) as session:
        for user_data in test_users:
            print(f"\n📧 Vérification: {user_data['email']}")
            
            # Rechercher l'utilisateur
            statement = select(Utilisateur).where(Utilisateur.email == user_data["email"])
            user = session.exec(statement).first()
            
            if not user:
                print(f"   ❌ ÉCHEC: Utilisateur non trouvé dans la base de données")
                all_valid = False
                continue
            
            # Vérifier les informations de base
            checks = []
            
            # 1. Vérifier le nom
            if user.nom == user_data["nom"]:
                checks.append("✅ Nom: OK")
            else:
                checks.append(f"❌ Nom: {user.nom} (attendu: {user_data['nom']})")
                all_valid = False
            
            # 2. Vérifier le rôle
            if user.role == user_data["role"]:
                checks.append("✅ Rôle: OK")
            else:
                checks.append(f"❌ Rôle: {user.role} (attendu: {user_data['role']})")
                all_valid = False
            
            # 3. Vérifier que le compte est actif
            if user.active:
                checks.append("✅ Actif: Oui")
            else:
                checks.append("❌ Actif: Non")
                all_valid = False
            
            # 4. Vérifier que le compte est vérifié
            if user.is_verified:
                checks.append("✅ Vérifié: Oui")
            else:
                checks.append("❌ Vérifié: Non")
                all_valid = False
            
            # 5. Vérifier le mot de passe
            if verify_password(user_data["password"], user.hashed_password):
                checks.append("✅ Mot de passe: Correspond")
            else:
                checks.append("❌ Mot de passe: Ne correspond pas")
                all_valid = False
            
            # 6. Vérifier les tables liées selon le rôle
            if user_data["role"] == "client":
                statement = select(Client).where(Client.utilisateur_id == user.id)
                client = session.exec(statement).first()
                if client:
                    checks.append("✅ Entrée Client: Existe")
                else:
                    checks.append("❌ Entrée Client: Manquante")
                    all_valid = False
            
            elif user_data["role"] in ["gerant", "serveur", "cuisinier"]:
                statement = select(Personnel).where(Personnel.utilisateur_id == user.id)
                personnel = session.exec(statement).first()
                if personnel:
                    checks.append("✅ Entrée Personnel: Existe")
                    
                    # Vérifier la table spécifique
                    if user_data["role"] == "gerant":
                        statement = select(Gerant).where(Gerant.personnel_id == personnel.id)
                        specific = session.exec(statement).first()
                        table_name = "Gérant"
                    elif user_data["role"] == "serveur":
                        statement = select(Serveur).where(Serveur.personnel_id == personnel.id)
                        specific = session.exec(statement).first()
                        table_name = "Serveur"
                    else:  # cuisinier
                        statement = select(Cuisinier).where(Cuisinier.personnel_id == personnel.id)
                        specific = session.exec(statement).first()
                        table_name = "Cuisinier"
                    
                    if specific:
                        checks.append(f"✅ Entrée {table_name}: Existe")
                    else:
                        checks.append(f"❌ Entrée {table_name}: Manquante")
                        all_valid = False
                else:
                    checks.append("❌ Entrée Personnel: Manquante")
                    all_valid = False
            
            # Afficher tous les contrôles
            for check in checks:
                print(f"   {check}")
    
    # Résumé final
    print("\n" + "="*70)
    if all_valid:
        print("✅ ✅ ✅  TOUS LES TESTS SONT RÉUSSIS  ✅ ✅ ✅")
        print("\n📋 Récapitulatif:")
        print("   • Tous les utilisateurs existent dans la base de données")
        print("   • Tous les mots de passe correspondent")
        print("   • Tous les comptes sont activés et vérifiés")
        print("   • Toutes les relations de tables sont correctes")
        print("\n🎉 Vous pouvez maintenant utiliser ces comptes pour vous connecter!")
    else:
        print("❌ ❌ ❌  CERTAINS TESTS ONT ÉCHOUÉ  ❌ ❌ ❌")
        print("\n⚠️  Veuillez vérifier les erreurs ci-dessus.")
    print("="*70)


if __name__ == "__main__":
    verify_test_users()
