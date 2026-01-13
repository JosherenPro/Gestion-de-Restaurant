import { MenuItem, Table, OrderStatus, Order, StaffMember, UserRole, Reservation, Categorie, TableStatus, TypeCommande, OrderItem } from './types';
import { API_CONFIG } from './config/api.config';

// Extended interfaces for mock data display (for demo components)
export interface MenuItemDisplay extends MenuItem {
  name: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  quantity?: number;
}

export interface OrderDisplay {
  id: string | number;
  tableId: string;
  items: Array<{
    id?: string | number;
    plat_id?: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  status: OrderStatus;
  timestamp: number;
  totalPrice: number;
}

export interface TableDisplay {
  id: number;
  number: string;
  capacity: number;
  status: string;
}

export interface StaffDisplay extends StaffMember {
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
}

// Helper function to convert backend MenuItem to display format
export const formatMenuItem = (item: MenuItem): MenuItemDisplay => {
  return {
    ...item,
    name: item.nom,
    price: item.prix / 100, // Convert from centimes to euros
    category: item.categorie?.nom || '',
    image: item.image_url ? `${API_CONFIG.BASE_URL}${item.image_url}` : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&h=300',
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
export const MENU_ITEMS: MenuItemDisplay[] = [
  {
    id: 1,
    nom: 'Royal Cheese Burger',
    name: 'Royal Cheese Burger',
    description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries',
    prix: 2310,
    price: 23.10,
    categorie_id: 1,
    category: 'Burgers',
    disponible: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&h=300'
  },
  {
    id: 2,
    nom: 'Margherita Pizza',
    name: 'Margherita Pizza',
    description: 'Fresh tomato sauce, mozzarella, basil and olive oil',
    prix: 1290,
    price: 12.90,
    categorie_id: 2,
    category: 'Pizzas',
    disponible: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&h=300'
  },
  {
    id: 3,
    nom: 'Tandoori Pizza',
    name: 'Tandoori Pizza',
    description: 'Spicy chicken tikka, peppers, onions and mozzarella',
    prix: 1790,
    price: 17.90,
    categorie_id: 2,
    category: 'Pizzas',
    disponible: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&h=300'
  },
  {
    id: 4,
    nom: 'Coke Coca Cola',
    name: 'Coke Coca Cola',
    description: 'Refreshing classic cola',
    prix: 250,
    price: 2.50,
    categorie_id: 3,
    category: 'Drinks',
    disponible: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=400&h=300'
  },
  {
    id: 5,
    nom: 'Vegan Discount Burger',
    name: 'Vegan Discount Burger',
    description: 'Plant-based patty with fresh avocado and vegan mayo',
    prix: 1550,
    price: 15.50,
    categorie_id: 1,
    category: 'Burgers',
    disponible: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=400&h=300'
  }
];

export const TABLES: TableDisplay[] = [
  { id: 1, number: '1', capacity: 2, status: 'FREE' },
  { id: 2, number: '2', capacity: 4, status: 'OCCUPIED' },
  { id: 3, number: '3', capacity: 4, status: 'RESERVED' },
  { id: 4, number: '4', capacity: 6, status: 'FREE' },
  { id: 5, number: '5', capacity: 2, status: 'OCCUPIED' },
];

export const STAFF: StaffDisplay[] = [
  { id: 1, nom: 'Serveur', name: 'Jean Serveur', prenom: 'Jean', role: UserRole.SERVEUR, email: 'jean@resto.com', telephone: '0612345678', utilisateur_id: 1, status: 'ACTIVE' },
  { id: 2, nom: 'Mario', name: 'Chef Mario', prenom: 'Chef', role: UserRole.CUISINIER, email: 'mario@resto.com', telephone: '0612345679', utilisateur_id: 2, status: 'ACTIVE' },
  { id: 3, nom: 'Directrice', name: 'Alice Directrice', prenom: 'Alice', role: UserRole.GERANT, email: 'alice@resto.com', telephone: '0612345680', utilisateur_id: 3, status: 'ACTIVE' },
];

export const RESERVATIONS: Reservation[] = [
  { 
    id: 1, 
    client_id: 1, 
    table_id: 3, 
    date_reservation: '2024-05-20T19:30:00Z', 
    nombre_personnes: 4, 
    statut: 'CONFIRMEE' 
  }
];

export const INITIAL_ORDERS: OrderDisplay[] = [
  {
    id: 'ORD001',
    tableId: 't2',
    items: [
      { id: 1, plat_id: 1, name: 'Royal Cheese Burger', quantity: 2, price: 23.10 },
      { id: 2, plat_id: 4, name: 'Coke Coca Cola', quantity: 2, price: 2.50 }
    ],
    status: OrderStatus.EN_COURS,
    timestamp: Date.now() - 1000 * 60 * 15,
    totalPrice: 51.20
  },
  {
    id: 'ORD002',
    tableId: 't5',
    items: [
      { id: 3, plat_id: 2, name: 'Margherita Pizza', quantity: 1, price: 12.90 }
    ],
    status: OrderStatus.EN_ATTENTE_VALIDATION,
    timestamp: Date.now() - 1000 * 60 * 5,
    totalPrice: 12.90
  }
];

