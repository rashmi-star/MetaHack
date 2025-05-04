import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LlamaService from '../services/LlamaService';

const ChatbotScreen = ({ route, navigation }) => {
  const { post } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('ready'); // 'ready', 'error', or 'connected'
  const scrollViewRef = useRef();

  // Initialize chat with a system message
  useEffect(() => {
    // Add initial messages
    const initialMessages = [
      {
        role: 'system',
        content: 'You are a helpful Instagram assistant. You can analyze posts, captions, and comments. You can provide insights about tone, sentiment, and content of posts.'
      },
      {
        role: 'assistant',
        content: 'I can help analyze this post! You can ask me about the tone of the comments, hashtags, sentiment, or any other questions about the post content.'
      }
    ];
    
    setMessages(initialMessages);
  }, []);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;
    
    const userMessage = {
      role: 'user',
      content: newMessage
    };
    
    // Add the user message to the chat
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    
    try {
      console.log('Preparing request for Llama API...');
      
      // Create API-friendly message format - we only send system and user messages
      // First, get all existing messages excluding assistant messages
      const apiMessages = [
        // Include the system prompt
        {
          role: 'system',
          content: 'You are a helpful Instagram assistant. You can analyze posts, captions, and comments. You can provide insights about tone, sentiment, and content of posts.'
        },
        // Include post context
        {
          role: 'user',
          content: `I'm looking at this Instagram post:
            Caption: ${post.caption}
            Username: ${post.username}
            Hashtags: ${post.caption.split(' ').filter(word => word.startsWith('#')).join(' ')}
            Comments: ${post.comments.map(comment => `${comment.username}: ${comment.text}`).join(' | ')}
            Likes: ${post.likes}
          `
        }
      ];
      
      // Add all previous user messages and the new one
      const userMessages = messages
        .filter(msg => msg.role === 'user')
        .concat(userMessage);
      
      // Combine all messages for the API request
      const requestMessages = [...apiMessages, ...userMessages];
      
      // Make API request to Llama using our service
      console.log('Sending request to Llama API...', requestMessages);
      const response = await LlamaService.sendMessage(requestMessages);
      console.log('Received response from Llama API:', response);
      
      // Update API status
      setApiStatus('connected');
      
      // Add the assistant's response
      const assistantMessage = {
        role: 'assistant',
        content: response
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error calling Llama API:', error);
      setApiStatus('error');
      
      // Using a more specific error message based on the error type
      let errorMessage = 'I apologize, but I encountered an error while processing your request.';
      
      if (error.response) {
        // Server responded with an error status code
        if (error.response.status === 401) {
          errorMessage += ' There seems to be an authentication issue with the AI service. Please check your API key.';
          console.log('Authentication error - check API key validity');
        } else if (error.response.status === 429) {
          errorMessage += ' The AI service is currently receiving too many requests. Please try again later.';
        } else if (error.response.status === 502) {
          errorMessage += ' Could not connect to the Llama API server. The service might be down or the endpoint URL may be incorrect.';
          console.log('Bad gateway error - check API endpoint URL');
        } else {
          errorMessage += ` There was an issue with the AI service (Error ${error.response.status}). Please try again later.`;
        }
        
        // Log response data for debugging
        if (error.response.data) {
          console.log('Error response data:', JSON.stringify(error.response.data));
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage += ' Could not reach the AI service. Please check your internet connection.';
        console.log('Network error - no response received');
      } else {
        // Something else went wrong
        errorMessage += ' Something unexpected happened. Please try again.';
        console.log('Unexpected error:', error.message);
      }
      
      // Add a fallback response in case of API error
      const errorResponseMessage = {
        role: 'assistant',
        content: errorMessage
      };
      
      setMessages(prevMessages => [...prevMessages, errorResponseMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageItem = ({ item }) => {
    const isUser = item.role === 'user';
    
    return (
      <View style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.assistantBubble
      ]}>
        <Text style={styles.messageText}>{item.content}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {apiStatus === 'error' && (
        <View style={styles.apiErrorBanner}>
          <Text style={styles.apiErrorText}>
            ⚠️ API Connection Issue - Using Fallback Mode
          </Text>
        </View>
      )}
      
      <View style={styles.chatContainer}>
        <FlatList
          data={messages.filter(msg => msg.role !== 'system')}
          renderItem={renderMessageItem}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.messageList}
          ref={scrollViewRef}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Ask about this post..."
          multiline
        />
        {isLoading ? (
          <ActivityIndicator size="small" color="#405DE6" style={styles.sendButton} />
        ) : (
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={24} color="#405DE6" />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  apiErrorBanner: {
    backgroundColor: '#FFE4E1',
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FFB6C1',
  },
  apiErrorText: {
    color: '#D8000C',
    fontSize: 14,
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageList: {
    paddingVertical: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  userBubble: {
    backgroundColor: '#E1F5FE',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  assistantBubble: {
    backgroundColor: '#F0F0F0',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatbotScreen; 