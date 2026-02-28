
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getTaskDetails, completeTask } from '../services/HomeService';
import styles from '../styles/TaskDetailsStyles';

const TaskDetailsScreen = ({ navigation, route }) => {
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [imageError, setImageError] = useState(false);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const fetchTaskDetails = useCallback(async () => {
    try {
      console.log('Fetching task details for ID:', taskId);
      const response = await getTaskDetails(taskId);
      console.log('Task details response:', response);
      
      if (response.status === 'SUCCESS' && response.data) {
        setTask(response.data);
      } else {
        Alert.alert('Error', 'Could not load task details');
        navigation.goBack();
      }
    } catch (error) {
      console.log('Fetch error:', error);
      Alert.alert('Error', 'Failed to load task');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [taskId, navigation]);

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const response = await completeTask(taskId);
      console.log('Complete response:', response);
      
      if (response && response.status === 'SUCCESS') {
        const scoreMessages = {
          0: 'Perfect! On time!',
          1: 'Good job! (Slightly late)',
          2: 'Okay! (Moderately late)',
          3: 'Completed (Very late)',
        };
        
        Alert.alert(
          '✅ Good Job!',
          scoreMessages[response.data.score] || 'Task completed successfully',
          [
            { 
              text: 'OK', 
              onPress: () => {
                navigation.goBack();
              } 
            }
          ]
        );
      } else {
        const errorMsg = response?.message || 'Could not complete task. Please try again.';
        Alert.alert('❌ Sorry', errorMsg);
      }
    } catch (error) {
      console.log('Complete error:', error);
      Alert.alert(
        '❌ Error',
        error?.response?.data?.message || 'Failed to complete task. Please try again.'
      );
    } finally {
      setCompleting(false);
    }
  };

  // Helper function to convert "7:30 AM" to Date object
  const getTaskDateFromScheduledTime = () => {
    if (!task || !task.scheduledTime) return null;
    
    try {
      const timeStr = task.scheduledTime;
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      
      let hour = parseInt(hours);
      if (modifier === 'PM' && hour !== 12) hour += 12;
      if (modifier === 'AM' && hour === 12) hour = 0;
      
      const taskDate = new Date();
      taskDate.setHours(hour, parseInt(minutes), 0, 0);
      return taskDate;
    } catch (e) {
      console.log('Error parsing time:', e);
      return null;
    }
  };

  // Check if task can be completed based on time window
  const canCompleteTask = () => {
    if (!task) return false;
    
    // Use the canComplete flag from backend if available
    if (task.canComplete !== undefined) {
      return task.canComplete;
    }
    
    if (task.status !== 'pending') return false;
    
    const taskDate = getTaskDateFromScheduledTime();
    if (!taskDate) return false;
    
    const now = currentTime;
    const diffMinutes = Math.floor((now - taskDate) / (1000 * 60));
    
    // Spec: Complete button visible from 30 minutes BEFORE to 30 minutes AFTER
    return diffMinutes >= -30 && diffMinutes <= 30;
  };

  // Get message about when task can be completed
  const getTimeWindowMessage = () => {
    if (!task) return '';
    
    const taskDate = getTaskDateFromScheduledTime();
    if (!taskDate) return '';
    
    const now = currentTime;
    const diffMinutes = Math.floor((now - taskDate) / (1000 * 60));
    
    if (diffMinutes < -30) {
      const minsUntil = Math.abs(diffMinutes) - 30;
      return `Available in ${minsUntil} minute${minsUntil !== 1 ? 's' : ''}`;
    } else if (diffMinutes < 0) {
      return `Available now (${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) !== 1 ? 's' : ''} early)`;
    } else if (diffMinutes <= 30) {
      return `Available (${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} late)`;
    } else {
      return `Expired (${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} late)`;
    }
  };

  // Format lateness for display
  const formatLateness = (minutes) => {
    if (!minutes || minutes <= 0) return null;
    
    if (minutes < 60) {
      return `${minutes} min late`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (mins === 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} late`;
      } else {
        return `${hours}h ${mins}m late`;
      }
    }
  };

  // Get score label
  const getScoreLabel = (score) => {
    switch(score) {
      case 0: return 'On time';
      case 1: return 'Slightly late (1-10 min)';
      case 2: return 'Moderately late (11-15 min)';
      case 3: return 'Very late (16-30 min)';
      case 4: return 'Missed';
      default: return '';
    }
  };

  // Construct full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Extract base URL without /api
    const baseUrl = 'http://172.22.173.6:5000';
    
    // Ensure path starts with /
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    return `${baseUrl}${cleanPath}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading task...</Text>
      </View>
    );
  }

  if (!task) {
    return (  
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert" size={60} color="#DC2626" />
        <Text style={styles.errorText}>Task not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isMedicine = task.taskType === 'Medicine';
  const iconName = isMedicine ? 'pill' : 'calendar-check';
  const iconColor = isMedicine ? '#2E7D32' : '#F57C00';
  const bgColor = isMedicine ? '#E8F5E9' : '#FFF3E0';
  
  const canComplete = canCompleteTask();
  const timeWindowMessage = getTimeWindowMessage();
  const lateText = formatLateness(task.latenessMinutes);
  
  // Get medicine image URL if available
  const imageUrl = task.details?.imageUrl ? getImageUrl(task.details.imageUrl) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon or Image */}
        {imageUrl && !imageError ? (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: imageUrl }}
              style={styles.medicineImage}
              onError={(error) => {
                console.log('Image load error:', error.nativeEvent.error);
                setImageError(true);
              }}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
            <MaterialCommunityIcons name={iconName} size={60} color={iconColor} />
          </View>
        )}

        {/* Task Name */}
        <Text style={styles.taskName}>{task.taskName}</Text>
        
        {/* Time */}
        <View style={styles.timeContainer}>
          <MaterialCommunityIcons name="clock" size={24} color="#6B7280" />
          <Text style={styles.timeText}>{task.scheduledTime}</Text>
        </View>

        {/* Status Badge */}
        <View style={[
          styles.statusBadge,
          { 
            backgroundColor: 
              task.status === 'completed' ? '#E8F5E9' :
              task.status === 'missed' ? '#FEE2E2' :
              canComplete ? '#FEF3C7' : '#F3F4F6'
          }
        ]}>
          <Text style={[
            styles.statusText,
            { 
              color: 
                task.status === 'completed' ? '#2E7D32' :
                task.status === 'missed' ? '#DC2626' :
                canComplete ? '#F59E0B' : '#6B7280'
            }
          ]}>
            {task.status === 'completed' ? 'Completed' :
             task.status === 'missed' ? 'Missed' :
             canComplete ? 'Available Now' : 'Not Available'}
          </Text>
        </View>

        {/* Score (if completed or missed) */}
        {(task.status === 'completed' || task.status === 'missed') && task.score !== undefined && (
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>
              {/* Score: {task.score} - {getScoreLabel(task.score)} */}
            </Text>
          </View>
        )}

        {/* Time Window Info */}
        {task.status === 'pending' && (
          <View style={[
            styles.timeWindowCard,
            { backgroundColor: canComplete ? '#F0FDF4' : '#F3F4F6' }
          ]}>
            <MaterialCommunityIcons 
              name={canComplete ? 'check-circle' : 'clock-outline'} 
              size={20} 
              color={canComplete ? '#2E7D32' : '#9CA3AF'} 
            />
            <Text style={[
              styles.timeWindowText,
              { color: canComplete ? '#2E7D32' : '#6B7280' }
            ]}>
              {timeWindowMessage}
            </Text>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsText}>
              {task.details?.instructions || task.details?.description || 'Take as directed'}
            </Text>
          </View>
        </View>

        {/* Purpose/Description */}
        {task.details?.purpose && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why</Text>
            <View style={styles.purposeCard}>
              <Text style={styles.purposeText}>{task.details.purpose}</Text>
            </View>
          </View>
        )}

        {/* Dosage (for medicines) */}
        {isMedicine && task.details?.dosage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dosage</Text>
            <View style={styles.dosageCard}>
              <Text style={styles.dosageText}>{task.details.dosage}</Text>
            </View>
          </View>
        )}

        {/* Lateness Info */}
        {lateText && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons 
              name={task.status === 'missed' ? 'alert-circle' : 'timer'} 
              size={20} 
              color={task.status === 'missed' ? '#DC2626' : '#F59E0B'} 
            />
            <Text style={[
              styles.infoLabel,
              { color: task.status === 'missed' ? '#DC2626' : '#92400E' }
            ]}>
              {lateText}
            </Text>
          </View>
        )}

        {/* Complete Button - Only show when can complete */}
        {canComplete && (
          <TouchableOpacity
            style={[styles.completeButton, completing && styles.completeButtonDisabled]}
            onPress={handleComplete}
            disabled={completing}
          >
            {completing ? (
              <ActivityIndicator color="#FFFFFF" size="large" />
            ) : (
              <>
                <MaterialCommunityIcons name="check-circle" size={32} color="#FFFFFF" />
                <Text style={styles.completeButtonText}>COMPLETE</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Already Completed Message */}
        {task.status === 'completed' && (
          <View style={styles.completedMessage}>
            <MaterialCommunityIcons name="check-circle" size={50} color="#2E7D32" />
            <Text style={styles.completedText}>Already Completed</Text>
            {task.latenessMinutes > 0 && (
              <Text style={styles.completedSubtext}>
                {formatLateness(task.latenessMinutes)}
              </Text>
            )}
          </View>
        )}

        {/* Missed Message */}
        {task.status === 'missed' && (
          <View style={styles.missedMessage}>
            <MaterialCommunityIcons name="close-circle" size={50} color="#DC2626" />
            <Text style={styles.missedText}>Task Missed</Text>
            <Text style={styles.missedSubtext}>
              This task was not completed
            </Text>
            {task.latenessMinutes > 0 && (
              <Text style={styles.missedSubtext}>
                {formatLateness(task.latenessMinutes)}
              </Text>
            )}
          </View>
        )}

        {/* Not Available Message */}
        {task.status === 'pending' && !canComplete && (
          <View style={styles.notAvailableMessage}>
            <MaterialCommunityIcons name="clock-alert" size={50} color="#9CA3AF" />
            <Text style={styles.notAvailableText}>Not Available Yet</Text>
            <Text style={styles.notAvailableSubtext}>
              {timeWindowMessage}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TaskDetailsScreen;