import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { logoutUser } from '../services/HomeService';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../styles/HomeStyles';

const TABS = [
  { key: 'home', icon: 'home-variant', label: 'Home' },
  { key: 'health', icon: 'heart-pulse', label: 'Health' },
  { key: 'assistant', icon: 'robot-outline', label: 'AI', fab: true },
  { key: 'routine', icon: 'calendar-check-outline', label: 'Routine' },
  { key: 'profile', icon: 'account-circle-outline', label: 'Profile' },
];

const QUICK_ACTIONS = [
  { key: 'medicines', icon: 'pill', label: 'Medicines', sub: '3 today' },
  { key: 'routine', icon: 'calendar-check-outline', label: 'Routine', sub: 'On track' },
  { key: 'location', icon: 'map-marker-outline', label: 'Location', sub: 'Share' },
  { key: 'reports', icon: 'file-chart-outline', label: 'Reports', sub: 'View all' },
];

const HomeScreen = ({ navigation }) => {
  const userName = 'Alex';
  const [activeTab, setActiveTab] = useState('home');

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dayNum = today.getDate();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* TOP BAR */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.topBarLogoCircle}>
            <MaterialCommunityIcons
              name="brain"
              size={30}
              color="#2E7D32"
            />
          </View>
          <Text style={styles.topBarAppName}>
            Care<Text style={styles.topBarAppNameAccent}>Mind</Text>
          </Text>
        </View>

        <View style={styles.topBarRight}>
          {/* Notification bell */}
          <TouchableOpacity style={styles.topBarIconBtn}>
            <MaterialCommunityIcons name="bell-outline" size={21} color="#374151" />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
            <TouchableOpacity style={styles.topBarIconBtn}   
            onPress={() => logoutUser(navigation)}  >
            <MaterialCommunityIcons name="logout" size={21} color="#374151" />
             
          </TouchableOpacity>
        </View>
      </View>

      {/* SCROLL CONTENT */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* GREETING */}
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>Good Morning 👋</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeDay}>{dayName}</Text>
            <Text style={styles.dateBadgeNum}>{dayNum}</Text>
          </View>
        </View>

        {/* HEALTH HERO CARD */}
        <View style={styles.heroCard}>
          <View style={styles.heroGradientInner}>
            <View style={styles.heroTop}>
              <View style={styles.heroStatusTag}>
                <View style={styles.heroStatusDot} />
                <Text style={styles.heroStatusText}>All systems normal</Text>
              </View>
              <View style={styles.heroHeartBox}>
                <MaterialCommunityIcons name="heart-pulse" size={24} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.heroTitle}>You're doing great today!</Text>
            <Text style={styles.heroSub}>Keep up your healthy routine 💪</Text>

            <View style={styles.heroStats}>
              <View style={styles.heroStatChip}>
                <Text style={styles.heroStatValue}>72</Text>
                <Text style={styles.heroStatLabel}>HEART RATE</Text>
              </View>
              <View style={styles.heroStatChip}>
                <Text style={styles.heroStatValue}>98%</Text>
                <Text style={styles.heroStatLabel}>OXYGEN</Text>
              </View>
              <View style={styles.heroStatChip}>
                <Text style={styles.heroStatValue}>3/3</Text>
                <Text style={styles.heroStatLabel}>MEDS TAKEN</Text>
              </View>
            </View>
          </View>
        </View>

        {/* NEXT MEDICINE REMINDER */}
        <View style={styles.reminderCard}>
          <View style={styles.reminderLeft}>
            <View style={styles.reminderIconBox}>
              <MaterialCommunityIcons name="pill" size={24} color="#2E7D32" />
            </View>
            <View>
              <Text style={styles.reminderTitle}>Next Medicine</Text>
              <Text style={styles.reminderTime}>Paracetamol • 09:00 AM</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.reminderBtn}>
            <Text style={styles.reminderBtnText}>View</Text>
          </TouchableOpacity>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionHeading}>Quick Actions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {QUICK_ACTIONS.map((item) => (
            <TouchableOpacity key={item.key} style={styles.card}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name={item.icon} size={24} color="#2E7D32" />
              </View>
              <Text style={styles.cardTitle}>{item.label}</Text>
              <Text style={styles.cardSub}>{item.sub}</Text>
              <View style={styles.cardArrow}>
                <MaterialCommunityIcons name="arrow-right" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* CAREGIVER FOOTER */}
        <View style={styles.footerCard}>
          <View style={styles.footerIconBox}>
            <MaterialCommunityIcons name="shield-check" size={22} color="#2E7D32" />
          </View>
          <View style={styles.footerTextBlock}>
            <Text style={styles.footerTitle}>Caregiver Connected</Text>
            <Text style={styles.footerText}>
              Your caregiver is actively monitoring your health status.
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
        </View>
      </ScrollView>

      {/* BOTTOM TAB BAR */}
      <View style={styles.bottomBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;

          if (tab.fab) {
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab.key)}
              >
                <View style={styles.fabTab}>
                  <MaterialCommunityIcons name={tab.icon} size={26} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key)}
            >
              <View style={[styles.tabIconBox, isActive && styles.tabIconBoxActive]}>
                <MaterialCommunityIcons
                  name={tab.icon}
                  size={22}
                  color={isActive ? '#2E7D32' : '#9CA3AF'}
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