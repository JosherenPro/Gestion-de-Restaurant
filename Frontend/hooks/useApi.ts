import { useState, useEffect } from 'react';
import { apiService } from '../services/api.service';
import { MenuItem, Categorie, Order, Table, Reservation } from '../types';
import { useAuth } from '../context/AuthContext';

export const useMenu = () => {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [plats, setPlats] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const [categoriesData, platsData] = await Promise.all([
          apiService.getCategories(),
          apiService.getPlats(),
        ]);
        setCategories(categoriesData);
        setPlats(platsData);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement du menu');
        console.error('Error fetching menu:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return { categories, plats, loading, error };
};

export const useTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        const data = await apiService.getTables(token || undefined);
        setTables(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des tables');
        console.error('Error fetching tables:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [token]);

  const refreshTables = async () => {
    try {
      const data = await apiService.getTables(token || undefined);
      setTables(data);
    } catch (err: any) {
      console.error('Error refreshing tables:', err);
    }
  };

  return { tables, loading, error, refreshTables };
};

export const useCommandes = () => {
  const [commandes, setCommandes] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCommandes = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await apiService.getCommandes(token);
        setCommandes(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des commandes');
        console.error('Error fetching commandes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommandes();
  }, [token]);

  const refreshCommandes = async () => {
    if (!token) return;
    
    try {
      const data = await apiService.getCommandes(token);
      setCommandes(data);
    } catch (err: any) {
      console.error('Error refreshing commandes:', err);
    }
  };

  return { commandes, loading, error, refreshCommandes };
};

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchReservations = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await apiService.getReservations(token);
        setReservations(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des réservations');
        console.error('Error fetching reservations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [token]);

  const refreshReservations = async () => {
    if (!token) return;
    
    try {
      const data = await apiService.getReservations(token);
      setReservations(data);
    } catch (err: any) {
      console.error('Error refreshing reservations:', err);
    }
  };

  return { reservations, loading, error, refreshReservations };
};

export const useMenus = () => {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const data = await apiService.getMenus();
        setMenus(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des menus');
        console.error('Error fetching menus:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const refreshMenus = async () => {
    try {
      const data = await apiService.getMenus();
      setMenus(data);
    } catch (err: any) {
      console.error('Error refreshing menus:', err);
    }
  };

  return { menus, loading, error, refreshMenus };
};
