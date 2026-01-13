import React, { useState, useEffect } from 'react';
import { Card, Button } from './UI';
import { ChefHat, Timer, Play, Check, Box, EyeOff, Eye, Loader, RefreshCw, LogOut } from 'lucide-react';
import { apiService } from '../services/api.service';
import { Order, OrderStatus, MenuItem } from '../types';
import { formatPrice } from '../mockData';
import { useAuth } from '../context/AuthContext';

export const CuisinierViewConnected: React.FC = () => {
  const { logout, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<'COMMANDES' | 'STOCK'>('COMMANDES');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Mock cuisinier ID
  const CUISINIER_ID = 1;

  useEffect(() => {
    loadData();
    // Refresh every 20 seconds
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [commandesData, platsData] = await Promise.all([
        apiService.getCommandes(),
        apiService.getPlats()
      ]);
      setOrders(commandesData);
      setMenu(platsData);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const startPreparing = async (orderId: number) => {
    try {
      setActionLoading(true);
      await apiService.preparerCommande(orderId, 'mock-token');
      await loadData();
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const markAsReady = async (orderId: number) => {
    try {
      setActionLoading(true);
      await apiService.commandePrete(orderId, CUISINIER_ID, 'mock-token');
      await loadData();
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleAvailability = async (platId: number, currentStatus: boolean) => {
    try {
      setActionLoading(true);
      // Note: L'API n'a pas d'endpoint spécifique pour changer la disponibilité
      // Vous devrez peut-être l'ajouter au backend
      await apiService.put(`/plats/${platId}`, { disponible: !currentStatus }, { token: 'mock-token' });
      await loadData();
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const aPreparer = orders.filter(o => 
    o.statut === OrderStatus.VALIDEE
  );
  
  const enPreparation = orders.filter(o => 
    o.statut === OrderStatus.EN_COURS
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
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#03081F] flex items-center gap-3 tracking-tight">
            <ChefHat className="text-[#FC8A06] w-10 h-10" /> CUISINE DIRECT
          </h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">
            ????? {user?.prenom || user?.nom || 'Cuisinier'} • Système de gestion de production
          </p>
        </div>
        
        <div className="flex gap-3 items-center">
          <button 
            onClick={loadData}
            className="p-3 bg-white rounded-xl hover:bg-gray-50 transition-all"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
            <button 
              onClick={() => setActiveTab('COMMANDES')}
              className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                activeTab === 'COMMANDES' 
                  ? 'bg-[#FC8A06] text-white shadow-lg' 
                  : 'text-gray-400 hover:text-[#03081F]'
              }`}
            >
              Commandes
            </button>
            <button 
              onClick={() => setActiveTab('STOCK')}
              className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                activeTab === 'STOCK' 
                  ? 'bg-[#FC8A06] text-white shadow-lg' 
                  : 'text-gray-400 hover:text-[#03081F]'
              }`}
            >
              Gestion Stock
            </button>
          </div>

          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {activeTab === 'COMMANDES' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Column: À Préparer */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-[#03081F] flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                ATTENTE ({aPreparer.length})
              </h2>
            </div>
            <div className="space-y-6">
              {aPreparer.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-20 text-center flex flex-col items-center gap-4 border-2 border-dashed border-gray-200">
                  <Box className="w-16 h-16 text-gray-100" />
                  <p className="text-gray-300 font-black uppercase text-sm">Cuisine libre</p>
                </div>
              ) : (
                aPreparer.map(order => {
                  const tableNum = order.table_id || '?';
                  return (
                    <Card 
                      key={order.id} 
                      className="p-8 border-none rounded-[2rem] bg-white shadow-xl hover:shadow-2xl transition-all relative group"
                    >
                      <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 rounded-l-full"></div>
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-lg">
                            T{tableNum}
                          </div>
                          <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">
                            REF: #{order.id}
                          </span>
                        </div>
                        <span className="text-gray-400 text-xs font-bold flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                          <Timer size={14} /> 
                          {order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </span>
                      </div>
                      <div className="space-y-3 mb-8">
                        {order.lignes && order.lignes.length > 0 ? (
                          order.lignes.map((ligne) => (
                            <div 
                              key={ligne.id} 
                              className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50"
                            >
                              <span className="font-bold text-[#03081F]">
                                <span className="text-[#FC8A06] font-black text-lg mr-3">{ligne.quantite}x</span> 
                                {ligne.plat?.nom || 'Plat inconnu'}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400 italic">Détails non disponibles</p>
                        )}
                      </div>
                      <Button 
                        fullWidth 
                        onClick={() => startPreparing(order.id)} 
                        variant="secondary" 
                        className="h-14 rounded-2xl shadow-xl shadow-gray-200"
                        disabled={actionLoading}
                      >
                        {actionLoading ? <Loader className="w-5 h-5 animate-spin" /> : <><Play size={18} fill="currentColor" /> PRENDRE EN CHARGE</>}
                      </Button>
                    </Card>
                  );
                })
              )}
            </div>
          </section>

          {/* Column: En Préparation */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-[#03081F] flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
                EN CUISSON ({enPreparation.length})
              </h2>
            </div>
            <div className="space-y-6">
              {enPreparation.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-20 text-center flex flex-col items-center gap-4 border-2 border-dashed border-gray-200">
                  <Timer className="w-16 h-16 text-gray-100" />
                  <p className="text-gray-300 font-black uppercase text-sm">Rien en cours</p>
                </div>
              ) : (
                enPreparation.map(order => {
                  const tableNum = order.table_id || '?';
                  return (
                    <Card 
                      key={order.id} 
                      className="p-8 border-none rounded-[2rem] bg-[#03081F] text-white shadow-2xl relative"
                    >
                      <div className="absolute top-0 left-0 w-2 h-full bg-[#FC8A06] rounded-l-full"></div>
                      <div className="flex justify-between items-center mb-6">
                        <div className="bg-white/10 text-white px-4 py-2 rounded-xl font-black text-lg">
                          T{tableNum}
                        </div>
                        <div className="animate-pulse flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#FC8A06]"></div>
                          <span className="text-[10px] font-black text-[#FC8A06] uppercase tracking-widest">En cours</span>
                        </div>
                      </div>
                      <div className="space-y-3 mb-8">
                        {order.lignes && order.lignes.length > 0 ? (
                          order.lignes.map((ligne) => (
                            <div 
                              key={ligne.id} 
                              className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5"
                            >
                              <span className="font-bold">
                                <span className="text-[#FC8A06] font-black text-lg mr-3">{ligne.quantite}x</span> 
                                {ligne.plat?.nom || 'Plat inconnu'}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-white/60 italic">Détails non disponibles</p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          fullWidth 
                          onClick={() => markAsReady(order.id)} 
                          variant="success" 
                          className="h-14 rounded-2xl shadow-lg shadow-green-900/20"
                          disabled={actionLoading}
                        >
                          {actionLoading ? <Loader className="w-5 h-5 animate-spin" /> : <><Check size={20} /> MARQUER COMME PRÊT</>}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menu.map(plat => (
            <Card key={plat.id} className="p-6 bg-white border-none rounded-3xl shadow-md group">
              <div className="relative h-40 w-full mb-4 rounded-2xl overflow-hidden">
                <img 
                  src={plat.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&h=300'} 
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    !plat.disponible ? 'grayscale opacity-50' : 'group-hover:scale-110'
                  }`}
                  alt={plat.nom}
                />
                {!plat.disponible && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-black uppercase">
                      Indisponible
                    </span>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-[#03081F] mb-1">{plat.nom}</h3>
              <p className="text-xs text-gray-400 mb-2 font-medium">{plat.categorie?.nom || 'Catégorie'}</p>
              <p className="text-sm text-[#FC8A06] font-bold mb-4">€{formatPrice(plat.prix)}</p>
              <Button 
                fullWidth 
                variant={plat.disponible ? 'outline' : 'success'} 
                className="h-11 rounded-xl text-xs font-black"
                onClick={() => toggleAvailability(plat.id, plat.disponible)}
                disabled={actionLoading}
              >
                {plat.disponible ? (
                  <><EyeOff size={14} /> Déclarer Indisponible</>
                ) : (
                  <><Eye size={14} /> Réactiver le plat</>
                )}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
