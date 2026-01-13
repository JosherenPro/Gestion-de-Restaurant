import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus, Table, TableStatus } from '../types';
import { Card, Button, Badge, Modal } from './UI';
import { LayoutGrid, ClipboardList, UserPlus, CheckCircle2, ChevronRight, Plus, Minus, Loader, RefreshCcw, LogOut } from 'lucide-react';
import { formatPrice } from '../mockData';

export const ServerViewConnected: React.FC = () => {
  const { token, user, logout } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [manualBasket, setManualBasket] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plats, setPlats] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    
    try {
      const [tablesData, commandesData, platsData] = await Promise.all([
        apiService.getTables(token),
        apiService.getCommandes(token),
        apiService.getPlats(token)
      ]);
      
      setTables(tablesData);
      setOrders(commandesData);
      setPlats(platsData);
      setError(null);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Table Plan Sidebar */}
      <aside className="w-full md:w-80 p-6 bg-[#03081F] text-white border-r space-y-8 overflow-y-auto max-h-screen md:sticky top-0 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FC8A06] rounded-xl flex items-center justify-center font-bold">S!</div>
            <span className="font-bold text-xl">Service Pro</span>
          </div>
          <button onClick={logout} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {user && (
          <div className="bg-white/5 rounded-2xl p-4 mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase">Connecté en tant que</p>
            <p className="text-sm font-bold mt-1">{user.prenom} {user.nom}</p>
            <p className="text-xs text-[#FC8A06] font-bold">{user.role}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 mb-4">
            <p className="text-xs text-red-200">{error}</p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Plan de Salle</h2>
            <button onClick={loadData} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {tables.map(table => (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                  selectedTable?.id === table.id ? 'border-[#FC8A06] bg-[#FC8A06]/10 ring-2 ring-[#FC8A06]/20' :
                  table.statut === TableStatus.OCCUPEE ? 'border-orange-500/20 bg-white/5 text-orange-400' :
                  table.statut === TableStatus.RESERVEE ? 'border-blue-500/20 bg-white/5 text-blue-400' :
                  'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
                }`}
              >
                <span className="font-black text-lg">T{table.numero_table}</span>
                <span className="text-[9px] font-bold opacity-60">{table.capacite} PERS.</span>
              </button>
            ))}
          </div>
        </div>

        {selectedTable && (
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 animate-in fade-in zoom-in duration-300">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <UserPlus size={16} className="text-[#FC8A06]" /> 
              Table {selectedTable.numero_table}
            </h3>
            <Button 
              fullWidth 
              onClick={() => setIsManualOrderOpen(true)} 
              variant="primary" 
              className="h-12 text-sm"
            >
              Prise de commande
            </Button>
            <button 
              className="w-full mt-2 text-xs text-gray-500 hover:text-white" 
              onClick={() => setSelectedTable(null)}
            >
              Annuler la sélection
            </button>
          </div>
        )}
      </aside>

      {/* Orders Dashboard */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#03081F]">Commandes Actives</h1>
            <p className="text-gray-500 font-medium">Flux temps réel du service</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="bg-orange-100 text-[#FC8A06] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FC8A06] animate-pulse"></div>
              {orders.filter(o => o.statut !== OrderStatus.SERVIE && o.statut !== OrderStatus.PAYEE).length} en cours
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {orders
            .filter(o => o.statut !== OrderStatus.SERVIE && o.statut !== OrderStatus.PAYEE)
            .map(order => (
              <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow border-none bg-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ClipboardList size={64} />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-[#03081F] rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg">
                        T{order.table_id}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-[#03081F]">#{order.id}</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase">
                          {order.created_at && new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
                          €{formatPrice(order.montant_total)}
                        </p>
                      </div>
                    </div>
                    <Badge status={order.statut} />
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                    <ul className="space-y-2">
                      {order.lignes?.map((item, idx) => (
                        <li key={idx} className="text-sm flex justify-between font-medium">
                          <span>
                            <span className="text-[#FC8A06] font-black mr-2">{item.quantite}x</span> 
                            {item.plat?.nom || 'Plat'}
                          </span>
                          <span className="text-gray-400">€{formatPrice(item.prix_unitaire * item.quantite)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    {order.statut === OrderStatus.EN_ATTENTE_VALIDATION && (
                      <Button 
                        fullWidth 
                        onClick={() => approveOrder(order.id)} 
                        variant="primary" 
                        className="h-12"
                      >
                        Valider
                      </Button>
                    )}
                    {order.statut === OrderStatus.PRETE && (
                      <Button 
                        fullWidth 
                        onClick={() => markServed(order.id)} 
                        variant="success" 
                        className="h-12"
                      >
                        Marquer comme servi
                      </Button>
                    )}
                    <Button variant="outline" className="h-12 w-12 p-0">
                      <ChevronRight />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </main>

      {/* Manual Order Modal */}
      <Modal 
        isOpen={isManualOrderOpen} 
        onClose={() => setIsManualOrderOpen(false)} 
        title={`Prise de commande - Table ${selectedTable?.numero_table}`}
      >
        <div className="flex flex-col gap-6">
          <div className="max-h-[40vh] overflow-y-auto space-y-2 pr-2">
            <h4 className="text-xs font-black text-gray-400 uppercase mb-2">Carte du restaurant</h4>
            {plats.filter(p => p.disponible).map(item => (
              <div 
                key={item.id} 
                className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100 hover:border-[#FC8A06] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-bold text-sm">{item.nom}</p>
                    <p className="text-xs text-[#FC8A06] font-bold">€{formatPrice(item.prix)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => addToManual(item)} 
                  className="p-2 bg-white rounded-xl shadow-sm hover:bg-[#FC8A06] hover:text-white transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed pt-4">
            <h4 className="text-xs font-black text-gray-400 uppercase mb-3">Sélection en cours</h4>
            <div className="space-y-2 mb-6">
              {manualBasket.length === 0 ? (
                <p className="text-center text-gray-300 text-sm py-4">Panier vide</p>
              ) : (
                manualBasket.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span className="text-sm font-bold">
                      <span className="text-[#FC8A06]">{item.quantite}x</span> {item.nom}
                    </span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => removeFromManual(item.id)} 
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-black">
                        €{formatPrice(item.prix * item.quantite)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button 
              fullWidth 
              onClick={createManualOrder} 
              variant="primary" 
              className="h-14" 
              disabled={manualBasket.length === 0}
            >
              Envoyer en cuisine (€{formatPrice(manualBasket.reduce((a, b) => a + b.prix * b.quantite, 0))})
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
