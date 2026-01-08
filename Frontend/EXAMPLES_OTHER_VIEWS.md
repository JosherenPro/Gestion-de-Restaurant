# ?? Exemples de Connexion des Autres Vues

Ce document fournit des exemples concrets pour connecter les vues restantes au backend.

## 1. ??? ServerView - Vue Serveur

### Modifications Nécessaires

```typescript
import React, { useState, useEffect } from 'react';
import { useCommandes, useTables } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api.service';
import { Order, Table, OrderStatus } from '../types';
import { Loader } from 'lucide-react';

export const ServerView: React.FC = () => {
  const { user, token } = useAuth();
  const { commandes, loading: loadingCommandes, refreshCommandes } = useCommandes();
  const { tables, loading: loadingTables, refreshTables } = useTables();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  // Rafraîchir toutes les 10 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshCommandes();
      refreshTables();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleValiderCommande = async (commandeId: number) => {
    if (!token || !user) return;
    
    try {
      await apiService.validerCommande(commandeId, user.id, token);
      await refreshCommandes();
      // Notification de succès
    } catch (error) {
      console.error('Erreur validation:', error);
      // Notification d'erreur
    }
  };

  const handleServirCommande = async (commandeId: number) => {
    if (!token) return;
    
    try {
      await apiService.servirCommande(commandeId, token);
      await refreshCommandes();
    } catch (error) {
      console.error('Erreur service:', error);
    }
  };

  const commandesParTable = (tableId: number) => {
    return commandes.filter(c => c.table_id === tableId);
  };

  if (loadingCommandes || loadingTables) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des Tables</h1>
      
      {/* Grille des tables */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {tables.map(table => {
          const commandesTable = commandesParTable(table.id);
          const hasActiveOrders = commandesTable.some(c => 
            c.statut !== OrderStatus.PAYEE && c.statut !== OrderStatus.ANNULEE
          );
          
          return (
            <div
              key={table.id}
              onClick={() => setSelectedTable(table.id)}
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                hasActiveOrders
                  ? 'bg-orange-100 border-2 border-orange-500'
                  : 'bg-gray-100 border-2 border-gray-300'
              } ${selectedTable === table.id ? 'ring-4 ring-blue-500' : ''}`}
            >
              <div className="text-center">
                <p className="text-2xl font-bold">{table.numero_table}</p>
                <p className="text-sm text-gray-600">
                  {table.capacite} personnes
                </p>
                <p className={`text-xs mt-2 font-bold ${
                  hasActiveOrders ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {hasActiveOrders ? 'Occupée' : 'Libre'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Commandes de la table sélectionnée */}
      {selectedTable && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">
            Commandes - Table {tables.find(t => t.id === selectedTable)?.numero_table}
          </h2>
          <div className="space-y-4">
            {commandesParTable(selectedTable).map(commande => (
              <div key={commande.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold">Commande #{commande.id}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(commande.created_at || '').toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    commande.statut === OrderStatus.EN_ATTENTE_VALIDATION
                      ? 'bg-yellow-100 text-yellow-800'
                      : commande.statut === OrderStatus.PRETE
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {commande.statut}
                  </span>
                </div>

                {/* Lignes de commande */}
                {commande.lignes && (
                  <div className="mb-4 space-y-2">
                    {commande.lignes.map(ligne => (
                      <div key={ligne.id} className="flex justify-between text-sm">
                        <span>{ligne.quantite}x {ligne.plat?.nom}</span>
                        <span className="text-gray-600">
                          €{((ligne.prix_unitaire * ligne.quantite) / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  {commande.statut === OrderStatus.EN_ATTENTE_VALIDATION && (
                    <button
                      onClick={() => handleValiderCommande(commande.id)}
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                      Valider
                    </button>
                  )}
                  {commande.statut === OrderStatus.PRETE && (
                    <button
                      onClick={() => handleServirCommande(commande.id)}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                      Servir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

## 2. ????? ChefView - Vue Cuisinier

### Modifications Nécessaires

```typescript
import React, { useState, useEffect } from 'react';
import { useCommandes } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api.service';
import { Order, OrderStatus } from '../types';
import { Loader, Clock, CheckCircle } from 'lucide-react';

export const ChefView: React.FC = () => {
  const { user, token } = useAuth();
  const { commandes, loading, refreshCommandes } = useCommandes();
  const [preparingOrders, setPreparingOrders] = useState<Set<number>>(new Set());

  // Rafraîchir automatiquement
  useEffect(() => {
    const interval = setInterval(refreshCommandes, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filtrer les commandes pour la cuisine
  const commandesEnAttente = commandes.filter(c => c.statut === OrderStatus.VALIDEE);
  const commandesEnCours = commandes.filter(c => c.statut === OrderStatus.EN_COURS);

  const handleDemarrerPreparation = async (commandeId: number) => {
    if (!token) return;
    
    try {
      setPreparingOrders(prev => new Set(prev).add(commandeId));
      await apiService.preparerCommande(commandeId, token);
      await refreshCommandes();
    } catch (error) {
      console.error('Erreur préparation:', error);
    } finally {
      setPreparingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(commandeId);
        return newSet;
      });
    }
  };

  const handleMarquerPrete = async (commandeId: number) => {
    if (!token || !user) return;
    
    try {
      await apiService.commandePrete(commandeId, user.id, token);
      await refreshCommandes();
    } catch (error) {
      console.error('Erreur marquage prêt:', error);
    }
  };

  const getCommandeAge = (createdAt?: string) => {
    if (!createdAt) return '0 min';
    const diff = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Cuisine - Commandes</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Colonne : En Attente */}
        <div>
          <div className="bg-yellow-100 p-4 rounded-t-xl">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              En Attente ({commandesEnAttente.length})
            </h2>
          </div>
          <div className="space-y-4 mt-4">
            {commandesEnAttente.map(commande => (
              <div key={commande.id} className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-yellow-500">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-lg">Table {commande.table_id}</p>
                    <p className="text-sm text-gray-500">
                      Commande #{commande.id}
                    </p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-bold">
                    {getCommandeAge(commande.created_at)}
                  </span>
                </div>

                {/* Plats à préparer */}
                {commande.lignes && (
                  <div className="space-y-2 mb-4">
                    {commande.lignes.map(ligne => (
                      <div key={ligne.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                          {ligne.quantite}
                        </span>
                        <div className="flex-1">
                          <p className="font-bold">{ligne.plat?.nom}</p>
                          {ligne.notes_speciales && (
                            <p className="text-xs text-orange-600">
                              Note: {ligne.notes_speciales}
                            </p>
                          )}
                          {ligne.plat?.temps_preparation && (
                            <p className="text-xs text-gray-500">
                              ?? {ligne.plat.temps_preparation} min
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => handleDemarrerPreparation(commande.id)}
                  disabled={preparingOrders.has(commande.id)}
                  className="w-full bg-orange-500 text-white px-4 py-3 rounded-lg font-bold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {preparingOrders.has(commande.id) ? 'Démarrage...' : 'Démarrer la Préparation'}
                </button>
              </div>
            ))}

            {commandesEnAttente.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <p>Aucune commande en attente</p>
              </div>
            )}
          </div>
        </div>

        {/* Colonne : En Préparation */}
        <div>
          <div className="bg-blue-100 p-4 rounded-t-xl">
            <h2 className="font-bold text-lg flex items-center gap-2">
              ?? En Préparation ({commandesEnCours.length})
            </h2>
          </div>
          <div className="space-y-4 mt-4">
            {commandesEnCours.map(commande => (
              <div key={commande.id} className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-lg">Table {commande.table_id}</p>
                    <p className="text-sm text-gray-500">
                      Commande #{commande.id}
                    </p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-bold animate-pulse">
                    {getCommandeAge(commande.created_at)}
                  </span>
                </div>

                {/* Plats en préparation */}
                {commande.lignes && (
                  <div className="space-y-2 mb-4">
                    {commande.lignes.map(ligne => (
                      <div key={ligne.id} className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                        <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                          {ligne.quantite}
                        </span>
                        <div className="flex-1">
                          <p className="font-bold">{ligne.plat?.nom}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => handleMarquerPrete(commande.id)}
                  className="w-full bg-green-500 text-white px-4 py-3 rounded-lg font-bold hover:bg-green-600 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Marquer Prêt
                </button>
              </div>
            ))}

            {commandesEnCours.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <p>Aucune commande en préparation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```

## 3. ?? AdminView - Vue Gérant

### Modifications Nécessaires

```typescript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api.service';
import { Stats, TopPlat } from '../types';
import { Loader, TrendingUp, Users, Star, DollarSign } from 'lucide-react';

export const AdminView: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [topPlats, setTopPlats] = useState<TopPlat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      
      const [statsData, topPlatsData] = await Promise.all([
        apiService.getStatsGlobal(token),
        apiService.getTopPlats(token)
      ]);
      
      setStats(statsData);
      setTopPlats(topPlatsData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données');
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl mb-4">Connexion requise</p>
          <p className="text-gray-500">Veuillez vous connecter en tant que gérant</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl mb-4">Erreur</p>
          <p>{error}</p>
          <button
            onClick={loadData}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard Gérant</h1>
          <button
            onClick={loadData}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Actualiser
          </button>
        </div>

        {/* KPIs */}
        {stats && (
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Chiffre d'Affaires</p>
                  <p className="text-2xl font-bold">
                    €{(stats.chiffre_affaires_total / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Commandes</p>
                  <p className="text-2xl font-bold">{stats.nombre_commandes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Note Moyenne</p>
                  <p className="text-2xl font-bold">
                    {stats.note_moyenne.toFixed(1)} / 5
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Clients</p>
                  <p className="text-2xl font-bold">{stats.nombre_clients}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Plats */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-6">Top 5 des Plats</h2>
          <div className="space-y-4">
            {topPlats.map((plat, index) => (
              <div key={plat.plat_id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                  index === 0 ? 'bg-yellow-100 text-yellow-600' :
                  index === 1 ? 'bg-gray-100 text-gray-600' :
                  index === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">{plat.nom_plat}</p>
                  <p className="text-sm text-gray-500">
                    {plat.quantite_vendue} vendus
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    €{(plat.chiffre_affaires / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">CA généré</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
```

## 4. ?? Résumé des Changements

### Pour chaque vue :

1. **Import des hooks et services**
   ```typescript
   import { useCommandes, useTables, useMenu } from '../hooks/useApi';
   import { useAuth } from '../context/AuthContext';
   import { apiService } from '../services/api.service';
   ```

2. **Utilisation des hooks**
   ```typescript
   const { token, user } = useAuth();
   const { commandes, loading, refreshCommandes } = useCommandes();
   ```

3. **Appels API pour les actions**
   ```typescript
   await apiService.validerCommande(id, serveurId, token);
   await refreshCommandes(); // Recharger les données
   ```

4. **Gestion du loading et des erreurs**
   ```typescript
   if (loading) return <Loader />;
   if (error) return <ErrorMessage />;
   ```

5. **Rafraîchissement automatique**
   ```typescript
   useEffect(() => {
     const interval = setInterval(refresh, 5000);
     return () => clearInterval(interval);
   }, []);
   ```

---

**Note** : Ces exemples sont des points de départ. Vous pouvez les adapter selon vos besoins spécifiques et ajouter plus de fonctionnalités !
