import os
import secrets
from fastapi import UploadFile
from pathlib import Path

UPLOAD_DIR = Path("app/static/uploads")

def save_upload_file(upload_file: UploadFile, folder: str = "plats") -> str:
    """
    Sauvegarde un fichier uploadé et retourne son URL relative.
    """
    # Créer le dossier s'il n'existe pas
    dest_dir = UPLOAD_DIR / folder
    dest_dir.mkdir(parents=True, exist_ok=True)
    
    # Générer un nom unique pour éviter les collisions
    extension = Path(upload_file.filename).suffix
    unique_filename = f"{secrets.token_hex(8)}{extension}"
    
    file_path = dest_dir / unique_filename
    
    # Écrire le fichier sur le disque
    with open(file_path, "wb") as buffer:
        buffer.write(upload_file.file.read())
        
    # Retourner l'URL relative
    return f"/static/uploads/{folder}/{unique_filename}"

def delete_old_image(image_url: str):
    """
    Supprime une ancienne image du disque si elle existe.
    """
    if not image_url or not image_url.startswith("/static/"):
        return
        
    # Convertir l'URL relative en chemin local
    # /static/uploads/plats/abc.jpg -> app/static/uploads/plats/abc.jpg
    relative_path = image_url.lstrip("/")
    # Remplacer 'static' par 'app/static'
    full_path = Path("app") / relative_path
    
    if full_path.exists():
        os.remove(full_path)
