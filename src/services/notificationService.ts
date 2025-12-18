// src/services/notificationService.ts
/**
 * Notification Service for Daily Work Status
 * Handles push notifications, reminders, and alerts
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { DWSDailyEntry } from '../types/dailyWorkStatus';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationConfig {
  dailyReminderTime?: string; // HH:MM format
  deadlineAlertDays?: number; // Days before deadline to alert
  enableStatusUpdates?: boolean;
  enableDeadlineAlerts?: boolean;
  enableDailyReminders?: boolean;
}

class NotificationService {
  private config: NotificationConfig = {
    dailyReminderTime: '17:00', // 5 PM default
    deadlineAlertDays: 2,
    enableStatusUpdates: true,
    enableDeadlineAlerts: true,
    enableDailyReminders: true,
  };

  /**
   * Initialize notifications and request permissions
   */
  async initialize(): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('[Notification] Web notifications not fully supported');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[Notification] Permission not granted');
        return false;
      }

      console.log('[Notification] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[Notification] Initialization error:', error);
      return false;
    }
  }

  /**
   * Update notification configuration
   */
  updateConfig(config: Partial<NotificationConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Schedule daily reminder to submit work status
   */
  async scheduleDailyReminder(): Promise<void> {
    if (!this.config.enableDailyReminders || Platform.OS === 'web') return;

    try {
      // Cancel existing daily reminders
      await this.cancelNotificationsByTag('daily-reminder');

      const [hours, minutes] = this.config.dailyReminderTime!.split(':').map(Number);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📝 Daily Work Status Reminder',
          body: 'Time to update your daily work status! Log your activities for today.',
          data: { type: 'daily-reminder' },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      console.log('[Notification] Daily reminder scheduled');
    } catch (error) {
      console.error('[Notification] Error scheduling daily reminder:', error);
    }
  }

  /**
   * Schedule deadline alert for a specific task
   */
  async scheduleDeadlineAlert(entry: DWSDailyEntry): Promise<void> {
    if (!this.config.enableDeadlineAlerts || Platform.OS === 'web') return;
    if (!entry.targetDate) return;

    try {
      const targetDate = new Date(entry.targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const daysUntilDeadline = Math.ceil(
        (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Schedule alert if within threshold
      if (daysUntilDeadline > 0 && daysUntilDeadline <= this.config.deadlineAlertDays!) {
        const alertDate = new Date(targetDate);
        alertDate.setDate(alertDate.getDate() - this.config.deadlineAlertDays!);
        alertDate.setHours(9, 0, 0, 0); // 9 AM

        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⏰ Deadline Approaching',
            body: `"${entry.mainActivity}" is due in ${daysUntilDeadline} day(s)!`,
            data: { 
              type: 'deadline-alert',
              entryId: entry.id,
              projectName: entry.projectName
            },
          },
          trigger: alertDate,
        });

        console.log('[Notification] Deadline alert scheduled for:', entry.mainActivity);
      }
    } catch (error) {
      console.error('[Notification] Error scheduling deadline alert:', error);
    }
  }

  /**
   * Send immediate notification for status updates
   */
  async sendStatusUpdateNotification(
    projectName: string,
    activity: string,
    updatedBy: string
  ): Promise<void> {
    if (!this.config.enableStatusUpdates || Platform.OS === 'web') return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Status Update',
          body: `${updatedBy} updated: "${activity}" in ${projectName}`,
          data: { 
            type: 'status-update',
            projectName,
            activity 
          },
        },
        trigger: null, // Send immediately
      });

      console.log('[Notification] Status update sent');
    } catch (error) {
      console.error('[Notification] Error sending status update:', error);
    }
  }

  /**
   * Send notification for tomorrow's activities
   */
  async sendTomorrowActivitiesNotification(count: number, activities: string[]): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const activityList = activities.slice(0, 3).join('\n• ');
      const moreText = activities.length > 3 ? `\n...and ${activities.length - 3} more` : '';

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🌅 ${count} Activities Starting Tomorrow`,
          body: `Activities:\n• ${activityList}${moreText}`,
          data: { type: 'tomorrow-activities' },
        },
        trigger: null,
      });

      console.log('[Notification] Tomorrow activities notification sent');
    } catch (error) {
      console.error('[Notification] Error sending tomorrow activities:', error);
    }
  }

  /**
   * Send notification for overdue tasks
   */
  async sendOverdueNotification(count: number, tasks: string[]): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const taskList = tasks.slice(0, 2).join('\n• ');
      const moreText = tasks.length > 2 ? `\n...and ${tasks.length - 2} more` : '';

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `⚠️ ${count} Overdue Tasks`,
          body: `Please review:\n• ${taskList}${moreText}`,
          data: { type: 'overdue-tasks' },
        },
        trigger: null,
      });

      console.log('[Notification] Overdue notification sent');
    } catch (error) {
      console.error('[Notification] Error sending overdue notification:', error);
    }
  }

  /**
   * Cancel notifications by tag/type
   */
  async cancelNotificationsByTag(tag: string): Promise<void> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const toCancel = scheduled
        .filter(n => n.content.data?.type === tag)
        .map(n => n.identifier);

      for (const id of toCancel) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }

      console.log(`[Notification] Cancelled ${toCancel.length} notifications with tag: ${tag}`);
    } catch (error) {
      console.error('[Notification] Error cancelling notifications:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('[Notification] All notifications cancelled');
    } catch (error) {
      console.error('[Notification] Error cancelling all notifications:', error);
    }
  }

  /**
   * Get scheduled notifications count
   */
  async getScheduledCount(): Promise<number> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      return scheduled.length;
    } catch (error) {
      console.error('[Notification] Error getting scheduled count:', error);
      return 0;
    }
  }

  /**
   * Setup notification listener
   */
  setupNotificationListener(
    onNotificationReceived: (notification: Notifications.Notification) => void
  ): void {
    Notifications.addNotificationReceivedListener(onNotificationReceived);
  }

  /**
   * Setup notification response listener (when user taps notification)
   */
  setupNotificationResponseListener(
    onNotificationResponse: (response: Notifications.NotificationResponse) => void
  ): void {
    Notifications.addNotificationResponseReceivedListener(onNotificationResponse);
  }
}

export const notificationService = new NotificationService();
