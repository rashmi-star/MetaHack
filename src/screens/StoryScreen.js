import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  SafeAreaView,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Get window dimensions
const { width, height } = Dimensions.get('window');

// Mock data for a single user's stories (multiple story items)
const MOCK_STORY = {
  userId: '1',
  username: 'johndoe',
  userAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  stories: [
    {
      id: '1',
      imageUrl: 'https://picsum.photos/id/1015/800/1400',
      timestamp: '2 hours ago',
      seenBy: 342
    },
    {
      id: '2',
      imageUrl: 'https://picsum.photos/id/1029/800/1400',
      timestamp: '1 hour ago',
      seenBy: 189
    },
    {
      id: '3',
      imageUrl: 'https://picsum.photos/id/1035/800/1400',
      timestamp: '30 minutes ago',
      seenBy: 87
    }
  ]
};

const StoryScreen = ({ route, navigation }) => {
  // In a real app, we would get the story from the route params
  // const { userId } = route.params;
  const storyData = MOCK_STORY;
  
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(null);
  
  // Start progress animation
  useEffect(() => {
    startProgressAnimation();
    
    return () => {
      if (progressAnimation.current) {
        progressAnimation.current.stop();
      }
    };
  }, [currentStoryIndex]);
  
  const startProgressAnimation = () => {
    // Reset progress
    progressAnim.setValue(0);
    
    // Start animation
    progressAnimation.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000, // 5 seconds per story
      useNativeDriver: false
    });
    
    progressAnimation.current.start(({ finished }) => {
      if (finished) {
        goToNextStory();
      }
    });
  };
  
  const pauseProgressAnimation = () => {
    if (progressAnimation.current) {
      progressAnimation.current.stop();
    }
  };
  
  const goToPreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else {
      // Go to previous user's story (would go back in a real app)
      navigation.goBack();
    }
  };
  
  const goToNextStory = () => {
    if (currentStoryIndex < storyData.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      // Go to next user's story (would go to next user in a real app)
      navigation.goBack();
    }
  };
  
  const handleLongPress = () => {
    setIsPaused(true);
    pauseProgressAnimation();
  };
  
  const handlePressOut = () => {
    setIsPaused(false);
    startProgressAnimation();
  };
  
  const handleTouchStart = (event) => {
    const touchX = event.nativeEvent.locationX;
    if (touchX < width / 3) {
      goToPreviousStory();
    } else if (touchX > (width * 2) / 3) {
      goToNextStory();
    }
  };
  
  const renderProgressBars = () => {
    return storyData.stories.map((story, index) => {
      const isActive = index === currentStoryIndex;
      const isComplete = index < currentStoryIndex;
      
      return (
        <View key={index} style={styles.progressBarContainer}>
          {isActive ? (
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]}
            />
          ) : (
            <View
              style={[
                styles.progressBar,
                {
                  width: isComplete ? '100%' : '0%'
                }
              ]}
            />
          )}
        </View>
      );
    });
  };
  
  const currentStory = storyData.stories[currentStoryIndex];
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Story Image */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.storyContainer}
        onLongPress={handleLongPress}
        onPressOut={handlePressOut}
        onPress={handleTouchStart}
      >
        <Image
          source={{ uri: currentStory.imageUrl }}
          style={styles.storyImage}
          resizeMode="cover"
        />
        
        {/* Header */}
        <View style={styles.storyHeader}>
          <View style={styles.progressContainer}>
            {renderProgressBars()}
          </View>
          
          <View style={styles.userInfo}>
            <Image
              source={{ uri: storyData.userAvatar }}
              style={styles.avatar}
            />
            <Text style={styles.username}>{storyData.username}</Text>
            <Text style={styles.timestamp}>{currentStory.timestamp}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Footer */}
        <View style={styles.storyFooter}>
          <View style={styles.replyContainer}>
            <TextInput
              style={styles.replyInput}
              placeholder="Send message"
              placeholderTextColor="#ccc"
            />
            <TouchableOpacity style={styles.sendButton}>
              <Ionicons name="paper-plane-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.storyInfo}>
            <Ionicons name="eye-outline" size={16} color="#fff" />
            <Text style={styles.seenCount}>{currentStory.seenBy}</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      {/* Paused Indicator */}
      {isPaused && (
        <View style={styles.pausedOverlay}>
          <Text style={styles.pausedText}>Paused</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  storyContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  storyImage: {
    ...StyleSheet.absoluteFillObject,
  },
  storyHeader: {
    padding: 15,
    flexDirection: 'column',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressBarContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    height: 2,
    borderRadius: 1,
    marginHorizontal: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  username: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  timestamp: {
    color: '#eee',
    fontSize: 12,
    marginLeft: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  storyFooter: {
    padding: 15,
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  replyInput: {
    flex: 1,
    color: '#fff',
    height: 50,
  },
  sendButton: {
    padding: 5,
  },
  storyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seenCount: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  pausedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pausedText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default StoryScreen; 