// src/components/dailyWorkStatus/DWSNotificationSettings.tsx
/**
 * Notification Settings for Daily Work Status
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { notificationService, NotificationConfig } from '../../services/notificationService';

export const DWSNotificationSettings: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [config, setConfig] = useState<NotificationConfig>({
    dailyReminderTime: '17:00',
    deadlineAlertDays: 2,
    enableStatusUpdates: true,
    enableDeadlineAlerts: true,
    enableDailyReminders: true,
  });
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    initializeNotifications();
    updateScheduledCount();
  }, []);

  const initializeNotifications = async () => {
    const enabled = await notificationService.initialize();
    setNotificationsEnabled(enabled);
  };

  const updateScheduledCount = async () => {
    const count = await notificationService.getScheduledCount();
    setScheduledCount(count);
  };

  const handleToggleDailyReminder = async (value: boolean) => {
    const newConfig = { ...config, enableDailyReminders: value };
    setConfig(newConfig);
    notificationService.updateConfig(newConfig);

    if (value) {
      await notificationService.scheduleDailyReminder();
      Alert.alert('Success', 'Daily reminder enabled');
    } else {
      await notificationService.cancelNotificationsByTag('daily-reminder');
      Alert.alert('Success', 'Daily reminder disabled');
    }
    updateScheduledCount();
  };

  const handleToggleDeadlineAlerts = (value: boolean) => {
    const newConfig = { ...config, enableDeadlineAlerts: value };
    setConfig(newConfig);
    notificationService.updateConfig(newConfig);
  };

  const handleToggleStatusUpdates = (value: boolean) => {
    const newConfig = { ...config, enableStatusUpdates: value };
    setConfig(newConfig);
    notificationService.updateConfig(newConfig);
  };

  const handleChangeReminderTime = (time: string) => {
    const newConfig = { ...config, dailyReminderTime: time };
    setConfig(newConfig);
    notificationService.updateConfig(newConfig);
    if (config.enableDailyReminders) {
      notificationService.scheduleDailyReminder();
      updateScheduledCount();
    }
  };

  const handleChangeDeadlineAlertDays = (days: number) => {
    const newConfig = { ...config, deadlineAlertDays: days };
    setConfig(newConfig);
    notificationService.updateConfig(newConfig);
  };

  const handleTestNotification = async () => {
    await notificationService.sendStatusUpdateNotification(
      'Test Project',
      'Test Activity',
      'System Test'
    );
    Alert.alert('Test Sent', 'Check your notifications!');
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to cancel all scheduled notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await notificationService.cancelAllNotifications();
            Alert.alert('Success', 'All notifications cleared');
            updateScheduledCount();
          },
        },
      ]
    );
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webNotice}>
          <MaterialCommunityIcons name="information" size={48} color="#FFC107" />
          <Text style={styles.webNoticeTitle}>Push Notifications Not Available on Web</Text>
          <Text style={styles.webNoticeText}>
            Push notifications are only available on iOS and Android devices.
            Please use the mobile app to enable notifications.
          </Text>
        </View>
      </View>
    );
  }

  if (!notificationsEnabled) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionNotice}>
          <MaterialCommunityIcons name="bell-off" size={48} color="#EF4444" />
          <Text style={styles.permissionTitle}>Notification Permission Required</Text>
          <Text style={styles.permissionText}>
            Please enable notifications in your device settings to receive alerts and reminders.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={initializeNotifications}>
            <Text style={styles.retryButtonText}>Retry Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="bell-ring" size={32} color={colors.ACTION_BLUE} />
        <Text style={styles.headerTitle}>Notification Settings</Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusText}>
          {scheduledCount} notification{scheduledCount !== 1 ? 's' : ''} scheduled
        </Text>
      </View>

      {/* Daily Reminder */}
      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <MaterialCommunityIcons name="clock-alert" size={24} color="#3B82F6" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Daily Reminder</Text>
              <Text style={styles.settingDescription}>
                Get reminded to submit your work status every day
              </Text>
            </View>
          </View>
          <Switch
            value={config.enableDailyReminders}
            onValueChange={handleToggleDailyReminder}
            trackColor={{ false: '#D1D5DB', true: colors.ACTION_BLUE }}
          />
        </View>

        {config.enableDailyReminders && (
          <View style={styles.subSetting}>
            <Text style={styles.subSettingLabel}>Reminder Time:</Text>
            <View style={styles.timeOptions}>
              {['09:00', '12:00', '15:00', '17:00', '18:00', '20:00'].map(time => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeOption,
                    config.dailyReminderTime === time && styles.timeOptionActive
                  ]}
                  onPress={() => handleChangeReminderTime(time)}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      config.dailyReminderTime === time && styles.timeOptionTextActive
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Deadline Alerts */}
      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <MaterialCommunityIcons name="calendar-alert" size={24} color="#F59E0B" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Deadline Alerts</Text>
              <Text style={styles.settingDescription}>
                Get notified when tasks are approaching their deadline
              </Text>
            </View>
          </View>
          <Switch
            value={config.enableDeadlineAlerts}
            onValueChange={handleToggleDeadlineAlerts}
            trackColor={{ false: '#D1D5DB', true: colors.ACTION_BLUE }}
          />
        </View>

        {config.enableDeadlineAlerts && (
          <View style={styles.subSetting}>
            <Text style={styles.subSettingLabel}>Alert Days Before:</Text>
            <View style={styles.timeOptions}>
              {[1, 2, 3, 5, 7].map(days => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.timeOption,
                    config.deadlineAlertDays === days && styles.timeOptionActive
                  ]}
                  onPress={() => handleChangeDeadlineAlertDays(days)}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      config.deadlineAlertDays === days && styles.timeOptionTextActive
                    ]}
                  >
                    {days}d
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Status Updates */}
      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <MaterialCommunityIcons name="bell" size={24} color="#10B981" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Status Update Notifications</Text>
              <Text style={styles.settingDescription}>
                Get notified when team members update task status
              </Text>
            </View>
          </View>
          <Switch
            value={config.enableStatusUpdates}
            onValueChange={handleToggleStatusUpdates}
            trackColor={{ false: '#D1D5DB', true: colors.ACTION_BLUE }}
          />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton} onPress={handleTestNotification}>
          <MaterialCommunityIcons name="bell-ring-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Send Test Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonDanger]}
          onPress={handleClearAll}
        >
          <MaterialCommunityIcons name="bell-cancel" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Clear All Scheduled</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
  },
  statusCard: {
    backgroundColor: '#E0F2FE',
    padding: spacing.md,
    margin: spacing.lg,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.ACTION_BLUE,
  },
  statusText: {
    fontSize: 14,
    color: '#0369A1',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 8,
    padding: spacing.md,
    ...Platform.select({
      web: { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    }),
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  subSetting: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  subSettingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: spacing.xs,
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  timeOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  timeOptionActive: {
    backgroundColor: colors.ACTION_BLUE,
    borderColor: colors.ACTION_BLUE,
  },
  timeOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  timeOptionTextActive: {
    color: '#FFFFFF',
  },
  actionsSection: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ACTION_BLUE,
    padding: spacing.md,
    borderRadius: 8,
    gap: spacing.xs,
  },
  actionButtonDanger: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  webNotice: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  webNoticeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  webNoticeText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 400,
  },
  permissionNotice: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 400,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.ACTION_BLUE,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
