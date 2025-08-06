import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { Video } from 'expo-av';
import { Entypo, Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const { width } = Dimensions.get('window');

const CoachDetailScreen = ({ route }) => {
  const { coach } = route.params;
  const [localVideos, setLocalVideos] = useState([]);

  // Function to detect video source type
  const getVideoSourceType = (url) => {
    if (!url) return 'unknown';
    
    // Local file (starts with file:// or no protocol)
    if (url.startsWith('file://') || (!url.includes('http') && !url.includes('www'))) {
      return 'local';
    }
    
    // Google Drive
    if (url.includes('drive.google.com')) {
      return 'googledrive';
    }
    
    // Dropbox
    if (url.includes('dropbox.com')) {
      return 'dropbox';
    }
    
    // OneDrive
    if (url.includes('onedrive.live.com') || url.includes('sharepoint.com')) {
      return 'onedrive';
    }
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    
    // Instagram
    if (url.includes('instagram.com') || url.includes('instagr.am')) {
      return 'instagram';
    }
    
    // TikTok
    if (url.includes('tiktok.com')) {
      return 'tiktok';
    }
    
    // Facebook
    if (url.includes('facebook.com') || url.includes('fb.com')) {
      return 'facebook';
    }
    
    // Direct video file URLs (.mp4, .mov, .avi, etc.)
    if (url.match(/\.(mp4|mov|avi|mkv|webm|m4v)(\?.*)?$/i)) {
      return 'direct';
    }
    
    // Default to web link
    return 'web';
  };

  // Function to get video thumbnail based on source
  const getVideoThumbnail = (url, sourceType) => {
    switch (sourceType) {
      case 'youtube':
        const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        const videoId = youtubeMatch ? youtubeMatch[1] : null;
        return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
      
      case 'instagram':
        // Try to extract thumbnail from Instagram URL
        return url.replace('/p/', '/p/').replace('/?', '/media/?size=l') || 'https://via.placeholder.com/400x400/E4405F/white?text=Instagram';
      
      case 'tiktok':
        // For TikTok, we'll use the video URL itself as thumbnail (it will show first frame)
        return url.includes('.mp4') ? url : 'https://via.placeholder.com/400x400/000000/white?text=TikTok';
      
      case 'facebook':
        // Facebook videos - try to use video URL
        return url.includes('.mp4') ? url : 'https://via.placeholder.com/400x400/1877F2/white?text=Facebook';
      
      case 'direct':
        // For direct video URLs, use the video itself as thumbnail (shows first frame)
        return url;
      
      case 'googledrive':
        // For Google Drive, try to get thumbnail
        const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
        if (driveMatch) {
          return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w400-h400`;
        }
        return 'https://via.placeholder.com/400x400/4285F4/white?text=Google+Drive';
      
      case 'dropbox':
        // For Dropbox, use the video URL but replace dl=1 with raw=1 for thumbnail
        return url.replace('dl=1', 'raw=1').replace('dl=0', 'raw=1');
      
      case 'onedrive':
        // OneDrive thumbnail
        return url.replace('/download', '/thumbnail').replace('/view', '/thumbnail');
      
      default:
        // If it's a video URL, use it as thumbnail (will show first frame)
        if (url.match(/\.(mp4|mov|avi|mkv|webm|m4v)(\?.*)?$/i)) {
          return url;
        }
        return 'https://via.placeholder.com/400x400/333333/white?text=Video';
    }
  };

  // Function to get platform icon
  const getPlatformIcon = (sourceType) => {
    switch (sourceType) {
      case 'youtube':
        return { name: 'logo-youtube', color: '#FF0000' };
      case 'googledrive':
        return { name: 'logo-google', color: '#4285F4' };
      case 'dropbox':
        return { name: 'cloud', color: '#0061FF' };
      case 'onedrive':
        return { name: 'cloud', color: '#0078D4' };
      case 'instagram':
        return { name: 'logo-instagram', color: '#E4405F' };
      case 'tiktok':
        return { name: 'musical-notes', color: '#000000' };
      case 'facebook':
        return { name: 'logo-facebook', color: '#1877F2' };
      case 'local':
        return { name: 'folder', color: '#4CAF50' };
      case 'direct':
        return { name: 'videocam', color: '#2196F3' };
      default:
        return { name: 'link', color: '#9E9E9E' };
    }
  };

  // Function to handle video press
  const handleVideoPress = (videoUrl, sourceType) => {
    if (sourceType === 'local' || sourceType === 'direct' || 
        sourceType === 'googledrive' || sourceType === 'dropbox' || sourceType === 'onedrive') {
      // These should play directly in the Video component or are direct files
      return;
    } else {
      // Open external URLs in browser/app
      Linking.openURL(videoUrl).catch(() => {
        Alert.alert('Erreur', 'Impossible d\'ouvrir la vidéo');
      });
    }
  };

  // Function to pick local video
  const pickLocalVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const video = result.assets[0];
        const newVideo = {
          id: Date.now(),
          title: video.name || 'Video Local',
          description: 'Vidéo ajoutée depuis l\'appareil',
          video_url: video.uri,
        };
        
        setLocalVideos(prev => [...prev, newVideo]);
        Alert.alert('Succès', 'Vidéo ajoutée avec succès!');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner la vidéo');
    }
  };

  const renderVideoItem = ({ item }) => {
    const sourceType = getVideoSourceType(item.video_url);
    const platformIcon = getPlatformIcon(sourceType);
    
    // For local files, direct video URLs, and cloud storage, use Video component
    if (sourceType === 'local' || sourceType === 'direct' || 
        sourceType === 'googledrive' || sourceType === 'dropbox' || sourceType === 'onedrive') {
      return (
        <View style={styles.reelCard}>
          <Video
            source={{ uri: item.video_url }}
            style={styles.reelVideo}
            useNativeControls
            resizeMode="cover"
            isLooping={false}
            shouldPlay={false}
          />
          <View style={styles.platformBadge}>
            <Ionicons name={platformIcon.name} size={16} color={platformIcon.color} />
            <Text style={styles.platformText}>
              {sourceType === 'local' ? 'Local' : 
               sourceType === 'googledrive' ? 'Google Drive' :
               sourceType === 'dropbox' ? 'Dropbox' :
               sourceType === 'onedrive' ? 'OneDrive' : 'Vidéo'}
            </Text>
          </View>
          <Text style={styles.reelTitle}>{item.title}</Text>
          <Text style={styles.reelDesc}>{item.description}</Text>
        </View>
      );
    }
    
    // For external platforms, show thumbnail with play button
    const thumbnailUrl = getVideoThumbnail(item.video_url, sourceType);
    
    return (
      <View style={styles.reelCard}>
        <TouchableOpacity 
          style={styles.thumbnailContainer}
          onPress={() => handleVideoPress(item.video_url, sourceType)}
        >
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.playButtonContainer}>
            <View style={[styles.playButton, { backgroundColor: platformIcon.color }]}>
              <Ionicons name="play" size={24} color="#fff" />
            </View>
          </View>
          <View style={styles.platformLabel}>
            <Ionicons name={platformIcon.name} size={18} color={platformIcon.color} />
            <Text style={styles.platformLabelText}>
              {sourceType.charAt(0).toUpperCase() + sourceType.slice(1)}
            </Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.reelTitle}>{item.title}</Text>
        <Text style={styles.reelDesc}>{item.description}</Text>
      </View>
    );
  };

  // Combine coach videos with local videos
  const allVideos = [...(coach.videos || []), ...localVideos];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image
          source={{ uri: coach.photo_url ? coach.photo_url : 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{coach.name}</Text>
        <Text style={styles.speciality}>
          {coach.specialities?.map((s) => s.name).join(', ') || 'No speciality'}
        </Text>
      </View>

      {/* Contact */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="call" size={20} color="#FF3B30" />
          <Text style={styles.sectionTitle}> Contact</Text>
        </View>
        <View style={styles.contactGrid}>
          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => Linking.openURL(`mailto:${coach.email}`)}
          >
            <Ionicons name="mail" size={24} color="#FFD700" />
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>{coach.email}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => Linking.openURL(`tel:${coach.phone}`)}
          >
            <Ionicons name="call" size={24} color="#00FF88" />
            <Text style={styles.contactLabel}>Téléphone</Text>
            <Text style={styles.contactValue}>{coach.phone}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bio */}
      {coach.bio && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color="#FF3B30" />
            <Text style={styles.sectionTitle}> Bio</Text>
          </View>
          <View style={styles.bioCard}>
            <Text style={styles.infoText}>{coach.bio}</Text>
          </View>
        </View>
      )}

      {/* Certifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="school" size={20} color="#FF3B30" />
          <Text style={styles.sectionTitle}> Certifications</Text>
        </View>
        <View style={styles.bioCard}>
          <Text style={styles.infoText}>{coach.certifications || 'No certifications listed.'}</Text>
        </View>
      </View>

      {/* Availability */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={20} color="#FF3B30" />
          <Text style={styles.sectionTitle}> Disponibilités</Text>
        </View>
        <View style={styles.availContainer}>
          {coach.availabilities?.length > 0 ? (
            coach.availabilities.map((a, i) => (
              <View key={i} style={styles.availBadge}>
                <Entypo name="calendar" size={14} color="#fff" />
                <Text style={styles.availText}>
                  {' '}
                  {a.day_of_week.charAt(0).toUpperCase() + a.day_of_week.slice(1)}: {a.start_time} - {a.end_time}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.infoText}>No availability listed.</Text>
          )}
        </View>
      </View>

      {/* Video Gallery */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="videocam" size={20} color="#FF3B30" />
          <Text style={styles.sectionTitle}> Vidéos du coach</Text>
          <TouchableOpacity 
            style={styles.addVideoButton}
            onPress={pickLocalVideo}
          >
            <Ionicons name="add-circle" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
        
        {allVideos.length > 0 ? (
          <FlatList
            data={allVideos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderVideoItem}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.noVideosContainer}>
            <Ionicons name="videocam-off" size={48} color="#666" />
            <Text style={styles.noVideosText}>Aucune vidéo disponible</Text>
            <TouchableOpacity style={styles.addFirstVideoButton} onPress={pickLocalVideo}>
              <Text style={styles.addFirstVideoText}>Ajouter une vidéo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  heroSection: { alignItems: 'center', marginBottom: 25 },
  profileImage: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#333' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#FF3B30', marginTop: 10 },
  speciality: { fontSize: 14, color: '#CCCCCC', marginTop: 4 },
  section: { marginBottom: 20 },
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10,
    justifyContent: 'space-between'
  },
  sectionTitle: { marginLeft: 8, color: '#FF3B30', fontSize: 18, fontWeight: 'bold', flex: 1 },
  addVideoButton: {
    padding: 5,
  },
  contactGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  contactCard: { 
    width: '48%', 
    backgroundColor: '#1E1E1E', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  contactLabel: { color: '#CCCCCC', fontSize: 14, marginTop: 5 },
  contactValue: { color: '#FFFFFF', fontSize: 12, marginTop: 2 },
  bioCard: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 10 },
  infoText: { color: '#CCCCCC', lineHeight: 20 },
  availContainer: { marginTop: 10 },
  availBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#333', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 8 
  },
  availText: { color: '#fff', marginLeft: 8, fontSize: 14 },
  reelCard: { 
    backgroundColor: '#1A1A1A', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  reelVideo: { 
    width: '100%', 
    height: 250, 
    borderRadius: 10, 
    backgroundColor: '#000' 
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
  },
  playButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  platformLabel: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  platformLabelText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: 'bold',
  },
  platformBadge: {
    position: 'absolute',
    top: 25,
    right: 25,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
  },
  platformText: {
    color: '#fff',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  reelTitle: { 
    color: '#FF3B30', 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginTop: 12 
  },
  reelDesc: { 
    color: '#CCCCCC', 
    fontSize: 14, 
    marginTop: 6,
    lineHeight: 18 
  },
  noVideosContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
  },
  noVideosText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  addFirstVideoButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addFirstVideoText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
export default CoachDetailScreen;
