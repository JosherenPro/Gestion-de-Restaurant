import React, { useState, useEffect, useRef } from 'react';
import { API_CONFIG } from '../config/api.config';
import { apiService } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus, Table, TableStatus } from '../types';
import { Card, Button, Badge, Modal } from './UI';
import { LayoutGrid, ClipboardList, UserPlus, CheckCircle2, ChevronRight, Plus, Minus, Loader, RefreshCcw, LogOut, ChefHat, Bell, BellRing, Timer, XCircle } from 'lucide-react';
import { formatPrice } from '../mockData';

export const ServerViewConnected: React.FC = () => {
  const { token, user, logout } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [manualBasket, setManualBasket] = useState<Array<any>>([]);
  const [plats, setPlats] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'TABLES' | 'COMMANDES'>('TABLES');
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [hasNewPendingOrders, setHasNewPendingOrders] = useState(false);
  const previousPendingCountRef = useRef(0);

  // Refusal State
  const [isRefuseOpen, setIsRefuseOpen] = useState(false);
  const [refuseReason, setRefuseReason] = useState('');
  const [orderToRefuse, setOrderToRefuse] = useState<Order | null>(null);
  const [refuseLoading, setRefuseLoading] = useState(false);

  const loadingRef = React.useRef(false);
  const isFirstLoad = React.useRef(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [token]);

  const loadData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const [tablesData, commandesData, platsData, categoriesData] = await Promise.all([
        apiService.getTables(token),
        apiService.getCommandes(token),
        apiService.getPlats(token),
        apiService.getCategories(token)
      ]);

      setTables(tablesData);
      setOrders(commandesData);
      setPlats(platsData);
      setCategories(categoriesData);

      // Check for new pending orders
      const currentPendingCount = commandesData.filter(
        (o: Order) => o.status === OrderStatus.EN_ATTENTE_VALIDATION
      ).length;

      setPendingOrdersCount(currentPendingCount);

      // Notification logic
      if (!isFirstLoad.current) {
        if (currentPendingCount > previousPendingCountRef.current) {
          setHasNewPendingOrders(true);
          // Play notification sound
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleAoAEoKshpFoS0VwqNXPmWQdBTeS0NesewgAF4yyj5dvT0hxptHPmWYfBjaN0NaseQcAGY+1k5lzVEtuptDOmGYfBjaN0NaseQcA');
            audio.volume = 0.5;
            audio.play().catch(() => { });
          } catch (e) { }
          // Clear notification after 5 seconds
          setTimeout(() => setHasNewPendingOrders(false), 5000);
        }
      } else {
        isFirstLoad.current = false;
      }

      previousPendingCountRef.current = currentPendingCount;
      setError(null);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const approveOrder = async (commandeId: number) => {
    if (!token || !user) return;

    try {
      await apiService.validerCommande(commandeId, user.id, token);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const markServed = async (commandeId: number) => {
    if (!token) return;

    try {
      await apiService.servirCommande(commandeId, token);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openRefuseModal = (order: Order) => {
    setOrderToRefuse(order);
    setRefuseReason('');
    setIsRefuseOpen(true);
  };

  const submitRefusal = async () => {
    if (!token || !user || !orderToRefuse) return;

    setRefuseLoading(true);
    try {
      await apiService.refuserCommande(orderToRefuse.id, user.id, refuseReason || 'Aucune raison spécifiée', token);
      setIsRefuseOpen(false);
      setOrderToRefuse(null);
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRefuseLoading(false);
    }
  };

  const addToManual = (item: any) => {
    setManualBasket(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantite: i.quantite + 1 } : i);
      }
      return [...prev, { ...item, quantite: 1 }];
    });
  };

  const removeFromManual = (id: number) => {
    setManualBasket(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing && existing.quantite > 1) {
        return prev.map(i => i.id === id ? { ...i, quantite: i.quantite - 1 } : i);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const createManualOrder = async () => {
    if (!selectedTable || manualBasket.length === 0 || !token || !user) return;

    try {
      const montantTotal = manualBasket.reduce((acc, item) => acc + (item.prix * item.quantite), 0);

      const newOrder = await apiService.createCommande({
        client_id: user.id,
        table_id: selectedTable.id,
        type_commande: 'SUR_PLACE',
        montant_total: montantTotal,
        notes: `Commande serveur - Table ${selectedTable.numero_table}`
      }, token);

      // Add items to order
      for (const item of manualBasket) {
        await apiService.addLigneCommande(newOrder.id, {
          commande_id: newOrder.id,
          plat_id: item.id,
          quantite: item.quantite,
          prix_unitaire: item.prix
        }, token);
      }

      // Validate immediately
      await apiService.validerCommande(newOrder.id, user.id, token);

      setManualBasket([]);
      setIsManualOrderOpen(false);
      setSelectedTable(null);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

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
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col pb-32">
      {/* Premium Sticky Header */}
      <header className="px-6 py-5 bg-white shadow-sm border-b border-gray-100 sticky top-0 z-[60] flex justify-between items-center backdrop-blur-xl bg-white/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#03081F] to-blue-900 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/10">
            <ClipboardList size={18} className="text-[#FC8A06]" strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-lg font-black text-[#03081F] leading-none tracking-tighter uppercase">Service Pro</h1>
            <p className="text-[9px] font-bold text-[#FC8A06] uppercase tracking-[0.2em] mt-1">{user?.prenom} {user?.nom}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className={`w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCcw size={16} />
          </button>
          <button
            onClick={logout}
            className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all border border-red-100"
          >
            <LogOut size={16} />
          </button>

          {/* Notification Bell for Pending Orders */}
          {pendingOrdersCount > 0 && (
            <button
              onClick={() => setActiveView('COMMANDES')}
              className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all border ${hasNewPendingOrders ? 'bg-orange-500 text-white border-orange-600 animate-bounce' : 'bg-orange-50 text-orange-500 border-orange-100 hover:bg-orange-100'}`}
            >
              {hasNewPendingOrders ? <BellRing size={16} /> : <Bell size={16} />}
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {pendingOrdersCount}
              </span>
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="mx-4 mt-6 bg-red-50 border-2 border-red-100 rounded-3xl p-5 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="w-10 h-10 bg-red-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
            <span className="text-white font-black text-xl">!</span>
          </div>
          <p className="text-xs text-red-700 font-black uppercase tracking-tight line-clamp-2">{error}</p>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8">
        {activeView === 'TABLES' ? (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-[#03081F] tracking-tighter uppercase">Plan de Salle</h2>
                <div className="flex gap-2 mt-2">
                  <div className="h-1 w-8 bg-[#FC8A06] rounded-full"></div>
                  <div className="h-1 w-2 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              <div className="bg-[#03081F] text-white px-5 py-2.5 rounded-2xl text-[10px] font-black flex items-center gap-3 uppercase tracking-widest shadow-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                {tables.filter(t => t.statut === TableStatus.LIBRE).length} Libres
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {tables.map(table => {
                // Find order for this table to determine status details
                const tableOrder = orders.find(o => o.table_id === table.id && o.status !== OrderStatus.SERVIE && o.status !== OrderStatus.PAYEE);
                const isOccupied = table.statut === TableStatus.OCCUPEE;
                const timeOccupied = tableOrder?.created_at ? Math.round((new Date().getTime() - new Date(tableOrder.created_at).getTime()) / 60000) : 0;

                return (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    className={`p-6 md:p-8 rounded-[2rem] border-[3px] transition-all flex flex-col items-center justify-between gap-4 aspect-square relative group overflow-hidden ${selectedTable?.id === table.id
                      ? 'border-[#FC8A06] bg-white shadow-2xl shadow-orange-500/10 scale-[1.02] z-10'
                      : isOccupied
                        ? 'border-emerald-100 bg-white ring-4 ring-emerald-50/50 shadow-xl shadow-emerald-100'
                        : 'border-white bg-white shadow-lg shadow-gray-100/50 hover:shadow-xl hover:-translate-y-1'
                      }`}
                  >
                    <div className="w-full flex justify-between items-start">
                      <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${isOccupied
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-100 text-gray-400'
                        }`}>
                        {isOccupied ? 'Occupé' : 'Libre'}
                      </div>
                      {isOccupied && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                          <Timer size={12} />
                          <span>{timeOccupied}m</span>
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <span className="font-black text-4xl text-[#03081F] tracking-tighter block mb-1">T{table.numero_table}</span>
                      <div className="flex items-center justify-center gap-2 text-gray-300">
                        <UserPlus size={14} />
                        <span className="text-xs font-bold">{table.capacite}p</span>
                      </div>
                    </div>

                    {isOccupied && tableOrder && (
                      <div className="w-full pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
                        <Badge status={tableOrder.status} />
                        <span className="text-[10px] font-black text-[#03081F]">{tableOrder.montant_total?.toLocaleString()} F</span>
                      </div>
                    )}

                    {/* Selection Indicator */}
                    {selectedTable?.id === table.id && (
                      <div className="absolute inset-0 border-[6px] border-[#FC8A06] rounded-[2rem] pointer-events-none animate-in fade-in duration-200"></div>
                    )}
                  </button>
                )
              })}
            </div>

            {selectedTable && (
              <div className="fixed inset-x-0 bottom-24 mx-4 p-8 bg-[#03081F] text-white rounded-[3rem] shadow-2xl shadow-blue-900/40 animate-in slide-in-from-bottom-10 z-[70] border border-blue-800">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center font-black text-3xl text-[#FC8A06] border border-white/5">
                      T{selectedTable.numero_table}
                    </div>
                    <div>
                      <h3 className="font-black text-2xl tracking-tighter uppercase">Table {selectedTable.numero_table}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${selectedTable.statut === TableStatus.LIBRE ? 'bg-emerald-500' : 'bg-[#FC8A06]'}`}></div>
                        <p className="text-[10px] font-black uppercase tracking-widest">{selectedTable.statut}</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTable(null)} className="w-12 h-12 bg-white/5 rounded-2xl text-white/40 hover:text-white flex items-center justify-center transition-all">
                    <Plus size={28} className="rotate-45" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Button
                    fullWidth
                    onClick={() => setIsManualOrderOpen(true)}
                    variant="primary"
                    className="h-16 rounded-[1.5rem] font-black text-sm shadow-2xl shadow-orange-500/20 uppercase tracking-widest border-none"
                  >
                    <ClipboardList size={20} className="mr-2" strokeWidth={3} /> Nouvel Ordre
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      fullWidth
                      variant="ghost"
                      className="h-14 rounded-2xl font-black text-[10px] border border-white/10 bg-white/5 uppercase tracking-widest text-white/50 hover:bg-white/10 transition-all"
                      onClick={() => apiService.updateTable(selectedTable.id, {
                        statut: selectedTable.statut === TableStatus.LIBRE ? TableStatus.OCCUPEE : TableStatus.LIBRE
                      }, token).then(() => {
                        setSelectedTable(null);
                        loadData();
                      })}
                    >
                      {selectedTable.statut === TableStatus.LIBRE ? 'Réserver' : 'Libérer'}
                    </Button>
                    <Button
                      fullWidth
                      variant="ghost"
                      className="h-14 rounded-2xl font-black text-[10px] border border-white/10 bg-white/5 uppercase tracking-widest text-white/50"
                      onClick={() => setSelectedTable(null)}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-[#03081F] tracking-tighter uppercase">Suivi Service</h2>
                <div className="flex gap-2 mt-2">
                  <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
                  <div className="h-1 w-2 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              <div className="bg-blue-50 text-blue-600 px-5 py-2.5 rounded-2xl text-[10px] font-black flex items-center gap-2 uppercase tracking-widest border border-blue-100 italic">
                {orders.filter(o => o.status !== OrderStatus.SERVIE && o.status !== OrderStatus.PAYEE).length} Actives
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
              {orders
                .filter(o => o.status !== OrderStatus.SERVIE && o.status !== OrderStatus.PAYEE)
                .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
                .map(order => (
                  <Card key={order.id} className="p-0 border-none rounded-[2.5rem] bg-white shadow-xl shadow-gray-100 overflow-hidden relative group hover:shadow-2xl transition-all duration-500 border border-gray-50">
                    <div className="p-6 md:p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-5">
                          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center font-black text-3xl shadow-xl transition-transform group-hover:scale-110 ${order.status === OrderStatus.PRETE ? 'bg-emerald-500 text-white shadow-emerald-200' :
                            order.status === OrderStatus.EN_ATTENTE_VALIDATION ? 'bg-[#03081F] text-white shadow-blue-900/20' :
                              'bg-gray-100 text-gray-400'
                            }`}>
                            T{order.table_id || '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="font-black text-2xl text-[#03081F] tracking-tighter italic">#{order.id}</h3>
                              <Badge status={order.status} />
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 font-bold tracking-widest text-[9px] text-gray-400 uppercase">
                              <span>{(order.date_commande || order.created_at) ? new Date(order.date_commande || order.created_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                              <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                              <span className="text-[#FC8A06] font-black">{order.montant_total?.toLocaleString()} CFA</span>
                            </div>
                          </div>
                        </div>
                        {/* Order Type Badge */}
                        <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${order.type_commande === 'a_emporter' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                          {order.type_commande === 'a_emporter' ? '📦 À Emporter' : '🍽️ Sur Place'}
                        </div>
                      </div>

                      {/* Order Notes */}
                      {order.notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4">
                          <p className="text-[9px] font-black text-yellow-600 uppercase tracking-widest mb-1">📝 Notes client</p>
                          <p className="text-sm text-yellow-800 font-medium">{order.notes}</p>
                        </div>
                      )}

                      <div className="bg-gray-50/50 rounded-[2rem] p-6 mb-6 border border-gray-100">
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">Détails de la commande</p>
                        <div className="space-y-3">
                          {order.lignes?.map((item, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-3 border border-gray-50">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-[#FC8A06]/10 flex items-center justify-center text-sm font-black text-[#FC8A06]">
                                    x{item.quantite}
                                  </div>
                                  <div>
                                    <span className="font-black text-[#03081F] text-sm uppercase tracking-tighter block">{item.plat?.nom || 'Plat inconnu'}</span>
                                    <span className="text-[10px] text-gray-400 font-medium">{item.prix_unitaire?.toLocaleString()} CFA / unité</span>
                                  </div>
                                </div>
                                <span className="text-sm font-black text-[#03081F]">{(item.prix_unitaire * item.quantite)?.toLocaleString()} CFA</span>
                              </div>
                              {/* Item Special Notes */}
                              {item.notes_speciales && (
                                <div className="mt-2 pl-13 text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-1.5 italic">
                                  ⚠️ {item.notes_speciales}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {/* Total */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</span>
                          <span className="text-xl font-black text-[#FC8A06]">{order.montant_total?.toLocaleString()} CFA</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        {order.status === OrderStatus.EN_ATTENTE_VALIDATION && (
                          <div className="flex gap-2 w-full">
                            <Button
                              onClick={() => openRefuseModal(order)}
                              variant="outline"
                              className="h-16 w-16 rounded-[1.2rem] border-red-100 bg-red-50 text-red-500 flex-shrink-0 flex items-center justify-center hover:bg-red-100 hover:border-red-200 transition-colors"
                            >
                              <XCircle size={24} />
                            </Button>
                            <Button
                              fullWidth
                              onClick={() => approveOrder(order.id)}
                              variant="primary"
                              className="h-16 rounded-[1.2rem] font-black text-xs shadow-xl shadow-orange-500/10 uppercase tracking-widest flex-1"
                            >
                              <CheckCircle2 size={18} className="mr-2" /> Transmettre en Cuisine
                            </Button>
                          </div>
                        )}
                        {order.status === OrderStatus.PRETE && (
                          <Button
                            fullWidth
                            onClick={() => markServed(order.id)}
                            variant="success"
                            className="h-16 rounded-[1.2rem] font-black text-xs shadow-xl shadow-emerald-500/10 uppercase tracking-widest bg-emerald-500 border-none text-white"
                          >
                            <ChefHat size={18} className="mr-2" /> Servir à Table
                          </Button>
                        )}
                        <Button variant="outline" className="h-16 w-16 rounded-[1.2rem] border-gray-100 bg-gray-50 flex-shrink-0 flex items-center justify-center hover:bg-gray-100 transition-colors">
                          <ChevronRight className="text-gray-400" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

              {orders.filter(o => o.status !== OrderStatus.SERVIE && o.status !== OrderStatus.PAYEE).length === 0 && (
                <div className="col-span-full py-32 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-200 mb-6">
                    <ClipboardList size={48} strokeWidth={1} />
                  </div>
                  <p className="font-black uppercase tracking-[0.2em] text-[10px] text-gray-400">Aucune commande en attente</p>
                  <p className="text-xs font-medium text-gray-300 mt-2">Le calme avant la tempête...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Premium Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 h-24 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex items-center justify-around px-8 z-[80] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setActiveView('TABLES')}
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeView === 'TABLES' ? 'text-[#FC8A06] scale-110' : 'text-gray-300 hover:text-gray-400'}`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeView === 'TABLES' ? 'bg-orange-50 shadow-inner' : ''}`}>
            <LayoutGrid size={activeView === 'TABLES' ? 24 : 22} strokeWidth={activeView === 'TABLES' ? 2.5 : 2} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.1em]">Salles</span>
        </button>

        <div className="relative -mt-14">
          <button
            onClick={() => {
              setActiveView('TABLES');
              setError('Choisissez une table pour commencer');
            }}
            className="w-16 h-16 bg-[#03081F] text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/40 border-[6px] border-white active:scale-90 transition-all group"
          >
            <Plus size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
            <div className="absolute -inset-2 bg-orange-500/20 rounded-[2.5rem] blur-xl opacity-0 group-active:opacity-100 transition-opacity"></div>
          </button>
        </div>

        <button
          onClick={() => setActiveView('COMMANDES')}
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeView === 'COMMANDES' ? 'text-blue-600 scale-110' : 'text-gray-300 hover:text-gray-400'}`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeView === 'COMMANDES' ? 'bg-blue-50 shadow-inner' : ''}`}>
            <div className="relative">
              <ClipboardList size={activeView === 'COMMANDES' ? 24 : 22} strokeWidth={activeView === 'COMMANDES' ? 2.5 : 2} />
              {orders.filter(o => o.status === OrderStatus.PRETE).length > 0 && (
                <div className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.1em]">Service</span>
        </button>
      </nav>

      {/* Modernized Manual Order Modal */}
      <Modal
        isOpen={isManualOrderOpen}
        onClose={() => setIsManualOrderOpen(false)}
        title={`COMMANDE TABLE ${selectedTable?.numero_table}`}
      >
        <div className="flex flex-col gap-8 pb-4">
          {/* Enhanced Search & Filters */}
          <div className="space-y-6">
            <div className="relative group">
              <input
                type="text"
                placeholder="RECHERCHER UN PLAT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 pl-14 pr-6 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-[#FC8A06] focus:ring-4 focus:ring-orange-500/5 transition-all uppercase tracking-tight"
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FC8A06] transition-colors">
                <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x mask-fade-right">
              <button
                onClick={() => setActiveCategory('ALL')}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black whitespace-nowrap transition-all snap-start ${activeCategory === 'ALL'
                  ? 'bg-[#03081F] text-white shadow-xl shadow-blue-900/20 scale-105'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
              >
                TOUS LES PLATS
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black whitespace-nowrap transition-all snap-start ${activeCategory === cat.id
                    ? 'bg-[#03081F] text-white shadow-xl shadow-blue-900/20 scale-105'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                >
                  {cat.nom.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pr-2 scrollbar-thin">
            {plats
              .filter(p => p.disponible)
              .filter(p => activeCategory === 'ALL' || p.categorie_id === activeCategory)
              .filter(p => p.nom.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(item => (
                <button
                  key={item.id}
                  onClick={() => addToManual(item)}
                  className="flex items-center justify-between bg-white p-3 rounded-2xl border-2 border-gray-50 hover:border-[#FC8A06] hover:bg-orange-50/10 transition-all group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                      <img src={item.image_url} alt={item.nom} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[#03081F] text-xs uppercase tracking-tight line-clamp-1">{item.nom}</p>
                      <p className="text-[10px] text-[#FC8A06] font-black mt-0.5 tracking-widest">{item.prix?.toLocaleString()} F</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-[#FC8A06] group-hover:text-white transition-all shadow-sm">
                    <Plus size={16} strokeWidth={3} />
                  </div>
                </button>
              ))}
          </div>

          <div className="bg-[#03081F] rounded-[2.5rem] p-8 mt-4 text-white shadow-2xl shadow-blue-900/20 border border-blue-800/50">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Votre Sélection</h4>
              <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-full">{manualBasket.length} Articles</span>
            </div>

            <div className="space-y-4 mb-8 max-h-[20vh] overflow-y-auto pr-2 scrollbar-none">
              {manualBasket.length === 0 ? (
                <div className="text-center py-8 opacity-20 flex flex-col items-center">
                  <ClipboardList size={32} strokeWidth={1} />
                  <p className="text-[9px] font-bold uppercase tracking-widest mt-2">Prêt pour la commande</p>
                </div>
              ) : (
                manualBasket.map(item => (
                  <div key={item.id} className="flex items-center justify-between animate-in slide-in-from-right-4 duration-300">
                    <div className="flex flex-col">
                      <span className="text-sm font-black uppercase tracking-tighter line-clamp-1">{item.nom}</span>
                      <span className="text-[9px] text-[#FC8A06] font-black">{item.prix?.toLocaleString()} CFA / UNITÉ</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/10">
                        <button
                          onClick={() => removeFromManual(item.id)}
                          className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors"
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className="w-8 text-center font-black text-sm text-white">{item.quantite}</span>
                        <button
                          onClick={() => addToManual(item)}
                          className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-emerald-400 transition-colors"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button
              fullWidth
              onClick={createManualOrder}
              variant="primary"
              className="h-16 rounded-2xl shadow-2xl shadow-orange-500/20 font-black text-sm uppercase tracking-widest border-none relative overflow-hidden group"
              disabled={manualBasket.length === 0}
            >
              <span className="relative z-10">Transmettre en Cuisine</span>
              <span className="ml-4 tabular-nums relative z-10 bg-white/10 px-3 py-1 rounded-lg">
                {manualBasket.reduce((a, b) => a + b.prix * b.quantite, 0).toLocaleString()} CFA
              </span>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 scale-x-0 group-active:scale-x-100 transition-transform origin-left"></div>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Refusal Modal */}
      <Modal isOpen={isRefuseOpen} onClose={() => setIsRefuseOpen(false)} title="">
        <div className="p-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-black text-[#03081F] mb-1">Refuser la commande</h3>
            <p className="text-gray-500 text-sm">Veuillez indiquer le motif du refus</p>
          </div>

          <textarea
            value={refuseReason}
            onChange={(e) => setRefuseReason(e.target.value)}
            placeholder="Ex: Rupture de stock, Problème technique..."
            className="w-full h-32 bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 mb-6 outline-none focus:border-red-500 transition-all font-medium text-sm resize-none"
          />

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsRefuseOpen(false)}
              className="flex-1 h-14 rounded-2xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-500"
            >
              Annuler
            </Button>
            <Button
              variant="outline"
              onClick={submitRefusal}
              disabled={refuseLoading}
              className="flex-1 h-14 rounded-2xl font-bold bg-red-500 hover:bg-red-600 text-white border-none shadow-lg shadow-red-500/30"
            >
              {refuseLoading ? <Loader className="animate-spin" /> : 'Refuser définitivement'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
