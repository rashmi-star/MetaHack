import LlamaService from './LlamaService';

// Mock data for posts - this would normally come from an API or database
import { MOCK_POSTS } from '../data/mockData';

/**
 * Service to handle post search using natural language processing via Llama
 */
class SearchService {
  /**
   * Search posts based on natural language query with image analysis
   * @param {string} query - Natural language search query
   * @param {Array} posts - Posts to search through (defaults to mock posts)
   * @returns {Promise<Array>} - Promise with search results
   */
  static async semanticSearch(query, posts = MOCK_POSTS) {
    if (!query || query.trim() === '') {
      return posts;
    }

    try {
      // First, generate image descriptions for our posts
      const postsWithImageDescriptions = await this.processImagesWithLlama(posts);
      
      // Prepare the search request for Llama with enhanced data including image descriptions
      const messages = [
        {
          role: 'system',
          content: `You are a search assistant for an Instagram-like app. 
            You'll be given a set of posts with captions, comments, and image descriptions.
            Your task is to determine which posts match the natural language query and rank them by relevance.
            Consider both the text content AND the image descriptions when matching.
            Respond with ONLY post IDs in JSON format like ["1", "3"] - no other text.
            Put the most relevant matches first.`
        },
        {
          role: 'user',
          content: `Here are the posts to search through:
            ${postsWithImageDescriptions.map(post => `
              Post ID: ${post.id}
              Username: ${post.username}
              Caption: ${post.caption}
              Hashtags: ${post.caption.split(' ').filter(word => word.startsWith('#')).join(' ')}
              Comments: ${post.comments.map(comment => `${comment.username}: ${comment.text}`).join(' | ')}
              Image Description: ${post.imageDescription || 'No description available'}
            `).join('\n')}
            
            Search query: "${query}"
            
            Return only matching post IDs in a JSON array, ranked by relevance. If no posts match, return empty array.`
        }
      ];

      console.log('Sending enhanced semantic search request to Llama...');
      const response = await LlamaService.sendMessage(messages);
      console.log('Search response:', response);

      // Extract JSON array from response
      const extractJSON = (text) => {
        try {
          // Look for something that looks like a JSON array
          const match = text.match(/\[\s*"[^"]*"(?:\s*,\s*"[^"]*")*\s*\]/);
          if (match) {
            return JSON.parse(match[0]);
          }
          
          // If we can't find a nicely formatted array, try to be more lenient
          if (text.includes('[') && text.includes(']')) {
            const jsonPart = text.substring(
              text.indexOf('['),
              text.lastIndexOf(']') + 1
            );
            return JSON.parse(jsonPart);
          }
          
          return [];
        } catch (e) {
          console.error('Error extracting JSON from Llama response:', e);
          return [];
        }
      };

      const matchingPostIds = extractJSON(response);
      
      // Sort posts based on the order returned by Llama
      const searchResults = matchingPostIds.map(id => 
        postsWithImageDescriptions.find(post => post.id === id)
      ).filter(Boolean);
      
      // If no results or error occurred, fall back to basic keyword matching
      if (searchResults.length === 0) {
        console.log('No AI results, falling back to keyword search');
        return this.keywordSearch(query, posts);
      }
      
      return searchResults;
    } catch (error) {
      console.error('Error in semantic search:', error);
      // Fall back to basic keyword search if Llama fails
      return this.keywordSearch(query, posts);
    }
  }
  
  /**
   * Process images with Llama to generate descriptions
   * @param {Array} posts - Posts with images to analyze
   * @returns {Promise<Array>} - Posts with added image descriptions
   */
  static async processImagesWithLlama(posts) {
    console.log('Generating image descriptions using Llama API...');
    
    try {
      const imageDescriptions = {};
      
      // Process in batches to avoid rate limiting
      for (const post of posts) {
        try {
          // Use the enhanced image analysis with direct vision API
          console.log(`Analyzing image for post ${post.id}:`, post.imageUrl);
          
          // We'll ask a general descriptive question to get details about the image
          const descriptiveQuestion = 'Describe this image in detail, including objects, people, colors, setting, and any notable features.';
          
          const response = await LlamaService.analyzeImage(post.imageUrl, descriptiveQuestion);
          
          // Check if the response appears to be an error message
          if (response && !response.includes('Error from Llama API:') && 
              !response.includes('having trouble') && 
              !response.includes('I don\'t have the ability')) {
            imageDescriptions[post.id] = response;
            console.log(`Generated description for post ${post.id}:`, response.substring(0, 100) + '...');
          } else {
            console.warn(`Could not get proper description for post ${post.id}, using generic description`);
            imageDescriptions[post.id] = `Image related to: ${post.caption}`;
          }
        } catch (error) {
          console.error(`Error analyzing image for post ${post.id}:`, error);
          // If there's an error for a specific post, use a generic description
          imageDescriptions[post.id] = `Image related to: ${post.caption}`;
        }
        
        // Add a small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Cache descriptions for future searches
      this.cachedImageDescriptions = imageDescriptions;
      
      return posts.map(post => ({
        ...post,
        imageDescription: imageDescriptions[post.id] || `Image related to: ${post.caption}`
      }));
      
    } catch (error) {
      console.error('Error processing images:', error);
      // Return posts with basic descriptions if there's an error
      return posts.map(post => ({
        ...post,
        imageDescription: `Image related to: ${post.caption}`
      }));
    }
  }
  
  /**
   * Basic keyword search as fallback
   * @param {string} query - Search query
   * @param {Array} posts - Posts to search through
   * @returns {Array} - Search results
   */
  static keywordSearch(query, posts) {
    const lowercaseQuery = query.toLowerCase();
    
    return posts.filter(post => {
      // Check caption
      if (post.caption.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }
      
      // Check username
      if (post.username.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }
      
      // Check comments
      if (post.comments.some(comment => 
        comment.text.toLowerCase().includes(lowercaseQuery) ||
        comment.username.toLowerCase().includes(lowercaseQuery)
      )) {
        return true;
      }
      
      return false;
    });
  }
  
  /**
   * Get recently viewed posts (mock implementation)
   * @returns {Array} - Recently viewed posts
   */
  static getRecentlyViewed() {
    // This would normally be stored in local storage or a database
    // For demo purposes, just return a subset of mock posts
    return MOCK_POSTS.slice(0, 3);
  }
}

export default SearchService; 