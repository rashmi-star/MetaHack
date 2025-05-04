import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Post = ({ post, navigation }) => {
  const [liked, setLiked] = useState(false);
  const [showAllCaption, setShowAllCaption] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [imageError, setImageError] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
  };

  const handlePostPress = () => {
    navigation.navigate('PostDetail', { post });
  };

  const handleImagePress = () => {
    const now = Date.now();
    
    // Reset tap count if more than 300ms has passed
    if (now - lastTapTime > 300) {
      setTapCount(1);
    } else {
      setTapCount(tapCount + 1);
    }
    
    setLastTapTime(now);
    
    // Open chatbot on triple tap - Navigate directly to Post Detail for analysis
    if (tapCount === 2) {
      navigation.navigate('PostDetail', { post });
      setTapCount(0);
    }
  };

  const handleImageError = () => {
    setImageError(true);
    console.log('Error loading post image:', post.imageUrl);
  };

  // Extract hashtags from caption
  const renderCaption = () => {
    if (!post.caption) return null;
    
    const MAX_LENGTH = 100;
    let displayCaption = post.caption;
    
    if (post.caption.length > MAX_LENGTH && !showAllCaption) {
      displayCaption = post.caption.substring(0, MAX_LENGTH) + '...';
    }
    
    // Process hashtags
    const words = displayCaption.split(' ');
    return words.map((word, index) => {
      if (word.startsWith('#')) {
        return <Text key={index} style={styles.hashtag}>{word} </Text>;
      }
      return <Text key={index}>{word} </Text>;
    });
  };

  return (
    <View style={styles.container}>
      {/* Post Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
          <Text style={styles.username}>{post.username}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Post Image */}
      <TouchableWithoutFeedback onPress={handleImagePress}>
        {imageError ? (
          <View style={[styles.postImage, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={50} color="#cccccc" />
            <Text style={styles.imagePlaceholderText}>Image could not be loaded</Text>
          </View>
        ) : (
          <Image 
            source={{ uri: post.imageUrl }} 
            style={styles.postImage} 
            resizeMode="cover"
            onError={handleImageError}
          />
        )}
      </TouchableWithoutFeedback>

      {/* Post Actions */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={24} 
              color={liked ? "red" : "black"} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Ionicons name="bookmark-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Likes */}
      <Text style={styles.likes}>{post.likes} likes</Text>

      {/* Caption */}
      <View style={styles.captionContainer}>
        <Text style={styles.captionUsername}>{post.username}</Text>
        <Text style={styles.caption}>
          {renderCaption()}
        </Text>
        {post.caption.length > 100 && (
          <TouchableOpacity onPress={() => setShowAllCaption(!showAllCaption)}>
            <Text style={styles.showMoreLess}>
              {showAllCaption ? 'Show less' : 'Show more'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Comments */}
      <TouchableOpacity 
        style={styles.commentsButton}
        onPress={handlePostPress}
      >
        <Text style={styles.viewComments}>
          View all {post.comments.length} comments
        </Text>
      </TouchableOpacity>
      
      {post.comments.length > 0 && (
        <View style={styles.comment}>
          <Text style={styles.commentUsername}>{post.comments[0].username}</Text>
          <Text>{post.comments[0].text}</Text>
        </View>
      )}

      {/* Timestamp */}
      <Text style={styles.timestamp}>{post.timestamp}</Text>
      
      {/* Triple tap hint */}
      <Text style={styles.tripleTapHint}>Triple-tap image for AI analysis</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    borderBottomWidth: 0.3,
    borderBottomColor: '#ccc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  },
  username: {
    fontWeight: 'bold',
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
  },
  imagePlaceholder: {
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#888888',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leftActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: 15,
  },
  likes: {
    fontWeight: 'bold',
    paddingHorizontal: 12,
    marginBottom: 5,
  },
  captionContainer: {
    paddingHorizontal: 12,
    marginBottom: 5,
  },
  captionUsername: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  caption: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hashtag: {
    color: '#3897f0',
  },
  showMoreLess: {
    color: '#8e8e8e',
    marginTop: 2,
  },
  commentsButton: {
    paddingHorizontal: 12,
  },
  viewComments: {
    color: '#8e8e8e',
    marginVertical: 3,
  },
  comment: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 3,
  },
  commentUsername: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  timestamp: {
    color: '#8e8e8e',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingBottom: 10,
    marginTop: 5,
  },
  tripleTapHint: {
    color: '#8e8e8e',
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingBottom: 8,
  },
});

export default Post; 