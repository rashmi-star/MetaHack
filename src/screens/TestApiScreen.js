import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LlamaService from '../services/LlamaService';

// Sample images for testing
const SAMPLE_IMAGES = [
  {
    id: '1',
    description: 'Sunset at beach',
    url: 'https://images.unsplash.com/photo-1583172556690-6c05f2045353'
  },
  {
    id: '2',
    description: 'Mountain landscape',
    url: 'https://images.unsplash.com/photo-1618588507085-c79565432917'
  },
  {
    id: '3',
    description: 'Pasta dish',
    url: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327'
  },
  {
    id: '4',
    description: 'Man in blue t-shirt',
    url: 'https://images.unsplash.com/photo-1602002418082-dd878326a3f8'
  },
  {
    id: '5',
    description: 'Golden retriever dog',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1'
  }
];

const TestApiScreen = ({ route, navigation }) => {
  // Check if an image URL was passed from another screen
  const passedImageUrl = route.params?.imageUrl;
  const passedPost = route.params?.post;
  
  // If a post image was passed, create a custom image object for it
  const customImage = passedImageUrl ? {
    id: 'custom',
    description: passedPost?.caption || 'Custom image',
    url: passedImageUrl
  } : null;
  
  // If we have a custom image, use it as the default selected image
  const [selectedImage, setSelectedImage] = useState(customImage || SAMPLE_IMAGES[0]);
  const [question, setQuestion] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiDiagnostics, setApiDiagnostics] = useState(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const handleImageSelect = (image) => {
    setSelectedImage(image);
    setAnalysisResult('');
  };

  const handleAnalyzeImage = async () => {
    if (!question.trim()) {
      Alert.alert('Question Required', 'Please enter a question about the image.');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResult('Connecting to Llama API to analyze this image...');
    
    try {
      console.log(`Analyzing image: ${selectedImage.url}`);
      console.log(`Question: ${question}`);
      
      const result = await LlamaService.analyzeImage(selectedImage.url, question);
      
      if (result.includes('Error from Llama API:')) {
        Alert.alert(
          'API Limitation',
          'The Llama API returned an error. This may be due to API limitations or configuration.',
          [{ text: 'OK' }]
        );
      }
      
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setAnalysisResult('Sorry, I encountered an error while analyzing this image. Please check the console for details and try again later.');
      
      Alert.alert(
        'Analysis Error',
        'There was a problem analyzing this image. Please try again or try a different question.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const testApiCapabilities = async () => {
    setIsDiagnosing(true);
    try {
      setAnalysisResult('Testing API capabilities...');
      const results = await LlamaService.testApiCapabilities();
      setApiDiagnostics(results);
      
      let diagnosticMessage = 'API Diagnostics Results:\n\n';
      diagnosticMessage += `- Chat API: ${results.chatEndpoint ? '✅ Working' : '❌ Not Working'}\n`;
      diagnosticMessage += `- Vision API: ${results.visionEndpoint ? '✅ Working' : '❌ Not Working'}\n`;
      
      if (results.error) {
        diagnosticMessage += `\nError: ${results.error}\n`;
      }
      
      if (!results.visionEndpoint) {
        diagnosticMessage += '\nThe vision capabilities are not available with this API key or configuration. ' +
                           'We will attempt to use alternative methods, but image analysis may be limited.';
      }
      
      setAnalysisResult(diagnosticMessage);
    } catch (error) {
      console.error('Error testing API capabilities:', error);
      setAnalysisResult('Error testing API capabilities. Check console for details.');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const renderSampleQuestions = () => {
    const sampleQuestions = [
      'What is in this image?',
      'What colors are visible in this image?',
      'Is there any person in this picture?',
      'Describe the setting of this image.',
      'What is the main subject of this photo?'
    ];

    return (
      <View style={styles.sampleQuestions}>
        <Text style={styles.sectionTitle}>Sample Questions:</Text>
        {sampleQuestions.map((q, index) => (
          <TouchableOpacity
            key={index}
            style={styles.sampleQuestionButton}
            onPress={() => setQuestion(q)}
          >
            <Text style={styles.sampleQuestionText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Llama API Image Analysis</Text>
          <Text style={styles.subtitle}>
            {customImage 
              ? 'Analyze this post image with Llama AI'
              : 'Test image analysis capabilities by asking questions about images'}
          </Text>
        </View>

        <View style={styles.imageSelector}>
          <Text style={styles.sectionTitle}>Select an Image:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
            {/* Show the custom image first if it exists */}
            {customImage && (
              <TouchableOpacity
                key="custom"
                style={[
                  styles.imageThumbnailContainer,
                  selectedImage.id === 'custom' && styles.selectedImageContainer
                ]}
                onPress={() => handleImageSelect(customImage)}
              >
                <Image
                  source={{ uri: customImage.url }}
                  style={styles.imageThumbnail}
                  resizeMode="cover"
                />
                <Text style={styles.imageLabel} numberOfLines={1}>
                  Current Post
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Show sample images */}
            {SAMPLE_IMAGES.map((image) => (
              <TouchableOpacity
                key={image.id}
                style={[
                  styles.imageThumbnailContainer,
                  selectedImage.id === image.id && styles.selectedImageContainer
                ]}
                onPress={() => handleImageSelect(image)}
              >
                <Image
                  source={{ uri: image.url }}
                  style={styles.imageThumbnail}
                  resizeMode="cover"
                />
                <Text style={styles.imageLabel} numberOfLines={1}>
                  {image.description}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.selectedImageContainer}>
          <Image
            source={{ uri: selectedImage.url }}
            style={styles.selectedImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.sectionTitle}>Ask a Question:</Text>
          <TextInput
            style={styles.questionInput}
            placeholder="E.g., What can you see in this image?"
            value={question}
            onChangeText={setQuestion}
            multiline
          />
          
          <TouchableOpacity
            style={[
              styles.analyzeButton,
              (!question.trim() || isAnalyzing) && styles.disabledButton
            ]}
            onPress={handleAnalyzeImage}
            disabled={!question.trim() || isAnalyzing}
          >
            <Text style={styles.buttonText}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
            </Text>
          </TouchableOpacity>
        </View>

        {renderSampleQuestions()}

        <TouchableOpacity
          style={[styles.diagnosticButton, isDiagnosing && styles.disabledButton]}
          onPress={testApiCapabilities}
          disabled={isDiagnosing}
        >
          <Text style={styles.buttonText}>
            {isDiagnosing ? 'Testing API...' : 'Test Llama API Capabilities'}
          </Text>
        </TouchableOpacity>

        {(analysisResult || isAnalyzing) && (
          <View style={styles.resultContainer}>
            <Text style={styles.sectionTitle}>Analysis Result:</Text>
            
            {isAnalyzing && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#405DE6" />
                <Text style={styles.loadingText}>Analyzing image...</Text>
              </View>
            )}
            
            {analysisResult && (
              <ScrollView style={styles.resultScroll}>
                <Text style={styles.resultText}>{analysisResult}</Text>
              </ScrollView>
            )}
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
  scrollContent: {
    padding: 15,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  imageSelector: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imagesScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  imageThumbnailContainer: {
    marginRight: 10,
    borderRadius: 8,
    padding: 2,
    width: 120,
  },
  selectedImageContainer: {
    borderColor: '#405DE6',
    borderWidth: 2,
  },
  imageThumbnail: {
    width: 110,
    height: 110,
    borderRadius: 8,
  },
  imageLabel: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 12,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    marginBottom: 10,
  },
  analyzeButton: {
    backgroundColor: '#405DE6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  diagnosticButton: {
    backgroundColor: '#F0AD4E',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  sampleQuestions: {
    marginTop: 20,
  },
  sampleQuestionButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  sampleQuestionText: {
    color: '#405DE6',
  },
  resultContainer: {
    marginTop: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  resultScroll: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 22,
  },
});

export default TestApiScreen; 