

import { MenuItem, Table, OrderStatus, Order, StaffMember, UserRole, Reservation, Categorie } from './types';

// Helper function to convert backend MenuItem to display format
export const formatMenuItem = (item: MenuItem): MenuItem & { name: string; price: number; category: string; image: string; isAvailable: boolean } => {
  return {
    ...item,
    name: item.nom,
    price: item.prix / 100, // Convert from centimes to euros
    category: item.categorie?.nom || '',
    image: item.image_url ? `http://localhost:8000${item.image_url}` : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&h=300',
    isAvailable: item.disponible,
  };
};

// Helper function to get category name
export const getCategoryName = (categoryId: number, categories: Categorie[]): string => {
  const category = categories.find(cat => cat.id === categoryId);
  return category?.nom || 'Autre';
};

// Helper function to format price
export const formatPrice = (priceInCentimes: number): string => {
  return (priceInCentimes / 100).toFixed(2);
};

// Mock data for demo purposes (kept for reference)
export const MENU_ITEMS: MenuItem[] = [
  {
    id: 1,
    nom: 'Royal Cheese Burger',
    description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries',
    prix: 2310,
    categorie_id: 1,
    disponible: true
  },
  {
    id: 2,
    nom: 'Margherita Pizza',
    description: 'Fresh tomato sauce, mozzarella, basil and olive oil',
    prix: 1290,
    categorie_id: 2,
    disponible: true
  },
  {
    id: 3,
    nom: 'Tandoori Pizza',
    description: 'Spicy chicken tikka, peppers, onions and mozzarella',
    prix: 1790,
    categorie_id: 2,
    disponible: true
  },
  {
    id: 4,
    nom: 'Coke Coca Cola',
    description: 'Refreshing classic cola',
    prix: 250,
    categorie_id: 3,
    disponible: true
  },
  {
    id: 5,
    nom: 'Vegan Discount Burger',
    description: 'Plant-based patty with fresh avocado and vegan mayo',
    prix: 1550,
    categorie_id: 1,
    disponible: true
  }
];

export const TABLES: Table[] = [
  { id: 1, numero_table: '1', capacite: 2, statut: 'LIBRE' },
  { id: 2, numero_table: '2', capacite: 4, statut: 'OCCUPEE' },
  { id: 3, numero_table: '3', capacite: 4, statut: 'RESERVEE' },
  { id: 4, numero_table: '4', capacite: 6, statut: 'LIBRE' },
  { id: 5, numero_table: '5', capacite: 2, statut: 'OCCUPEE' },
];

export const STAFF: StaffMember[] = [
  { id: 1, nom: 'Serveur', prenom: 'Jean', role: UserRole.SERVEUR, email: 'jean@resto.com', telephone: '0612345678', utilisateur_id: 1 },
  { id: 2, nom: 'Mario', prenom: 'Chef', role: UserRole.CUISINIER, email: 'mario@resto.com', telephone: '0612345679', utilisateur_id: 2 },
  { id: 3, nom: 'Directrice', prenom: 'Alice', role: UserRole.GERANT, email: 'alice@resto.com', telephone: '0612345680', utilisateur_id: 3 },
];

export const RESERVATIONS: Reservation[] = [
  { 
    id: 1, 
    client_id: 1, 
    table_id: 3, 
    date_reservation: '2024-05-20T19:30:00Z', 
    nb_personnes: 4, 
    statut: 'CONFIRMEE' 
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 1,
    client_id: 1,
    table_id: 2,
    type_commande: 'SUR_PLACE',
    statut: OrderStatus.EN_COURS,
    montant_total: 2810,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: 2,
    client_id: 2,
    table_id: 5,
    type_commande: 'SUR_PLACE',
    statut: OrderStatus.EN_ATTENTE_VALIDATION,
    montant_total: 1290,
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  }
];

