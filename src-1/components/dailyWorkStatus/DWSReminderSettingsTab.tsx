// src/components/dailyWorkStatus/DWSReminderSettingsTab.tsx
/**
 * DWS Reminder Settings Tab
 * Configure email/SMS reminders for Daily Work Status
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { db } from '../../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface ReminderSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  targetDateReminders: {
    sevenDays: boolean;
    threeDays: boolean;
    oneDay: boolean;
    overdue: boolean;
  };
  statusUpdateReminder: {
    enabled: boolean;
    hoursThreshold: number;
  };
  dailySummary: {
    enabled: boolean;
    time: string; // "18:00"
    recipients: string[]; // email addresses
  };
  tomorrowActivities: {
    enabled: boolean;
    time: string; // "08:00"
    recipients: string[];
  };
  delayReport: {
    enabled: boolean;
    time: string; // "09:00"
    recipients: string[];
    frequency: 'daily' | 'weekly'; // daily or weekly
  };
  workloadDistribution: {
    enabled: boolean;
    time: string; // "17:00"
    recipients: string[];
    frequency: 'daily' | 'weekly' | 'monthly';
  };
  targetAchievement: {
    enabled: boolean;
    time: string; // "18:00"
    recipients: string[];
    frequency: 'weekly' | 'monthly';
  };
  statusConversion: {
    enabled: boolean;
    time: string; // "18:00"
    recipients: string[];
    frequency: 'daily' | 'weekly' | 'monthly';
  };
  contributionReport: {
    enabled: boolean;
    time: string; // "18:00"
    recipients: string[];
    frequency: 'weekly' | 'monthly';
  };
  testMode: boolean;
}

const DEFAULT_SETTINGS: ReminderSettings = {
  emailEnabled: true,
  smsEnabled: false,
  targetDateReminders: {
    sevenDays: true,
    threeDays: true,
    oneDay: true,
    overdue: true,
  },
  statusUpdateReminder: {
    enabled: true,
    hoursThreshold: 24,
  },
  dailySummary: {
    enabled: true,
    time: '18:00',
    recipients: [],
  },
  tomorrowActivities: {
    enabled: false,
    time: '08:00',
    recipients: [],
  },
  delayReport: {
    enabled: false,
    time: '09:00',
    recipients: [],
    frequency: 'daily',
  },
  workloadDistribution: {
    enabled: false,
    time: '17:00',
    recipients: [],
    frequency: 'weekly',
  },
  targetAchievement: {
    enabled: false,
    time: '18:00',
    recipients: [],
    frequency: 'monthly',
  },
  statusConversion: {
    enabled: false,
    time: '18:00',
    recipients: [],
    frequency: 'weekly',
  },
  contributionReport: {
    enabled: false,
    time: '18:00',
    recipients: [],
    frequency: 'monthly',
  },
  testMode: false,
};

export const DWSReminderSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [newTomorrowRecipient, setNewTomorrowRecipient] = useState('');
  const [newDelayRecipient, setNewDelayRecipient] = useState('');
  const [newWorkloadRecipient, setNewWorkloadRecipient] = useState('');
  const [newTargetRecipient, setNewTargetRecipient] = useState('');
  const [newStatusRecipient, setNewStatusRecipient] = useState('');
  const [newContributionRecipient, setNewContributionRecipient] = useState('');

  // Load settings from Firestore
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'appSettings', 'dwsReminders');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSettings({ ...DEFAULT_SETTINGS, ...docSnap.data() as ReminderSettings });
      }
    } catch (error) {
      console.error('[DWS Reminders] Error loading settings:', error);
      Alert.alert('Error', 'Failed to load reminder settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const docRef = doc(db, 'appSettings', 'dwsReminders');
      await setDoc(docRef, settings);
      Alert.alert('Success', 'Reminder settings saved successfully');
    } catch (error) {
      console.error('[DWS Reminders] Error saving settings:', error);
      Alert.alert('Error', 'Failed to save reminder settings');
    } finally {
      setSaving(false);
    }
  };

  const addRecipient = () => {
    const email = newRecipient.trim();
    if (!email) return;
    
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (settings.dailySummary.recipients.includes(email)) {
      Alert.alert('Duplicate', 'This email is already added');
      return;
    }

    setSettings(prev => ({
      ...prev,
      dailySummary: {
        ...prev.dailySummary,
        recipients: [...prev.dailySummary.recipients, email]
      }
    }));
    setNewRecipient('');
  };

  const removeRecipient = (email: string) => {
    setSettings(prev => ({
      ...prev,
      dailySummary: {
        ...prev.dailySummary,
        recipients: prev.dailySummary.recipients.filter(r => r !== email)
      }
    }));
  };

  const testReminders = async () => {
    console.log('[DWS] Test button clicked!');
    
    // Get the first recipient email or prompt for one
    const testEmail = settings.dailySummary.recipients[0] || newRecipient;
    
    console.log('[DWS] Test email:', testEmail);
    console.log('[DWS] Recipients:', settings.dailySummary.recipients);
    
    if (!testEmail) {
      if (window.confirm) {
        window.alert('No Email - Please enter an email address in the recipients section first');
      } else {
        Alert.alert('No Email', 'Please enter an email address in the recipients section first');
      }
      return;
    }

    // Use window.confirm for web compatibility
    const confirmed = window.confirm ? 
      window.confirm(`Send a test email to ${testEmail}?`) :
      true;
    
    if (!confirmed && !window.confirm) {
      Alert.alert(
        'Send Test Email',
        `Send a test email to ${testEmail}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Send', onPress: () => sendTestEmailNow(testEmail) }
        ]
      );
      return;
    }
    
    if (confirmed) {
      await sendTestEmailNow(testEmail);
    }
  };

  const sendTestEmailNow = async (testEmail: string) => {
    try {
      console.log('[DWS] Attempting to send email...');
      
      // For now, show instructions to use the terminal script
      // until Cloud Functions CORS issues are resolved
      if (window.alert) {
        window.alert(
          `✉️ Send Test Email\n\n` +
          `To send a test email, please run this command in your terminal:\n\n` +
          `node test-email-direct.js ${testEmail}\n\n` +
          `The Cloud Functions deployment is having CORS issues.\n` +
          `The terminal script works perfectly and will send the email immediately.`
        );
      } else {
        Alert.alert(
          '✉️ Send Test Email',
          `To send a test email, run this command in terminal:\n\nnode test-email-direct.js ${testEmail}`
        );
      }
    } catch (error: any) {
      console.error('[DWS] Test email error:', error);
      if (window.alert) {
        window.alert(`Error: ${error.message}`);
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  const handleDeploy = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Not Available', 'Deployment is only available on web platform.');
      return;
    }

    const confirmed = window.confirm(
      '🚀 Deploy to GitHub Pages?\n\n' +
      'This will guide you through deploying your changes.\n\n' +
      'Continue?'
    );

    if (!confirmed) return;

    window.alert(
      '🚀 DEPLOYMENT INSTRUCTIONS\n\n' +
      '══════════════════════════════\n' +
      'QUICK DEPLOY:\n' +
      '══════════════════════════════\n\n' +
      '1. Open PowerShell in:\n' +
      '   E:\\prashant\\APP_PILOT PROJECT\n\n' +
      '2. Run:\n' +
      '   .\\deploy-web.ps1\n\n' +
      'The script will automatically:\n' +
      '  • Build web app\n' +
      '  • Copy to web-build folder\n' +
      '  • Fix _expo paths (CRITICAL!)\n' +
      '  • Add .nojekyll file\n' +
      '  • Commit & push to GitHub\n\n' +
      '✅ Deployment: ~1 minute\n' +
      '🔄 Clear browser cache after: Ctrl+Shift+R\n\n' +
      '🌐 Live site:\n' +
      'https://prashantakashe.github.io/pilotappra/'
    );

    try {
      const deployCommand = '.\\deploy-web.ps1';
      await navigator.clipboard.writeText(deployCommand);
      window.alert('✅ Deploy command copied to clipboard!');
    } catch (e) {
      // Clipboard API might not be available
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ Reminder Settings</Text>
        <Text style={styles.subtitle}>
          Configure automatic email and SMS notifications for Daily Work Status
        </Text>
      </View>

      {/* Notification Channels */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📧 Notification Channels</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingText}>Email Notifications</Text>
            <Text style={styles.settingDescription}>Send reminders via email</Text>
          </View>
          <Switch
            value={settings.emailEnabled}
            onValueChange={(value) => setSettings(prev => ({ ...prev, emailEnabled: value }))}
            trackColor={{ false: '#D1D5DB', true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingText}>SMS Notifications</Text>
            <Text style={styles.settingDescription}>Send reminders via SMS (requires Twilio)</Text>
          </View>
          <Switch
            value={settings.smsEnabled}
            onValueChange={(value) => setSettings(prev => ({ ...prev, smsEnabled: value }))}
            trackColor={{ false: '#D1D5DB', true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Target Date Reminders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Target Date Reminders</Text>
        <Text style={styles.sectionDescription}>
          Send reminders before target dates approach
        </Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingText}>7 days before</Text>
          <Switch
            value={settings.targetDateReminders.sevenDays}
            onValueChange={(value) => setSettings(prev => ({
              ...prev,
              targetDateReminders: { ...prev.targetDateReminders, sevenDays: value }
            }))}
            trackColor={{ false: '#D1D5DB', true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingText}>3 days before</Text>
          <Switch
            value={settings.targetDateReminders.threeDays}
            onValueChange={(value) => setSettings(prev => ({
              ...prev,
              targetDateReminders: { ...prev.targetDateReminders, threeDays: value }
            }))}
            trackColor={{ false: '#D1D5DB', true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingText}>1 day before</Text>
          <Switch
            value={settings.targetDateReminders.oneDay}
            onValueChange={(value) => setSettings(prev => ({
              ...prev,
              targetDateReminders: { ...prev.targetDateReminders, oneDay: value }
            }))}
            trackColor={{ false: '#D1D5DB', true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Overdue alerts</Text>
          <Switch
            value={settings.targetDateReminders.overdue}
            onValueChange={(value) => setSettings(prev => ({
              ...prev,
              targetDateReminders: { ...prev.targetDateReminders, overdue: value }
            }))}
            trackColor={{ false: '#D1D5DB', true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Status Update Reminders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Status Update Reminders</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingText}>Enable status reminders</Text>
            <Text style={styles.settingDescription}>
              Remind when no update for {settings.statusUpdateReminder.hoursThreshold}+ hours
            </Text>
          </View>
          <Switch
            value={settings.statusUpdateReminder.enabled}
            onValueChange={(value) => setSettings(prev => ({
              ...prev,
              statusUpdateReminder: { ...prev.statusUpdateReminder, enabled: value }
            }))}
            trackColor={{ false: '#D1D5DB', true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {settings.statusUpdateReminder.enabled && (
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Hours threshold:</Text>
            <TextInput
              style={styles.numberInput}
              value={settings.statusUpdateReminder.hoursThreshold.toString()}
              onChangeText={(text) => {
                const hours = parseInt(text) || 24;
                setSettings(prev => ({
                  ...prev,
                  statusUpdateReminder: { ...prev.statusUpdateReminder, hoursThreshold: hours }
                }));
              }}
              keyboardType="number-pad"
              maxLength={3}
            />
            <Text style={styles.inputUnit}>hours</Text>
          </View>
        )}
      </View>

      {/* Daily Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Daily Summary Report</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingText}>Enable daily summary</Text>
            <Text style={styles.settingDescription}>Send end-of-day summary to managers</Text>
          </View>
          <Switch
            value={settings.dailySummary.enabled}
            onValueChange={(value) => setSettings(prev => ({
              ...prev,
              dailySummary: { ...prev.dailySummary, enabled: value }
            }))}
            trackColor={{ false: '#D1D5DB', true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {settings.dailySummary.enabled && (
          <>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Send at:</Text>
              <TextInput
                style={styles.timeInput}
                value={settings.dailySummary.time}
                onChangeText={(text) => setSettings(prev => ({
                  ...prev,
                  dailySummary: { ...prev.dailySummary, time: text }
                }))}
                placeholder="18:00"
                maxLength={5}
              />
              <Text style={styles.inputUnit}>(24-hour format)</Text>
            </View>

            <View style={styles.recipientsSection}>
              <Text style={styles.recipientsTitle}>Recipients:</Text>
              
              {settings.dailySummary.recipients.map((email, index) => (
                <View key={index} style={styles.recipientRow}>
                  <Text style={styles.recipientEmail}>{email}</Text>
                  <TouchableOpacity onPress={() => removeRecipient(email)}>
                    <Text style={styles.removeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.addRecipientRow}>
                <TextInput
                  style={styles.emailInput}
                  value={newRecipient}
                  onChangeText={setNewRecipient}
                  placeholder="manager@company.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onSubmitEditing={addRecipient}
                />
                <TouchableOpacity style={styles.addButton} onPress={addRecipient}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Automated Reports Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Automated Reports</Text>
        <Text style={styles.sectionDescription}>
          Configure automatic report generation and delivery
        </Text>

        {/* Daily Work Summary */}
        <View style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportTitle}>📋 Daily Work Summary</Text>
            <Switch
              value={settings.dailySummary.enabled}
              onValueChange={(value) => setSettings(prev => ({
                ...prev,
                dailySummary: { ...prev.dailySummary, enabled: value }
              }))}
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          {settings.dailySummary.enabled && (
            <View>
              <Text style={styles.reportDescription}>
                Daily summary of all activities, status updates, and progress.
              </Text>
              
              {/* Send Time */}
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Send Time (24hr format):</Text>
                <TextInput
                  style={styles.timeInput}
                  value={settings.dailySummary.time}
                  onChangeText={(value) => setSettings(prev => ({
                    ...prev,
                    dailySummary: { ...prev.dailySummary, time: value }
                  }))}
                  placeholder="18:00"
                  maxLength={5}
                />
              </View>
              
              {/* Recipients */}
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Recipients:</Text>
                <View style={styles.recipientsContainer}>
                  {settings.dailySummary.recipients.map((email, idx) => (
                    <View key={idx} style={styles.recipientChip}>
                      <Text style={styles.recipientText}>{email}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setSettings(prev => ({
                            ...prev,
                            dailySummary: {
                              ...prev.dailySummary,
                              recipients: prev.dailySummary.recipients.filter((_, i) => i !== idx)
                            }
                          }));
                        }}
                      >
                        <Text style={styles.removeRecipient}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
              
              {/* Add Recipient */}
              <View style={styles.settingRow}>
                <TextInput
                  style={styles.recipientInput}
                  value={newRecipient}
                  onChangeText={setNewRecipient}
                  placeholder="Enter email and press Add"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.addRecipientButton}
                  onPress={() => {
                    if (newRecipient.trim() && newRecipient.includes('@')) {
                      setSettings(prev => ({
                        ...prev,
                        dailySummary: {
                          ...prev.dailySummary,
                          recipients: [...prev.dailySummary.recipients, newRecipient.trim()]
                        }
                      }));
                      setNewRecipient('');
                    } else {
                      Alert.alert('Invalid Email', 'Please enter a valid email address');
                    }
                  }}
                >
                  <Text style={styles.addRecipientText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Tomorrow's Activities */}
        <View style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportTitle}>🌅 Tomorrow's Start Activities</Text>
            <Switch
              value={settings.tomorrowActivities.enabled}
              onValueChange={(value) => setSettings(prev => ({
                ...prev,
                tomorrowActivities: { ...prev.tomorrowActivities, enabled: value }
              }))}
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          {settings.tomorrowActivities.enabled && (
            <View>
              <Text style={styles.reportDescription}>
                Shows activities scheduled to start tomorrow and ongoing activities requiring attention.
              </Text>
              
              {/* Send Time */}
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Send Time (24hr format):</Text>
                <TextInput
                  style={styles.timeInput}
                  value={settings.tomorrowActivities.time}
                  onChangeText={(value) => setSettings(prev => ({
                    ...prev,
                    tomorrowActivities: { ...prev.tomorrowActivities, time: value }
                  }))}
                  placeholder="08:00"
                  maxLength={5}
                />
              </View>
              
              {/* Recipients */}
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Recipients:</Text>
                <View style={styles.recipientsContainer}>
                  {settings.tomorrowActivities.recipients.map((email, idx) => (
                    <View key={idx} style={styles.recipientChip}>
                      <Text style={styles.recipientText}>{email}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setSettings(prev => ({
                            ...prev,
                            tomorrowActivities: {
                              ...prev.tomorrowActivities,
                              recipients: prev.tomorrowActivities.recipients.filter((_, i) => i !== idx)
                            }
                          }));
                        }}
                      >
                        <Text style={styles.removeRecipient}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
              
              {/* Add Recipient */}
              <View style={styles.settingRow}>
                <TextInput
                  style={styles.recipientInput}
                  value={newTomorrowRecipient}
                  onChangeText={setNewTomorrowRecipient}
                  placeholder="Enter email and press Add"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.addRecipientButton}
                  onPress={() => {
                    if (newTomorrowRecipient.trim() && newTomorrowRecipient.includes('@')) {
                      setSettings(prev => ({
                        ...prev,
                        tomorrowActivities: {
                          ...prev.tomorrowActivities,
                          recipients: [...prev.tomorrowActivities.recipients, newTomorrowRecipient.trim()]
                        }
                      }));
                      setNewTomorrowRecipient('');
                    } else {
                      Alert.alert('Invalid Email', 'Please enter a valid email address');
                    }
                  }}
                >
                  <Text style={styles.addRecipientText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Delay Report */}
        <View style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportTitle}>⚠️ Delay Report</Text>
            <Switch
              value={settings.delayReport.enabled}
              onValueChange={(value) => setSettings(prev => ({
                ...prev,
                delayReport: { ...prev.delayReport, enabled: value }
              }))}
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          {settings.delayReport.enabled && (
            <View>
              <Text style={styles.reportDescription}>
                Activities past target dates or at risk of delays.
              </Text>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Send Time:</Text>
                <TextInput
                  style={styles.timeInput}
                  value={settings.delayReport.time}
                  onChangeText={(value) => setSettings(prev => ({
                    ...prev,
                    delayReport: { ...prev.delayReport, time: value }
                  }))}
                  placeholder="09:00"
                  maxLength={5}
                />
                <Text style={styles.settingLabel}>Frequency:</Text>
                <View style={styles.frequencyButtons}>
                  <TouchableOpacity
                    style={[styles.frequencyBtn, settings.delayReport.frequency === 'daily' && styles.frequencyBtnActive]}
                    onPress={() => setSettings(prev => ({
                      ...prev,
                      delayReport: { ...prev.delayReport, frequency: 'daily' }
                    }))}
                  >
                    <Text style={[styles.frequencyBtnText, settings.delayReport.frequency === 'daily' && styles.frequencyBtnTextActive]}>Daily</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.frequencyBtn, settings.delayReport.frequency === 'weekly' && styles.frequencyBtnActive]}
                    onPress={() => setSettings(prev => ({
                      ...prev,
                      delayReport: { ...prev.delayReport, frequency: 'weekly' }
                    }))}
                  >
                    <Text style={[styles.frequencyBtnText, settings.delayReport.frequency === 'weekly' && styles.frequencyBtnTextActive]}>Weekly</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Recipients:</Text>
                <View style={styles.recipientsContainer}>
                  {settings.delayReport.recipients.map((email, idx) => (
                    <View key={idx} style={styles.recipientChip}>
                      <Text style={styles.recipientText}>{email}</Text>
                      <TouchableOpacity onPress={() => {
                        setSettings(prev => ({
                          ...prev,
                          delayReport: {
                            ...prev.delayReport,
                            recipients: prev.delayReport.recipients.filter((_, i) => i !== idx)
                          }
                        }));
                      }}>
                        <Text style={styles.removeRecipient}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={styles.settingRow}>
                <TextInput
                  style={styles.recipientInput}
                  value={newDelayRecipient}
                  onChangeText={setNewDelayRecipient}
                  placeholder="Enter email and press Add"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.addRecipientButton}
                  onPress={() => {
                    if (newDelayRecipient.trim() && newDelayRecipient.includes('@')) {
                      setSettings(prev => ({
                        ...prev,
                        delayReport: {
                          ...prev.delayReport,
                          recipients: [...prev.delayReport.recipients, newDelayRecipient.trim()]
                        }
                      }));
                      setNewDelayRecipient('');
                    } else {
                      Alert.alert('Invalid Email', 'Please enter a valid email address');
                    }
                  }}
                >
                  <Text style={styles.addRecipientText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Workload Distribution */}
        <View style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportTitle}>👥 Workload Distribution</Text>
            <Switch
              value={settings.workloadDistribution.enabled}
              onValueChange={(value) => setSettings(prev => ({
                ...prev,
                workloadDistribution: { ...prev.workloadDistribution, enabled: value }
              }))}
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          {settings.workloadDistribution.enabled && (
            <View>
              <Text style={styles.reportDescription}>
                Personnel workload analysis and activity distribution.
              </Text>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Send Time:</Text>
                <TextInput
                  style={styles.timeInput}
                  value={settings.workloadDistribution.time}
                  onChangeText={(value) => setSettings(prev => ({
                    ...prev,
                    workloadDistribution: { ...prev.workloadDistribution, time: value }
                  }))}
                  placeholder="17:00"
                  maxLength={5}
                />
                <Text style={styles.settingLabel}>Frequency:</Text>
                <View style={styles.frequencyButtons}>
                  <TouchableOpacity
                    style={[styles.frequencyBtn, settings.workloadDistribution.frequency === 'daily' && styles.frequencyBtnActive]}
                    onPress={() => setSettings(prev => ({
                      ...prev,
                      workloadDistribution: { ...prev.workloadDistribution, frequency: 'daily' }
                    }))}
                  >
                    <Text style={[styles.frequencyBtnText, settings.workloadDistribution.frequency === 'daily' && styles.frequencyBtnTextActive]}>Daily</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.frequencyBtn, settings.workloadDistribution.frequency === 'weekly' && styles.frequencyBtnActive]}
                    onPress={() => setSettings(prev => ({
                      ...prev,
                      workloadDistribution: { ...prev.workloadDistribution, frequency: 'weekly' }
                    }))}
                  >
                    <Text style={[styles.frequencyBtnText, settings.workloadDistribution.frequency === 'weekly' && styles.frequencyBtnTextActive]}>Weekly</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.frequencyBtn, settings.workloadDistribution.frequency === 'monthly' && styles.frequencyBtnActive]}
                    onPress={() => setSettings(prev => ({
                      ...prev,
                      workloadDistribution: { ...prev.workloadDistribution, frequency: 'monthly' }
                    }))}
                  >
                    <Text style={[styles.frequencyBtnText, settings.workloadDistribution.frequency === 'monthly' && styles.frequencyBtnTextActive]}>Monthly</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Recipients:</Text>
                <View style={styles.recipientsContainer}>
                  {settings.workloadDistribution.recipients.map((email, idx) => (
                    <View key={idx} style={styles.recipientChip}>
                      <Text style={styles.recipientText}>{email}</Text>
                      <TouchableOpacity onPress={() => {
                        setSettings(prev => ({
                          ...prev,
                          workloadDistribution: {
                            ...prev.workloadDistribution,
                            recipients: prev.workloadDistribution.recipients.filter((_, i) => i !== idx)
                          }
                        }));
                      }}>
                        <Text style={styles.removeRecipient}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={styles.settingRow}>
                <TextInput
                  style={styles.recipientInput}
                  value={newWorkloadRecipient}
                  onChangeText={setNewWorkloadRecipient}
                  placeholder="Enter email and press Add"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.addRecipientButton}
                  onPress={() => {
                    if (newWorkloadRecipient.trim() && newWorkloadRecipient.includes('@')) {
                      setSettings(prev => ({
                        ...prev,
                        workloadDistribution: {
                          ...prev.workloadDistribution,
                          recipients: [...prev.workloadDistribution.recipients, newWorkloadRecipient.trim()]
                        }
                      }));
                      setNewWorkloadRecipient('');
                    } else {
                      Alert.alert('Invalid Email', 'Please enter a valid email address');
                    }
                  }}
                >
                  <Text style={styles.addRecipientText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Target Achievement Report */}
        <View style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportTitle}>🎯 Target Achievement</Text>
            <Switch
              value={settings.targetAchievement.enabled}
              onValueChange={(value) => setSettings(prev => ({
                ...prev,
                targetAchievement: { ...prev.targetAchievement, enabled: value }
              }))}
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          {settings.targetAchievement.enabled && (
            <View>
              <Text style={styles.reportDescription}>
                Project-wise target completion and achievement rates.
              </Text>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Send Time:</Text>
                <TextInput
                  style={styles.timeInput}
                  value={settings.targetAchievement.time}
                  onChangeText={(value) => setSettings(prev => ({
                    ...prev,
                    targetAchievement: { ...prev.targetAchievement, time: value }
                  }))}
                  placeholder="18:00"
                  maxLength={5}
                />
                <Text style={styles.settingLabel}>Frequency:</Text>
                <View style={styles.frequencyButtons}>
                  <TouchableOpacity
                    style={[styles.frequencyBtn, settings.targetAchievement.frequency === 'weekly' && styles.frequencyBtnActive]}
                    onPress={() => setSettings(prev => ({
                      ...prev,
                      targetAchievement: { ...prev.targetAchievement, frequency: 'weekly' }
                    }))}
                  >
                    <Text style={[styles.frequencyBtnText, settings.targetAchievement.frequency === 'weekly' && styles.frequencyBtnTextActive]}>Weekly</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.frequencyBtn, settings.targetAchievement.frequency === 'monthly' && styles.frequencyBtnActive]}
                    onPress={() => setSettings(prev => ({
                      ...prev,
                      targetAchievement: { ...prev.targetAchievement, frequency: 'monthly' }
                    }))}
                  >
                    <Text style={[styles.frequencyBtnText, settings.targetAchievement.frequency === 'monthly' && styles.frequencyBtnTextActive]}>Monthly</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Recipients:</Text>
                <View style={styles.recipientsContainer}>
                  {settings.targetAchievement.recipients.map((email, idx) => (
                    <View key={idx} style={styles.recipientChip}>
                      <Text style={styles.recipientText}>{email}</Text>
                      <TouchableOpacity onPress={() => {
                        setSettings(prev => ({
                          ...prev,
                          targetAchievement: {
                            ...prev.targetAchievement,
                            recipients: prev.targetAchievement.recipients.filter((_, i) => i !== idx)
                          }
                        }));
                      }}>
                        <Text style={styles.removeRecipient}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={styles.settingRow}>
                <TextInput
                  style={styles.recipientInput}
                  value={newTargetRecipient}
                  onChangeText={setNewTargetRecipient}
                  placeholder="Enter email and press Add"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.addRecipientButton}
                  onPress={() => {
                    if (newTargetRecipient.trim() && newTargetRecipient.includes('@')) {
                      setSettings(prev => ({
                        ...prev,
                        targetAchievement: {
                          ...prev.targetAchievement,
                          recipients: [...prev.targetAchievement.recipients, newTargetRecipient.trim()]
                        }
                      }));
                      setNewTargetRecipient('');
                    } else {
                      Alert.alert('Invalid Email', 'Please enter a valid email address');
                    }
                  }}
                >
                  <Text style={styles.addRecipientText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Status Conversion Report */}
        <View style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportTitle}>🔄 Status Conversion</Text>
            <Switch
              value={settings.statusConversion.enabled}
              onValueChange={(value) => setSettings(prev => ({
                ...prev,
                statusConversion: { ...prev.statusConversion, enabled: value }
              }))}
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          {settings.statusConversion.enabled && (
            <View>
              <Text style={styles.reportDescription}>
                Track how activities progress through different statuses.
              </Text>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Send Time:</Text>
                <TextInput
                  style={styles.timeInput}
                  value={settings.statusConversion.time}
                  onChangeText={(value) => setSettings(prev => ({
                    ...prev,
                    statusConversion: { ...prev.statusConversion, time: value }
                  }))}
                  placeholder="18:00"
                  maxLength={5}
                />
                <Text style={styles.settingLabel}>Frequency:</Text>
                <View style={styles.frequencyButtons}>
                  <TouchableOpacity
                    style={[styles.frequencyBtn, settings.statusConversion.frequency === 'daily' && styles.frequencyBtnActive]}
                    onPress={() => setSettings(prev => ({
                      ...prev,
                      statusConversion: { ...prev.statusConversion, frequency: 'daily' }
                    }))}
                  >
                    <Text style={[styles.frequencyBtnText, settings.statusConversion.frequency === 'daily' && styles.frequencyBtnTextActive]}>Daily</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.frequencyBtn, settings.statusConversion.frequency === 'weekly' && styles.frequencyBtnActive]}
                    onPress={() => setSettings(prev => ({
                      ...prev,
                      statusConversion: { ...prev.statusConversion, frequency: 'weekly' }
                    }))}
                  >
                    <Text style={[styles.frequencyBtnText, settings.statusConversion.frequency === 'weekly' && styles.frequencyBtnTextActive]}>Weekly</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.frequencyBtn, settings.statusConversion.frequency === 'monthly' && styles.frequencyBtnActive]}
                    onPress={() => setSettings(prev => ({
                      ...prev,
                      statusConversion: { ...prev.statusConversion, frequency: 'monthly' }
                    }))}
                  >
                    <Text style={[styles.frequencyBtnText, settings.statusConversion.frequency === 'monthly' && styles.frequencyBtnTextActive]}>Monthly</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Recipients:</Text>
                <View style={styles.recipientsContainer}>
                  {settings.statusConversion.recipients.map((email, idx) => (
                    <View key={idx} style={styles.recipientChip}>
                      <Text style={styles.recipientText}>{email}</Text>
                      <TouchableOpacity onPress={() => {
                        setSettings(prev => ({
                          ...prev,
                          statusConversion: {
                            ...prev.statusConversion,
                            recipients: prev.statusConversion.recipients.filter((_, i) => i !== idx)
                          }
                        }));
                      }}>
                        <Text style={styles.removeRecipient}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={styles.settingRow}>
                <TextInput
                  style={styles.recipientInput}
                  value={newStatusRecipient}
                  onChangeText={setNewStatusRecipient}
                  placeholder="Enter email and press Add"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.addRecipientButton}
                  onPress={() => {
                    if (newStatusRecipient.trim() && newStatusRecipient.includes('@')) {
                      setSettings(prev => ({
                        ...prev,
                        statusConversion: {
                          ...prev.statusConversion,
                          recipients: [...prev.statusConversion.recipients, newStatusRecipient.trim()]
                        }
                      }));
                      setNewStatusRecipient('');
                    } else {
                      Alert.alert('Invalid Email', 'Please enter a valid email address');
                    }
                  }}
                >
                  <Text style={styles.addRecipientText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Contribution Report */}
        <View style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportTitle}>⭐ Contribution Report</Text>
            <Switch
              value={settings.contributionReport.enabled}
              onValueChange={(value) => setSettings(prev => ({
                ...prev,
                contributionReport: { ...prev.contributionReport, enabled: value }
              }))}
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          {settings.contributionReport.enabled && (
            <View>
              <Text style={styles.reportDescription}>
                Individual personnel contributions and productivity metrics.
              </Text>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Send Time:</Text>
                <TextInput
                  style={styles.timeInput}
                  value={settings.contributionReport.time}
                  onChangeText={(value) => setSettings(prev => ({
                    ...prev,
                    contributionReport: { ...prev.contributionReport, time: value }
                  }))}
                  placeholder="18:00"
                  maxLength={5}
                />
                <Text style={styles.settingLabel}>Frequency:</Text>
                <View style={styles.frequencyButtons}>
                  <TouchableOpacity
                    style={[styles.frequencyBtn, settings.contributionReport.frequency === 'weekly' && styles.frequencyBtnActive]}
                    onPress={() => setSettings(prev => ({
                      ...prev,
                      contributionReport: { ...prev.contributionReport, frequency: 'weekly' }
                    }))}
                  >
                    <Text style={[styles.frequencyBtnText, settings.contributionReport.frequency === 'weekly' && styles.frequencyBtnTextActive]}>Weekly</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.frequencyBtn, settings.contributionReport.frequency === 'monthly' && styles.frequencyBtnActive]}
                    onPress={() => setSettings(prev => ({
                      ...prev,
                      contributionReport: { ...prev.contributionReport, frequency: 'monthly' }
                    }))}
                  >
                    <Text style={[styles.frequencyBtnText, settings.contributionReport.frequency === 'monthly' && styles.frequencyBtnTextActive]}>Monthly</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Recipients:</Text>
                <View style={styles.recipientsContainer}>
                  {settings.contributionReport.recipients.map((email, idx) => (
                    <View key={idx} style={styles.recipientChip}>
                      <Text style={styles.recipientText}>{email}</Text>
                      <TouchableOpacity onPress={() => {
                        setSettings(prev => ({
                          ...prev,
                          contributionReport: {
                            ...prev.contributionReport,
                            recipients: prev.contributionReport.recipients.filter((_, i) => i !== idx)
                          }
                        }));
                      }}>
                        <Text style={styles.removeRecipient}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={styles.settingRow}>
                <TextInput
                  style={styles.recipientInput}
                  value={newContributionRecipient}
                  onChangeText={setNewContributionRecipient}
                  placeholder="Enter email and press Add"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.addRecipientButton}
                  onPress={() => {
                    if (newContributionRecipient.trim() && newContributionRecipient.includes('@')) {
                      setSettings(prev => ({
                        ...prev,
                        contributionReport: {
                          ...prev.contributionReport,
                          recipients: [...prev.contributionReport.recipients, newContributionRecipient.trim()]
                        }
                      }));
                      setNewContributionRecipient('');
                    } else {
                      Alert.alert('Invalid Email', 'Please enter a valid email address');
                    }
                  }}
                >
                  <Text style={styles.addRecipientText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]} 
          onPress={saveSettings}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>💾 Save Settings</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.testButton]} 
          onPress={testReminders}
        >
          <Text style={styles.testButtonText}>🧪 Send Test Reminder</Text>
        </TouchableOpacity>

        {Platform.OS === 'web' && (
          <TouchableOpacity 
            style={[styles.button, styles.deployButton]} 
            onPress={handleDeploy}
          >
            <Text style={styles.deployButtonText}>🚀 Deploy Changes to Web</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ Setup Status</Text>
        <Text style={styles.infoText}>
          • Email Extension: {settings.emailEnabled ? '✅ Enabled' : '❌ Disabled'}
        </Text>
        <Text style={styles.infoText}>
          • SMS Service: {settings.smsEnabled ? '✅ Configured' : '⚠️ Not configured'}
        </Text>
        <Text style={styles.infoText}>
          • Cloud Functions: Check Firebase Console
        </Text>
        <Text style={styles.infoText}>
          • Reminders run daily at 8:00 AM IST
        </Text>
        <Text style={styles.infoText}>
          • Summary sends at {settings.dailySummary.time} IST
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLabel: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: typography.weights.medium as any,
  },
  settingDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputLabel: {
    fontSize: typography.sizes.md,
    color: colors.text,
    marginRight: spacing.md,
    fontWeight: typography.weights.medium as any,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: spacing.sm,
    width: 80,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: spacing.sm,
    width: 100,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
  inputUnit: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  recipientsSection: {
    marginTop: spacing.md,
  },
  recipientsTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as any,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  recipientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  recipientEmail: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  removeButton: {
    fontSize: 20,
    color: colors.error,
    fontWeight: typography.weights.bold as any,
    padding: spacing.xs,
  },
  addRecipientRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  emailInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    marginRight: spacing.sm,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
  },
  actions: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  button: {
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
  },
  testButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  testButtonText: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as any,
  },
  deployButton: {
    backgroundColor: '#10B981',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  deployButtonText: {
    color: '#fff',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reportTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
  },
  reportStatus: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium as any,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  reportDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  settingRow: {
    marginTop: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 4,
    width: '100%'
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    width: 100
  },
  recipientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    width: '100%'
  },
  recipientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6
  },
  recipientText: {
    fontSize: 12,
    color: colors.primary
  },
  removeRecipient: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 4
  },
  recipientInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    minWidth: 200
  },
  addRecipientButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6
  },
  addRecipientText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8
  },
  frequencyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff'
  },
  frequencyBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  frequencyBtnText: {
    fontSize: 12,
    color: colors.TEXT_PRIMARY,
    fontWeight: '500'
  },
  frequencyBtnTextActive: {
    color: '#fff',
    fontWeight: '600'
  }
});
