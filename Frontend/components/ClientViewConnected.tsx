import React, { useState, useEffect } from 'react';
import { MenuItem, OrderItem, OrderStatus, Order, Categorie, TypeCommande, Menu, Reservation, Table, TableStatus } from '../types';
import { Button, Card, Modal } from './UI';
import { ShoppingBasket, Search, Plus, Minus, CheckCircle, Calendar, Star, MessageSquare, Loader, Sparkles, ChefHat, Clock, Award, TrendingUp, Heart, X, UtensilsCrossed, CreditCard, Wallet, Smartphone, Receipt, XCircle, LogOut, User, History, Edit, Trash2, Home, Utensils, MapPin } from 'lucide-react';
import { useMenu, useMenus } from '../hooks/useApi';
import { apiService } from '../services/api.service';
import { API_CONFIG } from '../config/api.config';
import { formatPrice } from '../mockData';
import { ClientAuthModal } from './ClientAuthModal';
import { BottomTabBar } from './BottomTabBar';

export const ClientView: React.FC = () => {
  const { categories, plats, loading } = useMenu();
  const { menus, loading: menusLoading } = useMenus();
  const [activeCategory, setActiveCategory] = useState<number | 'ALL'>('ALL');
  const [basket, setBasket] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('client_basket');
    return saved ? JSON.parse(saved) : [];
  });
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [step, setStep] = useState<'HOME' | 'MENU' | 'MENUS_LIST' | 'TRACKING'>('HOME');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderError, setOrderError] = useState<string | null>(null);

  // Table selection state
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [loadingTables, setLoadingTables] = useState(false);

  // Reservation state
  const [reservationData, setReservationData] = useState({
    nbPersonnes: 2,
    dateReservation: '',
    commentaire: '',
  });
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);

  // Simple guest mode - no auth required

  // Authentication state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [clientToken, setClientToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [clientData, setClientData] = useState<any>(null);

  // Payment state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('card');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Addition/Bill state
  const [isAdditionOpen, setIsAdditionOpen] = useState(false);
  const [additionData, setAdditionData] = useState<any>(null);

  // Cancel order state
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Review state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // My Reservations state
  const [isMyReservationsOpen, setIsMyReservationsOpen] = useState(false);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);

  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  // Advanced UX State
  const [selectedPlat, setSelectedPlat] = useState<MenuItem | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleFavorite = (platId: number) => {
    setFavorites(prev => {
      const isFav = prev.includes(platId);
      const next = isFav ? prev.filter(id => id !== platId) : [...prev, platId];
      localStorage.setItem('client_favorites', JSON.stringify(next));
      showToast(isFav ? 'Retiré des favoris' : 'Ajouté aux favoris', isFav ? 'info' : 'success');
      return next;
    });
  };

  const fetchMyOrders = async () => {
    try {
      const orders = await apiService.getCommandes(clientToken || undefined);
      // Filter by current client if clientData exists
      setMyOrders(orders);
      setIsMyOrdersOpen(true);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const viewOrderDetails = (order: Order) => {
    setCurrentOrder(order);
    setStep('TRACKING');
    setIsMyOrdersOpen(false);
  };
  const CLIENT_ID = 1;
  // const TABLE_ID = 1; // Removed hardcoded table ID

  // Fetch tables
  useEffect(() => {
    const fetchTables = async () => {
      setLoadingTables(true);
      try {
        // Use API_CONFIG for consistent URL construction
        const data = await apiService.get(API_CONFIG.ENDPOINTS.TABLES.BASE, { token: clientToken || undefined });
        setTables(data);
      } catch (err) {
        console.error('Error fetching tables:', err);
      } finally {
        setLoadingTables(false);
      }
    };
    fetchTables();
  }, [clientToken]);

  const addToBasket = (item: MenuItem) => {
    setBasket(prev => {
      const existing = prev.find(i => i.plat_id === item.id);
      if (existing) {
        return prev.map(i =>
          i.plat_id === item.id
            ? { ...i, quantite: i.quantite + 1 }
            : i
        );
      }
      return [...prev, {
        plat_id: item.id,
        plat: item,
        quantite: 1,
        prix_unitaire: item.prix
      }];
    });
  };

  const removeFromBasket = (platId: number) => {
    setBasket(prev => {
      const existing = prev.find(i => i.plat_id === platId);
      if (existing && existing.quantite > 1) {
        return prev.map(i =>
          i.plat_id === platId
            ? { ...i, quantite: i.quantite - 1 }
            : i
        );
      }
      return prev.filter(i => i.plat_id !== platId);
    });
  };

  const totalInCentimes = basket.reduce((acc, item) =>
    acc + (item.prix_unitaire * item.quantite), 0
  );

  const placeOrder = async () => {
    try {
      setOrderError(null);
      console.log('?? Création de la commande...');

      if (!selectedTable) {
        setOrderError('Veuillez sélectionner une table');
        return;
      }

      // Create the order with auth if available
      const orderData = {
        client_id: clientData ? clientData.id : CLIENT_ID,
        table_id: selectedTable,
        type_commande: TypeCommande.SUR_PLACE,
        montant_total: totalInCentimes,
        notes: clientToken ? 'Commande client authentifié' : 'Commande client sans authentification'
      };

      const newOrder = await apiService.createCommande(orderData, clientToken || undefined);
      console.log('? Commande créée:', newOrder);

      // Add each item as a line
      for (const item of basket) {
        await apiService.addLigneCommande(newOrder.id, {
          commande_id: newOrder.id,
          plat_id: item.plat_id,
          quantite: item.quantite,
          prix_unitaire: item.prix_unitaire,
          notes_speciales: item.notes_speciales || ''
        }, clientToken || undefined);
      }

      console.log('? Commande envoyée aux cuisiniers!');
      setCurrentOrder(newOrder);
      setBasket([]);
      setIsBasketOpen(false);
      setStep('TRACKING');
    } catch (error: any) {
      console.error('? Erreur commande:', error);
      setOrderError(error.message || 'Erreur lors de la création de la commande');
    }
  };

  const createReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setReservationError(null);
      setReservationSuccess(false);

      if (!reservationData.dateReservation) {
        setReservationError('Veuillez sélectionner une date et une heure');
        return;
      }
      if (!selectedTable) {
        setReservationError('Veuillez sélectionner une table');
        return;
      }

      const reservationDateTime = new Date(reservationData.dateReservation).toISOString();
      const reservationPayload = {
        client_id: clientData?.id || CLIENT_ID,
        table_id: selectedTable,
        date_reservation: reservationDateTime,
        nombre_personnes: reservationData.nbPersonnes,
        notes: reservationData.commentaire || undefined
      };

      if (selectedReservation) {
        await apiService.updateReservation(selectedReservation.id, reservationPayload, clientToken || '');
      } else {
        await apiService.createReservation(reservationPayload, clientToken || undefined);
      }

      setReservationSuccess(true);

      setTimeout(() => {
        setReservationSuccess(false);
        setIsReservationOpen(false);
        setSelectedReservation(null);
        setReservationData({ nbPersonnes: 2, dateReservation: '', commentaire: '' });
      }, 2000);
    } catch (err: any) {
      setReservationError(err.message || 'Erreur lors de la réservation');
    }
  };
  const filteredPlats = plats.filter(plat => {
    const matchesCategory = activeCategory === 'ALL' || plat.categorie_id === activeCategory;
    const matchesSearch = plat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesCategory && matchesSearch && plat.disponible;
  });


  // Load user data on mount if token exists
  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const userData = await apiService.getCurrentUser(token);
          setClientData(userData);
          setClientToken(token);
        } catch (err) {
          localStorage.removeItem('auth_token');
          setClientToken(null);
        }
      }
    };
    loadUserData();
  }, []);

  // Handle auth success
  const handleAuthSuccess = (token: string, userData: any) => {
    setClientToken(token);
    setClientData(userData);
    setIsAuthOpen(false);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setClientToken(null);
    setClientData(null);
  };

  // Save basket to localStorage
  useEffect(() => {
    localStorage.setItem('client_basket', JSON.stringify(basket));
  }, [basket]);

  // Fetch Addition
  const fetchAddition = async () => {
    if (!currentOrder) return;
    try {
      const data = await apiService.getAddition(currentOrder.id, clientToken || undefined);
      setAdditionData(data);
      setIsAdditionOpen(true);
    } catch (err) {
      console.error('Error fetching addition:', err);
    }
  };

  // Process Payment
  const processPayment = async () => {
    if (!currentOrder) return;
    setPaymentLoading(true);
    try {
      await apiService.payerCommande(currentOrder.id, paymentMethod, clientToken || undefined);
      setPaymentSuccess(true);
      setCurrentOrder({ ...currentOrder, status: OrderStatus.PAYEE });
      setTimeout(() => {
        setIsPaymentOpen(false);
        setPaymentSuccess(false);
        setStep('HOME');
      }, 2000);
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Cancel Order
  const cancelOrder = async () => {
    if (!currentOrder) return;
    setCancelLoading(true);
    try {
      // Note: Backend might need a cancel endpoint - using status update for now
      setCurrentOrder({ ...currentOrder, status: OrderStatus.ANNULEE });
      setIsCancelOpen(false);
      setTimeout(() => setStep('HOME'), 1500);
    } catch (err) {
      console.error('Cancel error:', err);
    } finally {
      setCancelLoading(false);
    }
  };

  // Confirm Reception
  const confirmReception = async () => {
    if (!currentOrder) return;
    try {
      await apiService.receptionnerCommande(currentOrder.id, clientToken || undefined);
      setCurrentOrder({ ...currentOrder, status: OrderStatus.RECEPTIONNEE });
      setIsReviewOpen(true);
    } catch (err) {
      console.error('Reception error:', err);
    }
  };

  // Submit Review
  const submitReview = async () => {
    if (!currentOrder || reviewRating === 0) return;
    setReviewLoading(true);
    try {
      await apiService.createAvis({
        client_id: clientData?.id || CLIENT_ID,
        commande_id: currentOrder.id,
        note: reviewRating,
        commentaire: reviewComment || undefined
      }, clientToken || undefined);
      setReviewSuccess(true);
      setTimeout(() => {
        setIsReviewOpen(false);
        setReviewSuccess(false);
        setReviewRating(0);
        setReviewComment('');
      }, 2000);
    } catch (err) {
      console.error('Review error:', err);
    } finally {
      setReviewLoading(false);
    }
  };

  // Fetch reservations
  const fetchMyReservations = async () => {
    try {
      const data = await apiService.getReservations(clientToken || undefined);
      // Normaliser les données (backend status -> frontend statut)
      const normalizedData = data.map((res: any) => ({
        ...res,
        status: (res.statut || res.status || 'EN_ATTENTE').toUpperCase()
      }));
      setMyReservations(normalizedData);
      setIsMyReservationsOpen(true);
    } catch (err) {
      console.error('Error fetching reservations:', err);
    }
  };
  // Edit reservation
  const openEditReservation = (res: any) => {
    setReservationData({
      nbPersonnes: res.nombre_personnes,
      dateReservation: new Date(res.date_reservation).toISOString().slice(0, 16),
      commentaire: res.notes || ''
    });
    setSelectedReservation(res);
    setIsMyReservationsOpen(false);
    setIsReservationOpen(true);
  };

  // Cancel reservation
  const cancelReservation = async (id: number) => {
    try {
      await apiService.annulerReservation(id, clientToken || '');
      setMyReservations(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error canceling reservation:', err);
    }
  };

  const getImageUrl = (imageUrl?: string) => {
    if (imageUrl) {
      if (imageUrl.startsWith('http')) return imageUrl;
      // Remove leading slash if present to avoid double slashes
      const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
      return `${API_CONFIG.BASE_URL}/${cleanPath}`;
    }
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&h=300';
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-[#FC8A06] mx-auto" />
          <p className="mt-4 text-gray-500">Chargement du menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      {/* FLOATING HEADER - Premium & Glassmorphism */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <div className="max-w-md mx-auto bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/60 p-4 flex items-center justify-between">
          <button onClick={() => setStep('HOME')} className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FC8A06] to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-black text-lg tracking-tight text-[#03081F]">RestoDeluxe</span>
              <span className="text-[9px] font-bold text-[#FC8A06] uppercase tracking-widest">Expérience Premium</span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {/* Auth Button */}
            {clientToken ? (
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 rounded-2xl px-3 py-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#FC8A06]" />
                  <span className="text-xs font-bold text-[#03081F] truncate max-w-[80px]">
                    {clientData?.prenom || 'Client'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="bg-[#03081F] text-white rounded-2xl px-4 py-2 text-xs font-bold hover:bg-gray-800 transition-all"
              >
                Connexion
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto pt-24 pb-32">
        {/* HOME SCREEN - Hero Section */}
        {step === 'HOME' && (
          <div className="px-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Banner with Parallax Effect */}
            <div className="relative h-72 rounded-[2.5rem] overflow-hidden shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt="Restaurant"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <span className="text-white/90 text-sm font-bold uppercase tracking-widest">Ouvert Maintenant</span>
                </div>
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                  Bienvenue chez<br />RestoDeluxe
                </h1>
                <p className="text-white/80 text-sm font-medium flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Cuisine gastronomique • Service premium
                </p>
              </div>
            </div>

            {/* Food Gallery Carousel */}
            <div className="grid grid-cols-3 gap-3">
              {[
                'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80'
              ].map((img, i) => (
                <div key={i} className="relative h-32 rounded-[1.5rem] overflow-hidden shadow-lg group cursor-pointer">
                  <img
                    src={img}
                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                    alt={`Food ${i + 1}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Star, label: '4.9/5', sublabel: 'Avis', color: 'from-yellow-400 to-orange-500' },
                { icon: Clock, label: '20 min', sublabel: 'Temps moy.', color: 'from-blue-400 to-cyan-500' },
                { icon: TrendingUp, label: 'Top 3', sublabel: 'Restaurants', color: 'from-purple-400 to-pink-500' }
              ].map((stat, i) => (
                <Card key={i} className="p-4 bg-white border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3 shadow-md`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-black text-xl text-[#03081F]">{stat.label}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{stat.sublabel}</p>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setStep('MENU')}
                className="w-full bg-gradient-to-r from-[#FC8A06] to-orange-600 text-white rounded-[1.5rem] p-6 shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:-translate-y-1 active:scale-95 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-lg tracking-tight">Commander des Plats</p>
                      <p className="text-xs text-white/80 font-medium">Parcourir notre carte</p>
                    </div>
                  </div>
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </button>

              <button
                onClick={() => setStep('MENUS_LIST')}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-[1.5rem] p-6 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:-translate-y-1 active:scale-95 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <UtensilsCrossed className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-lg tracking-tight">Découvrir les Menus</p>
                      <p className="text-xs text-white/80 font-medium">Formules complètes à prix fixe</p>
                    </div>
                  </div>
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsReservationOpen(true)}
                className="bg-white rounded-[1.5rem] p-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 border border-gray-100"
              >
                <Calendar className="w-6 h-6 text-[#FC8A06] mb-2" />
                <p className="font-bold text-sm text-[#03081F]">Réserver</p>
                <p className="text-[10px] text-gray-400 font-medium">Une table</p>
              </button>

              <button
                onClick={() => setIsReviewOpen(true)}
                className="bg-white rounded-[1.5rem] p-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 border border-gray-100"
              >
                <Star className="w-6 h-6 text-yellow-400 mb-2" />
                <p className="font-bold text-sm text-[#03081F]">Avis</p>
                <p className="text-[10px] text-gray-400 font-medium">Votre expérience</p>
              </button>

              {clientToken && (
                <>
                  <button
                    onClick={fetchMyReservations}
                    className="bg-white rounded-[1.5rem] p-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 border border-gray-100"
                  >
                    <History className="w-6 h-6 text-blue-500 mb-2" />
                    <p className="font-bold text-sm text-[#03081F]">Mes Résas</p>
                    <p className="text-[10px] text-gray-400 font-medium">Historique</p>
                  </button>

                  <button
                    onClick={fetchMyOrders}
                    className="bg-[#03081F] rounded-[1.5rem] p-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 text-white"
                  >
                    <ShoppingBasket className="w-6 h-6 text-[#FC8A06] mb-2" />
                    <p className="font-bold text-sm">Mes Commandes</p>
                    <p className="text-[10px] text-gray-400 font-medium">Historique</p>
                  </button>
                </>
              )}
            </div>

            {/* Trust Badges */}
            <Card className="p-5 bg-gradient-to-br from-gray-50 to-white border-none shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Pourquoi nous choisir</p>
              <div className="space-y-2">
                {['Ingrédients frais & locaux', 'Service impeccable', 'Ambiance chaleureuse'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* MENU SCREEN - Enhanced Design */}
        {step === 'MENU' && (
          <div className="space-y-6">
            {/* Category Chips - Horizontal Scroll */}
            <div className="px-4 overflow-x-auto no-scrollbar">
              <div className="flex gap-3 pb-2">
                <button
                  onClick={() => setActiveCategory('ALL')}
                  className={`whitespace-nowrap px-6 py-3 rounded-[1.2rem] font-bold text-sm transition-all ${activeCategory === 'ALL'
                    ? 'bg-gradient-to-r from-[#FC8A06] to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105'
                    : 'bg-white text-gray-600 shadow-md hover:shadow-lg'
                    }`}
                >
                  Tous les plats
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`whitespace-nowrap px-6 py-3 rounded-[1.2rem] font-bold text-sm transition-all ${activeCategory === cat.id
                      ? 'bg-gradient-to-r from-[#FC8A06] to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105'
                      : 'bg-white text-gray-600 shadow-md hover:shadow-lg'
                      }`}
                  >
                    {cat.nom}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar - Enhanced */}
            <div className="px-4">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#FC8A06] transition-colors" />
                <input
                  type="text"
                  placeholder="Rechercher un délice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border-2 border-gray-100 rounded-[1.5rem] py-4 pl-14 pr-4 shadow-lg focus:border-[#FC8A06] focus:shadow-xl outline-none font-medium transition-all"
                />
              </div>
            </div>

            {/* Menu Items - Premium Cards */}
            <div className="px-4 space-y-4">
              {filteredPlats.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-gray-400 font-medium">Aucun plat trouvé</p>
                </div>
              ) : (
                filteredPlats.map((plat, index) => (
                  <Card
                    key={plat.id}
                    onClick={() => setSelectedPlat(plat)}
                    className="p-0 border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white rounded-[2rem] overflow-hidden group cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex gap-0">
                      {/* Image Section */}
                      <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden">
                        <img
                          src={getImageUrl(plat.image_url)}
                          className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                          alt={plat.nom}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {/* Add to cart button on image */}
                        <button
                          onClick={() => addToBasket(plat)}
                          className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-[0.8rem] shadow-lg flex items-center justify-center text-[#FC8A06] hover:bg-[#FC8A06] hover:text-white transition-all hover:scale-110 active:scale-95 z-10"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-black text-base text-[#03081F] group-hover:text-[#FC8A06] transition-colors line-clamp-1">
                              {plat.nom}
                            </h3>
                            <Heart className="w-5 h-5 text-gray-300 hover:text-red-500 hover:fill-red-500 transition-all cursor-pointer flex-shrink-0" />
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                            {plat.description || 'Un délicieux plat préparé avec soin par nos chefs'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-[#FC8A06]">{formatPrice(plat.prix)} FCFA</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs font-bold text-gray-600">4.{Math.floor(Math.random() * 3) + 7}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* MENUS LIST SCREEN - Display all menus */}
        {step === 'MENUS_LIST' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="px-4">
              <button
                onClick={() => setStep('HOME')}
                className="text-gray-500 hover:text-[#FC8A06] font-medium text-sm flex items-center gap-2 mb-4"
              >
                ? Retour à l'accueil
              </button>
              <h2 className="text-3xl font-black text-[#03081F] mb-2">Nos Menus</h2>
              <p className="text-gray-500">Découvrez nos formules complètes à prix fixe</p>
            </div>

            {menusLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader className="w-8 h-8 animate-spin text-[#FC8A06]" />
              </div>
            ) : menus.length === 0 ? (
              <div className="px-4 text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                  <UtensilsCrossed className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">Aucun menu disponible pour le moment</p>
              </div>
            ) : (
              <div className="px-4 space-y-4">
                {menus.filter((menu: Menu) => menu.actif).map((menu: Menu, index: number) => (
                  <Card
                    key={menu.id}
                    className="p-0 border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-purple-50 rounded-[2rem] overflow-hidden group cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="p-6">
                      {/* Menu Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                              <UtensilsCrossed className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-black text-xl text-[#03081F] group-hover:text-purple-600 transition-colors">
                                {menu.nom}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Award className="w-4 h-4 text-yellow-400" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Formule complète</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-purple-600">{formatPrice(menu.prix_fixe)} FCFA</span>
                          </div>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Prix fixe</span>
                        </div>
                      </div>

                      {/* Menu Description / Plats */}
                      <div className="bg-white/60 rounded-[1.5rem] p-4 mb-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ce menu comprend :</p>
                        {menu.contenus && menu.contenus.length > 0 ? (
                          <div className="space-y-2">
                            {menu.contenus.slice(0, 3).map((contenu: any) => {
                              const plat = plats.find(p => p.id === contenu.plat_id);
                              return plat ? (
                                <div key={contenu.plat_id} className="flex items-center gap-2 text-sm text-gray-700">
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  <span className="font-medium">{plat.nom}</span>
                                </div>
                              ) : null;
                            })}
                            {menu.contenus.length > 3 && (
                              <p className="text-xs text-gray-400 font-medium italic">+ {menu.contenus.length - 3} autres plats...</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">Menu personnalisable avec notre sélection</p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            // Add all plats from menu to basket
                            if (menu.contenus && menu.contenus.length > 0) {
                              menu.contenus.forEach((contenu: any) => {
                                const plat = plats.find(p => p.id === contenu.plat_id);
                                if (plat && plat.disponible) {
                                  addToBasket(plat);
                                }
                              });
                              setIsBasketOpen(true);
                            }
                          }}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-[1.2rem] py-4 px-6 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:-translate-y-1 active:scale-95 font-bold flex items-center justify-center gap-2"
                        >
                          <ShoppingBasket className="w-5 h-5" />
                          Commander ce menu
                        </button>
                        <button
                          className="w-14 h-14 bg-white border-2 border-gray-100 rounded-[1.2rem] flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-all"
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Additional Info */}
                      <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span className="font-medium">~30 min</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="font-bold text-gray-600">4.{Math.floor(Math.random() * 3) + 7}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider bg-green-50 px-3 py-1 rounded-full">
                          Économisez {formatPrice(menu.contenus ? menu.contenus.reduce((acc: number, c: any) => {
                            const plat = plats.find(p => p.id === c.plat_id);
                            return acc + (plat?.prix || 0);
                          }, 0) - menu.prix_fixe : 0)} FCFA
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TRACKING SCREEN - Enhanced Timeline */}
        {step === 'TRACKING' && currentOrder && (
          <div className="px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="p-8 bg-gradient-to-br from-white to-green-50 border-none shadow-2xl rounded-[2.5rem]">
              {/* Success Header */}
              <div className="flex items-center justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-[#03081F] mb-2">Commande Confirmée !</h2>
                <p className="text-sm text-gray-500 font-medium">Commande #{currentOrder.id}</p>
              </div>

              {/* Enhanced Timeline */}
              <div className="relative py-6 mb-8">
                {/* Progress Line */}
                <div className="absolute left-[2.4rem] top-12 bottom-12 w-1 bg-gradient-to-b from-[#FC8A06] via-orange-400 to-gray-200 rounded-full"></div>

                <div className="space-y-8">
                  {[
                    {
                      status: OrderStatus.EN_ATTENTE_VALIDATION,
                      label: 'En attente',
                      sublabel: 'Commande reçue',
                      icon: Clock,
                      active: currentOrder.status === OrderStatus.EN_ATTENTE_VALIDATION
                    },
                    {
                      status: OrderStatus.VALIDEE,
                      label: 'Validée',
                      sublabel: 'Par notre équipe',
                      icon: CheckCircle,
                      active: [OrderStatus.VALIDEE, OrderStatus.EN_COURS, OrderStatus.PRETE, OrderStatus.SERVIE].includes(currentOrder.status)
                    },
                    {
                      status: OrderStatus.EN_COURS,
                      label: 'En préparation',
                      sublabel: 'Nos chefs au travail',
                      icon: ChefHat,
                      active: [OrderStatus.EN_COURS, OrderStatus.PRETE, OrderStatus.SERVIE].includes(currentOrder.status)
                    },
                    {
                      status: OrderStatus.PRETE,
                      label: 'Prêt !',
                      sublabel: 'Bonne dégustation',
                      icon: Sparkles,
                      active: [OrderStatus.PRETE, OrderStatus.SERVIE].includes(currentOrder.status)
                    },
                  ].map((s, idx) => (
                    <div key={idx} className="flex items-center gap-5 relative">
                      {/* Icon */}
                      <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${s.active
                        ? 'bg-gradient-to-br from-[#FC8A06] to-orange-600 shadow-orange-500/50 scale-110'
                        : 'bg-white shadow-gray-200'
                        }`}>
                        <s.icon className={`w-6 h-6 ${s.active ? 'text-white' : 'text-gray-300'}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <p className={`font-black text-base transition-all ${s.active ? 'text-[#03081F]' : 'text-gray-400'}`}>
                          {s.label}
                        </p>
                        <p className={`text-xs font-medium transition-all ${s.active ? 'text-gray-600' : 'text-gray-400'}`}>
                          {s.sublabel}
                        </p>
                      </div>

                      {/* Active indicator */}
                      {s.active && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-[9px] font-bold text-green-600 uppercase tracking-wider">Actif</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Actions */}
              <div className="pt-6 border-t-2 border-dashed border-gray-200 space-y-4">
                <div className="bg-white rounded-[1.5rem] p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total à régler</span>
                    <span className="text-3xl font-black text-[#FC8A06]">{formatPrice(currentOrder.montant_total)} FCFA</span>
                  </div>
                </div>

                {/* Action Buttons based on order status */}
                <div className="space-y-3">
                  {/* View Addition */}
                  <button
                    onClick={fetchAddition}
                    className="w-full bg-white border-2 border-gray-200 text-[#03081F] rounded-[1.5rem] p-4 font-bold flex items-center justify-center gap-3 hover:border-[#FC8A06] transition-all"
                  >
                    <Receipt className="w-5 h-5 text-[#FC8A06]" />
                    Voir l'addition
                  </button>

                  {/* Cancel Order - only before EN_COURS */}
                  {[OrderStatus.EN_ATTENTE_VALIDATION, OrderStatus.VALIDEE].includes(currentOrder.status) && (
                    <button
                      onClick={() => setIsCancelOpen(true)}
                      className="w-full bg-red-50 border-2 border-red-200 text-red-600 rounded-[1.5rem] p-4 font-bold flex items-center justify-center gap-3 hover:bg-red-100 transition-all"
                    >
                      <XCircle className="w-5 h-5" />
                      Annuler la commande
                    </button>
                  )}

                  {/* Confirm Reception - only when SERVIE */}
                  {currentOrder.status === OrderStatus.SERVIE && (
                    <button
                      onClick={confirmReception}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-[1.5rem] p-5 shadow-xl font-bold flex items-center justify-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5" />
                      J'ai reçu ma commande
                    </button>
                  )}

                  {/* Pay Button - main action (only visible after server validation) */}
                  {currentOrder.status !== OrderStatus.PAYEE && currentOrder.status !== OrderStatus.ANNULEE && currentOrder.status !== OrderStatus.EN_ATTENTE_VALIDATION && (
                    <button
                      onClick={() => setIsPaymentOpen(true)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-[1.5rem] p-5 shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transition-all hover:-translate-y-1 active:scale-95 font-bold flex items-center justify-center gap-3"
                    >
                      <CreditCard className="w-5 h-5" />
                      Payer maintenant
                    </button>
                  )}

                  {/* Message when waiting for server validation */}
                  {currentOrder.status === OrderStatus.EN_ATTENTE_VALIDATION && (
                    <div className="w-full bg-yellow-50 border-2 border-yellow-200 text-yellow-700 rounded-[1.5rem] p-5 font-bold flex items-center justify-center gap-3">
                      <Clock className="w-5 h-5" />
                      En attente de validation par le serveur
                    </div>
                  )}

                  {/* Paid confirmation */}
                  {currentOrder.status === OrderStatus.PAYEE && (
                    <div className="w-full bg-green-50 border-2 border-green-200 text-green-700 rounded-[1.5rem] p-5 font-bold flex items-center justify-center gap-3">
                      <CheckCircle className="w-5 h-5" />
                      Commande payée - Merci !
                    </div>
                  )}

                  <button
                    onClick={() => setStep('HOME')}
                    className="w-full text-gray-500 hover:text-[#03081F] py-3 font-bold transition-all"
                  >
                    Retour à l'accueil
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* BASKET MODAL - Premium Design */}
      <Modal isOpen={isBasketOpen} onClose={() => setIsBasketOpen(false)} title="">
        <div className="relative">
          {/* Custom Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-[#03081F]">Mon Panier</h2>
              <p className="text-sm text-gray-500 font-medium">{basket.length} article{basket.length > 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => setIsBasketOpen(false)}
              className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {basket.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                <ShoppingBasket className="w-12 h-12 text-gray-300" />
              </div>
              <p className="text-gray-400 font-bold text-lg mb-2">Panier vide</p>
              <p className="text-sm text-gray-400 mb-6">Ajoutez des plats pour commencer</p>
              <Button variant="primary" onClick={() => setIsBasketOpen(false)} className="rounded-[1.2rem]">
                Parcourir le menu
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orderError && (
                <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-[1.2rem] text-sm font-medium">
                  {orderError}
                </div>
              )}

              {/* Items List */}
              <div className="max-h-80 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {basket.map(item => (
                  <div key={item.plat_id} className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      {/* Quantity Badge */}
                      <div className="w-12 h-12 bg-gradient-to-br from-[#FC8A06] to-orange-600 rounded-[1rem] flex items-center justify-center shadow-lg flex-shrink-0">
                        <span className="text-white font-black text-lg">{item.quantite}</span>
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#03081F] truncate">{item.plat?.nom}</p>
                        <p className="text-xs text-gray-500 font-medium">{formatPrice(item.prix_unitaire)} FCFA × {item.quantite}</p>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={() => removeFromBasket(item.plat_id)}
                          className="w-9 h-9 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all active:scale-90"
                        >
                          <Minus className="w-4 h-4 mx-auto" />
                        </button>
                        <button
                          onClick={() => item.plat && addToBasket(item.plat)}
                          className="w-9 h-9 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all active:scale-90"
                        >
                          <Plus className="w-4 h-4 mx-auto" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <p className="font-black text-[#FC8A06] text-lg">
                        {formatPrice(item.prix_unitaire * item.quantite)} FCFA
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Selection */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  Choisissez votre table
                </label>
                {loadingTables ? (
                  <div className="flex justify-center py-4"><Loader className="w-5 h-5 animate-spin text-[#FC8A06]" /></div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                    {tables.map(table => (
                      <button
                        key={table.id}
                        disabled={table.statut !== TableStatus.LIBRE && selectedTable !== table.id}
                        onClick={() => setSelectedTable(table.id)}
                        className={`h-10 rounded-xl font-black text-sm transition-all border-2 ${selectedTable === table.id
                          ? 'bg-[#FC8A06] border-[#FC8A06] text-white shadow-lg shadow-orange-200 scale-105'
                          : table.statut === TableStatus.LIBRE
                            ? 'bg-white border-green-100 text-green-600 hover:border-green-300 hover:bg-green-50'
                            : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                          }`}
                      >
                        {table.numero_table}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="space-y-3 pt-4 border-t-2 border-dashed border-gray-200">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-[1.5rem] p-6 shadow-inner">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Total</span>
                    <span className="text-4xl font-black text-[#FC8A06]">{formatPrice(totalInCentimes)} FCFA</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium text-right">Taxes et service inclus</p>
                </div>

                <button
                  onClick={placeOrder}
                  className="w-full bg-gradient-to-r from-[#FC8A06] to-orange-600 text-white rounded-[1.5rem] p-6 shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 transition-all hover:-translate-y-1 active:scale-95 font-black text-lg"
                >
                  Commander maintenant
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* RESERVATION MODAL - Modern Design */}
      <Modal isOpen={isReservationOpen} onClose={() => setIsReservationOpen(false)} title="">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-[#03081F]">Réservation</h2>
              <p className="text-sm text-gray-500 font-medium">{selectedReservation ? "Mettez à jour vos informations" : "Garantissez votre table"}</p>
            </div>
            <button
              onClick={() => setIsReservationOpen(false)}
              className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {reservationSuccess ? (
            <div className="py-16 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-black text-[#03081F] mb-2">Réservation envoyée !</h3>
              <p className="text-gray-500 font-medium">Le gérant va examiner votre demande</p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={createReservation}>
              {reservationError && (
                <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-[1.2rem] text-sm font-medium">
                  {reservationError}
                </div>
              )}

              {/* Number of guests */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Nombre de personnes</label>
                <div className="grid grid-cols-4 gap-3">
                  {[2, 4, 6, 8].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReservationData(prev => ({ ...prev, nbPersonnes: n }))}
                      className={`h-14 border-2 rounded-[1.2rem] font-black text-lg transition-all active:scale-95 ${reservationData.nbPersonnes === n
                        ? 'border-[#FC8A06] bg-orange-50 text-[#FC8A06]'
                        : 'border-gray-200 hover:border-[#FC8A06] hover:bg-orange-50 hover:text-[#FC8A06]'
                        }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Date & Heure</label>
                <input
                  type="datetime-local"
                  required
                  value={reservationData.dateReservation}
                  onChange={(e) => setReservationData(prev => ({ ...prev, dateReservation: e.target.value }))}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-[1.2rem] font-medium outline-none focus:border-[#FC8A06] transition-all"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Commentaire (optionnel)</label>
                <textarea
                  value={reservationData.commentaire}
                  onChange={(e) => setReservationData(prev => ({ ...prev, commentaire: e.target.value }))}
                  placeholder="Allergie, demande spéciale..."
                  className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-[1.2rem] h-24 outline-none focus:border-[#FC8A06] resize-none font-medium transition-all"
                />
              </div>

              {/* Table Selection for Reservation */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Table souhaitée</label>
                {loadingTables ? (
                  <div className="flex justify-center py-4"><Loader className="w-5 h-5 animate-spin text-[#FC8A06]" /></div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                    {tables.map(table => (
                      <button
                        key={table.id}
                        type="button"
                        onClick={() => setSelectedTable(table.id)}
                        className={`h-10 rounded-xl font-black text-sm transition-all border-2 ${selectedTable === table.id
                          ? 'bg-[#FC8A06] border-[#FC8A06] text-white shadow-lg shadow-orange-200'
                          : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                      >
                        {table.numero_table}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#FC8A06] to-orange-600 text-white rounded-[1.5rem] p-5 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:-translate-y-1 active:scale-95 font-bold mt-6"
              >
                Confirmer ma réservation
              </button>
            </form>
          )}
        </div>
      </Modal>

      {/* REVIEW MODAL - Connected to API */}
      <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title="">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-[#03081F]">Votre Avis</h2>
              <p className="text-sm text-gray-500 font-medium">Partagez votre expérience</p>
            </div>
            <button
              onClick={() => setIsReviewOpen(false)}
              className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {reviewSuccess ? (
            <div className="py-16 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-black text-[#03081F] mb-2">Merci pour votre avis !</h3>
              <p className="text-gray-500 font-medium">Votre retour nous aide à nous améliorer</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-5 font-medium">Comment s'est passée votre visite ?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`transition-all hover:scale-125 active:scale-110 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-400'
                        }`}
                    >
                      <Star className="w-12 h-12 fill-current" />
                    </button>
                  ))}
                </div>
                {reviewRating > 0 && (
                  <p className="mt-2 text-sm font-bold text-[#FC8A06]">
                    {reviewRating === 5 ? 'Excellent !' : reviewRating === 4 ? 'Très bien' : reviewRating === 3 ? 'Correct' : reviewRating === 2 ? 'Décevant' : 'Mauvais'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Votre commentaire</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Partagez votre expérience avec nous..."
                  className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-[1.5rem] h-32 outline-none focus:border-[#FC8A06] resize-none font-medium transition-all"
                />
              </div>

              <button
                onClick={submitReview}
                disabled={reviewRating === 0 || reviewLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-[1.5rem] p-5 shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:-translate-y-1 active:scale-95 font-bold disabled:opacity-50"
              >
                {reviewLoading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : 'Envoyer mon avis'}
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* PAYMENT MODAL */}
      <Modal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} title="">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-[#03081F]">Paiement</h2>
              <p className="text-sm text-gray-500 font-medium">Choisissez votre méthode</p>
            </div>
            <button onClick={() => setIsPaymentOpen(false)} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {paymentSuccess ? (
            <div className="py-16 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-black text-[#03081F] mb-2">Paiement réussi !</h3>
              <p className="text-gray-500 font-medium">Merci pour votre visite</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentOrder && (
                <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                  <p className="text-sm text-gray-500">Montant à payer</p>
                  <p className="text-3xl font-black text-[#FC8A06]">{formatPrice(currentOrder.montant_total)} FCFA</p>
                </div>
              )}

              <div className="space-y-3">
                {[
                  { id: 'card', icon: CreditCard, label: 'Carte bancaire', color: 'from-blue-500 to-indigo-600' },
                  { id: 'mobile', icon: Smartphone, label: 'Mobile Money', color: 'from-orange-500 to-red-500' },
                  { id: 'cash', icon: Wallet, label: 'Espèces', color: 'from-green-500 to-emerald-600' }
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${paymentMethod === method.id
                      ? 'border-[#FC8A06] bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${method.color} rounded-xl flex items-center justify-center`}>
                      <method.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-[#03081F]">{method.label}</span>
                    {paymentMethod === method.id && <CheckCircle className="w-5 h-5 text-[#FC8A06] ml-auto" />}
                  </button>
                ))}
              </div>

              <button
                onClick={processPayment}
                disabled={paymentLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-[1.5rem] p-5 shadow-xl shadow-green-500/30 mt-4 font-bold disabled:opacity-50"
              >
                {paymentLoading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : 'Confirmer le paiement'}
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* CANCEL CONFIRMATION MODAL */}
      <Modal isOpen={isCancelOpen} onClose={() => setIsCancelOpen(false)} title="">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-black text-[#03081F] mb-2">Annuler la commande ?</h3>
          <p className="text-gray-500 mb-6">Cette action est irréversible</p>
          <div className="flex gap-3">
            <button
              onClick={() => setIsCancelOpen(false)}
              className="flex-1 bg-gray-100 text-gray-700 rounded-xl p-4 font-bold hover:bg-gray-200 transition-all"
            >
              Non, garder
            </button>
            <button
              onClick={cancelOrder}
              disabled={cancelLoading}
              className="flex-1 bg-red-500 text-white rounded-xl p-4 font-bold hover:bg-red-600 transition-all disabled:opacity-50"
            >
              {cancelLoading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : 'Oui, annuler'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ADDITION/BILL MODAL */}
      <Modal isOpen={isAdditionOpen} onClose={() => setIsAdditionOpen(false)} title="">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-[#03081F]">L'Addition</h2>
              <p className="text-sm text-gray-500 font-medium">Détail de votre commande</p>
            </div>
            <button onClick={() => setIsAdditionOpen(false)} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {currentOrder && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                {currentOrder.lignes?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#03081F]">{item.plat?.nom || 'Article'}</p>
                      <p className="text-xs text-gray-500">{item.quantite}x @ {formatPrice(item.prix_unitaire)} FCFA</p>
                    </div>
                    <p className="font-bold">{formatPrice(item.quantite * item.prix_unitaire)} FCFA</p>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500">Sous-total</span>
                  <span className="font-bold">{formatPrice(currentOrder.montant_total)} FCFA</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500">Service</span>
                  <span className="font-bold">0 FCFA</span>
                </div>
                <div className="flex justify-between items-center text-xl">
                  <span className="font-black text-[#03081F]">TOTAL</span>
                  <span className="font-black text-[#FC8A06]">{formatPrice(currentOrder.montant_total)} FCFA</span>
                </div>
              </div>

              <button
                onClick={() => { setIsAdditionOpen(false); setIsPaymentOpen(true); }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-[1.5rem] p-5 shadow-xl font-bold mt-4"
              >
                Payer maintenant
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* AUTH MODAL */}
      <ClientAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* MY RESERVATIONS MODAL */}
      <Modal isOpen={isMyReservationsOpen} onClose={() => setIsMyReservationsOpen(false)} title="">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-[#03081F]">Mes Réservations</h2>
            <button onClick={() => setIsMyReservationsOpen(false)} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {myReservations.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune réservation</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myReservations.map(res => (
                <div key={res.id} className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                  <div>
                    <p className="font-bold text-[#03081F] flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-[#FC8A06]" />
                      {new Date(res.date_reservation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-gray-500">{res.nombre_personnes} personnes</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 inline-block ${res.status === 'CONFIRMEE' ? 'bg-green-100 text-green-700' :
                      res.status === 'ANNULEE' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{res.status}</span>
                  </div>
                  <div className="flex gap-2">
                    {res.status !== 'ANNULEE' && (
                      <>
                        <button
                          onClick={() => openEditReservation(res)}
                          className="bg-white text-blue-500 hover:bg-blue-50 p-2 rounded-xl border border-gray-100 transition-all shadow-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => cancelReservation(res.id)}
                          className="bg-white text-red-500 hover:bg-red-50 p-2 rounded-xl border border-gray-100 transition-all shadow-sm"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
      {/* MY ORDERS MODAL */}
      <Modal isOpen={isMyOrdersOpen} onClose={() => setIsMyOrdersOpen(false)} title="">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-[#03081F]">Mes Commandes</h2>
            <button onClick={() => setIsMyOrdersOpen(false)} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {myOrders.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingBasket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune commande</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myOrders.map(order => (
                <div key={order.id} className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-[#03081F]">#{order.id}</span>
                      <span className="text-xs text-gray-500">{new Date(order.date_commande || '').toLocaleDateString('fr-FR')}</span>
                    </div>
                    <p className="font-bold text-[#FC8A06]">{formatPrice(order.montant_total)} FCFA</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 inline-block ${order.status === OrderStatus.PAYEE ? 'bg-green-100 text-green-700' :
                      order.status === OrderStatus.ANNULEE ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>{order.status}</span>
                  </div>
                  <button
                    onClick={() => viewOrderDetails(order)}
                    className="bg-white text-[#FC8A06] hover:bg-orange-50 p-2 rounded-xl border border-gray-100 transition-all shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* DISH DETAILS MODAL */}
      <Modal isOpen={!!selectedPlat} onClose={() => setSelectedPlat(null)} title="">
        {selectedPlat && (
          <div className="relative -m-6 h-auto flex flex-col overflow-hidden max-h-[85vh]">
            <div className="h-64 relative">
              <img
                src={getImageUrl(selectedPlat.image_url)}
                className="w-full h-full object-cover"
                alt={selectedPlat.nom}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <button
                onClick={() => setSelectedPlat(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              <button
                onClick={() => toggleFavorite(selectedPlat.id)}
                className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center transition-all active:scale-90"
              >
                <Heart className={`w-6 h-6 transition-colors ${favorites.includes(selectedPlat.id) ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} />
              </button>
            </div>

            <div className="flex-1 bg-white rounded-t-[3rem] -mt-10 p-8 flex flex-col overflow-y-auto">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-orange-100 text-[#FC8A06] text-[10px] font-bold uppercase tracking-widest rounded-full">Suggestion Chef</span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold">4.9</span>
                  </div>
                </div>
                <h2 className="text-3xl font-black text-[#03081F] mb-4">{selectedPlat.nom}</h2>
                <p className="text-gray-500 leading-relaxed font-medium">
                  {selectedPlat.description || 'Une expérience culinaire unique, préparée avec passion par notre brigade. Des ingrédients frais et de saison pour un goût inoubliable.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Portion</p>
                  <p className="font-bold text-[#03081F]">Généreuse (450g)</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Calories</p>
                  <p className="font-bold text-[#03081F]">~650 kcal</p>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between gap-6 pb-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Prix</span>
                  <span className="text-2xl font-black text-[#FC8A06]">{formatPrice(selectedPlat.prix)} FCFA</span>
                </div>
                <button
                  onClick={() => { addToBasket(selectedPlat); setSelectedPlat(null); }}
                  className="flex-1 bg-gradient-to-r from-[#FC8A06] to-orange-600 text-white rounded-2xl p-5 shadow-xl shadow-orange-500/30 font-black text-lg hover:shadow-orange-500/50 transition-all active:scale-95"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border border-white/20 flex items-center gap-3 ${toast.type === 'success' ? 'bg-green-500/90 text-white' :
            toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-blue-500/90 text-white'
            }`}>
            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
            <span className="font-bold text-sm tracking-tight">{toast.message}</span>
          </div>
        </div>
      )}

      {/* BOTTOM TAB BAR */}
      <BottomTabBar
        activeTab={
          isBasketOpen ? 'BASKET' :
            isMyReservationsOpen ? 'RESERVATIONS' :
              step === 'MENU' ? 'MENU' : 'HOME'
        }
        setActiveTab={(tab) => {
          if (tab === 'BASKET') {
            setIsBasketOpen(true);
          } else if (tab === 'RESERVATIONS') {
            if (clientToken) fetchMyReservations();
            else setIsAuthOpen(true);
          } else {
            setStep(tab as any);
            setIsBasketOpen(false);
            setIsMyReservationsOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        basketCount={basket.reduce((a, b) => a + b.quantite, 0)}
      />
    </div>
  );
};
