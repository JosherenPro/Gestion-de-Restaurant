import React, { useState, useEffect } from 'react';
import { Card, Button, Modal } from './UI';
import { Calendar, Users, Clock, Check, X, AlertCircle, Loader, MessageSquare, MapPin } from 'lucide-react';
import { apiService } from '../services/api.service';
import { Reservation } from '../types';

export const ReservationManagerView: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // For now, we'll use a mock token. In production, this should come from auth context
  const MANAGER_TOKEN = 'mock-manager-token';

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getReservations();
      setReservations(data);
    } catch (err: any) {
      console.error('Error fetching reservations:', err);
      setError(err.message || 'Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      setActionLoading(true);
      await apiService.confirmerReservation(id, MANAGER_TOKEN);
      console.log('? Réservation confirmée');
      // Refresh list
      await fetchReservations();
      setIsDetailModalOpen(false);
    } catch (err: any) {
      console.error('Error confirming reservation:', err);
      alert('Erreur lors de la confirmation: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      setActionLoading(true);
      await apiService.annulerReservation(id, MANAGER_TOKEN);
      console.log('? Réservation annulée');
      // Refresh list
      await fetchReservations();
      setIsDetailModalOpen(false);
    } catch (err: any) {
      console.error('Error canceling reservation:', err);
      alert('Erreur lors de l\'annulation: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return (
          <div className="flex items-center gap-2 bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full">
            <AlertCircle className="w-3 h-3" />
            <span className="text-xs font-bold uppercase">En attente</span>
          </div>
        );
      case 'CONFIRMEE':
        return (
          <div className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1 rounded-full">
            <Check className="w-3 h-3" />
            <span className="text-xs font-bold uppercase">Confirmée</span>
          </div>
        );
      case 'ANNULEE':
        return (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full">
            <X className="w-3 h-3" />
            <span className="text-xs font-bold uppercase">Annulée</span>
          </div>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingReservations = reservations.filter(r => r.statut === 'EN_ATTENTE');
  const confirmedReservations = reservations.filter(r => r.statut === 'CONFIRMEE');
  const canceledReservations = reservations.filter(r => r.statut === 'ANNULEE');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-[#FC8A06] mx-auto" />
          <p className="mt-4 text-gray-500">Chargement des réservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-black text-[#03081F] flex items-center gap-3">
              <Calendar className="text-[#FC8A06] w-10 h-10" />
              Gestion des Réservations
            </h1>
            <button 
              onClick={fetchReservations}
              className="bg-white border-2 border-gray-100 px-6 py-3 rounded-xl font-bold text-sm hover:border-[#FC8A06] hover:text-[#FC8A06] transition-all"
            >
              Actualiser
            </button>
          </div>
          <p className="text-gray-500 font-medium">Gérez les demandes de réservation de vos clients</p>
        </header>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-white border-none shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">En attente</p>
                <p className="text-3xl font-black text-yellow-600">{pendingReservations.length}</p>
              </div>
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-none shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Confirmées</p>
                <p className="text-3xl font-black text-green-600">{confirmedReservations.length}</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <Check className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-gray-50 to-white border-none shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Annulées</p>
                <p className="text-3xl font-black text-gray-600">{canceledReservations.length}</p>
              </div>
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                <X className="w-7 h-7 text-gray-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Reservations List */}
        <div className="space-y-6">
          {/* Pending Section */}
          {pendingReservations.length > 0 && (
            <div>
              <h2 className="text-xl font-black text-[#03081F] mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                Demandes en attente
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pendingReservations.map((reservation) => (
                  <Card 
                    key={reservation.id}
                    className="p-6 bg-white border-2 border-yellow-100 hover:border-yellow-300 transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedReservation(reservation);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-bold text-[#03081F]">Client #{reservation.client_id}</p>
                          <p className="text-xs text-gray-500">Réservation #{reservation.id}</p>
                        </div>
                      </div>
                      {getStatusBadge(reservation.statut)}
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700">{formatDate(reservation.date_reservation)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700">{formatTime(reservation.date_reservation)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700">{reservation.nombre_personnes} personne{reservation.nombre_personnes > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700">Table #{reservation.table_id}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirm(reservation.id);
                        }}
                        disabled={actionLoading}
                        className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Confirmer
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel(reservation.id);
                        }}
                        disabled={actionLoading}
                        className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Refuser
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Confirmed Section */}
          {confirmedReservations.length > 0 && (
            <div>
              <h2 className="text-xl font-black text-[#03081F] mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Réservations confirmées
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {confirmedReservations.map((reservation) => (
                  <Card 
                    key={reservation.id}
                    className="p-4 bg-white border border-gray-100 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedReservation(reservation);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-sm">Client #{reservation.client_id}</p>
                      {getStatusBadge(reservation.statut)}
                    </div>
                    <div className="space-y-2 text-xs text-gray-600">
                      <p>{formatDate(reservation.date_reservation)}</p>
                      <p className="font-bold text-[#FC8A06]">{formatTime(reservation.date_reservation)} • {reservation.nombre_personnes} pers.</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {reservations.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-12 h-12 text-gray-300" />
              </div>
              <p className="text-gray-400 font-bold text-lg">Aucune réservation pour le moment</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        title=""
      >
        {selectedReservation && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-[#03081F]">Détails de la réservation</h2>
                <p className="text-sm text-gray-500 font-medium">Réservation #{selectedReservation.id}</p>
              </div>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#FC8A06] rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold">Client</p>
                    <p className="font-bold text-[#03081F]">Client #{selectedReservation.client_id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Date</p>
                    <p className="font-bold text-sm">{formatDate(selectedReservation.date_reservation)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Heure</p>
                    <p className="font-bold text-sm">{formatTime(selectedReservation.date_reservation)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Personnes</p>
                    <p className="font-bold text-sm">{selectedReservation.nombre_personnes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Table</p>
                    <p className="font-bold text-sm">Table #{selectedReservation.table_id}</p>
                  </div>
                </div>
              </div>

              {selectedReservation.notes && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-blue-600 uppercase font-bold mb-2 flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" />
                    Notes
                  </p>
                  <p className="text-sm text-gray-700">{selectedReservation.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-center">
                {getStatusBadge(selectedReservation.statut)}
              </div>

              {selectedReservation.statut === 'EN_ATTENTE' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleConfirm(selectedReservation.id)}
                    disabled={actionLoading}
                    className="flex-1 bg-green-500 text-white py-4 rounded-xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    Confirmer
                  </button>
                  <button
                    onClick={() => handleCancel(selectedReservation.id)}
                    disabled={actionLoading}
                    className="flex-1 bg-red-500 text-white py-4 rounded-xl font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? <Loader className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                    Refuser
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
