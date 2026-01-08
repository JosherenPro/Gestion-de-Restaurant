import React, { useState, useEffect } from 'react';
import { MenuItem, OrderItem, OrderStatus, Order, Categorie, TypeCommande } from '../types';
import { Button, Card, Modal } from './UI';
import { ShoppingBasket, Search, Plus, Minus, CheckCircle, Calendar, Star, MessageSquare, Loader } from 'lucide-react';
import { useMenu } from '../hooks/useApi';
import { apiService } from '../services/api.service';
import { formatPrice } from '../mockData';

export const ClientView: React.FC = () => {
  const { categories, plats, loading } = useMenu();
  const [activeCategory, setActiveCategory] = useState<number | 'ALL'>(';ALL');
  const [basket, setBasket] = useState<OrderItem[]>([]);
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [step, setStep] = useState<'HOME' | 'MENU' | 'TRACKING'>('HOME');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderError, setOrderError] = useState<string | null>(null);

  // For demo purposes - in production, this would come from QR code scan or user selection
  const CLIENT_ID = 1;
  const TABLE_ID = 1;

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
      
      // Create the order
      const orderData = {
        client_id: CLIENT_ID,
        table_id: TABLE_ID,
        type_commande: TypeCommande.SUR_PLACE,
        montant_total: totalInCentimes,
        notes: ''
      };
      
      const newOrder = await apiService.createCommande(orderData);
      
      // Add each item as a line
      for (const item of basket) {
        await apiService.addLigneCommande(newOrder.id, {
          commande_id: newOrder.id,
          plat_id: item.plat_id,
          quantite: item.quantite,
          prix_unitaire: item.prix_unitaire,
          notes_speciales: item.notes_speciales || ''
        });
      }
      
      setCurrentOrder(newOrder);
      setBasket([]);
      setIsBasketOpen(false);
      setStep('TRACKING');
    } catch (error: any) {
      setOrderError(error.message || 'Erreur lors de la création de la commande');
      console.error('Error placing order:', error);
    }
  };

  const filteredPlats = plats.filter(plat => {
    const matchesCategory = activeCategory === 'ALL' || plat.categorie_id === activeCategory;
    const matchesSearch = plat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (plat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesCategory && matchesSearch && plat.disponible;
  });

  const getImageUrl = (imageUrl?: string) => {
    if (imageUrl) {
      return imageUrl.startsWith('http') ? imageUrl : `http://localhost:8000${imageUrl}`;
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
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24 relative shadow-2xl">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-30 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('HOME')}>
          <div className="w-10 h-10 bg-[#FC8A06] rounded-xl flex items-center justify-center text-white font-bold">R</div>
          <span className="font-bold text-xl">RestoManager</span>
        </div>
        {step === 'MENU' && (
          <button onClick={() => setIsBasketOpen(true)} className="relative p-2 bg-green-100 text-green-700 rounded-full">
            <ShoppingBasket className="w-6 h-6" />
            {basket.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {basket.reduce((a, b) => a + b.quantite, 0)}
              </span>
            )}
          </button>
        )}
      </div>

      {step === 'HOME' && (
        <div className="p-6 flex flex-col gap-6 items-center text-center mt-4">
          <div className="relative w-full">
            <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" className="w-full h-48 object-cover rounded-3xl shadow-lg" alt="Restaurant" />
            <div className="absolute inset-0 bg-black/20 rounded-3xl flex items-center justify-center">
              <span className="bg-white/90 px-4 py-1 rounded-full text-xs font-bold text-[#03081F]">OUVERT</span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#03081F]">Bienvenue</h1>
            <p className="text-gray-500 mt-1 italic">"Découvrez notre menu"</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 w-full">
            <Button fullWidth onClick={() => setStep('MENU')} variant="primary" className="h-16 text-lg">
              <Plus /> Commander maintenant
            </Button>
            <Button fullWidth onClick={() => setIsReservationOpen(true)} variant="outline" className="h-16 text-lg border-2">
              <Calendar /> Réserver une table
            </Button>
            <Button fullWidth onClick={() => setIsReviewOpen(true)} variant="secondary" className="h-16 text-lg border-2">
              <MessageSquare /> Laisser un avis
            </Button>
          </div>
        </div>
      )}

      {step === 'MENU' && (
        <>
          <div className="bg-[#FC8A06] p-4 text-white overflow-hidden shadow-md">
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              <button
                onClick={() => setActiveCategory('ALL')}
                className={`whitespace-nowrap px-4 py-2 rounded-full transition-all text-sm font-bold ${
                  activeCategory === 'ALL' ? 'bg-white text-[#FC8A06] shadow-md' : 'text-white/80'
                }`}
              >
                Tous
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full transition-all text-sm font-bold ${
                    activeCategory === cat.id ? 'bg-white text-[#FC8A06] shadow-md' : 'text-white/80'
                  }`}
                >
                  {cat.nom}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Rechercher un plat..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-full py-3 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-[#FC8A06] outline-none" 
              />
            </div>
            
            <div className="flex flex-col gap-4">
              {filteredPlats.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p>Aucun plat trouvé</p>
                </div>
              ) : (
                filteredPlats.map(plat => (
                  <Card key={plat.id} className="flex gap-4 p-4 items-center group">
                    <div className="flex-1">
                      <h3 className="font-bold text-base text-[#03081F] group-hover:text-[#FC8A06] transition-colors">
                        {plat.nom}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                        {plat.description || 'Délicieux plat'}
                      </p>
                      <p className="font-bold text-[#FC8A06] mt-2">
                        €{formatPrice(plat.prix)}
                      </p>
                    </div>
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                      <img 
                        src={getImageUrl(plat.image_url)} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        alt={plat.nom} 
                      />
                      <button 
                        onClick={() => addToBasket(plat)}
                        className="absolute bottom-1 right-1 bg-white p-2 rounded-xl shadow-lg text-[#FC8A06] hover:bg-[#FC8A06] hover:text-white transition-all active:scale-90"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {step === 'TRACKING' && currentOrder && (
        <div className="p-6 animate-in fade-in duration-500">
          <Card className="p-6 bg-white border-2 border-green-500 shadow-xl rounded-3xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-green-100 p-4 rounded-2xl text-green-600 animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Commande en cours</h2>
                <p className="text-sm text-gray-500">ID: #{currentOrder.id}</p>
              </div>
            </div>

            <div className="space-y-10 relative pl-4">
              <div className="absolute left-[23px] top-4 bottom-4 w-1 bg-gray-100 rounded-full z-0"></div>
              
              {[
                { status: OrderStatus.EN_ATTENTE_VALIDATION, label: 'En attente', active: currentOrder.statut === OrderStatus.EN_ATTENTE_VALIDATION },
                { status: OrderStatus.VALIDEE, label: 'Validée', active: [OrderStatus.VALIDEE, OrderStatus.EN_COURS, OrderStatus.PRETE, OrderStatus.SERVIE].includes(currentOrder.statut) },
                { status: OrderStatus.EN_COURS, label: 'En préparation', active: [OrderStatus.EN_COURS, OrderStatus.PRETE, OrderStatus.SERVIE].includes(currentOrder.statut) },
                { status: OrderStatus.PRETE, label: 'Prête !', active: [OrderStatus.PRETE, OrderStatus.SERVIE].includes(currentOrder.statut) },
              ].map((s, idx) => (
                <div key={idx} className="flex items-start gap-6 relative z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-sm transition-all duration-500 ${
                    s.active ? 'bg-[#FC8A06] border-[#FC8A06] text-white scale-110' : 'bg-white border-gray-200 text-gray-300'
                  }`}>
                    {s.active ? <CheckCircle className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-gray-200" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${s.active ? 'text-[#03081F]' : 'text-gray-400'}`}>{s.label}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                      {s.active ? 'Validé' : 'À venir'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-dashed border-gray-200 space-y-3">
              <div className="flex justify-between items-center px-2">
                <span className="text-sm font-bold text-gray-600">Total à régler</span>
                <span className="text-xl font-black text-[#FC8A06]">€{formatPrice(currentOrder.montant_total)}</span>
              </div>
              <Button 
                fullWidth 
                variant="success" 
                className="h-14 rounded-2xl shadow-green-200 shadow-lg"
                onClick={() => setStep('HOME')}
              >
                Retour à l'accueil
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Basket Bottom Drawer */}
      <Modal isOpen={isBasketOpen} onClose={() => setIsBasketOpen(false)} title="Ma commande">
        {basket.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center gap-4">
            <ShoppingBasket className="w-16 h-16 text-gray-200" />
            <p className="text-gray-400 font-medium">Votre panier est vide</p>
            <Button variant="outline" onClick={() => setIsBasketOpen(false)}>Retour au menu</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orderError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {orderError}
              </div>
            )}
            <div className="max-h-60 overflow-y-auto pr-2 flex flex-col gap-3">
              {basket.map(item => (
                <div key={item.plat_id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl">
                  <div className="w-10 h-10 bg-[#FC8A06]/10 rounded-xl flex items-center justify-center font-bold text-[#FC8A06]">
                    {item.quantite}x
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{item.plat?.nom}</p>
                    <p className="text-[10px] text-gray-400 uppercase">€{formatPrice(item.prix_unitaire)} / unité</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => removeFromBasket(item.plat_id)} className="p-1 text-gray-400 hover:text-red-500">
                      <Minus className="w-5 h-5" />
                    </button>
                    <button onClick={() => item.plat && addToBasket(item.plat)} className="p-1 text-gray-400 hover:text-[#FC8A06]">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-dashed space-y-2">
              <div className="flex justify-between text-xl font-black text-[#03081F] mt-2">
                <p>TOTAL</p>
                <p>€{formatPrice(totalInCentimes)}</p>
              </div>
            </div>
            <Button fullWidth variant="primary" onClick={placeOrder} className="h-14 mt-4 text-lg shadow-orange-100 shadow-xl">
              Commander maintenant
            </Button>
          </div>
        )}
      </Modal>

      {/* Reservation Modal */}
      <Modal isOpen={isReservationOpen} onClose={() => setIsReservationOpen(false)} title="Réserver une table">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsReservationOpen(false); }}>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nombre de personnes</label>
            <div className="flex gap-2">
              {[2, 4, 6, 8].map(n => (
                <button key={n} type="button" className="flex-1 py-3 border-2 border-gray-100 rounded-xl font-bold hover:border-[#FC8A06] hover:text-[#FC8A06] transition-all">
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Date & Heure</label>
            <input type="datetime-local" className="w-full p-4 bg-gray-50 border-none rounded-xl font-medium outline-none" />
          </div>
          <Button fullWidth variant="primary" className="h-14 mt-4">Confirmer la réservation</Button>
        </form>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title="Votre avis nous intéresse">
        <div className="space-y-6 text-center">
          <p className="text-gray-500 text-sm">Comment s'est passée votre expérience ?</p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} className="text-gray-200 hover:text-yellow-400 transition-colors">
                <Star className="w-10 h-10 fill-current" />
              </button>
            ))}
          </div>
          <textarea placeholder="Votre commentaire..." className="w-full p-4 bg-gray-50 border-none rounded-2xl h-32 outline-none" />
          <Button fullWidth variant="primary" onClick={() => setIsReviewOpen(false)}>Envoyer mon avis</Button>
        </div>
      </Modal>

      {/* Persistent Bottom Bar */}
      {step === 'MENU' && basket.length > 0 && !isBasketOpen && (
        <div className="fixed bottom-6 left-6 right-6 max-w-sm mx-auto z-40">
          <Button fullWidth onClick={() => setIsBasketOpen(true)} className="h-16 shadow-2xl bg-[#03081F] rounded-2xl border-2 border-white/10">
            <ShoppingBasket className="w-6 h-6 text-[#FC8A06]" />
            <div className="flex-1 text-left px-4">
              <p className="text-[10px] uppercase font-bold text-gray-400">Voir le panier</p>
              <p className="font-black text-white">€{formatPrice(totalInCentimes)}</p>
            </div>
            <div className="bg-[#FC8A06] p-2 rounded-xl text-white">
              <CheckCircle className="w-5 h-5" />
            </div>
          </Button>
        </div>
      )}
    </div>
  );
};
