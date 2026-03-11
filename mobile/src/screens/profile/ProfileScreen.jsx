/**
 * @fileoverview Profile screen - User profile and stats
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Card, Text, Button, Avatar, ActivityIndicator, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ApiService from '../../services/api';
import { StorageService } from '../../services/storage';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const cached = await StorageService.getUserProfile();
      if (cached) {
        setUser(cached);
      }

      const result = await ApiService.getUserProfile();
      if (result.success) {
        setUser(result.user);
      }
    } catch (error) {
      console.error('[ProfileScreen] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        onPress: () => { }
      },
      {
        text: 'Logout',
        onPress: async () => {
          await ApiService.logout();
          // Navigation will update automatically
        }
      }
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      </SafeAreaView>
    );
  }

  const gamification = user?.gamification || {};
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.headerCard}>
          <View style={styles.profileTop}>
            <Avatar.Text
              size={80}
              label={initials}
              style={{ backgroundColor: '#10B981' }}
            />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={styles.name}>{user?.name}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              <Text style={styles.school}>{user?.profile?.school}</Text>
            </View>
          </View>

          {/* Level Badge */}
          <View style={styles.levelBanner}>
            <View style={styles.levelContent}>
              <Text style={styles.levelLabel}>LEVEL</Text>
              <Text style={styles.levelNumber}>{gamification.level || 1}</Text>
            </View>
            <View style={styles.pointsContent}>
              <Text style={styles.pointsLabel}>ECO POINTS</Text>
              <Text style={styles.pointsNumber}>{(gamification.ecoPoints || 0).toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Card.Content style={styles.statCardContent}>
                <MaterialCommunityIcons name="medal" size={32} color="#F59E0B" />
                <Text style={styles.statCount}>{gamification.badges?.length || 0}</Text>
                <Text style={styles.statName}>Badges</Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content style={styles.statCardContent}>
                <MaterialCommunityIcons name="flame" size={32} color="#EF4444" />
                <Text style={styles.statCount}>{gamification.currentStreak || 0}</Text>
                <Text style={styles.statName}>Day Streak</Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content style={styles.statCardContent}>
                <MaterialCommunityIcons name="chart-line" size={32} color="#0284C7" />
                <Text style={styles.statCount}>{gamification.level || 1}</Text>
                <Text style={styles.statName}>Level</Text>
              </Card.Content>
            </Card>

            <Card style={styles.statCard}>
              <Card.Content style={styles.statCardContent}>
                <MaterialCommunityIcons name="tree" size={32} color="#10B981" />
                <Text style={styles.statCount}>{(gamification.treesPlanted || 0)}</Text>
                <Text style={styles.statName}>Trees</Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Environmental Impact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environmental Impact</Text>
          <Card style={styles.impactCard}>
            <Card.Content>
              <View style={styles.impactRow}>
                <View style={styles.impactItem}>
                  <Text style={styles.impactEmoji}>🌍</Text>
                  <Text style={styles.impactValue}>{(gamification.co2Prevented || 0).toFixed(1)}</Text>
                  <Text style={styles.impactLabel}>kg CO₂</Text>
                </View>
                <View style={styles.impactItem}>
                  <Text style={styles.impactEmoji}>💧</Text>
                  <Text style={styles.impactValue}>{(gamification.waterSaved || 0)}</Text>
                  <Text style={styles.impactLabel}>L Water</Text>
                </View>
                <View style={styles.impactItem}>
                  <Text style={styles.impactEmoji}>♻️</Text>
                  <Text style={styles.impactValue}>{(gamification.plasticReduced || 0)}</Text>
                  <Text style={styles.impactLabel}>kg Plastic</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Achievements */}
        {gamification.badges && gamification.badges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Badges</Text>
            <View style={styles.badgesContainer}>
              {gamification.badges.slice(-6).map((badge, index) => (
                <View key={index} style={styles.badgeItem}>
                  <Text style={styles.badgeIcon}>{badge.icon || '🏆'}</Text>
                  <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialCommunityIcons name="bell" size={24} color="#6B7280" />
            <Text style={styles.settingText}>Notifications</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#D1D5DB" />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.settingItem}>
            <MaterialCommunityIcons name="shield" size={24} color="#6B7280" />
            <Text style={styles.settingText}>Privacy & Security</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#D1D5DB" />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.settingItem}>
            <MaterialCommunityIcons name="information" size={24} color="#6B7280" />
            <Text style={styles.settingText}>About</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <Button
            mode="outlined"
            style={styles.logoutButton}
            labelStyle={{ color: '#EF4444' }}
            onPress={handleLogout}
            icon="logout"
          >
            Logout
          </Button>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937'
  },
  email: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  school: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
    fontWeight: '600'
  },
  levelBanner: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#BBEF63'
  },
  levelContent: {
    flex: 1,
    alignItems: 'center'
  },
  levelLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  levelNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10B981'
  },
  pointsContent: {
    flex: 1,
    alignItems: 'center'
  },
  pointsLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  pointsNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10B981'
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12
  },
  statCardContent: {
    alignItems: 'center'
  },
  statCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginVertical: 6
  },
  statName: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600'
  },
  impactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  impactItem: {
    alignItems: 'center'
  },
  impactEmoji: {
    fontSize: 28,
    marginBottom: 6
  },
  impactValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937'
  },
  impactLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  badgeItem: {
    alignItems: 'center',
    gap: 4
  },
  badgeIcon: {
    fontSize: 32
  },
  badgeName: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    width: 60,
    textAlign: 'center'
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12
  },
  settingText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12
  },
  logoutButton: {
    borderColor: '#EF4444'
  }
});

export default ProfileScreen;
