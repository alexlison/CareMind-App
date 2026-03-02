import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, SafeAreaView, StatusBar, Keyboard, ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import styles from '../styles/ChatStyles';
import { loadChatHistory, sendChatMessage, clearChatHistory } from '../services/ChatService';

// Chatbot personality
const BOT_NAME = "Dr. Care";
const BOT_TITLE = "Your Health Assistant";

// Simple suggestion chips
const SUGGESTIONS = [
  "What are my medicines for today?",
  "Can I skip a dose?",
  "I have a headache",
  "I missed my medicine",
  "Tell me about my routines",
  "Is this normal?",
];

const ChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const scrollViewRef = useRef(null);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
    
    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Load chat history
  const fetchHistory = async () => {
    const history = await loadChatHistory();
    
    if (history.length > 0) {
      setMessages(history);
      setShowWelcome(false);
    }
    
    setHistoryLoaded(true);
  };

  // Send message
  const handleSend = async (text) => {
    const msg = (text || inputText).trim();
    if (!msg) return;

    setInputText('');
    setLoading(true);
    Keyboard.dismiss();
    setShowWelcome(false);

    // User message
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: msg,
      time: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    // Get bot response
    const result = await sendChatMessage(msg);

    const botMsg = {
      id: Date.now().toString() + '_bot',
      role: 'assistant',
      text: result.success
        ? result.reply
        : "I'm having trouble connecting. Please try again in a moment.",
      time: new Date(),
    };
    setMessages(prev => [...prev, botMsg]);

    setLoading(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // Clear chat
  const handleClear = () => {
    Alert.alert('Clear Chat', 'Delete all conversation history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearChatHistory();
          setMessages([]);
          setShowWelcome(true);
        },
      },
    ]);
  };

  // Handle suggestion click
  const handleSuggestionPress = (suggestion) => {
    handleSend(suggestion);
  };

  // Render message bubble
  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    
    return (
      <View style={[styles.bubbleRow, isUser && styles.bubbleRowRight]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <MaterialCommunityIcons name="doctor" size={18} color="#fff" />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[
            styles.bubbleText, 
            isUser && styles.userBubbleText
          ]}>
            {item.text}
          </Text>
          <Text style={[styles.timeText, isUser && styles.userTimeText]}>
            {new Date(item.time).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

  // Welcome screen component
  const renderWelcomeScreen = () => (
    <ScrollView 
      ref={scrollViewRef}
      contentContainerStyle={styles.welcomeScrollContent}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={styles.welcomeContent}>
        <View style={styles.welcomeIconBox}>
          <MaterialCommunityIcons name="doctor" size={80} color="#2E7D32" />
        </View>
        <Text style={styles.welcomeTitle}>Hi! I'm {BOT_NAME}</Text>
        <Text style={styles.welcomeSubtitle}>
          Your personal health assistant
        </Text>
        <Text style={styles.suggestionsLabel}>Try asking:</Text>
        <View style={styles.suggestionsGrid}>
          {SUGGESTIONS.map((s, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.suggestionChip} 
              onPress={() => handleSuggestionPress(s)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.bottomSpacer} />
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header - Fixed at top */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <MaterialCommunityIcons name="doctor" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>{BOT_NAME}</Text>
            <Text style={styles.headerSub}>{BOT_TITLE}</Text>
          </View>
        </View>

        {messages.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <MaterialCommunityIcons name="delete-outline" size={22} color="#999" />
          </TouchableOpacity>
        )}
        {messages.length === 0 && <View style={{ width: 40 }} />}
      </View>

      {/* Content Area - Takes remaining space */}
      <View style={styles.contentContainer}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {showWelcome && !loading ? (
            // Welcome screen - scrollable
            renderWelcomeScreen()
          ) : (
            // Chat messages area
            <View style={styles.chatContainer}>
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={true}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
              />

              {/* Typing indicator */}
              {loading && (
                <View style={styles.typingRow}>
                  <View style={styles.botAvatar}>
                    <MaterialCommunityIcons name="doctor" size={18} color="#fff" />
                  </View>
                  <View style={styles.typingBubble}>
                    <ActivityIndicator size="small" color="#2E7D32" />
                    <Text style={styles.typingText}>{BOT_NAME} is thinking...</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Input bar - Fixed at bottom */}
          <View style={[
            styles.inputBar,
            keyboardVisible && styles.inputBarWithKeyboard
          ]}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder={`Ask ${BOT_NAME} anything...`}
              placeholderTextColor="#aaa"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={() => handleSend()}
            />

            <TouchableOpacity
              style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || loading}
            >
              <MaterialCommunityIcons 
                name="send" 
                size={20} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;