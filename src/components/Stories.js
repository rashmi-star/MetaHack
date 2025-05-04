import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WINDOW_WIDTH = Dimensions.get('window').width;

// Mock data for stories
const STORIES = [
  {
    id: 'your-story',
    username: 'Your Story',
    image: null, // Placeholder for user's own story
    hasStory: false,
    viewed: false,
    avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
  },
  {
    id: '1',
    username: 'johndoe',
    hasStory: true,
    viewed: false,
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: '2',
    username: 'sarah',
    hasStory: true,
    viewed: false,
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: '3',
    username: 'michael',
    hasStory: true,
    viewed: true, // Already viewed
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    id: '4',
    username: 'jennifer',
    hasStory: true,
    viewed: false,
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
  {
    id: '5',
    username: 'chris',
    hasStory: true,
    viewed: false,
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
  },
  {
    id: '6',
    username: 'tech_enthusiast',
    hasStory: true,
    viewed: false,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '7',
    username: 'coffee_enthusiast',
    hasStory: true,
    viewed: true,
    avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
  }
];

const Stories = ({ navigation }) => {
  const openStory = (story) => {
    // Navigate to the Story screen with the story ID
    if (story.id !== 'your-story' && story.hasStory) {
      navigation.navigate('Story', { storyUserId: story.id });
    } else if (story.id === 'your-story') {
      // For "Your Story", you might want to add functionality to create a story
      alert('Add to your story');
    } else {
      // For users without stories
      alert(`${story.username} has no stories to view`);
    }
  };

  const renderStoryItem = ({ item }) => {
    const isYourStory = item.id === 'your-story';
    
    return (
      <TouchableOpacity 
        style={styles.storyContainer}
        onPress={() => openStory(item)}
      >
        <View 
          style={[
            styles.storyRing,
            item.viewed && styles.viewedStoryRing,
            isYourStory && styles.yourStoryRing
          ]}
        >
          <Image 
            source={{ uri: item.avatar }}
            style={styles.storyAvatar}
          />
          
          {isYourStory && (
            <View style={styles.addButton}>
              <Ionicons name="add-circle" size={20} color="#405DE6" />
            </View>
          )}
        </View>
        
        <Text 
          style={[
            styles.storyUsername,
            isYourStory && styles.yourStoryUsername
          ]}
          numberOfLines={1}
        >
          {item.username.length > 9 
            ? item.username.substring(0, 8) + '...' 
            : item.username}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={STORIES}
        renderItem={renderStoryItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#DADADA',
    paddingVertical: 10,
  },
  storiesContent: {
    paddingHorizontal: 10,
  },
  storyContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 70,
  },
  storyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#E1306C', // Instagram's gradient color (simplified)
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  viewedStoryRing: {
    borderColor: '#DBDBDB', // Grey color for viewed stories
  },
  yourStoryRing: {
    borderWidth: 0,
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  storyUsername: {
    fontSize: 12,
    textAlign: 'center',
  },
  yourStoryUsername: {
    fontSize: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'white',
  },
});

export default Stories; 