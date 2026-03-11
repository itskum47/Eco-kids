/**
 * @fileoverview Challenges screen - Display and manage school challenges
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert,
  TouchableOpacity
} from 'react-native';
import { Card, Text, Button, ActivityIndicator, Chip, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ApiService from '../../services/api';

const ChallengesScreen = ({ navigation }) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('active'); // active, upcoming, completed

  useEffect(() => {
    loadChallenges();
  }, [filter]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const result = await ApiService.getChallenges({ status: filter });

      if (result.success) {
        setChallenges(result.challenges || []);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('[ChallengesScreen] Error:', error);
      Alert.alert('Error', 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChallenges();
    setRefreshing(false);
  };

  const renderChallengeCard = ({ item }) => {
    const timeRemaining = item.endsAt ? getTimeRemaining(item.endsAt) : null;
    const difficultyColor = getDifficultyColor(item.rules?.difficultyTier);

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ChallengeDetail', { challengeId: item._id, title: item.title })}
      >
        <Card style={styles.challengeCard}>
          <Card.Content>
            <View style={styles.challengeHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.challengeTitle}>{item.title}</Text>
                <Text style={styles.challengeType}>{item.challengeType?.replace('_', ' ')}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(filter) }]}>
                <Text style={styles.statusText}>{getStatusEmoji(filter)}</Text>
              </View>
            </View>

            <Text style={styles.description}>{item.description}</Text>

            {/* Difficulty & Multiplier */}
            <View style={styles.tagsContainer}>
              {item.rules?.difficultyTier && (
                <Chip
                  icon="zap"
                  style={{ backgroundColor: difficultyColor, marginRight: 8 }}
                  textStyle={{ color: '#FFFFFF', fontSize: 10 }}
                >
                  {item.rules.difficultyTier.toUpperCase()}
                </Chip>
              )}
              {item.rules?.pointsMultiplier > 1 && (
                <Chip
                  icon="star"
                  style={{ backgroundColor: '#A78BFA', marginRight: 8 }}
                  textStyle={{ color: '#FFFFFF', fontSize: 10 }}
                >
                  {item.rules.pointsMultiplier}x BONUS
                </Chip>
              )}
            </View>

            {/* Participants */}
            <View style={styles.participantsBox}>
              <MaterialCommunityIcons name="account-multiple" size={16} color="#6B7280" />
              <Text style={styles.participantsText}>
                {item.schools?.length || 0} schools • {item.schools?.reduce((sum, s) => sum + (s.participantCount || 0), 0) || 0} participants
              </Text>
            </View>

            {/* Time Remaining */}
            {timeRemaining && filter === 'active' && (
              <View style={styles.timeBox}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#DC2626" />
                <Text style={styles.timeText}>{timeRemaining}</Text>
              </View>
            )}

            {/* View Button */}
            <Button
              mode="contained"
              style={styles.viewButton}
              onPress={() => navigation.navigate('ChallengeDetail', { challengeId: item._id, title: item.title })}
            >
              View Challenge
            </Button>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading && challenges.length === 0) {
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
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['active', 'upcoming', 'completed'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.filterTab,
              filter === tab && styles.filterTabActive
            ]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[
              styles.filterText,
              filter === tab && styles.filterTextActive
            ]}>
              {tab === 'active' && '🔥 Active'}
              {tab === 'upcoming' && '📅 Upcoming'}
              {tab === 'completed' && '✅ Completed'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Challenges List */}
      <FlatList
        data={challenges}
        renderItem={renderChallengeCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="inbox-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No {filter} challenges</Text>
            <Text style={styles.emptyText}>Check back soon for new challenges!</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getTimeRemaining = (endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;

  if (diff <= 0) return 'Ended';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
};

const getDifficultyColor = (tier) => {
  switch (tier) {
    case 'easy': return '#34D399';
    case 'medium': return '#60A5FA';
    case 'hard': return '#F97316';
    case 'extreme': return '#DC2626';
    default: return '#6B7280';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'active': return '#D1FAE5';
    case 'upcoming': return '#DBEAFE';
    case 'completed': return '#D1D5DB';
    default: return '#F3F4F6';
  }
};

const getStatusEmoji = (status) => {
  switch (status) {
    case 'active': return '🔥';
    case 'upcoming': return '📅';
    case 'completed': return '✅';
    default: return '•';
  }
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6'
  },
  filterTabActive: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#0284C7'
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280'
  },
  filterTextActive: {
    color: '#0284C7'
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  challengeCard: {
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937'
  },
  challengeType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textTransform: 'capitalize'
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusText: {
    fontSize: 18
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 10
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 6
  },
  participantsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 6
  },
  participantsText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500'
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 6
  },
  timeText: {
    fontSize: 12,
    color: '#DC2626',
    marginLeft: 6,
    fontWeight: '600'
  },
  viewButton: {
    backgroundColor: '#10B981',
    marginTop: 8
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

export default ChallengesScreen;
