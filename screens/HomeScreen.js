import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { branchAPI, groupSessionAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome, MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const CARD_SPACING = 15;
const PRODUCT_WIDTH = width * 0.45;

const HomeScreen = ({ navigation }) => {
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookedSessions, setBookedSessions] = useState([]);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Static data
  const categories = [
    { id: 1, name: 'With Pool', icon: 'pool' },
    { id: 2, name: '24/7 Access', icon: 'clock' },
    { id: 3, name: 'Yoga', icon: 'yoga' },
    { id: 4, name: 'CrossFit', icon: 'weight-lifter' },
    { id: 5, name: 'Premium', icon: 'crown' },
  ];

  const shopItems = [
    { id: 1, name: 'Whey Protein', price: '299 DH', image: require('../assets/gym-banner.jpg') },
    { id: 2, name: 'Gym Gloves', price: '149 DH', image: require('../assets/gym-banner.jpg') },
    { id: 3, name: 'Shaker Bottle', price: '99 DH', image: require('../assets/gym-banner.jpg') },
    { id: 4, name: 'Training Belt', price: '199 DH', image: require('../assets/gym-banner.jpg') },
  ];

  const promotions = [
    { id: 1, title: 'Summer Special', subtitle: 'Get 20% off on all memberships' },
    { id: 2, title: 'New Member', subtitle: 'First month free for new users' },
  ];

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadAllData();
    }, [])
  );

  const loadAllData = async () => {
    await loadUserName();
    await loadBranches();
    await loadBookedSessions();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const loadUserName = async () => {
    try {
      const storedUserName = await AsyncStorage.getItem('userName');
      if (storedUserName) setUserName(storedUserName);
    } catch (error) {
      console.error('Error loading user name:', error);
    }
  };

  const loadBranches = async () => {
    try {
      setLoading(true);
      const response = await branchAPI.getAll();
      setBranches(response.data);
      setFilteredBranches(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load branches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadBookedSessions = async () => {
    try {
      setLoadingBookings(true);
      const response = await groupSessionAPI.getUserBookings();
      setBookedSessions(response.data || response);
    } catch (error) {
      console.error('Error loading booked sessions:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const filterBranches = () => {
    if (searchQuery === '') {
      setFilteredBranches(branches);
    } else {
      const filtered = branches.filter(branch =>
        branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBranches(filtered);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              navigation.replace('Auth');
            } catch (error) {
              console.error('Logout failed:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleBranchPress = (branch) => {
    navigation.navigate('BranchDetail', { branch });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <MaterialCommunityIcons 
        name={item.icon} 
        size={24} 
        color="#FF3B30" 
        style={styles.categoryIcon} 
      />
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderShopItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.shopItem}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image source={item.image} style={styles.shopItemImage} />
      <Text style={styles.shopItemName}>{item.name}</Text>
      <Text style={styles.shopItemPrice}>{item.price}</Text>
      <TouchableOpacity style={styles.addToCartButton}>
        <MaterialIcons name="add-shopping-cart" size={18} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPromoItem = ({ item }) => (
    <View style={styles.promoCard}>
      <View style={styles.promoContent}>
        <Text style={styles.promoTitle}>{item.title}</Text>
        <Text style={styles.promoSubtitle}>{item.subtitle}</Text>
        <TouchableOpacity style={styles.promoButton}>
          <Text style={styles.promoButtonText}>Claim Offer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBranchItem = ({ item }) => (
    <TouchableOpacity
      style={styles.branchCard}
      onPress={() => handleBranchPress(item)}
    >
      <View style={styles.branchHeader}>
        <Text style={styles.branchName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <FontAwesome name="star" size={14} color="#FF9500" />
          <Text style={styles.ratingText}>4.8</Text>
        </View>
      </View>
      <Text style={styles.branchAddress}>
        <MaterialIcons name="location-on" size={14} color="#FF3B30" /> 
        {item.address}, {item.city}
      </Text>
      <Text style={styles.branchContact}>
        <MaterialIcons name="phone" size={14} color="#FF3B30" /> 
        {item.phone}
      </Text>
      <View style={styles.branchFooter}>
        <Text style={styles.branchPrice}>From 50 DH/day</Text>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookingItem}
      onPress={() => {
        setShowBookingsModal(false);
        navigation.navigate('SessionDetail', { session: item });
      }}
    >
      <Text style={styles.bookingTitle}>{item.title}</Text>
      <Text style={styles.bookingDate}>{formatDate(item.session_date)}</Text>
      <Text style={styles.bookingLocation}>
        <MaterialIcons name="location-on" size={14} color="#FF3B30" /> 
        {item.branch?.name || 'Unknown location'}
      </Text>
      <TouchableOpacity 
        style={styles.viewSessionButton}
        onPress={() => {
          setShowBookingsModal(false);
          navigation.navigate('SessionDetail', { session: item });
        }}
      >
        <Text style={styles.viewSessionButtonText}>Consulter la session</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF3B30" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadBranches}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Search */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Hello, {userName}</Text>
          <Text style={styles.headerTitle}>Find Your Perfect Gym</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search gyms, locations..."
          placeholderTextColor="#777"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="clear" size={20} color="#777" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF3B30"
            colors={['#FF3B30']}
          />
        }
      >
        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            horizontal
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        </View>
{/*
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Special Offers</Text>
  <FlatList
    horizontal
    data={promotions}
    renderItem={renderPromoItem}
    keyExtractor={item => item.id.toString()}
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.promotionsContainer}
  />
</View>
*/}


        {/* Branch List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? 'Search Results' : 'Popular Gyms'}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('BranchMap')}>
              <Text style={styles.seeAllText}>View Map</Text>
            </TouchableOpacity>
          </View>
          {filteredBranches.length > 0 ? (
            <FlatList
              horizontal
              data={filteredBranches}
              renderItem={renderBranchItem}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: CARD_SPACING }}
              snapToInterval={CARD_WIDTH + CARD_SPACING}
              decelerationRate="fast"
            />
          ) : (
            <View style={styles.noResults}>
              <MaterialIcons name="search-off" size={40} color="#FF3B30" />
              <Text style={styles.noResultsText}>No gyms found</Text>
            </View>
          )}
        </View>

        {/* Shop Section 
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gym Essentials</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={shopItems}
            renderItem={renderShopItem}
            keyExtractor={item => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shopContainer}
          />
        </View>
*/}
        {/* Membership Benefits
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Membership Benefits</Text>
          <View style={styles.benefitsGrid}>
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="account-group" size={30} color="#FF3B30" />
              <Text style={styles.benefitText}>Group Classes</Text>
            </View>
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="trainer" size={30} color="#FF3B30" />
              <Text style={styles.benefitText}>Personal Trainer</Text>
            </View>
            <View style={styles.benefitItem}>
              <MaterialIcons name="spa" size={30} color="#FF3B30" />
              <Text style={styles.benefitText}>Spa Access</Text>
            </View>
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="towel" size={30} color="#FF3B30" />
              <Text style={styles.benefitText}>Free Towels</Text>
            </View>
          </View>
        </View>
 */}
        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <FontAwesome name="sign-out" size={16} color="#FF3B30" style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bookings Floating Button */}
      <TouchableOpacity
        style={styles.bookingsButton}
        onPress={() => setShowBookingsModal(true)}
      >
        <MaterialCommunityIcons name="calendar-check" size={24} color="white" />
        {bookedSessions.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{bookedSessions.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Bookings Modal */}
      <Modal
        visible={showBookingsModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowBookingsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>My Booked Sessions</Text>
            <TouchableOpacity onPress={() => setShowBookingsModal(false)}>
              <MaterialIcons name="close" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          {loadingBookings ? (
            <ActivityIndicator size="large" color="#FF3B30" style={styles.loadingIndicator} />
          ) : bookedSessions.length > 0 ? (
            <FlatList
              data={bookedSessions}
              renderItem={renderBookingItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.bookingsList}
            />
          ) : (
            <View style={styles.noBookings}>
              <MaterialCommunityIcons name="calendar-remove" size={50} color="#FF3B30" />
              <Text style={styles.noBookingsText}>No sessions booked yet</Text>
              <TouchableOpacity 
                style={styles.findSessionsButton}
                onPress={() => {
                  setShowBookingsModal(false);
                  navigation.navigate('BranchMap');
                }}
              >
                <Text style={styles.findSessionsText}>Find Sessions</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* Floating Action Buttons */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('UserProgress')}
        >
          <FontAwesome name="line-chart" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('WorkoutList')}
        >
          <FontAwesome name="heartbeat" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  greetingText: {
    fontSize: 16,
    color: '#777',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  viewSessionButton: {
  backgroundColor: '#FF3B30',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 20,
  alignSelf: 'flex-start',
  marginTop: 10,
},
viewSessionButtonText: {
  color: 'white',
  fontSize: 14,
  fontWeight: '600',
},
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 14,
  },
  heroBanner: {
    height: 180,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 20,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
    marginBottom: 15,
  },
  seeAllText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  categoriesContainer: {
    paddingLeft: 20,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  categoryIcon: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 50,
    marginBottom: 8,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  promotionsContainer: {
    paddingLeft: 20,
  },
  promoCard: {
    width: width * 0.8,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    marginRight: 15,
  },
  promoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 5,
  },
  promoSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 15,
  },
  promoButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
    logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontWeight: 'bold',
    fontSize: 16,
  },
  promoButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  branchCard: {
    width: CARD_WIDTH,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    marginRight: CARD_SPACING,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  branchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  branchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 5,
  },
  branchAddress: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  branchContact: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 15,
  },
  branchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  branchPrice: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  viewButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  viewButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  shopContainer: {
    paddingLeft: 20,
  },
  shopItem: {
    width: PRODUCT_WIDTH,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
  },
  shopItemImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#333',
  },
  shopItemName: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginBottom: 5,
  },
  shopItemPrice: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: '#FF3B30',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitsSection: {
    marginBottom: 30,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  benefitItem: {
    width: '48%',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  benefitText: {
    color: 'white',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noResultsText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  floatingButtons: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    flexDirection: 'column',
  },
  floatingButton: {
    backgroundColor: '#FF3B30',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 18,
    marginBottom: 12,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  // Bookings button styles
  bookingsButton: {
    position: 'absolute',
    bottom: 190,
    right: 20,
    backgroundColor: '#FF3B30',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FF3B30',
    fontWeight: 'bold',
    fontSize: 12,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  bookingsList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  bookingItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 5,
  },
  bookingDate: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  bookingLocation: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  noBookings: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noBookingsText: {
    fontSize: 18,
    color: 'white',
    marginTop: 20,
    marginBottom: 30,
  },
  findSessionsButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  findSessionsText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingIndicator: {
    marginTop: 50,
  },
});

export default HomeScreen;