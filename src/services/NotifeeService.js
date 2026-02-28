/**
 * NotifeeService.js
 * Handles push notification display with proper vibration patterns
 */

import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { Platform } from 'react-native';

class NotifeeService {
  async requestPermissions() {
    try {
      await notifee.requestPermission();
    } catch (error) {
      console.log('Permission error:', error);
    }
  }

  async createChannels() {
    try {
      // Reminders channel (lower importance)
      await notifee.createChannel({
        id: 'reminders',
        name: 'Reminders',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
        vibrationPattern: [300, 500], // short buzz pattern
      });

      // Alerts channel (higher importance, longer vibration)
      await notifee.createChannel({
        id: 'alerts',
        name: 'Alerts',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
        vibrationPattern: [500, 500, 500], // pattern: buzz, pause, buzz
        bypassDnd: true,
      });

      console.log('Notification channels created');
    } catch (error) {
      console.log('Channel error:', error);
    }
  }

  async showNotification(title, body, data = {}, channelId = 'reminders') {
    try {
      // Cancel any existing notification with same ID to avoid duplicates
      if (data.notificationId) {
        await notifee.cancelNotification(data.notificationId);
      }

      const notificationId = await notifee.displayNotification({
        id: data.notificationId || Date.now().toString(),
        title,
        body,
        data,
        android: {
          channelId,
          smallIcon: 'ic_launcher', // Make sure this exists in your project
          color: '#2E7D32',
          pressAction: { 
            id: 'default',
            launchActivity: 'default',
          },
          timeoutAfter: 30000, // Auto dismiss after 30 seconds
          ongoing: false,
          autoCancel: true,
          showTimestamp: true,
          sound: 'default',
        },
        ios: {
          categoryId: channelId,
          sound: 'default',
          critical: channelId === 'alerts',
          criticalVolume: 1.0,
        },
      });

      console.log('Notification shown:', notificationId, title);
      return notificationId;
    } catch (error) {
      console.log('Show notification error:', error);
      return null;
    }
  }

  async showReminder(task) {
    return this.showNotification(
      `🔔 Reminder: ${task.taskName}`,
      `Due in 2 minutes at ${task.scheduledTime}`,
      { 
        taskId: task._id, 
        type: 'reminder',
        scheduledTime: task.scheduledTime 
      },
      'reminders'
    );
  }

  async showAlert(task, minutesLate) {
    return this.showNotification(
      `⚠️ Alert: ${task.taskName}`,
      `${minutesLate} min late - Please take now`,
      { 
        taskId: task._id, 
        type: 'alert',
        minutesLate,
        scheduledTime: task.scheduledTime 
      },
      'alerts'
    );
  }

  async showMissed(task) {
    return this.showNotification(
      `❌ Missed: ${task.taskName}`,
      `Was due at ${task.scheduledTime}`,
      { 
        taskId: task._id, 
        type: 'missed',
        scheduledTime: task.scheduledTime 
      },
      'alerts'
    );
  }

  async showOnTime(task) {
    return this.showNotification(
      `⏰ Time for: ${task.taskName}`,
      `Scheduled at ${task.scheduledTime}`,
      { 
        taskId: task._id, 
        type: 'alert',
        scheduledTime: task.scheduledTime 
      },
      'alerts'
    );
  }

  async setBadgeCount(count) {
    try {
      await notifee.setBadgeCount(Math.max(0, count));
    } catch (error) {
      console.log('Badge error:', error);
    }
  }

  async clearBadge() {
    await this.setBadgeCount(0);
  }

  // Handle notification press
  setupNotificationHandler(navigation) {
    return notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification) {
        const { taskId } = detail.notification.data || {};
        if (taskId && navigation) {
          navigation.navigate('TaskDetails', { taskId });
        }
      }
    });
  }

  // Handle background notification press
  setupBackgroundHandler() {
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log('Background press:', detail.notification?.data);
        // Handle background press if needed
      }
    });
  }
}

export default new NotifeeService();