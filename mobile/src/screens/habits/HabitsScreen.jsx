/**
 * @fileoverview Habits screen - Daily habit tracking
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { Card, Text, Button, ActivityIndicator, LinearProgress, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ApiService from '../../services/api';

const HabitsScreen = ({ navigation }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const habitCategories = [
    { name: 'energy', color: '#FCD34D', icon: '⚡' },
    { name: 'water', color: '#0EA5E9', icon: '💧' },
    { name: 'waste', color: '#A3E635', icon: '♻️' },
    { name: 'transportation', color: '#F97316', icon: '🚗' },
    { name: 'food', color: '#EC4899', icon: '🥗' }
  ];

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const result = await ApiService.getHabits();

      if (result.success) {
        setHabits(result.habits || []);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('[HabitsScreen] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHabits();
    setRefreshing(false);
  };

  const handleCompleteHabit = async (habitId) => {
    try {
      const result = await ApiService.logHabitCompletion(habitId);

      if (result.success) {
        Alert.alert('Success', result.message || 'Habit completed!');
        await loadHabits();
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('[HabitsScreen] Error completing habit:', error);
    }
  };

  const renderHabitCard = ({ item }) => {
    const categoryInfo = habitCategories.find(c => c.name === item.category);
    const weeklyProgress = item.weeklyProgress || [];
    const completedToday = weeklyProgress.length > 0 && weeklyProgress[weeklyProgress.length - 1]?.completed;

    return (
      <Card style={styles.habitCard}>
        <Card.Content>
          <View style={styles.habitHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.habitName}>{item.name}</Text>
              <Text style={styles.habitCategory}>{categoryInfo?.icon} {item.category}</Text>
            </View>
            <View style={[styles.streakBadge, { backgroundColor: '#FBBF24' }]}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakNumber}>{item.currentStreak || 0}</Text>
            </View>
          </View>

          {/* Weekly progress */}
          <View style={styles.weeklyProgress}>
            {Array.from({ length: 7 }).map((_, i) => {
              const progress = item.weeklyProgress?.[i];
              return (
                <View
                  key={i}
                  style={[
                    styles.dayCircle,
                    { backgroundColor: progress?.completed ? '#10B981' : '#E5E7EB' }
                  ]}
                >
                  <Text style={styles.dayText}>
                    {progress?.completed ? '✓' : progress?.date?.split('-')[2]}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Description */}
          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total:  {item.totalCompletion || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Best: {item.longestStreak || 0} days</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Week Progress: {item.stats?.weeklyCompletion || 0}/7</Text>
            <LinearProgress
              value={(item.stats?.weeklyCompletion || 0) / 7}
              color="#10B981"
              style={styles.progressBar}
            />
          </View>

          {/* Action Button */}
          {!completedToday ? (
            <Button
              mode="contained"
              style={styles.completeButton}
              onPress={() => handleCompleteHabit(item._id)}
              icon="check-circle"
            >
              Complete Today +{item.ecoPointsPerCompletion || 10} pts
            </Button>
          ) : (
            <View style={styles.completedBadge}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
              <Text style={styles.completedText}>Completed today!</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Daily Habits 🌱</Text>
          <Text style={styles.subtitle}>Build consistency, earn eco-points</Text>
        </View>

        {/* Habits List */}
        {habits.length > 0 ? (
          <View style={styles.habitsList}>
            {habits.map((habit) => (
              <View key={habit._id}>
                {renderHabitCard({ item: habit })}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="leaf" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptyText}>Start building sustainable habits!</Text>
            <Button mode="contained" style={{ marginTop: 12 }}>
              Add First Habit
            </Button>
          </View>
        )}
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500'
  },
  habitsList: {
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  habitCard: {
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  habitName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937'
  },
  habitCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textTransform: 'capitalize'
  },
  streakBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center'
  },
  streakEmoji: {
    fontSize: 16
  },
  streakNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2
  },
  weeklyProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  dayText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  description: {
    fontSize: 12,
    color: '#6B7280',
    marginVertical: 8,
    fontStyle: 'italic'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 6
  },
  statItem: {
    flex: 1
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600'
  },
  progressContainer: {
    marginVertical: 10
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '600'
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB'
  },
  completeButton: {
    backgroundColor: '#10B981',
    marginTop: 12
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#F0FDF4',
    borderRadius: 6
  },
  completedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 6
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12
  },
  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6
  }
});

export default HabitsScreen;
