import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  SafeAreaView,
  Button,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Post from '../components/Post';
import Stories from '../components/Stories';
import { MOCK_POSTS } from '../data/mockData';

const HomeScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [hasNotifications, setHasNotifications] = useState(true); // Mock notification state

  useEffect(() => {
    // In a real app, you would fetch posts from an API
    setPosts(MOCK_POSTS);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Instagram</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => Alert.alert('Notifications', 'You have new likes and comments!')}
          >
            <Ionicons name={hasNotifications ? "heart" : "heart-outline"} size={24} color={hasNotifications ? "#E1306C" : "black"} />
            {hasNotifications && <View style={styles.notificationDot} />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => Alert.alert('Messages', 'No new messages')}
          >
            <Ionicons name="paper-plane-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* AI Feature Instruction Banner */}
      <View style={styles.featureInstructionBanner}>
        <Ionicons name="information-circle-outline" size={18} color="#405DE6" />
        <Text style={styles.featureInstructionText}>
          Triple-tap on any image to analyze it with Llama AI
        </Text>
      </View>
      
      {/* Stories Component */}
      <Stories navigation={navigation} />
      
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Post 
            post={item} 
            navigation={navigation}
          />
        )}
      />
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
    height: 50,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DADADA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 15,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E1306C',
  },
  featureInstructionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 10,
    marginVertical: 5,
    justifyContent: 'center',
  },
  featureInstructionText: {
    color: '#405DE6',
    marginLeft: 8,
    fontSize: 14,
    fontStyle: 'italic',
  }
});

export default HomeScreen; 