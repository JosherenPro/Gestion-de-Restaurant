import React, { useState, useEffect } from 'react';
import { Card, Button, Modal } from './UI';
import { Calendar, Users, Clock, Check, X, AlertCircle, Loader, MessageSquare, MapPin } from 'lucide-react';
import { apiService } from '../services/api.service';
import { Reservation } from '../types';
import { useAuth } from '../context/AuthContext';

export const ReservationManagerView: React.FC = () => {
  const { token } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const getToken = () => token || '';

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getReservations(getToken());
      // Normaliser les données du backend (status -> statut, minuscule -> MAJUSCULE)
      const normalizedData = data.map((res: any) => ({
        ...res,
        status: (res.statut || res.status || 'EN_ATTENTE').toUpperCase(),
        // Assurer que les autres champs sont là
        statut: undefined // On nettoie pour éviter la confusion
      }));
      setReservations(normalizedData);
    } catch (err: any) {
      console.error('Error fetching reservations:', err);
      setError(err.message || 'Erreur lors du chargement des reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      setActionLoading(true);
      await apiService.confirmerReservation(id, getToken());
      await fetchReservations();
      setIsDetailModalOpen(false);
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      setActionLoading(true);
      await apiService.annulerReservation(id, getToken());
      await fetchReservations();
      setIsDetailModalOpen(false);
    } catch (err: any) {
      alert('Erreur: ' + err.message);
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
            <span className="text-xs font-bold uppercase">Confirmee</span>
          </div>
        );
      case 'ANNULEE':
        return (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full">
            <X className="w-3 h-3" />
            <span className="text-xs font-bold uppercase">Annulee</span>
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

  const pendingReservations = reservations.filter(r => r.status === 'EN_ATTENTE' || (r as any).status === 'en_attente');
  const confirmedReservations = reservations.filter(r => r.status === 'CONFIRMEE' || (r as any).status === 'confirmee');
  const canceledReservations = reservations.filter(r => r.status === 'ANNULEE' || (r as any).status === 'annulee');

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-[#FC8A06] mx-auto" />
          <p className="mt-4 text-gray-500">Chargement des reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#03081F] flex items-center gap-3">
            <Calendar className="text-[#FC8A06] w-7 h-7" />
            Gestion des Reservations
          </h2>
          <p className="text-gray-500 text-sm">Gerez les demandes de reservation de vos clients</p>
        </div>
        <button
          onClick={fetchReservations}
          className="bg-white border-2 border-gray-100 px-6 py-3 rounded-xl font-bold text-sm hover:border-[#FC8A06] hover:text-[#FC8A06] transition-all"
        >
          Actualiser
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Confirmees</p>
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
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Annulees</p>
              <p className="text-3xl font-black text-gray-600">{canceledReservations.length}</p>
            </div>
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
              <X className="w-7 h-7 text-gray-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        {pendingReservations.length > 0 && (
          <div>
            <h3 className="text-xl font-black text-[#03081F] mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              Demandes en attente
            </h3>
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
                        <p className="text-xs text-gray-500">Reservation #{reservation.id}</p>
                      </div>
                    </div>
                    {getStatusBadge(reservation.status)}
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

        {confirmedReservations.length > 0 && (
          <div>
            <h3 className="text-xl font-black text-[#03081F] mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Reservations confirmees
            </h3>
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
                    {getStatusBadge(reservation.status)}
                  </div>
                  <div className="space-y-2 text-xs text-gray-600">
                    <p>{formatDate(reservation.date_reservation)}</p>
                    <p className="font-bold text-[#FC8A06]">{formatTime(reservation.date_reservation)} - {reservation.nombre_personnes} pers.</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {reservations.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-12 h-12 text-gray-300" />
            </div>
            <p className="text-gray-400 font-bold text-lg">Aucune reservation pour le moment</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Details de la reservation"
      >
        {selectedReservation && (
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
              {getStatusBadge(selectedReservation.status)}
            </div>

            {selectedReservation.status === 'EN_ATTENTE' && (
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
        )}
      </Modal>
    </div>
  );
};
