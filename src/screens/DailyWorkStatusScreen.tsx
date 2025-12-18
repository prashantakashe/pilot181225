// src/screens/DailyWorkStatusScreen.tsx
import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { AppLayout } from '../components/AppLayout';
import { getFilteredDWSNav } from '../constants/sidebarMenus';
import { userService } from '../services/userService';
import { dailyWorkStatusService } from '../services/dailyWorkStatusService';
import { getUserRole } from '../utils/permissions';
import type { DWSPersonnel } from '../types/dailyWorkStatus';
import {
  DWSMasterDataTab,
  DWSDailyEntryTab,
  DWSReportTab,
  DWSDashboardTab,
  DWSUserManagementTab,
  DWSReminderSettingsTab
} from '../components/dailyWorkStatus';
import { DWSNotificationSettings } from '../components/dailyWorkStatus/DWSNotificationSettings';

type DWSTab = 'DWSMaster' | 'DWSDaily' | 'DWSReport' | 'DWSDashboard' | 'DWSUsers' | 'DWSReminders' | 'DWSNotifications';
type SystemRole = 'Super Admin' | 'Admin' | 'Manager' | 'Engineer' | null;

interface DailyWorkStatusScreenProps {
  navigation: any;
}

/**
 * DailyWorkStatusScreen - Daily Work Status module main screen
 * Contains all sub-modules: Master Data, Daily Entry, Report, Dashboard, User Management
 */
const DailyWorkStatusScreen: React.FC<DailyWorkStatusScreenProps> = ({ navigation }) => {
  const [userName, setUserName] = useState('User');
  const [activeTab, setActiveTab] = useState<DWSTab>('DWSDashboard');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [masterSubTab, setMasterSubTab] = useState<string>('');
  const [userRole, setUserRole] = useState<SystemRole>(null);
  const [personnel, setPersonnel] = useState<DWSPersonnel[]>([]);
  const { user, signOut } = useContext(AuthContext)!;

  useEffect(() => {
    if (user?.displayName) {
      setUserName(user.displayName.split(' ')[0]);
    } else if (user?.email) {
      setUserName(user.email.split('@')[0]);
    }

    if (user?.uid) {
      userService
        .getUserProfile(user.uid)
        .then((profile) => {
          if (profile?.name) {
            const firstName = profile.name.split(' ')[0];
            setUserName(firstName);
          }
        })
        .catch(console.error);
    }

    // Subscribe to personnel to get user role
    const unsubPersonnel = dailyWorkStatusService.subscribeToPersonnel((personnelList) => {
      setPersonnel(personnelList);
      if (user?.email) {
        const role = getUserRole(user.email, personnelList);
        setUserRole(role);
      }
    });

    return () => unsubPersonnel();
  }, [user]);

  // Handle sidebar navigation
  const handleSidebarPress = (key: string) => {
    if (key === 'Logout') {
      signOut();
      return;
    }
    if (key === 'Dashboard') {
      navigation.navigate('MainNew');
    } else if (key.startsWith('DWS')) {
      setActiveTab(key as DWSTab);
      // Clear status filter when manually navigating
      if (key === 'DWSDaily') {
        setStatusFilter('');
      }
      // Clear master sub-tab filter when manually navigating
      if (key === 'DWSMaster') {
        setMasterSubTab('');
      }
    }
  };

  // Get title based on active tab
  const getTitle = () => {
    switch (activeTab) {
      case 'DWSMaster': return 'Daily Work Status - Master Data';
      case 'DWSDaily': return 'Daily Work Status - Daily Entry';
      case 'DWSReport': return 'Daily Work Status - Report';
      case 'DWSDashboard': return 'Daily Work Status - Dashboard';
      case 'DWSUsers': return 'Daily Work Status - User Management';
      case 'DWSReminders': return 'Daily Work Status - Reminder Settings';
      case 'DWSNotifications': return 'Daily Work Status - Notifications';
      default: return 'Daily Work Status';
    }
  };

  // Render active tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'DWSMaster':
        return <DWSMasterDataTab key={masterSubTab} initialSubTab={masterSubTab as any} />;
      case 'DWSDaily':
        return <DWSDailyEntryTab key={statusFilter} initialFilter={statusFilter} />;
      case 'DWSReport':
        return <DWSReportTab />;
      case 'DWSDashboard':
        return <DWSDashboardTab onNavigate={(tab: DWSTab, filter?: string) => {
          setActiveTab(tab);
          if (tab === 'DWSMaster' && filter) {
            setMasterSubTab(filter);
          } else {
            setStatusFilter(filter || '');
          }
        }} />;
      case 'DWSUsers':
        return <DWSUserManagementTab />;
      case 'DWSReminders':
        return <DWSReminderSettingsTab />;
      case 'DWSNotifications':
        return <DWSNotificationSettings />;
      default:
        return <DWSMasterDataTab />;
    }
  };

  return (
    <AppLayout 
      title={getTitle()}
      activeRoute={activeTab}
      sidebarItems={getFilteredDWSNav(userRole)}
      onSidebarItemPress={handleSidebarPress}
    >
      <View style={styles.container}>
        {renderContent()}
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  }
});

export default DailyWorkStatusScreen;
