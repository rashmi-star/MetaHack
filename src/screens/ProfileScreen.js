import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  ScrollView,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Mock profile data
const PROFILE_DATA = {
  username: 'instagram_user',
  fullName: 'Instagram User',
  avatar: 'https://randomuser.me/api/portraits/men/35.jpg',
  bio: 'Digital creator | Photography enthusiast\nExploring the world one photo at a time ✨',
  website: 'instagram.com',
  postsCount: 213,
  followers: 863,
  following: 408,
};

// Mock posts data for the profile grid
const PROFILE_POSTS = Array(15).fill(0).map((_, index) => ({
  id: index.toString(),
  imageUrl: `https://picsum.photos/id/${300 + index}/300/300`
}));

const ProfileScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('grid');
  
  const numColumns = 3;
  const screenWidth = Dimensions.get('window').width;
  const tileSize = screenWidth / numColumns;

  const renderPostItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.postItem, { width: tileSize, height: tileSize }]}
      onPress={() => navigation.navigate('PostDetail', {
        post: {
          id: item.id,
          username: PROFILE_DATA.username,
          userAvatar: PROFILE_DATA.avatar,
          imageUrl: item.imageUrl,
          caption: `Profile post #${item.id}`,
          likes: Math.floor(Math.random() * 500),
          timestamp: Math.floor(Math.random() * 30) + 'd ago',
          comments: []
        }
      })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.username}>{PROFILE_DATA.username}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="add-circle-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="menu-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView>
        <View style={styles.profileInfo}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: PROFILE_DATA.avatar }} style={styles.profileImage} />
            
            <View style={styles.profileStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{PROFILE_DATA.postsCount}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{PROFILE_DATA.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{PROFILE_DATA.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.fullName}>{PROFILE_DATA.fullName}</Text>
          <Text style={styles.bio}>{PROFILE_DATA.bio}</Text>
          <Text style={styles.website}>{PROFILE_DATA.website}</Text>
          
          <View style={styles.profileActions}>
            <TouchableOpacity style={styles.editProfileButton}>
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareProfileButton}>
              <Ionicons name="person-add-outline" size={16} color="black" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'grid' && styles.activeTab]}
            onPress={() => setActiveTab('grid')}
          >
            <Ionicons 
              name="grid-outline" 
              size={24} 
              color={activeTab === 'grid' ? 'black' : '#8e8e8e'} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'tagged' && styles.activeTab]}
            onPress={() => setActiveTab('tagged')}
          >
            <Ionicons 
              name="pricetag-outline" 
              size={24} 
              color={activeTab === 'tagged' ? 'black' : '#8e8e8e'} 
            />
          </TouchableOpacity>
        </View>
        
        {activeTab === 'grid' ? (
          <FlatList
            data={PROFILE_POSTS}
            renderItem={renderPostItem}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyTaggedContainer}>
            <Ionicons name="image-outline" size={60} color="#8e8e8e" />
            <Text style={styles.emptyTaggedText}>No Photos</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 44,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DADADA',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 20,
  },
  profileInfo: {
    padding: 15,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#8e8e8e',
  },
  fullName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  bio: {
    marginBottom: 2,
  },
  website: {
    color: '#3897f0',
    marginBottom: 15,
  },
  profileActions: {
    flexDirection: 'row',
  },
  editProfileButton: {
    flex: 1,
    backgroundColor: '#EFEFEF',
    borderRadius: 4,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  editProfileText: {
    fontWeight: '600',
  },
  shareProfileButton: {
    backgroundColor: '#EFEFEF',
    borderRadius: 4,
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: '#DADADA',
  },
  tab: {
    flex: 1,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  postItem: {
    padding: 1,
  },
  postImage: {
    flex: 1,
  },
  emptyTaggedContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTaggedText: {
    fontSize: 16,
    color: '#8e8e8e',
    marginTop: 10,
  },
});

export default ProfileScreen; 