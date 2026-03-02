
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, SafeAreaView, StatusBar, Keyboard,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import styles from '../styles/ChatStyles';
import { loadChatHistory, sendChatMessage, clearChatHistory } from '../services/ChatService';

// Chatbot personality
const BOT_NAME = "Dr. Care";
const BOT_TITLE = "Your Health Assistant";
const BOT_GREETING = `Hi! I'm ${BOT_NAME}, your personal health assistant. How can I help you today?`;

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
  
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchHistory();
    
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
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
    
    if (history.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        text: BOT_GREETING,
        time: new Date(),
      }]);
    } else {
      setMessages(history);
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

  const handleClear = () => {
    Alert.alert('Clear Chat', 'Delete all conversation history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearChatHistory();
          setMessages([{
            id: 'welcome',
            role: 'assistant',
            text: BOT_GREETING,
            time: new Date(),
          }]);
        },
      },
    ]);
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    const isWelcome = item.id === 'welcome';
    
    return (
      <View style={[styles.bubbleRow, isUser && styles.bubbleRowRight]}>
        {!isUser && (
          <View style={[styles.botAvatar, isWelcome && styles.welcomeAvatar]}>
            <MaterialCommunityIcons 
              name={isWelcome ? "star" : "doctor"} 
              size={isWelcome ? 20 : 18} 
              color="#fff" 
            />
          </View>
        )}
        <View style={[
          styles.bubble, 
          isUser ? styles.userBubble : styles.botBubble,
          isWelcome && styles.welcomeBubble
        ]}>
          {!isUser && !isWelcome && (
            <Text style={styles.botNameText}>{BOT_NAME}</Text>
          )}
          {isWelcome && (
            <Text style={styles.welcomeTitle}>Welcome to CareMind!</Text>
          )}
          <Text style={[
            styles.bubbleText, 
            isUser && styles.userBubbleText,
            isWelcome && styles.welcomeText
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

  const renderEmpty = () => {
    if (!historyLoaded) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBox}>
          <MaterialCommunityIcons name="doctor" size={50} color="#2E7D32" />
        </View>
        <Text style={styles.emptyTitle}>Welcome to {BOT_NAME}</Text>
        <Text style={styles.emptySubtitle}>
          Your personal health assistant is here to help
        </Text>
        <Text style={styles.suggestionsLabel}>Try asking:</Text>
        <View style={styles.chipsContainer}>
          {SUGGESTIONS.map((s, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.chip} 
              onPress={() => handleSend(s)}
            >
              <Text style={styles.chipText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
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

        <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
          <MaterialCommunityIcons name="delete-outline" size={22} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.messagesList,
            messages.length === 0 && styles.emptyList,
          ]}
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

        {/* Input bar */}
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
    </SafeAreaView>
  );
};

export default ChatScreen;