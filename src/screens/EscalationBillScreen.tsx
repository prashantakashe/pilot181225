// src/screens/EscalationBillScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { AppLayout } from '../components/AppLayout';
import { colors } from '../theme/colors';
import type { EscalationMaster, EscalationProject } from '../types/escalation';
import { getAllMasters } from '../services/escalationService';

// Tabs
import MasterSetupTab from '../components/escalation/MasterSetupTab';
import IndicesGraphsTab from '../components/escalation/IndicesGraphsTab';
import CreateBillTab from '../components/escalation/CreateBillTab';
import CalculationTab from '../components/escalation/CalculationTab';
import DocumentsTab from '../components/escalation/DocumentsTab';
import HistoryTab from '../components/escalation/HistoryTab';

type TabType =
  | 'master'
  | 'indices'
  | 'create'
  | 'calculation'
  | 'documents'
  | 'history';

interface Tab {
  id: TabType;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'master', label: 'Master Setup', icon: '⚙️' },
  { id: 'indices', label: 'Indices & Graphs', icon: '📊' },
  { id: 'create', label: 'Create Bill', icon: '📝' },
  { id: 'calculation', label: 'Calculation', icon: '🧮' },
  { id: 'documents', label: 'Documents', icon: '📁' },
  { id: 'history', label: 'History', icon: '📜' },
];

interface Props {
  navigation: any;
}

const EscalationBillScreen: React.FC<Props> = () => {
  const [activeTab, setActiveTab] = useState<TabType>('master');
  const [masters, setMasters] = useState<EscalationMaster[]>([]);
  const [selectedMaster, setSelectedMaster] =
    useState<EscalationMaster | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProject, setSelectedProject] =
    useState<EscalationProject | null>(null);

  useEffect(() => {
    loadMasters();
  }, []);

  const loadMasters = async () => {
    try {
      setLoading(true);
      const data = await getAllMasters();
      setMasters(data);

      if (data.length > 0 && !selectedMaster) {
        setSelectedMaster(data[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load master data');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.ACTION_BLUE} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'master':
        return (
          <MasterSetupTab
            masters={masters}
            selectedMaster={selectedMaster}
            onMasterSelect={setSelectedMaster}
            onMasterCreated={loadMasters}
            onMasterUpdated={loadMasters}
            projectId={selectedProject?.id || ''}
          />
        );

      case 'indices':
        return <IndicesGraphsTab masterId={selectedMaster?.id} />;

      case 'create':
        return <CreateBillTab master={selectedMaster} />;

      case 'calculation':
        return <CalculationTab master={selectedMaster} />;

      case 'documents':
        return <DocumentsTab master={selectedMaster} />;

      case 'history':
        return <HistoryTab master={selectedMaster} />;

      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <View style={styles.container}>
        <View style={styles.tabHeader}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TABS.map(tab => {
              const active = tab.id === activeTab;

              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, active && styles.activeTab]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Text style={styles.tabIcon}>{tab.icon}</Text>
                  <Text
                    style={[styles.tabLabel, active && styles.activeTabLabel]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.tabContent}>{renderTabContent()}</View>
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabHeader: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: 6,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: colors.ACTION_BLUE,
  },
  tabIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 14,
    color: '#666',
  },
  activeTabLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
});

export default EscalationBillScreen;
