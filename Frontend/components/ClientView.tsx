import React, { useState } from 'react';
import { MENU_ITEMS, MenuItemDisplay, OrderDisplay } from '../mockData';
import { OrderStatus } from '../types';
import { Button, Card, Badge, Modal } from './UI';
import { ShoppingBasket, Search, Plus, Minus, CheckCircle, Clock, Calendar, Star, MessageSquare } from 'lucide-react';

export const ClientView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Burgers');
  const [basket, setBasket] = useState<Array<MenuItemDisplay & { quantity: number }>>([]);
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderDisplay | null>(null);
  const [step, setStep] = useState<'HOME' | 'MENU' | 'TRACKING'>('HOME');

  const categories = ['Offers', 'Burgers', 'Fries', 'Snacks', 'Salads', 'Cold drinks'];

  const addToBasket = (item: MenuItemDisplay) => {
    setBasket(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromBasket = (id: number) => {
    setBasket(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const total = basket.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const placeOrder = () => {
    const newOrder: OrderDisplay = {
      id: Math.random().toString(36).substr(2, 9),
      tableId: 't1',
      items: basket.map(item => ({
        id: item.id,
        plat_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      status: OrderStatus.EN_ATTENTE_VALIDATION,
      timestamp: Date.now(),
      totalPrice: total
    };
    setCurrentOrder(newOrder);
    setBasket([]);
    setIsBasketOpen(false);
    setStep('TRACKING');
  };

  const filteredItems = MENU_ITEMS.filter(item => 
    activeCategory === 'Offers' 
    ? item.price < 20 
    : (item.category || '').toLowerCase().includes(activeCategory.toLowerCase().slice(0, -1))
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24 relative shadow-2xl">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-30 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('HOME')}>
          <div className="w-10 h-10 bg-[#FC8A06] rounded-xl flex items-center justify-center text-white font-bold">O!</div>
          <span className="font-bold text-xl">RestoManager</span>
        </div>
        {step === 'MENU' && (
           <button onClick={() => setIsBasketOpen(true)} className="relative p-2 bg-green-100 text-green-700 rounded-full">
            <ShoppingBasket className="w-6 h-6" />
            {basket.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {basket.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>
        )}
      </div>

      {step === 'HOME' && (
        <div className="p-6 flex flex-col gap-6 items-center text-center mt-4">
          <div className="relative w-full">
             <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" className="w-full h-48 object-cover rounded-3xl shadow-lg" alt="Resto" />
             <div className="absolute inset-0 bg-black/20 rounded-3xl flex items-center justify-center">
                <span className="bg-white/90 px-4 py-1 rounded-full text-xs font-bold text-[#03081F]">OUVERT</span>
             </div>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#03081F]">Table 12</h1>
            <p className="text-gray-500 mt-1 italic">"La meilleure cuisine italienne en ville"</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 w-full">
            <Button fullWidth onClick={() => setStep('MENU')} variant="primary" className="h-16 text-lg">
              <Plus /> Commander maintenant
            </Button>
            <Button fullWidth onClick={() => setIsReservationOpen(true)} variant="outline" className="h-16 text-lg border-2">
              <Calendar /> Réserver une table
            </Button>
            {/* Fix: removed non-existent 'outline' prop which was causing a type error */}
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
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full transition-all text-sm font-bold ${activeCategory === cat ? 'bg-white text-[#FC8A06] shadow-md' : 'text-white/80'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Rechercher un plat..." className="w-full bg-white border border-gray-100 rounded-full py-3 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-[#FC8A06] outline-none" />
            </div>
            
            <div className="flex flex-col gap-4">
              {filteredItems.map(item => (
                <Card key={item.id} className="flex gap-4 p-4 items-center group">
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-[#03081F] group-hover:text-[#FC8A06] transition-colors">{item.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">{item.description}</p>
                    <p className="font-bold text-[#FC8A06] mt-2">€{item.price.toFixed(2)}</p>
                  </div>
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.name} />
                    <button 
                      onClick={() => addToBasket(item)}
                      className="absolute bottom-1 right-1 bg-white p-2 rounded-xl shadow-lg text-[#FC8A06] hover:bg-[#FC8A06] hover:text-white transition-all active:scale-90"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
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
                { status: OrderStatus.EN_ATTENTE_VALIDATION, label: 'Validation reçue', active: true },
                { status: OrderStatus.EN_COURS, label: 'En cuisine', active: currentOrder.status !== OrderStatus.EN_ATTENTE_VALIDATION },
                { status: OrderStatus.PRETE, label: 'Plat prêt !', active: [OrderStatus.PRETE, OrderStatus.SERVIE].includes(currentOrder.status) },
                { status: OrderStatus.SERVIE, label: 'Bon appétit !', active: currentOrder.status === OrderStatus.SERVIE }
              ].map((s, idx) => (
                <div key={idx} className="flex items-start gap-6 relative z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-sm transition-all duration-500 ${s.active ? 'bg-[#FC8A06] border-[#FC8A06] text-white scale-110' : 'bg-white border-gray-200 text-gray-300'}`}>
                    {s.active ? <CheckCircle className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-gray-200" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${s.active ? 'text-[#03081F]' : 'text-gray-400'}`}>{s.label}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{s.active ? 'Validé' : 'À venir'}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-dashed border-gray-200 space-y-3">
              <div className="flex justify-between items-center px-2">
                <span className="text-sm font-bold text-gray-600">Total à régler</span>
                <span className="text-xl font-black text-[#FC8A06]">€{currentOrder.totalPrice.toFixed(2)}</span>
              </div>
              <Button fullWidth variant="success" className="h-14 rounded-2xl shadow-green-200 shadow-lg">Payer & Terminer</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Reservation Modal */}
      <Modal isOpen={isReservationOpen} onClose={() => setIsReservationOpen(false)} title="Réserver une table">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsReservationOpen(false); }}>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nombre de personnes</label>
            <div className="flex gap-2">
              {[2, 4, 6, 8].map(n => (
                <button key={n} type="button" className="flex-1 py-3 border-2 border-gray-100 rounded-xl font-bold hover:border-[#FC8A06] hover:text-[#FC8A06] transition-all">{n}</button>
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
          <p className="text-gray-500 text-sm">Comment s'est passée votre expérience aujourd'hui ?</p>
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
            <div className="max-h-60 overflow-y-auto pr-2 flex flex-col gap-3">
              {basket.map(item => (
                <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl">
                  <div className="w-10 h-10 bg-[#FC8A06]/10 rounded-xl flex items-center justify-center font-bold text-[#FC8A06]">{item.quantity}x</div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase">€{item.price.toFixed(2)} / unité</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => removeFromBasket(item.id)} className="p-1 text-gray-400 hover:text-red-500"><Minus className="w-5 h-5" /></button>
                    <button onClick={() => addToBasket(item)} className="p-1 text-gray-400 hover:text-[#FC8A06]"><Plus className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-dashed space-y-2">
              <div className="flex justify-between text-gray-500 text-sm"><p>Sous-total</p><p>€{total.toFixed(2)}</p></div>
              <div className="flex justify-between text-gray-500 text-sm"><p>Service (Table 12)</p><p>€1.50</p></div>
              <div className="flex justify-between text-xl font-black text-[#03081F] mt-2"><p>TOTAL</p><p>€{(total + 1.5).toFixed(2)}</p></div>
            </div>
            <Button fullWidth variant="primary" onClick={placeOrder} className="h-14 mt-4 text-lg shadow-orange-100 shadow-xl">
              Commander maintenant
            </Button>
          </div>
        )}
      </Modal>

      {/* Persistent Bottom Bar */}
      {step === 'MENU' && basket.length > 0 && !isBasketOpen && (
        <div className="fixed bottom-6 left-6 right-6 max-w-sm mx-auto z-40">
          <Button fullWidth onClick={() => setIsBasketOpen(true)} className="h-16 shadow-2xl bg-[#03081F] rounded-2xl border-2 border-white/10">
            <ShoppingBasket className="w-6 h-6 text-[#FC8A06]" />
            <div className="flex-1 text-left px-4">
               <p className="text-[10px] uppercase font-bold text-gray-400">Voir le panier</p>
               <p className="font-black text-white">€{total.toFixed(2)}</p>
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
