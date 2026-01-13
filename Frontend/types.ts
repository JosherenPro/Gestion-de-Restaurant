

export enum UserRole {
  CLIENT = 'CLIENT',
  SERVEUR = 'SERVEUR',
  CUISINIER = 'CUISINIER',
  GERANT = 'GERANT'
}

export enum OrderStatus {
  EN_ATTENTE_VALIDATION = 'EN_ATTENTE_VALIDATION',
  VALIDEE = 'VALIDEE',
  EN_COURS = 'EN_COURS',
  PRETE = 'PRETE',
  SERVIE = 'SERVIE',
  PAYEE = 'PAYEE',
  ANNULEE = 'ANNULEE'
}

export enum TableStatus {
  LIBRE = 'LIBRE',
  OCCUPEE = 'OCCUPEE',
  RESERVEE = 'RESERVEE'
}

export enum TypeCommande {
  SUR_PLACE = 'SUR_PLACE',
  A_EMPORTER = 'A_EMPORTER'
}

export interface Categorie {
  id: number;
  nom: string;
  description?: string;
}

export interface MenuItem {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  categorie_id: number;
  categorie?: Categorie;
  disponible: boolean;
  image_url?: string;
  temps_preparation?: number;
}

export interface OrderItem {
  id?: number;
  plat_id: number;
  plat?: MenuItem;
  quantite: number;
  prix_unitaire: number;
  notes_speciales?: string;
}

export interface Order {
  id: number;
  client_id: number;
  table_id: number;
  type_commande: TypeCommande;
  statut: OrderStatus;
  montant_total: number;
  notes?: string;
  lignes?: OrderItem[];
  created_at?: string;
  updated_at?: string;
}

export interface Table {
  id: number;
  numero_table: string;
  capacite: number;
  statut: TableStatus;
  qr_code?: string;
}

export interface StaffMember {
  id: number;
  nom: string;
  prenom: string;
  role: UserRole;
  email: string;
  telephone?: string;
  utilisateur_id: number;
  actif?: boolean;
}

export interface Reservation {
  id: number;
  client_id: number;
  table_id: number;
  date_reservation: string;
  nombre_personnes: number;
  statut: 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE';
  notes?: string;
}

export interface Avis {
  id: number;
  client_id: number;
  commande_id: number;
  note: number;
  commentaire?: string;
  created_at?: string;
}

export interface Stats {
  chiffre_affaires_total: number;
  nombre_commandes: number;
  note_moyenne: number;
  nombre_clients: number;
}

export interface TopPlat {
  plat_id: number;
  nom_plat: string;
  quantite_vendue: number;
  chiffre_affaires: number;
}

export interface Menu {
  id: number;
  nom: string;
  prix_fixe: number;
  actif: boolean;
  contenus?: Array<{
    menu_id: number;
    plat_id: number;
    plat?: MenuItem;
  }>;
}

export interface MenuWithPlats extends Menu {
  plats?: MenuItem[];
}

