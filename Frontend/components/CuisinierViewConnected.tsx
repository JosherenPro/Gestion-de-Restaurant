import React, { useState, useEffect } from 'react';
import { Card, Button, Modal } from './UI';
import { ChefHat, Timer, Play, Check, Box, EyeOff, Eye, Loader, RefreshCw, LogOut, Info, X } from 'lucide-react';
import { API_CONFIG } from '../config/api.config';
import { apiService } from '../services/api.service';
import { Order, OrderStatus, MenuItem } from '../types';
import { formatPrice } from '../mockData';
import { useAuth } from '../context/AuthContext';

export const CuisinierViewConnected: React.FC = () => {
  const { logout, user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<'COMMANDES' | 'STOCK'>('COMMANDES');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Use real user ID
  const CUISINIER_ID = user?.id || 0;

  // Sound effect ref
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const previousOrderCountRef = React.useRef(0);
  const isFirstLoad = React.useRef(true);

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
    if (url.startsWith('http')) return url;
    return `${API_CONFIG.BASE_URL}${url}`;
  };

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // A loud "Kitchen Order" bell

    if (user) {
      loadData();
      const interval = setInterval(loadData, 30000); // Refresh every 30s for kitchen
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadData = async () => {
    try {
      if (isFirstLoad.current) setLoading(true);
      setError(null);
      const [commandesData, platsData] = await Promise.all([
        apiService.getCommandes(token),
        apiService.getPlats(token)
      ]);
      setOrders(commandesData);
      setMenu(platsData);

      // Check for new orders to play sound
      const newOrdersCount = commandesData.filter(o => o.status === OrderStatus.VALIDEE).length;

      if (!isFirstLoad.current) {
        if (newOrdersCount > previousOrderCountRef.current) {
          // Play sound
          try {
            if (audioRef.current) {
              audioRef.current.volume = 1.0;
              audioRef.current.play().catch(e => console.log("Audio play failed", e));
            }
          } catch (e) { }
        }
      } else {
        isFirstLoad.current = false;
      }

      previousOrderCountRef.current = newOrdersCount;

    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const startPreparing = async (orderId: number) => {
    // Optimistic Update
    const originalOrders = [...orders];
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: OrderStatus.EN_COURS } : o));

    try {
      if (token) {
        await apiService.preparerCommande(orderId, token);
        // No loadData() needed, state is already correct
      }
    } catch (err: any) {
      // Revert on error
      setOrders(originalOrders);
      alert('Erreur: ' + err.message);
    }
  };

  const markAsReady = async (orderId: number) => {
    // Optimistic Update
    const originalOrders = [...orders];
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: OrderStatus.PRETE } : o));

    try {
      if (token) {
        await apiService.commandePrete(orderId, CUISINIER_ID, token);
      }
    } catch (err: any) {
      setOrders(originalOrders);
      alert('Erreur: ' + err.message);
    }
  };

  const toggleAvailability = async (platId: number, currentStatus: boolean) => {
    try {
      setActionLoading(true);
      setActionLoading(true);
      if (token) {
        await apiService.updatePlat(platId, { disponible: !currentStatus }, token);
        await loadData();
      }
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const aPreparer = orders.filter(o =>
    o.status === OrderStatus.VALIDEE
  );

  const enPreparation = orders.filter(o =>
    o.status === OrderStatus.EN_COURS
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-[#FC8A06] mx-auto" />
          <p className="mt-4 text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 md:mb-12">
        <div className="relative">
          <h1 className="text-3xl md:text-5xl font-black text-[#03081F] flex items-center gap-4 tracking-tighter">
            <div className="bg-[#FC8A06] p-2 md:p-3 rounded-2xl shadow-lg shadow-orange-500/20">
              <ChefHat className="text-white w-8 h-8 md:w-10 md:h-10" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#03081F] to-blue-900">CUISINE DIRECT</span>
          </h1>
          <p className="text-gray-400 font-bold text-xs md:text-sm uppercase tracking-[0.2em] mt-3 md:mt-4 flex items-center gap-2">
            <span className="w-8 h-[2px] bg-orange-500/30"></span>
            Connecté : <span className="text-[#03081F] font-black">{user?.prenom || user?.nom || 'Chef'}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto">
          <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl shadow-gray-200/50 border border-white flex-1 md:flex-initial">
            <button
              onClick={() => setActiveTab('COMMANDES')}
              className={`flex-1 md:px-8 py-3.5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'COMMANDES'
                ? 'bg-[#03081F] text-white shadow-2xl scale-105'
                : 'text-gray-400 hover:text-[#03081F]'
                }`}
            >
              <Timer size={16} /> Commandes
            </button>
            <button
              onClick={() => setActiveTab('STOCK')}
              className={`flex-1 md:px-8 py-3.5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'STOCK'
                ? 'bg-[#FC8A06] text-white shadow-2xl scale-105'
                : 'text-gray-400 hover:text-[#03081F]'
                }`}
            >
              <Box size={16} /> Stock
            </button>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-4 bg-white rounded-2xl hover:bg-gray-50 transition-all shadow-lg border border-white group"
            >
              <RefreshCw className={`w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={logout}
              className="flex flex-1 md:flex-none items-center justify-center gap-3 px-6 py-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all font-black text-xs uppercase tracking-widest border border-red-100"
            >
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {activeTab === 'COMMANDES' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 h-auto lg:h-[calc(100vh-280px)]">
          {/* Column: Nouvelles Commandes */}
          <section className="flex flex-col h-full bg-blue-50/30 rounded-[2.5rem] p-4 md:p-8 border border-blue-100/50 backdrop-blur-xl group">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <Box className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#03081F] tracking-tighter">À PRÉPARER</h2>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{aPreparer.length} COMMANDES EN ATTENTE</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-blue-100 text-blue-600 rounded-xl font-black text-xs shadow-sm shadow-blue-200/50">
                TEMP : MEDIUM
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 px-1 md:px-2 pr-2 md:pr-4 custom-scrollbar">
              {aPreparer.length === 0 ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-6 text-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner relative">
                    <Check className="w-12 h-12 text-blue-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-dashed border-blue-50/50 animate-[spin_10s_linear_infinite]"></div>
                  </div>
                  <div>
                    <p className="font-black text-[#03081F] text-lg">Cuisine dégagée !</p>
                    <p className="text-gray-400 text-xs font-bold uppercase mt-2 tracking-widest">Prenez une courte pause</p>
                  </div>
                </div>
              ) : (
                aPreparer.map(order => {
                  const tableNum = order.table?.numero_table || order.table_id || '?';
                  const waitTime = order.created_at ? Math.round((new Date().getTime() - new Date(order.created_at).getTime()) / 60000) : 0;

                  // KDS Color Logic
                  let borderColor = 'border-blue-100';
                  let bgColor = 'bg-white';
                  let timerColor = 'text-blue-600 bg-blue-50';

                  if (waitTime > 20) {
                    borderColor = 'border-red-500 border-4';
                    timerColor = 'text-white bg-red-500 animate-pulse';
                  } else if (waitTime > 10) {
                    borderColor = 'border-yellow-400 border-4';
                    timerColor = 'text-yellow-700 bg-yellow-100';
                  }

                  return (
                    <Card
                      key={order.id}
                      className={`p-6 md:p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_70px_rgba(59,130,246,0.1)] transition-all duration-500 animate-in slide-in-from-bottom-5 ${borderColor} ${bgColor}`}
                    >
                      <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-5 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                          <div className="bg-[#03081F] text-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-3xl shadow-xl shadow-blue-900/20 group-hover:scale-110 transition-transform">
                            T{tableNum}
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-1">Ticket #{order.id}</span>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-black text-xs ${timerColor}`}>
                              <Timer size={14} /> {waitTime} min
                            </div>
                            {order.notes && (
                              <div className="mt-2 text-[10px] bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-center font-black uppercase tracking-widest animate-pulse border border-yellow-200">
                                ⚠️ Note Client
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-xl"
                        >
                          <Info size={20} />
                        </Button>
                      </div>

                      <div className="space-y-3 mb-8">
                        {order.lignes?.map((ligne) => (
                          <div
                            key={ligne.id}
                            onClick={() => ligne.plat && setSelectedDish(ligne.plat)}
                            className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors group/item"
                          >
                            <span className="font-black text-xl text-[#03081F] flex items-center">
                              <span className="bg-[#FC8A06] text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg mr-4 shadow-lg shadow-orange-500/20">{ligne.quantite}</span>
                              {ligne.plat?.nom}
                              <Info size={16} className="ml-2 text-gray-300 group-hover/item:text-[#FC8A06] transition-colors opacity-0 group-hover/item:opacity-100" />
                            </span>
                          </div>
                        ))}
                      </div>

                      <Button
                        fullWidth
                        onClick={() => startPreparing(order.id)}
                        variant="primary"
                        className="h-20 rounded-[1.5rem] shadow-xl shadow-blue-900/10 text-lg font-black uppercase tracking-widest bg-[#03081F] hover:bg-blue-900 border-none"
                        disabled={actionLoading}
                      >
                        {actionLoading ? <Loader className="w-8 h-8 animate-spin" /> : <div className="flex items-center gap-3"><Play size={24} fill="currentColor" /> LANCER (Feu)</div>}
                      </Button>
                    </Card>
                  );
                })
              )}
            </div>
          </section>

          {/* Column: En Préparation */}
          <section className="flex flex-col h-full bg-[#03081F] rounded-[2.5rem] p-4 md:p-8 border border-white/5 shadow-2xl group">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 border border-white/10">
                  <Timer className="text-orange-500 w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tighter">AUX FOURNEAUX</h2>
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{enPreparation.length} PLATS EN CUISSON</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></div>
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 px-1 md:px-2 pr-2 md:pr-4 custom-scrollbar-dark">
              {enPreparation.length === 0 ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-6 text-center opacity-40">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                    <ChefHat className="w-12 h-12 text-white/20" />
                  </div>
                  <div>
                    <p className="font-black text-white text-lg">Fourneau en attente</p>
                    <p className="text-white/40 text-xs font-bold uppercase mt-2 tracking-widest">Lancez une commande</p>
                  </div>
                </div>
              ) : (
                enPreparation.map(order => {
                  const tableNum = order.table?.numero_table || order.table_id || '?';
                  return (
                    <Card
                      key={order.id}
                      className="p-6 md:p-8 border-none rounded-[2.5rem] bg-white/5 text-white shadow-2xl relative overflow-hidden group/card hover:bg-white/[0.08] transition-all duration-500 border border-white/5 animate-in slide-in-from-right-10"
                    >
                      <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover/card:bg-orange-500/20 transition-colors"></div>

                      <div className="flex justify-between items-center mb-8 relative z-10">
                        <div className="bg-white/10 text-white px-6 py-3 rounded-2xl font-black text-2xl border border-white/10 shadow-lg ring-1 ring-white/20">
                          T{tableNum}
                        </div>
                        <div className="flex flex-col items-end cursor-pointer" onClick={() => setSelectedOrder(order)}>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Coup de feu</span>
                            <div className="flex gap-1">
                              <div className="w-1 h-3 bg-orange-500 rounded-full animate-[bounce_0.6s_infinite]"></div>
                              <div className="w-1 h-3 bg-orange-500 rounded-full animate-[bounce_0.6s_0.2s_infinite]"></div>
                              <div className="w-1 h-3 bg-orange-500 rounded-full animate-[bounce_0.6s_0.4s_infinite]"></div>
                            </div>
                          </div>
                          <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">En cours depuis {order.updated_at ? Math.round((new Date().getTime() - new Date(order.updated_at).getTime()) / 60000) : 0} min</span>
                          {order.notes && (
                            <div className="mt-2 text-[10px] bg-yellow-500 text-white px-2 py-1 rounded text-center font-black uppercase tracking-widest border border-yellow-400 shadow-lg">
                              ⚠️ Note Client
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4 mb-8 relative z-10">
                        {order.lignes?.map((ligne) => (
                          <div
                            key={ligne.id}
                            onClick={() => ligne.plat && setSelectedDish(ligne.plat)}
                            className="flex justify-between items-center bg-white/5 p-5 rounded-[1.5rem] border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer group/item"
                          >
                            <span className="font-black text-xl flex items-center">
                              <span className="bg-gradient-to-br from-orange-400 to-orange-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg mr-5 shadow-xl shadow-orange-500/40 ring-4 ring-white/5">{ligne.quantite}</span>
                              {ligne.plat?.nom}
                              <Info size={16} className="ml-2 text-white/30 group-hover/item:text-white transition-colors opacity-0 group-hover/item:opacity-100" />
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="relative z-10">
                        <Button
                          fullWidth
                          onClick={() => markAsReady(order.id)}
                          variant="success"
                          className="h-16 rounded-[1.5rem] shadow-2xl shadow-green-500/30 text-base font-black border-none ring-2 ring-transparent hover:ring-green-500/50 transition-all group/ready"
                          disabled={actionLoading}
                        >
                          {actionLoading ? <Loader className="w-6 h-6 animate-spin" /> : <div className="flex items-center gap-3"><Check size={26} strokeWidth={3} className="group-hover/ready:scale-125 transition-transform" /> ENVOYER AU SERVICE</div>}
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8 animate-in fade-in zoom-in duration-700">
          {menu.map(plat => (
            <Card key={plat.id} className="p-0 bg-white border-none rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.04)] overflow-hidden group border border-gray-100/50 hover:-translate-y-3 transition-all duration-500 relative">
              <div className="relative h-56 md:h-64 w-full overflow-hidden">
                <img
                  src={getImageUrl(plat.image_url)}
                  className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ${!plat.disponible ? 'grayscale opacity-40 scale-105' : ''
                    }`}
                  alt={plat.nom}
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#03081F]/80 via-transparent to-transparent opacity-60"></div>

                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <span className="bg-white/95 backdrop-blur-md text-[#03081F] px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-2xl border border-white/20">
                    {plat.categorie?.nom || 'Plat'}
                  </span>
                </div>

                {!plat.disponible && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#03081F]/60 backdrop-blur-md">
                    <div className="bg-white text-red-600 px-8 py-3 rounded-[1.2rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl rotate-[-5deg] border-2 border-red-500">
                      Rupture de Stock
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 relative">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-black text-[#03081F] text-2xl md:text-3xl tracking-tighter leading-none">{plat.nom}</h3>
                </div>

                <div className="flex items-center justify-between mb-8">
                  <p className="text-3xl text-[#FC8A06] font-black">{formatPrice(plat.prix)} <span className="text-sm">FCFA</span></p>
                </div>

                <Button
                  fullWidth
                  variant={plat.disponible ? 'outline' : 'success'}
                  className={`h-14 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 ${plat.disponible
                    ? 'border-gray-200 hover:border-[#03081F] hover:bg-[#03081F] hover:text-white'
                    : 'bg-green-500 text-white shadow-xl shadow-green-500/30'
                    }`}
                  onClick={() => toggleAvailability(plat.id, plat.disponible)}
                  disabled={actionLoading}
                >
                  {plat.disponible ? (
                    <><EyeOff size={18} className="mr-3" /> Mettre en rupture</>
                  ) : (
                    <><Eye size={18} className="mr-3" /> Remettre en stock</>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* ORDER DETAIL MODAL */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="">
        {selectedOrder && (
          <div className="relative flex flex-col h-[85vh] md:h-auto -m-6">
            {/* Header */}
            <div className={`p-8 ${selectedOrder.status === OrderStatus.EN_COURS ? 'bg-[#03081F] text-white' : 'bg-white text-[#03081F]'} border-b border-gray-100 flex-shrink-0 relative overflow-hidden`}>
              {selectedOrder.status === OrderStatus.EN_COURS && (
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              )}
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-6">
                  <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center font-black text-4xl shadow-xl ${selectedOrder.status === OrderStatus.EN_COURS
                    ? 'bg-white/10 text-white border border-white/10'
                    : 'bg-[#03081F] text-white'
                    }`}>
                    T{selectedOrder.table?.numero_table || selectedOrder.table_id || '?'}
                  </div>
                  <div>
                    <h2 className={`text-3xl font-black tracking-tighter mb-1 ${selectedOrder.status === OrderStatus.EN_COURS ? 'text-white' : 'text-[#03081F]'}`}>
                      Commande #{selectedOrder.id}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${selectedOrder.status === OrderStatus.EN_COURS
                        ? 'bg-orange-500 text-white'
                        : 'bg-blue-100 text-blue-600'
                        }`}>
                        {selectedOrder.status === OrderStatus.EN_COURS ? 'En cuisson' : 'À préparer'}
                      </span>
                      <span className={`flex items-center gap-1 text-xs font-bold ${selectedOrder.status === OrderStatus.EN_COURS ? 'text-white/60' : 'text-gray-400'}`}>
                        <Timer size={14} />
                        {selectedOrder.created_at ? Math.round((new Date().getTime() - new Date(selectedOrder.created_at).getTime()) / 60000) : 0} min
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${selectedOrder.status === OrderStatus.EN_COURS
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Client Info Section */}
              <div className={`mt-6 flex flex-wrap gap-3 ${selectedOrder.status === OrderStatus.EN_COURS ? 'text-white/80' : 'text-gray-500'}`}>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-current/20">
                  <span className="text-xs font-bold uppercase tracking-wider">Client:</span>
                  <span className={`font-black uppercase ${selectedOrder.status === OrderStatus.EN_COURS ? 'text-white' : 'text-[#03081F]'}`}>
                    {selectedOrder.client?.utilisateur?.prenom ? `${selectedOrder.client.utilisateur.prenom} ${selectedOrder.client.utilisateur.nom}` : 'Client de passage'}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-current/20">
                  <span className="text-xs font-bold uppercase tracking-wider">Type:</span>
                  <span className={`font-black uppercase ${selectedOrder.status === OrderStatus.EN_COURS ? 'text-white' : 'text-[#03081F]'}`}>
                    {selectedOrder.type_commande === 'a_emporter' ? 'A EMPORTER' : 'SUR PLACE'}
                  </span>
                </div>
              </div>

              {/* GLOBAL ORDER NOTES - Highlighted */}
              {selectedOrder.notes && (
                <div className={`mt-6 p-4 rounded-xl border-2 animate-in slide-in-from-left-4 duration-500 ${selectedOrder.status === OrderStatus.EN_COURS
                  ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  }`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${selectedOrder.status === OrderStatus.EN_COURS ? 'bg-yellow-500 text-[#03081F]' : 'bg-yellow-100 text-yellow-600'}`}>
                      <Info size={24} />
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedOrder.status === OrderStatus.EN_COURS ? 'text-yellow-400' : 'text-yellow-600'}`}>Message du Chef / Client</p>
                      <p className="text-lg font-bold leading-tight">{selectedOrder.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
              <div className="space-y-4">
                {selectedOrder.lignes?.map((ligne) => (
                  <div
                    key={ligne.id}
                    onClick={() => {
                      if (ligne.plat) {
                        setSelectedOrder(null); // Close order modal
                        setSelectedDish(ligne.plat); // Open dish detail
                      }
                    }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Dish Thumbnail */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
                        <img
                          src={getImageUrl(ligne.plat?.image_url)}
                          alt={ligne.plat?.nom}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-black text-xl text-[#03081F] border border-gray-100 group-hover:bg-[#FC8A06] group-hover:text-white transition-colors">
                        {ligne.quantite}x
                      </div>
                      <div>
                        <p className="font-black text-lg text-[#03081F]">{ligne.plat?.nom}</p>
                        {ligne.plat?.categorie && (
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{ligne.plat.categorie.nom}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Info size={18} className="text-gray-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-white border-t border-gray-100 flex gap-4">
              <Button
                variant="outline"
                className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest border-gray-200 hover:bg-gray-50"
                onClick={() => setSelectedOrder(null)}
              >
                Fermer
              </Button>
              {selectedOrder.status === OrderStatus.VALIDEE ? (
                <Button
                  fullWidth
                  className="flex-[2] h-16 rounded-2xl font-black uppercase tracking-widest bg-[#03081F] text-white hover:bg-blue-900 shadow-xl shadow-blue-900/20"
                  onClick={() => {
                    startPreparing(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader className="animate-spin" /> : <><Play size={20} className="mr-2" /> Lancer la cuisson</>}
                </Button>
              ) : selectedOrder.status === OrderStatus.EN_COURS ? (
                <Button
                  fullWidth
                  className="flex-[2] h-16 rounded-2xl font-black uppercase tracking-widest bg-green-500 text-white hover:bg-green-600 shadow-xl shadow-green-500/20"
                  onClick={() => {
                    markAsReady(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader className="animate-spin" /> : <><Check size={20} className="mr-2" /> Terminée</>}
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </Modal>

      {/* DISH DETAIL MODAL */}
      <Modal isOpen={!!selectedDish} onClose={() => setSelectedDish(null)} title="">
        {selectedDish && (
          <div className="relative -m-6 flex flex-col h-[80vh] md:h-auto">
            {/* Header Image */}
            <div className="h-64 relative flex-shrink-0">
              <img
                src={getImageUrl(selectedDish.image_url)}
                className="w-full h-full object-cover"
                alt={selectedDish.nom}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <button
                onClick={() => setSelectedDish(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/40 transition-all z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="bg-orange-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 inline-block shadow-lg">
                  {selectedDish.categorie?.nom || 'Plat'}
                </span>
                <h2 className="text-3xl font-black text-white leading-none tracking-tight">{selectedDish.nom}</h2>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-white p-8 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Timer size={12} /> Préparation
                  </p>
                  <p className="font-black text-[#03081F] text-lg">{selectedDish.temps_preparation || 15} min</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Recette #</p>
                  <p className="font-black text-[#03081F] text-lg">{selectedDish.id}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-[#03081F] uppercase tracking-widest mb-3">Description & Dressage</h3>
                  <p className="text-gray-600 leading-relaxed font-medium bg-blue-50/50 p-6 rounded-2xl border border-blue-50">
                    {selectedDish.description || "Aucune instruction spécifique pour ce plat. Suivre la fiche technique standard."}
                  </p>
                </div>

                {/* Simulated Ingredients - In a real app, this would come from the API */}
                <div>
                  <h3 className="text-sm font-black text-[#03081F] uppercase tracking-widest mb-3">Ingrédients Clés</h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedDish.description?.split(' ') || ['Ingrédients', 'frais', 'du', 'marché']).slice(0, 5).map((tag, i) => (
                      <span key={i} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold capitalize">
                        {tag.replace(/[^a-zA-Z]/g, '')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-[2rem]">
              <Button
                fullWidth
                onClick={() => setSelectedDish(null)}
                className="h-16 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg"
              >
                Fermer la fiche
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div >
  );
};
