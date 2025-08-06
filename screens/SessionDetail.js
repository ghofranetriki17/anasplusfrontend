import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { groupSessionAPI } from '../services/api';

const SessionDetail = ({ route, navigation }) => {
  const { session } = route.params;
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bookingStatus, setBookingStatus] = useState({
    isBooked: false,
    availableSpots: 0,
    currentParticipants: 0
  });

  useEffect(() => {
    fetchBookingStatus();
  }, []);

  const fetchBookingStatus = async () => {
    try {
      const status = await groupSessionAPI.checkBookingStatus(session.id);
      setBookingStatus(status);
    } catch (error) {
      console.error('Error fetching booking status:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookingStatus();
    setRefreshing(false);
  };

  const handleBookSession = async () => {
    if (bookingStatus.isBooked) {
      Alert.alert(
        "Annuler la réservation",
        "Êtes-vous sûr de vouloir annuler votre réservation pour cette session?",
        [
          { text: "Non", style: "cancel" },
          { 
            text: "Oui, annuler", 
            style: "destructive",
            onPress: cancelBooking
          }
        ]
      );
      return;
    }

    if (bookingStatus.availableSpots <= 0) {
      Alert.alert("Session complète", "Cette session est complètement réservée.");
      return;
    }

    Alert.alert(
      "Confirmer la réservation",
      "Voulez-vous réserver cette session?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Réserver", 
          onPress: bookSession
        }
      ]
    );
  };

  const bookSession = async () => {
    setLoading(true);
    try {
      await groupSessionAPI.bookSession(session.id);
      Alert.alert("Succès", "Session réservée avec succès!");
      await fetchBookingStatus(); // Refresh status
    } catch (error) {
      console.error('Booking error:', error);
      let errorMessage = "Erreur lors de la réservation";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 409) {
        errorMessage = "Cette session est déjà complète";
      } else if (error.response?.status === 400) {
        errorMessage = "Vous avez déjà réservé cette session";
      }
      
      Alert.alert("Erreur", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async () => {
    setLoading(true);
    try {
      await groupSessionAPI.cancelBooking(session.id);
      Alert.alert("Succès", "Réservation annulée avec succès!");
      await fetchBookingStatus(); // Refresh status
    } catch (error) {
      console.error('Cancellation error:', error);
      let errorMessage = "Erreur lors de l'annulation";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert("Erreur", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isSessionPassed = () => {
    return new Date(session.session_date) < new Date();
  };

  const getBookingButtonText = () => {
    if (isSessionPassed()) return "Session terminée";
    if (bookingStatus.isBooked) return "Annuler la réservation";
    if (bookingStatus.availableSpots <= 0) return "Session complète";
    return "Réserver cette session";
  };

  const getBookingButtonStyle = () => {
    if (isSessionPassed()) return [styles.bookButton, styles.disabledButton];
    if (bookingStatus.isBooked) return [styles.bookButton, styles.cancelButton];
    if (bookingStatus.availableSpots <= 0) return [styles.bookButton, styles.fullButton];
    return styles.bookButton;
  };

  const canBook = () => {
    return !isSessionPassed() && bookingStatus.availableSpots > 0;
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF3B30" />
      }
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>{session.title}</Text>
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeRow}>
            <Ionicons name="calendar-outline" size={20} color="#FF3B30" />
            <Text style={styles.dateText}>{formatDate(session.session_date)}</Text>
          </View>
          <View style={styles.dateTimeRow}>
            <Ionicons name="time-outline" size={20} color="#FF3B30" />
            <Text style={styles.timeText}>{formatTime(session.session_date)} • {session.duration} min</Text>
          </View>
        </View>
      </View>

      {/* Status Cards */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusCard, bookingStatus.isBooked && styles.bookedStatusCard]}>
          <Ionicons 
            name={bookingStatus.isBooked ? "checkmark-circle" : "calendar-outline"} 
            size={24} 
            color={bookingStatus.isBooked ? "#00FF88" : "#FF3B30"} 
          />
          <Text style={[styles.statusText, bookingStatus.isBooked && styles.bookedStatusText]}>
            {bookingStatus.isBooked ? "Réservée" : "Disponible"}
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Ionicons name="people-outline" size={24} color="#FFD700" />
          <Text style={styles.statusText}>
            {bookingStatus.currentParticipants}/{session.max_participants || '∞'} places
          </Text>
        </View>
      </View>

      {/* Session Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="information-circle-outline" size={24} color="#FF3B30" />
          {' '}Détails de la session
        </Text>
        
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={20} color="#00FF88" />
            <Text style={styles.detailLabel}>Coach:</Text>
            <Text style={styles.detailText}>{session.coach?.name || 'Non assigné'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="book-outline" size={20} color="#64D2FF" />
            <Text style={styles.detailLabel}>Cours:</Text>
            <Text style={styles.detailText}>{session.course?.name || 'Session libre'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color="#FF69B4" />
            <Text style={styles.detailLabel}>Salle:</Text>
            <Text style={styles.detailText}>{session.branch?.name || 'Salle principale'}</Text>
          </View>

          {session.max_participants && (
            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={20} color="#FFD700" />
              <Text style={styles.detailLabel}>Participants max:</Text>
              <Text style={styles.detailText}>{session.max_participants}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Badges */}
      {(session.is_for_women || session.is_for_kids || session.is_free) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="pricetag-outline" size={24} color="#FF3B30" />
            {' '}Informations spéciales
          </Text>
          
          <View style={styles.badgeContainer}>
            {session.is_for_women && (
              <View style={[styles.badge, styles.womenBadge]}>
                <Ionicons name="woman" size={16} color="#FF69B4" />
                <Text style={[styles.badgeText, { color: '#FF69B4' }]}>Session Femmes</Text>
              </View>
            )}
            
            {session.is_for_kids && (
              <View style={[styles.badge, styles.kidsBadge]}>
                <Ionicons name="happy" size={16} color="#64D2FF" />
                <Text style={[styles.badgeText, { color: '#64D2FF' }]}>Session Enfants</Text>
              </View>
            )}
            
            {session.is_free && (
              <View style={[styles.badge, styles.freeBadge]}>
                <Ionicons name="gift" size={16} color="#00FF88" />
                <Text style={[styles.badgeText, { color: '#00FF88' }]}>Gratuit</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Availability Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="analytics-outline" size={24} color="#FF3B30" />
          {' '}Disponibilité
        </Text>
        
        <View style={styles.availabilityCard}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  {
                    width: session.max_participants 
                      ? `${(bookingStatus.currentParticipants / session.max_participants) * 100}%`
                      : '0%'
                  }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {bookingStatus.availableSpots > 0 
                ? `${bookingStatus.availableSpots} places restantes`
                : 'Session complète'
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Booking Button */}
      <TouchableOpacity
        style={getBookingButtonStyle()}
        onPress={handleBookSession}
        disabled={loading || (!bookingStatus.isBooked && !canBook())}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <View style={styles.bookButtonContent}>
            <Ionicons 
              name={bookingStatus.isBooked ? "close-circle" : "calendar"} 
              size={20} 
              color="#FFFFFF" 
            />
            <Text style={styles.bookButtonText}>{getBookingButtonText()}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Additional Info */}
      {isSessionPassed() && (
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={20} color="#FFD700" />
          <Text style={styles.infoText}>Cette session est terminée</Text>
        </View>
      )}

      {bookingStatus.isBooked && !isSessionPassed() && (
        <View style={[styles.infoContainer, styles.successInfo]}>
          <Ionicons name="checkmark-circle" size={20} color="#00FF88" />
          <Text style={[styles.infoText, { color: '#00FF88' }]}>
            Vous avez réservé cette session
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#1A1A1A',
    padding: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  dateTimeContainer: {
    alignItems: 'center',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginLeft: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  timeText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 10,
    fontWeight: '700',
  },
  statusContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-around',
  },
  statusCard: {
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#333333',
  },
  bookedStatusCard: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderColor: '#00FF88',
  },
  statusText: {
    color: '#CCCCCC',
    marginTop: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  bookedStatusText: {
    color: '#00FF88',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 16,
    color: '#CCCCCC',
    marginLeft: 12,
    marginRight: 8,
    minWidth: 80,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  womenBadge: {
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
    borderColor: '#FF69B4',
  },
  kidsBadge: {
    backgroundColor: 'rgba(100, 210, 255, 0.1)',
    borderColor: '#64D2FF',
  },
  freeBadge: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderColor: '#00FF88',
  },
  badgeText: {
    fontWeight: '600',
    marginLeft: 5,
    fontSize: 14,
  },
  availabilityCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    marginBottom: 15,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF3B30',
    borderRadius: 4,
  },
  progressText: {
    color: '#CCCCCC',
    fontSize: 16,
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#FF3B30',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
  },
  fullButton: {
    backgroundColor: '#666666',
  },
  disabledButton: {
    backgroundColor: '#333333',
  },
  bookButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
    marginLeft: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  successInfo: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderColor: '#00FF88',
  },
  infoText: {
    color: '#FFD700',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
});

export default SessionDetail;