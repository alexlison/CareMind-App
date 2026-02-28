import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getTodayTasks } from '../services/MyDayService';
import styles from '../styles/MyDayStyles';

const MyDayScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState({
    allTasks: [],
    upcoming: [],
    missed: [],
    completed: [],
    summary: { total: 0, upcoming: 0, completed: 0, missed: 0 }
  });
  const [activeTab, setActiveTab] = useState('upcoming');

  const fetchTasks = useCallback(async () => {
    try {
      const response = await getTodayTasks();
      console.log('Raw API Response:', JSON.stringify(response, null, 2));
      
      if (response.status === 'SUCCESS' && response.data) {
        // Debug: Check lateness values for completed tasks
        if (response.data.completed && response.data.completed.length > 0) {
          console.log('Completed tasks lateness:');
          response.data.completed.forEach((task, index) => {
            console.log(`Task ${index + 1}:`, {
              name: task.name || task.taskName,
              latenessMinutes: task.latenessMinutes,
              minutesLate: task.minutesLate,
              score: task.score,
              status: task.status
            });
          });
        }
        
        setTasks(response.data);
      }
    } catch (error) {
      console.log('Fetch tasks error:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  // FIXED: formatLateness function with proper checks
  const formatLateness = (task) => {
    // For completed tasks with score 0, they were on time
    if (task.status === 'completed' && task.score === 0) {
      return null; // On time - no badge
    }
    
    // For completed tasks with score > 0, they were late
    if (task.status === 'completed' && task.score > 0) {
      const minutes = task.latenessMinutes || task.minutesLate || 0;
      if (minutes <= 0) return 'Late'; // Fallback if minutes not available
      if (minutes < 60) return `${minutes} min late`;
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins === 0 ? `${hours}h late` : `${hours}h ${mins}m late`;
    }
    
    // For non-completed tasks
    const minutes = task.latenessMinutes || task.minutesLate || 0;
    if (minutes <= 0) return null;
    
    if (minutes < 60) return `${minutes} min late`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${hours}h late` : `${hours}h ${mins}m late`;
  };

  const getTaskIcon = (type) => type === 'Medicine' ? 'pill' : 'calendar-check';
  const getTaskColor = (type) => type === 'Medicine' ? '#2E7D32' : '#F57C00';

  const renderTaskItem = ({ item }) => {
    const taskId = item.id || item._id;
    const isLate = item.isLate || (item.minutesLate > 0);
    
    // Pass the whole task object to formatLateness
    const lateText = formatLateness(item);

    return (
      <TouchableOpacity
        style={[
          styles.taskCard,
          activeTab === 'missed' && styles.taskCardMissed,
          activeTab === 'completed' && styles.taskCardCompleted,
        ]}
        onPress={() => navigation.navigate('TaskDetails', { taskId })}
        activeOpacity={0.7}
      >
        <View style={[styles.taskIcon, { backgroundColor: `${getTaskColor(item.taskType)}20` }]}>
          <MaterialCommunityIcons
            name={getTaskIcon(item.taskType)}
            size={24}
            color={getTaskColor(item.taskType)}
          />
        </View>

        <View style={styles.taskInfo}>
          <Text style={styles.taskName}>{item.name || item.taskName}</Text>
          <View style={styles.taskTimeRow}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#8DA887" />
            <Text style={styles.taskTime}>{item.scheduledTime}</Text>
          </View>
          {lateText && (
            <View style={[
              styles.lateBadge,
              item.status === 'completed' ? styles.lateBadgeGreen : styles.lateBadgeRed
            ]}>
              <MaterialCommunityIcons 
                name="clock-alert-outline" 
                size={12} 
                color={item.status === 'completed' ? '#2E7D32' : '#C62828'} 
              />
              <Text style={[
                styles.lateText,
                item.status === 'completed' ? styles.lateTextGreen : styles.lateTextRed
              ]}>
                {lateText}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.taskStatus}>
          {activeTab === 'upcoming' && (
            <MaterialCommunityIcons
              name={isLate ? 'clock-alert' : 'clock-outline'}
              size={20}
              color={isLate ? '#C62828' : '#2E7D32'}
            />
          )}
          {activeTab === 'completed' && (
            <MaterialCommunityIcons name="check-circle" size={20} color="#2E7D32" />
          )}
          {activeTab === 'missed' && (
            <MaterialCommunityIcons name="close-circle" size={20} color="#C62828" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const tabs = [
    { key: 'upcoming', label: 'Upcoming', count: tasks.upcoming.length, icon: 'clock-outline' },
    { key: 'missed', label: 'Missed', count: tasks.missed.length, icon: 'close-circle-outline' },
    { key: 'completed', label: 'Done', count: tasks.completed.length, icon: 'check-circle-outline' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading your day...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F4F0" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Day</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Today's Task List Card with Stats Integrated */}
      <View style={styles.todayTaskListCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <MaterialCommunityIcons name="format-list-checks" size={20} color="#2E7D32" />
            <Text style={styles.cardTitle}>Today's Tasks</Text>
          </View>
          <View style={styles.totalTasksBadge}>
            <Text style={styles.totalTasksText}>{tasks.summary.total} Total</Text>
          </View>
        </View>

        {/* Stats Grid Inside Card */}
        <View style={styles.statsGrid}>
          <View style={[styles.statItem, styles.statUpcoming]}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#F57C00" />
            <Text style={styles.statNumber}>{tasks.summary.upcoming}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          
          <View style={[styles.statItem, styles.statCompleted]}>
            <MaterialCommunityIcons name="check-circle-outline" size={20} color="#2E7D32" />
            <Text style={styles.statNumber}>{tasks.summary.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={[styles.statItem, styles.statMissed]}>
            <MaterialCommunityIcons name="close-circle-outline" size={20} color="#C62828" />
            <Text style={styles.statNumber}>{tasks.summary.missed}</Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${tasks.summary.total > 0 
                    ? (tasks.summary.completed / tasks.summary.total) * 100 
                    : 0}%` 
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {tasks.summary.completed} of {tasks.summary.total} tasks completed
          </Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={16}
              color={activeTab === tab.key ? '#2E7D32' : '#8DA887'}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[styles.tabBadge, activeTab === tab.key && styles.activeTabBadge]}>
                <Text style={styles.tabBadgeText}>{tab.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      <FlatList
        data={activeTab === 'upcoming' ? tasks.upcoming : activeTab === 'missed' ? tasks.missed : tasks.completed}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id || item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name={
                activeTab === 'upcoming' ? 'calendar-blank' :
                activeTab === 'missed' ? 'check-circle' : 'clipboard-check-outline'
              }
              size={50}
              color="#8DA887"
            />
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming' ? 'No upcoming tasks' :
               activeTab === 'missed' ? 'No missed tasks - Great job!' :
               'No completed tasks yet'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default MyDayScreen;