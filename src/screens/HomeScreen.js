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
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  logoutUser,
  getPatientDashboard,
  getPatientNotifications,
  getTodayTasks,
} from '../services/HomeService';
import styles from '../styles/HomeStyles';

const TABS = [
  { key: 'home',      icon: 'home-variant',   label: 'Home' },
  { key: 'contacts',  icon: 'account-group',  label: 'Contacts' },
  { key: 'assistant', icon: 'robot-excited',  label: 'Help', fab: true },
  { key: 'myday',     icon: 'calendar-check', label: 'My Day' },
  { key: 'profile',   icon: 'account-circle', label: 'Me' },
];

const DEFAULT_DASHBOARD = {
  patient: { name: '', nickName: '', imageUrl: null },
  greeting: 'Hello',
  currentDate: '',
  upcomingTasks: [],
  quickActions: { medicines: 0, routines: 0, relations: 0 },
  notificationCount: 0,
  priorityLevel: 'normal',
  summary: { total: 0, upcoming: 0, completed: 0, missed: 0 }
};

const formatLateness = (minutes) => {
  if (!minutes || minutes <= 0) return null;
  if (minutes < 60) return `${minutes} min late`;
  const hours = Math.floor(minutes / 60);
  const mins  = minutes % 60;
  return mins === 0 ? `${hours}h late` : `${hours}h ${mins}m late`;
};

const HomeScreen = ({ navigation }) => {
  const [activeTab,     setActiveTab]     = useState('home');
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [dashboardData, setDashboardData] = useState(DEFAULT_DASHBOARD);
  const [tasks,         setTasks]         = useState({
    allTasks: [], upcoming: [], missed: [], completed: [],
    summary: { total: 0, upcoming: 0, completed: 0, missed: 0 }
  });
  const [activeTaskTab, setActiveTaskTab] = useState('upcoming');

  const fetchDashboardData = useCallback(async () => {
    try {
      const dashRes = await getPatientDashboard();
      if (dashRes.status === 'SUCCESS' && dashRes.data)
        setDashboardData((prev) => ({ ...prev, ...dashRes.data }));

      const notifRes = await getPatientNotifications();
      if (notifRes.status === 'SUCCESS')
        setDashboardData((prev) => ({ ...prev, notificationCount: notifRes.unreadCount ?? 0 }));

      const tasksRes = await getTodayTasks();
      if (tasksRes.status === 'SUCCESS' && tasksRes.data) {
        const d = tasksRes.data;
        setTasks({
          allTasks:  d.allTasks  || [],
          upcoming:  d.upcoming  || [],
          missed:    d.missed    || [],
          completed: d.completed || [],
          summary:   d.summary   || { total: 0, upcoming: 0, completed: 0, missed: 0 }
        });
      }
    } catch (e) {
      console.log('Dashboard error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const onRefresh = () => { setRefreshing(true); fetchDashboardData(); };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to leave?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: async () => await logoutUser(navigation) },
    ]);
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab.key);
    if      (tab.key === 'assistant') navigation.navigate('Chatbot');
    else if (tab.key === 'profile')   navigation.navigate('Profile');
    else if (tab.key === 'contacts')  navigation.navigate('Relations');
    else if (tab.key === 'myday')     navigation.navigate('MyDay');
  };

  const getTaskIcon  = (t) => t === 'Medicine' ? 'pill' : 'calendar-check';
  const getTaskColor = (t) => t === 'Medicine' ? styles.taskIconMedicine : styles.taskIconRoutine;
  const getTaskBg    = (t) => t === 'Medicine' ? styles.taskIconBgMedicine : styles.taskIconBgRoutine;

  const getQuickActionCount = (a) => dashboardData.quickActions[a] || 0;

  const getPriorityIcon = (l) => {
    if (l === 'critical') return 'alert-circle';
    if (l === 'high')     return 'alert';
    if (l === 'medium')   return 'information';
    return 'check-circle';
  };

  const renderTaskList = () => {
    let tasksToShow  = [];
    let emptyMessage = '';
    let emptyIcon    = '';

    switch (activeTaskTab) {
      case 'upcoming':
        tasksToShow  = tasks.upcoming;
        emptyMessage = 'No upcoming tasks';
        emptyIcon    = 'calendar-blank-outline';
        break;
      case 'missed':
        tasksToShow  = tasks.missed;
        emptyMessage = 'No missed tasks — Great job!';
        emptyIcon    = 'check-circle-outline';
        break;
      case 'completed':
        tasksToShow  = tasks.completed;
        emptyMessage = 'No completed tasks yet';
        emptyIcon    = 'clipboard-check-outline';
        break;
    }

    if (tasksToShow.length === 0) {
      return (
        <View style={styles.emptyTasksContainer}>
          <View style={styles.emptyIconWrap}>
            <MaterialCommunityIcons name={emptyIcon} size={36} color="#2E7D32" />
          </View>
          <Text style={styles.emptyTasksText}>{emptyMessage}</Text>
        </View>
      );
    }

    return tasksToShow.map((task) => {
      const taskId      = task.id || task._id;
      const isCompleted = task.status === 'completed';

      const isLate = isCompleted
        ? (task.score > 0)
        : task.isLate || (task.minutesLate > 0);

      const latenessMinutes = isCompleted
        ? (task.score > 0 ? (task.latenessMinutes || 0) : 0)
        : (task.latenessMinutes || task.minutesLate || 0);

      const lateText = formatLateness(latenessMinutes);

      const taskType = task.type || task.taskType;

      return (
        <TouchableOpacity
          key={taskId}
          style={[
            styles.taskCard,
            activeTaskTab === 'missed'    && styles.taskCardMissed,
            activeTaskTab === 'completed' && styles.taskCardCompleted,
            activeTaskTab === 'upcoming' && isLate && styles.taskCardLate,
          ]}
          onPress={() => {
            console.log('Navigating to TaskDetails with ID:', taskId);
            navigation.navigate('TaskDetails', { taskId });
          }}
          activeOpacity={0.75}
        >
          <View style={[
            styles.taskIcon,
            taskType === 'Medicine' ? styles.taskIconBgMedicine : styles.taskIconBgRoutine,
          ]}>
            <MaterialCommunityIcons
              name={getTaskIcon(taskType)}
              size={26}
              color={taskType === 'Medicine' ? '#2E7D32' : '#F57C00'}
            />
          </View>

          <View style={styles.taskInfo}>
            <Text style={styles.taskName} numberOfLines={1}>
              {task.name || task.taskName}
            </Text>
            <View style={styles.taskMetaRow}>
              <MaterialCommunityIcons name="clock-outline" size={12} color="#8DA887" />
              <Text style={styles.taskTime}>{task.scheduledTime}</Text>
            </View>
            {lateText && (
              <View style={[
                styles.lateBadge,
                activeTaskTab === 'completed' ? styles.lateBadgeGreen : styles.lateBadgeRed,
              ]}>
                <MaterialCommunityIcons
                  name="clock-alert-outline"
                  size={11}
                  color={activeTaskTab === 'completed' ? '#2E7D32' : '#C62828'}
                />
                <Text style={[
                  styles.lateText,
                  activeTaskTab === 'completed' ? styles.lateTextGreen : styles.lateTextRed,
                ]}>
                  {lateText}
                </Text>
              </View>
            )}
          </View>

          {activeTaskTab === 'upcoming' && (
            <View style={[styles.statusPill, isLate ? styles.statusPillWarn : styles.statusPillGood]}>
              <MaterialCommunityIcons
                name={isLate ? 'clock-alert' : 'clock-outline'}
                size={15}
                color={isLate ? '#E65100' : '#2E7D32'}
              />
            </View>
          )}
          {activeTaskTab === 'completed' && (
            <View style={[styles.statusPill, styles.statusPillDone]}>
              <MaterialCommunityIcons name="check-bold" size={15} color="#2E7D32" />
            </View>
          )}
          {activeTaskTab === 'missed' && (
            <View style={[styles.statusPill, styles.statusPillMissed]}>
              <MaterialCommunityIcons name="close-thick" size={15} color="#C62828" />
            </View>
          )}
        </TouchableOpacity>
      );
    });
  };

  const getQuickActionIcon = (action) => {
    switch (action) {
      case 'medicines': return 'pill';
      case 'routines':  return 'calendar-check';
      case 'relations': return 'account-group';
      default:          return 'help';
    }
  };

  const getPriorityBannerStyle = (level) => {
    if (level === 'critical') return styles.prioritycritical;
    if (level === 'high')     return styles.priorityhigh;
    return styles.prioritymedium;
  };

  const getPriorityBadgeStyle = (level) => {
    if (level === 'critical') return styles.priorityBadgecritical;
    if (level === 'high')     return styles.priorityBadgehigh;
    return styles.priorityBadgemedium;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading your day...</Text>
      </View>
    );
  }

  const patientName = dashboardData.patient?.nickName || dashboardData.patient?.name || '';

  const summaryItems = [
    { label: 'Total',    value: tasks.summary.total,     icon: 'format-list-checks',  style: styles.summaryCardTotal },
    { label: 'Upcoming', value: tasks.summary.upcoming,  icon: 'clock-outline',        style: styles.summaryUpcoming },
    { label: 'Done',     value: tasks.summary.completed, icon: 'check-circle-outline', style: styles.summaryCompleted },
    { label: 'Missed',   value: tasks.summary.missed,    icon: 'close-circle-outline', style: styles.summaryMissed },
  ];

  const taskTabItems = [
    { key: 'upcoming',  label: 'Upcoming',  count: tasks.upcoming.length,  icon: 'clock-outline',        activeStyle: styles.tabPillActiveGreen },
    { key: 'missed',    label: 'Missed',    count: tasks.missed.length,    icon: 'close-circle-outline', activeStyle: styles.tabPillActiveRed },
    { key: 'completed', label: 'Completed', count: tasks.completed.length, icon: 'check-circle-outline', activeStyle: styles.tabPillActiveGreen },
  ];

  const quickItems = [
    { 
      label: 'Medicines',     
      icon: 'pill',           
      nav: 'Medicines',        
      action: 'medicines',     
      cardStyle: styles.quickCardMedicine,  
      iconStyle: styles.quickIconMedicine 
    },
    { 
      label: 'Routines',      
      icon: 'calendar-check', 
      nav: 'Routines',         
      action: 'routines',      
      cardStyle: styles.quickCardRoutine,   
      iconStyle: styles.quickIconRoutine 
    },
    { 
      label: 'Known Persons', 
      icon: 'account-group',  
      nav: 'Relations',        
      action: 'relations',     
      cardStyle: styles.quickCardRelations, 
      iconStyle: styles.quickIconRelations 
    },
    { 
      label: 'Emergency',     
      icon: 'phone',          
      nav: 'EmergencyContact', 
      action: null,        
      cardStyle: styles.quickCardEmergency, 
      iconStyle: styles.quickIconEmergency 
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F4F0" />

      {/* ── Top Bar ── */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="brain" size={26} color="#2E7D32" />
          </View>
          <Text style={styles.title}>
            Care<Text style={styles.light}>Mind</Text>
          </Text>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
            <MaterialCommunityIcons name="bell-outline" size={22} color="#374151" />
            {dashboardData.notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {dashboardData.notificationCount > 9 ? '9+' : dashboardData.notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={22} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
        }
      >
        {/* ── Hero Greeting ──────── */}
        <View style={styles.heroCard}>
          <View style={styles.heroBlob1} />
          <View style={styles.heroBlob2} />
          <View style={styles.heroContent}>
            <Text style={styles.heroGreeting}>
              {dashboardData.greeting || `Hello, ${patientName}`}
            </Text>
            <View style={styles.heroDateRow}>
              <MaterialCommunityIcons name="calendar-today" size={13} color="rgba(255,255,255,0.7)" />
              <Text style={styles.heroDate}>{dashboardData.currentDate}</Text>
            </View>
          </View>
          {dashboardData.priorityLevel !== 'normal' && (
            <View style={[styles.heroPriorityBadge, getPriorityBadgeStyle(dashboardData.priorityLevel)]}>
              <MaterialCommunityIcons
                name={getPriorityIcon(dashboardData.priorityLevel)}
                size={12}
                color="#FFFFFF"
              />
              <Text style={styles.heroPriorityText}>
                {dashboardData.priorityLevel.toUpperCase()} PRIORITY
              </Text>
            </View>
          )}
        </View>

{/* ── Today's Activities Card ────────────────────────────── */}
<View style={styles.activitiesCard}>
  <View style={styles.activitiesHeader}>
    <MaterialCommunityIcons name="calendar-today" size={20} color="#2E7D32" />
    <Text style={styles.activitiesTitle}>Today's Activities</Text>
  </View>
  
  {/* Summary Strip inside card */}
  <View style={styles.summaryContainer}>
    {summaryItems.map((item) => (
      <View key={item.label} style={[styles.summaryCard, item.style]}>
        <MaterialCommunityIcons name={item.icon} size={18} color="#2E7D32" />
        <Text style={styles.summaryNumber}>{item.value}</Text>
        <Text style={styles.summaryLabel}>{item.label}</Text>
      </View>
    ))}
  </View>
</View>

        {/* ── Tasks Section ───────*/}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          <View style={styles.sectionDivider} />
        </View>

        {/* Tab pills */}
        <View style={styles.tabPillRow}>
          {taskTabItems.map((tab) => {
            const isActive = activeTaskTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabPill, isActive && tab.activeStyle]}
                onPress={() => setActiveTaskTab(tab.key)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={tab.icon}
                  size={13}
                  color={isActive ? '#FFFFFF' : '#8DA887'}
                />
                <Text style={[styles.tabPillText, isActive && styles.tabPillTextActive]}>
                  {tab.label}
                </Text>
                <View style={[styles.tabPillCount, isActive && styles.tabPillCountActive]}>
                  <Text style={[styles.tabPillCountText, isActive && styles.tabPillCountTextActive]}>
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.tasksSection}>
          {renderTaskList()}
        </View>

        {/* ── Quick Access ─────────────────────────────────────────────── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.sectionDivider} />
        </View>

        <View style={styles.grid}>
          {quickItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.gridCard, item.cardStyle]}
              onPress={() => navigation.navigate(item.nav)}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconBox, item.iconStyle]}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={28}
                  color={item.label === 'Emergency' ? '#b93535' : '#2E7D32'}
                />
                {item.action && getQuickActionCount(item.action) > 0 && (
                  <View style={styles.gridBadge}>
                    <Text style={styles.gridBadgeText}>{getQuickActionCount(item.action)}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.gridTitle, item.label === 'Emergency' && styles.gridTitleEmergency]}>
                {item.label}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={15} color="#8DA887" />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Priority Banner ─────*/}
        {dashboardData.priorityLevel && dashboardData.priorityLevel !== 'normal' && (
          <View style={[styles.priorityCard, getPriorityBannerStyle(dashboardData.priorityLevel)]}>
            <View style={styles.priorityIconWrap}>
              <MaterialCommunityIcons
                name={getPriorityIcon(dashboardData.priorityLevel)}
                size={30}
                color="#FFFFFF"
              />
            </View>
            <View style={styles.priorityTextContainer}>
              <Text style={styles.priorityTitle}>
                {dashboardData.priorityLevel === 'critical' ? 'Critical Priority' :
                 dashboardData.priorityLevel === 'high'     ? 'High Priority' : 'Medium Priority'}
              </Text>
              <Text style={styles.prioritySubtext}>
                {dashboardData.priorityLevel === 'critical' ? 'Extra reminders active' :
                 dashboardData.priorityLevel === 'high'     ? 'More frequent alerts' : 'Increased attention needed'}
              </Text>
            </View>
          </View>
        )}

        {/* ── Caregiver Card ────*/}
        <TouchableOpacity
          style={styles.caregiverCard}
          onPress={() => navigation.navigate('CaregiverInfo')}
          activeOpacity={0.8}
        >
          <View style={styles.caregiverLeft}>
            <View style={styles.caregiverIcon}>
              <MaterialCommunityIcons name="shield-account" size={26} color="#2E7D32" />
            </View>
            <View>
              <Text style={styles.caregiverTitle}>Your Caregiver</Text>
              <View style={styles.caregiverStatusRow}>
                <View style={styles.caregiverOnlineDot} />
                <Text style={styles.caregiverSubtext}>Connected & Monitoring</Text>
              </View>
            </View>
          </View>
          <View style={styles.caregiverChevronWrap}>
            <MaterialCommunityIcons name="chevron-right" size={18} color="#2E7D32" />
          </View>
        </TouchableOpacity>

      </ScrollView>

      {/* ── Bottom Navigation ──────*/}
      <View style={styles.bottomBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          if (tab.fab) {
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                onPress={() => handleTabPress(tab)}
              >
                <View style={styles.fabButton}>
                  <MaterialCommunityIcons name={tab.icon} size={26} color="#FFFFFF" />
                </View>
                <Text style={styles.tabLabel}>{tab.label}</Text>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => handleTabPress(tab)}
            >
              <View style={[styles.tabIconWrap, isActive && styles.tabIconWrapActive]}>
                <MaterialCommunityIcons
                  name={tab.icon}
                  size={22}
                  color={isActive ? '#2E7D32' : '#8DA887'}
                />
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;