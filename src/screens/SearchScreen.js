import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  Image, 
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_POSTS, SEARCH_SUGGESTIONS } from '../data/mockData';
import SearchService from '../services/SearchService';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [suggestions, setSuggestions] = useState(SEARCH_SUGGESTIONS);
  const [loading, setLoading] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  
  const numColumns = 3;
  const screenWidth = Dimensions.get('window').width;
  const tileSize = screenWidth / numColumns;

  useEffect(() => {
    // Load recently viewed posts
    setRecentlyViewed(SearchService.getRecentlyViewed());
    
    // Set initial results to all posts
    setSearchResults(MOCK_POSTS);
  }, []);
  
  // Debounce search to avoid too many API calls
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      }
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [searchQuery]);
  
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(MOCK_POSTS);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Use Llama for semantic search
      const results = await SearchService.semanticSearch(query, MOCK_POSTS);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      // Fall back to all posts if search fails
      setSearchResults(MOCK_POSTS);
    } finally {
      setLoading(false);
    }
  };

  const renderGridItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.imageContainer, { width: tileSize, height: tileSize }]}
      onPress={() => {
        navigation.navigate('PostDetail', { post: item });
        // In a real app, we'd add this to recently viewed here
      }}
    >
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.image} 
      />
    </TouchableOpacity>
  );
  
  const renderRecentItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.recentItem}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
    >
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.recentImage} 
      />
      <View style={styles.recentInfo}>
        <Text style={styles.recentUsername}>{item.username}</Text>
        <Text style={styles.recentCaption} numberOfLines={1}>
          {item.caption}
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.suggestionItem}
      onPress={() => {
        setSearchQuery(item);
        setSearchActive(true);
      }}
    >
      <Ionicons name="search-outline" size={16} color="#8e8e8e" style={styles.suggestionIcon} />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={20} color="#8e8e8e" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts (try 'blue t-shirt and sunglasses')"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setSearchActive(true)}
          returnKeyType="search"
          onSubmitEditing={() => performSearch(searchQuery)}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery('');
              setSearchResults(MOCK_POSTS);
            }}
          >
            <Ionicons name="close-circle" size={18} color="#8e8e8e" />
          </TouchableOpacity>
        )}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#405DE6" />
          <Text style={styles.loadingText}>Searching with AI...</Text>
        </View>
      ) : (
        <>
          {searchActive && searchQuery === '' ? (
            // Show suggestions and recent posts when search is active but empty
            <View style={styles.suggestionsContainer}>
              <Text style={styles.sectionTitle}>Suggestions</Text>
              <FlatList
                data={suggestions}
                renderItem={renderSuggestionItem}
                keyExtractor={(item) => item}
              />
              
              {recentlyViewed.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Recently Viewed</Text>
                  <FlatList
                    data={recentlyViewed}
                    renderItem={renderRecentItem}
                    keyExtractor={(item) => item.id}
                  />
                </>
              )}
            </View>
          ) : (
            // Show grid or search results
            <>
              {searchQuery.length > 0 && (
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsText}>
                    {searchResults.length === 0 
                      ? 'No posts match your search' 
                      : `Found ${searchResults.length} ${searchResults.length === 1 ? 'post' : 'posts'}`}
                  </Text>
                </View>
              )}
              
              <FlatList
                data={searchResults}
                renderItem={renderGridItem}
                keyExtractor={(item) => item.id}
                numColumns={numColumns}
                onScrollBeginDrag={() => setSearchActive(false)}
              />
            </>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    height: 40,
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  clearButton: {
    padding: 5,
  },
  imageContainer: {
    padding: 1,
  },
  image: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#8e8e8e',
    fontSize: 16,
  },
  suggestionsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EFEFEF',
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 15,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EFEFEF',
  },
  recentImage: {
    width: 45,
    height: 45,
    borderRadius: 5,
    marginRight: 10,
  },
  recentInfo: {
    flex: 1,
  },
  recentUsername: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  recentCaption: {
    fontSize: 13,
    color: '#8e8e8e',
  },
  resultsHeader: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EFEFEF',
  },
  resultsText: {
    fontSize: 14,
    color: '#8e8e8e',
  }
});

export default SearchScreen; 