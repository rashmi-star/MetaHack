# Instagram Clone with Llama AI Integration

A modern Instagram clone built with React Native and Expo that includes a Llama AI chatbot feature.

## Features

- **Instagram-like Feed**: Scrollable feed with posts, likes, and comments
- **Interactive Posts**: Tap interactions for post details
- **Llama AI Integration**: Triple tap on any post to access an AI assistant
- **Chatbot Analysis**: Ask the AI about post content, tone of comments, sentiment, etc.
- **Profile View**: User profiles with posts grid
- **Explore Page**: Discover new content

## Llama AI Integration

The app features a unique AI-powered chatbot that can analyze Instagram posts:
- Triple tap on any post image to activate the Llama chatbot
- Ask questions about the post content, comments, sentiment analysis, etc.
- Powered by Llama 3 Maverick model

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd instagram-clone
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npx expo start
```

4. Install the Expo Go app on your mobile device and scan the QR code to view the app

## Tech Stack

- React Native
- Expo
- React Navigation
- Llama API
- Axios

## Project Structure

```
instagram-clone/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # App screens
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API and other services
│   ├── utils/            # Helper functions
│   └── assets/           # Images and other assets
├── App.js                # App entry point
└── package.json          # Dependencies
```

## Contributing

Feel free to submit issues or pull requests to enhance this project.

## License

This project is licensed under the MIT License. 