/**
 * @fileoverview Dashboard screen - Main home screen for authenticated users
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert
} from 'react-native';
import { Card, Text, Button, ActivityIndicator, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ApiService from '../../services/api';

const DashboardScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const result = await ApiService.getUserProfile();

      if (result.success) {
        setUser(result.user);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('[DashboardScreen] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
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
  const ecoPoints = gamification.ecoPoints || 0;
  const level = gamification.level || 1;
  const badges = gamification.badges || [];
  const currentStreak = gamification.currentStreak || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back, {user?.name?.split(' ')[0]}! 👋</Text>
          <Text style={styles.subGreeting}>Keep saving the planet, one task at a time</Text>
        </View>

        {/* Eco Points Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.ecoPointsContainer}>
              <View>
                <Text style={styles.label}>Eco Points</Text>
                <Text style={styles.ecoPointsValue}>{ecoPoints.toLocaleString()}</Text>
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>LEVEL</Text>
                <Text style={styles.levelNumber}>{level}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Card.Content>
              <MaterialCommunityIcons name="flame" size={32} color="#F59E0B" />
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <MaterialCommunityIcons name="medal" size={32} color="#F59E0B" />
              <Text style={styles.statValue}>{badges.length}</Text>
              <Text style={styles.statLabel}>Badges Earned</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.buttonsContainer}>
            <Button
              mode="contained"
              style={styles.actionButton}
              labelStyle={styles.buttonLabel}
              onPress={() => navigation.navigate('ChallengesStack', { screen: 'ChallengesList' })}
              icon="trophy"
            >
              Challenges
            </Button>
            <Button
              mode="contained"
              style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
              labelStyle={styles.buttonLabel}
              onPress={() => navigation.navigate('HabitsStack', { screen: 'HabitsList' })}
              icon="calendar-check"
            >
              Daily Habits
            </Button>
          </View>
          <View style={styles.buttonsContainer}>
            <Button
              mode="outlined"
              style={styles.outlineButton}
              onPress={() => navigation.navigate('ChallengesStack', { screen: 'Submission' })}
              icon="camera"
            >
              Submit Activity
            </Button>
            <Button
              mode="outlined"
              style={styles.outlineButton}
              onPress={() => navigation.navigate('LeaderboardStack', { screen: 'LeaderboardList' })}
              icon="chart-line"
            >
              Leaderboard
            </Button>
          </View>
        </View>

        {/* Recent Achievements */}
        {badges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Badges</Text>
            <View style={styles.badgesContainer}>
              {badges.slice(-3).map((badge, index) => (
                <View key={index} style={styles.badgeChip}>
                  <Text style={styles.badgeEmoji}>{badge.icon || '🏆'}</Text>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tips Section */}
        <Card style={[styles.card, { marginBottom: 30 }]}>
          <Card.Content>
            <View style={styles.tipHeader}>
              <MaterialCommunityIcons name="lightbulb" size={24} color="#10B981" />
              <Text style={styles.tipTitle}>Daily Tip</Text>
            </View>
            <Text style={styles.tipText}>
              Complete your daily habits and challenges to earn more eco-points and climb the leaderboard! 🌱
            </Text>
          </Card.Content>
        </Card>
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
  header: {
    padding: 20,
    paddingBottom: 10
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 5
  },
  subGreeting: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500'
  },
  card: {
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  ecoPointsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  ecoPointsValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 5
  },
  levelBadge: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center'
  },
  levelText: {
    fontSize: 10,
    color: '#0284C7',
    fontWeight: '700'
  },
  levelNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0284C7',
    marginTop: 2
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 10,
    gap: 10
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 15
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginVertical: 5
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600'
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#10B981'
  },
  buttonLabel: {
    fontSize: 12,
    fontWeight: '600'
  },
  outlineButton: {
    flex: 1,
    borderColor: '#10B981'
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  badgeChip: {
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#BBEF63',
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeEmoji: {
    fontSize: 20,
    marginBottom: 2
  },
  badgeName: {
    fontSize: 10,
    color: '#16A34A',
    fontWeight: '600'
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
    marginLeft: 8
  },
  tipText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20
  }
});

export default DashboardScreen;
