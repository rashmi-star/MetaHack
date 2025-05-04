import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Post from '../components/Post';
import LlamaService from '../services/LlamaService';

const PostDetailScreen = ({ route, navigation }) => {
  const { post } = route.params;
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [imageAnalysisMode, setImageAnalysisMode] = useState(false);
  const [imageQuestion, setImageQuestion] = useState('');
  const [imageAnswer, setImageAnswer] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiDiagnostics, setApiDiagnostics] = useState(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  
  // State for the analysis type (image or comments)
  const [analysisType, setAnalysisType] = useState('image');
  
  // Image tap detection for triple-tap
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [modalImageError, setModalImageError] = useState(false);

  // Add state for API status
  const [apiStatus, setApiStatus] = useState({
    checking: false,
    connected: false,
    visionCapable: false,
    message: 'API status not checked'
  });

  const handleAddComment = () => {
    if (commentText.trim() === '') return;
    
    const newComment = {
      id: (comments.length + 1).toString(),
      username: 'current_user', // In a real app, use the logged-in user
      text: commentText.trim(),
      timestamp: 'Just now'
    };
    
    setComments([...comments, newComment]);
    setCommentText('');
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
    
    // Open image analysis modal on triple tap
    if (tapCount === 2) {
      setImageAnalysisMode(true);
      setTapCount(0);
    }
  };

  // Function to check API status when modal opens
  const checkApiStatus = async () => {
    if (apiStatus.checking) return;
    
    setApiStatus({
      ...apiStatus,
      checking: true,
      message: 'Checking API status...'
    });
    
    try {
      const capabilities = await LlamaService.testApiCapabilities();
      
      setApiStatus({
        checking: false,
        connected: capabilities.chatEndpoint,
        visionCapable: capabilities.simulatedVisionCapability,
        message: capabilities.error 
          ? `Error: ${capabilities.error}` 
          : capabilities.chatEndpoint 
            ? `Connected to Llama API. Vision simulation ${capabilities.simulatedVisionCapability ? 'active' : 'inactive'}.`
            : 'Failed to connect to Llama API.'
      });
      
      console.log('API capabilities:', capabilities);
    } catch (error) {
      console.error('Error checking API status:', error);
      setApiStatus({
        checking: false,
        connected: false,
        visionCapable: false,
        message: `Error checking API: ${error.message}`
      });
    }
  };

  const handleImageAnalysis = async () => {
    if (!imageQuestion.trim()) {
      Alert.alert('Question Required', 'Please enter a question about the post.');
      return;
    }
    
    setIsAnalyzing(true);
    setImageAnswer('');
    
    try {
      // Show that we're connecting to the API
      setImageAnswer('Connecting to Llama API to analyze...');
      
      let result;
      
      if (analysisType === 'image') {
        // Image analysis
        console.log(`Analyzing image: ${post.imageUrl}`);
        console.log(`Question: ${imageQuestion}`);
        
        result = await LlamaService.analyzeImage(post.imageUrl, imageQuestion);
      } else {
        // Content/comments analysis
        console.log(`Analyzing post content and comments`);
        console.log(`Question: ${imageQuestion}`);
        
        result = await LlamaService.analyzePost(post, imageQuestion);
      }
      
      // Check if result contains error messages
      if (result.includes('Error from Llama API:')) {
        Alert.alert(
          'API Limitation',
          'The Llama API returned an error. This may be due to API limitations or configuration.',
          [{ text: 'OK' }]
        );
      }
      
      setImageAnswer(result);
      
      // Update API status based on success
      if (!apiStatus.connected) {
        setApiStatus({
          ...apiStatus,
          connected: true,
          message: 'Connected to Llama API successfully.'
        });
      }
    } catch (error) {
      console.error('Error analyzing post:', error);
      setImageAnswer('Sorry, I encountered an error while analyzing. Please check the console for details and try again later.');
      
      // Update API status on error
      setApiStatus({
        ...apiStatus,
        connected: false,
        message: `Error: ${error.message}`
      });
      
      Alert.alert(
        'Analysis Error',
        'There was a problem analyzing this post. Please try again or try a different question.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const testApiCapabilities = async () => {
    setIsDiagnosing(true);
    try {
      setImageAnswer('Testing API capabilities...');
      const results = await LlamaService.testApiCapabilities();
      setApiDiagnostics(results);
      
      let diagnosticMessage = 'AI Analysis Capabilities:\n\n';
      diagnosticMessage += `- Text Chat API: ${results.chatEndpoint ? '✅ Working' : '❌ Not Working'}\n`;
      diagnosticMessage += `- Vision API: ${results.visionEndpoint ? '✅ Working' : '❌ Not Available'}\n`;
      diagnosticMessage += `- Context Extraction: ${results.contextExtractionActive ? '✅ Working' : '❌ Not Working'}\n\n`;
      
      diagnosticMessage += 'Supported Features:\n';
      if (results.supportedFeatures && results.supportedFeatures.length > 0) {
        results.supportedFeatures.forEach(feature => {
          diagnosticMessage += `- ${feature}\n`;
        });
      }
      
      if (results.error) {
        diagnosticMessage += `\nError: ${results.error}\n`;
      }
      
      diagnosticMessage += '\nCurrently using our smart context extraction to analyze images. ' +
                          'Triple-tap any image to use this feature.';
      
      setImageAnswer(diagnosticMessage);
    } catch (error) {
      console.error('Error testing API capabilities:', error);
      setImageAnswer('Error testing API capabilities. Check console for details.');
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Function to handle image loading errors
  const handleImageError = () => {
    setImageError(true);
    console.log('Error loading image:', post.imageUrl);
  };
  
  const handleModalImageError = () => {
    setModalImageError(true);
    console.log('Error loading modal image:', post.imageUrl);
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <Image 
        source={{ uri: `https://randomuser.me/api/portraits/men/${parseInt(item.id) + 5}.jpg` }} 
        style={styles.commentAvatar} 
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUsername}>{item.username}</Text>
          <Text style={styles.commentText}>{item.text}</Text>
        </View>
        <View style={styles.commentActions}>
          <Text style={styles.timestamp}>{item.timestamp || '1m'}</Text>
          <TouchableOpacity style={styles.likeButton}>
            <Text style={styles.likeText}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.replyButton}>
            <Text style={styles.replyText}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.commentLike}>
        <Ionicons name="heart-outline" size={14} color="#8e8e8e" />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Custom Post Content with Triple-Tap Support */}
        <View style={styles.postContainer}>
          {/* Post Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
              <View>
                <Text style={styles.username}>{post.username}</Text>
                <Text style={styles.location}>Instagram Clone</Text>
              </View>
            </View>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Post Image with Triple-Tap Detection */}
          <TouchableWithoutFeedback onPress={handleImagePress}>
            <View style={styles.imageContainer}>
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
              {tapCount > 0 && (
                <View style={styles.tapCountIndicator}>
                  <Text style={styles.tapCountText}>
                    {tapCount === 1 ? 'Tap twice more for AI analysis' : 'Tap once more for AI analysis'}
                  </Text>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>

          {/* Post Actions */}
          <View style={styles.actions}>
            <View style={styles.leftActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="heart-outline" size={26} color="black" />
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
          <Text style={styles.likes}>{post.likes.toLocaleString()} likes</Text>

          {/* Caption */}
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{post.username}</Text>
            <Text style={styles.caption}>{post.caption}</Text>
          </View>
          
          {/* Timestamp */}
          <Text style={styles.timestamp}>{post.timestamp}</Text>
          
          {/* Triple-tap instruction */}
          <View style={styles.instructionContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#8e8e8e" />
            <Text style={styles.tripleTapInstruction}>
              Triple-tap the image to analyze it with AI
            </Text>
          </View>
        </View>
        
        {/* Comments Header */}
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>
            Comments {comments.length > 0 ? `(${comments.length})` : ''}
          </Text>
          {comments.length > 5 && (
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Comments Section */}
        <View style={styles.commentsSection}>
          {comments.length === 0 ? (
            <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
          ) : (
            <FlatList
              data={comments.slice(0, 10)} // Show only first 10 comments
              renderItem={renderComment}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.commentSeparator} />}
            />
          )}
          
          {comments.length > 10 && (
            <TouchableOpacity style={styles.showMoreButton}>
              <Text style={styles.showMoreText}>Show more comments</Text>
              <Ionicons name="chevron-down" size={16} color="#405DE6" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      
      {/* Add Comment Section */}
      <View style={styles.addCommentContainer}>
        <Image 
          source={{ uri: 'https://randomuser.me/api/portraits/men/10.jpg' }} 
          style={styles.userAvatar} 
        />
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity 
          style={[styles.postButton, !commentText.trim() && styles.disabledButton]}
          onPress={handleAddComment}
          disabled={!commentText.trim()}
        >
          <Text style={[styles.postButtonText, !commentText.trim() && styles.disabledButtonText]}>
            Post
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Image Analysis Modal */}
      <Modal
        visible={imageAnalysisMode}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setImageAnalysisMode(false)}
        onShow={checkApiStatus}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ask AI about this post</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setImageAnalysisMode(false);
                  setImageQuestion('');
                  setImageAnswer('');
                }}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            {/* API Status Indicator */}
            <View style={[
              styles.apiStatusContainer,
              apiStatus.connected ? styles.apiConnected : styles.apiDisconnected
            ]}>
              <View style={styles.apiStatusIconContainer}>
                {apiStatus.checking ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons 
                    name={apiStatus.connected ? "checkmark-circle" : "alert-circle"} 
                    size={16} 
                    color="#fff" 
                  />
                )}
                <Text style={styles.apiStatusText}>
                  {apiStatus.connected ? 'Llama API Connected' : 'API Status'}
                </Text>
              </View>
              {apiStatus.connected && apiStatus.visionCapable && (
                <View style={styles.visionBadge}>
                  <Text style={styles.visionBadgeText}>Vision</Text>
                </View>
              )}
            </View>
            
            <ScrollView 
              style={styles.modalScrollContent} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContentContainer}
            >
              {/* Analysis Type Selector */}
              <View style={styles.analysisTypeSelector}>
                <TouchableOpacity
                  style={[
                    styles.analysisTypeButton,
                    analysisType === 'image' && styles.activeAnalysisType
                  ]}
                  onPress={() => setAnalysisType('image')}
                >
                  <Ionicons 
                    name="image" 
                    size={20} 
                    color={analysisType === 'image' ? '#fff' : '#405DE6'} 
                  />
                  <Text style={[
                    styles.analysisTypeText,
                    analysisType === 'image' && styles.activeAnalysisTypeText
                  ]}>
                    Analyze Image
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.analysisTypeButton,
                    analysisType === 'content' && styles.activeAnalysisType
                  ]}
                  onPress={() => setAnalysisType('content')}
                >
                  <Ionicons 
                    name="chatbubble" 
                    size={20} 
                    color={analysisType === 'content' ? '#fff' : '#405DE6'} 
                  />
                  <Text style={[
                    styles.analysisTypeText,
                    analysisType === 'content' && styles.activeAnalysisTypeText
                  ]}>
                    Analyze Comments & Content
                  </Text>
                </TouchableOpacity>
              </View>
              
              {analysisType === 'image' && (
                modalImageError ? (
                  <View style={[styles.modalImage, styles.imagePlaceholder]}>
                    <Ionicons name="image-outline" size={50} color="#cccccc" />
                    <Text style={styles.imagePlaceholderText}>Image could not be loaded</Text>
                  </View>
                ) : (
                  <Image 
                    source={{ uri: post.imageUrl }} 
                    style={styles.modalImage} 
                    resizeMode="cover"
                    onError={handleModalImageError}
                  />
                )
              )}
              
              {analysisType === 'content' && (
                <View style={styles.contentPreview}>
                  <Text style={styles.contentPreviewTitle}>Content & Comments:</Text>
                  <ScrollView 
                    style={styles.contentPreviewScroll}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                  >
                    <Text style={styles.previewCaption}>
                      <Text style={styles.previewUsername}>{post.username}: </Text>
                      {post.caption}
                    </Text>
                    
                    <View style={styles.commentsSeparator} />
                    
                    {post.comments.map((comment, index) => (
                      <View key={index} style={styles.previewCommentContainer}>
                        <Text style={styles.previewComment}>
                          <Text style={styles.previewUsername}>{comment.username}: </Text>
                          {comment.text}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
              
              <View style={styles.questionContainer}>
                <TextInput
                  style={styles.questionInput}
                  placeholder={analysisType === 'image' 
                    ? "Ask about this image (e.g., 'What is in this picture?')" 
                    : "Ask about this post (e.g., 'Summarize the comments')"}
                  value={imageQuestion}
                  onChangeText={setImageQuestion}
                  multiline
                />
                <TouchableOpacity
                  style={[
                    styles.analyzeButton,
                    (!imageQuestion.trim() || isAnalyzing) && styles.disabledButton
                  ]}
                  onPress={handleImageAnalysis}
                  disabled={!imageQuestion.trim() || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.analyzeButtonText}>Analyze</Text>
                  )}
                </TouchableOpacity>
              </View>
              
              {isAnalyzing && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#405DE6" />
                  <Text style={styles.loadingText}>Analyzing {analysisType === 'image' ? 'image' : 'content'}...</Text>
                </View>
              )}
              
              {imageAnswer !== '' && (
                <View style={styles.answerContainer}>
                  <View style={styles.answerHeader}>
                    <Text style={styles.answerTitle}>Analysis:</Text>
                    <TouchableOpacity style={styles.copyButton}>
                      <Ionicons name="copy-outline" size={18} color="#405DE6" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView 
                    style={styles.answerScroll}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                  >
                    <Text style={styles.answerText}>{imageAnswer}</Text>
                  </ScrollView>
                </View>
              )}
              
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleTitle}>Sample questions:</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.exampleScroll}
                  contentContainerStyle={styles.exampleScrollContent}
                >
                  {analysisType === 'image' ? (
                    <>
                      <TouchableOpacity
                        style={styles.exampleButton}
                        onPress={() => setImageQuestion('What is in this image?')}
                      >
                        <Text style={styles.exampleButtonText}>What is in this image?</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.exampleButton}
                        onPress={() => setImageQuestion('Is there any animal in this picture?')}
                      >
                        <Text style={styles.exampleButtonText}>Is there any animal in this picture?</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.exampleButton}
                        onPress={() => setImageQuestion('What colors are visible in this image?')}
                      >
                        <Text style={styles.exampleButtonText}>What colors are visible in this image?</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.exampleButton}
                        onPress={() => setImageQuestion('Summarize the comments on this post')}
                      >
                        <Text style={styles.exampleButtonText}>Summarize the comments</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.exampleButton}
                        onPress={() => setImageQuestion('What is the sentiment of the comments?')}
                      >
                        <Text style={styles.exampleButtonText}>What is the sentiment of the comments?</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.exampleButton}
                        onPress={() => setImageQuestion('What are people discussing in this post?')}
                      >
                        <Text style={styles.exampleButtonText}>What are people discussing?</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </ScrollView>
                
                {/* API Diagnostics button */}
                <TouchableOpacity
                  style={[styles.diagnosticButton, isDiagnosing && styles.disabledButton]}
                  onPress={testApiCapabilities}
                  disabled={isDiagnosing}
                >
                  <Text style={styles.diagnosticButtonText}>
                    {isDiagnosing ? 'Testing API...' : 'Test Llama API Capabilities'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  postContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 0.5,
    borderColor: '#eee',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  location: {
    fontSize: 12,
    color: '#8e8e8e',
    marginTop: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
  },
  tapCountIndicator: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 20,
  },
  tapCountText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: 20,
  },
  likes: {
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 6,
    fontSize: 14,
  },
  captionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  captionUsername: {
    fontWeight: 'bold',
    marginRight: 5,
    fontSize: 14,
  },
  caption: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: '#8e8e8e',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 15,
    backgroundColor: '#f8f8f8',
    paddingVertical: 8,
    borderRadius: 4,
    marginHorizontal: 16,
  },
  tripleTapInstruction: {
    color: '#8e8e8e',
    fontSize: 12,
    marginLeft: 5,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  commentsTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  viewAllText: {
    color: '#405DE6',
    fontWeight: 'bold',
  },
  commentsSection: {
    padding: 16,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  commentUsername: {
    fontWeight: 'bold',
    marginRight: 5,
    fontSize: 13,
  },
  commentText: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: 13,
    lineHeight: 18,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 5,
  },
  commentLike: {
    marginLeft: 10,
    justifyContent: 'flex-start',
    paddingTop: 5,
  },
  addCommentContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 80,
    padding: 8,
    fontSize: 14,
  },
  postButton: {
    paddingHorizontal: 12,
  },
  postButtonText: {
    color: '#405DE6',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: '#8e8e8e',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '94%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalScrollContentContainer: {
    paddingVertical: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#262626',
  },
  closeButton: {
    padding: 5,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  questionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    minHeight: 50,
  },
  analyzeButton: {
    backgroundColor: '#405DE6',
    padding: 12,
    borderRadius: 8,
    height: 50,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  answerContainer: {
    marginVertical: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#efefef',
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  answerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#405DE6',
  },
  copyButton: {
    padding: 6,
    backgroundColor: '#efefef',
    borderRadius: 12,
  },
  answerScroll: {
    maxHeight: 200,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  answerText: {
    fontSize: 14,
    lineHeight: 22,
  },
  exampleContainer: {
    marginTop: 15,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#262626',
  },
  exampleScroll: {
    marginVertical: 8,
  },
  exampleScrollContent: {
    flexDirection: 'row',
  },
  exampleButton: {
    padding: 10,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  exampleButtonText: {
    fontSize: 13,
    color: '#405DE6',
  },
  diagnosticButton: {
    padding: 14,
    marginTop: 20,
    backgroundColor: '#F0AD4E',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  diagnosticButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  analysisTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  analysisTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#405DE6',
    flex: 1,
    marginHorizontal: 5,
  },
  activeAnalysisType: {
    backgroundColor: '#405DE6',
  },
  analysisTypeText: {
    color: '#405DE6',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 13,
  },
  activeAnalysisTypeText: {
    color: '#fff',
  },
  contentPreview: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  contentPreviewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#405DE6',
  },
  contentPreviewScroll: {
    maxHeight: 200,
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  previewCaption: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    padding: 4,
  },
  commentsSeparator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  previewCommentContainer: {
    marginBottom: 10,
    paddingBottom: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  previewComment: {
    fontSize: 13,
    lineHeight: 20,
  },
  previewUsername: {
    fontWeight: 'bold',
  },
  noCommentsText: {
    color: '#8e8e8e',
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
    fontStyle: 'italic',
  },
  commentSeparator: {
    height: 1,
    backgroundColor: '#f5f5f5',
    marginVertical: 12,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    marginTop: 10,
  },
  showMoreText: {
    color: '#405DE6',
    fontWeight: 'bold',
    marginRight: 5,
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
  // New styles for API status
  apiStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  apiConnected: {
    backgroundColor: '#4CAF50',
  },
  apiDisconnected: {
    backgroundColor: '#F44336',
  },
  apiStatusIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apiStatusText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: 'bold',
  },
  visionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  visionBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default PostDetailScreen; 