import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { gameAPI, leaderboardAPI } from '../api/services';

export default function GameScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeGames, setActiveGames] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameStats, setGameStats] = useState(null);
  const [gameSession, setGameSession] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch data in parallel
      const [gamesRes, leaderboardRes] = await Promise.all([
        gameAPI.getActiveGames().catch(() => ({ data: [] })),
        leaderboardAPI.getGlobal({ limit: 10 }).catch(() => ({ data: [] })),
      ]);

      setActiveGames(gamesRes.data || []);
      setLeaderboard(leaderboardRes.data?.leaderboard || []);
      
    } catch (error) {
      console.error('Error loading game data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const startNewGame = async () => {
    try {
      setLoading(true);
      
      const response = await gameAPI.startGame({
        type: 'quick_match',
        mode: 'ranked'
      });

      setGameSession(response.data);
      Alert.alert('Game Started!', 'Good luck!');
      
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const endGame = async () => {
    if (!gameSession) return;

    try {
      setLoading(true);
      
      await gameAPI.endGame(gameSession._id, {
        score: Math.floor(Math.random() * 1000),
        duration: 300,
        won: Math.random() > 0.5
      });

      setGameSession(null);
      Alert.alert('Game Complete!', 'Results saved!');
      loadData();
      
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to end game');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={['#1e3a8a', '#1a1a1a']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Game Arena</Text>
        <Text style={styles.headerSubtitle}>Compete & Climb the Ranks</Text>
      </LinearGradient>

      {/* Active Game Session */}
      {gameSession && (
        <View style={styles.sessionCard}>
          <View style={styles.sessionHeader}>
            <Ionicons name="game-controller" size={24} color="#10b981" />
            <Text style={styles.sessionTitle}>Active Game</Text>
          </View>
          <Text style={styles.sessionText}>Game ID: {gameSession._id?.slice(-8)}</Text>
          <Text style={styles.sessionText}>Started: {new Date(gameSession.startedAt).toLocaleTimeString()}</Text>
          <TouchableOpacity style={styles.endButton} onPress={endGame}>
            <Text style={styles.endButtonText}>End Game</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Start New Game */}
      {!gameSession && (
        <TouchableOpacity style={styles.startButton} onPress={startNewGame}>
          <LinearGradient
            colors={['#2563eb', '#1d4ed8']}
            style={styles.startButtonGradient}
          >
            <Ionicons name="play" size={24} color="#fff" />
            <Text style={styles.startButtonText}>Start New Game</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Active Games */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Games</Text>
        {activeGames.length === 0 ? (
          <Text style={styles.emptyText}>No active games right now</Text>
        ) : (
          activeGames.map((game, index) => (
            <View key={game._id || index} style={styles.gameCard}>
              <View style={styles.gameInfo}>
                <Text style={styles.gameType}>{game.type}</Text>
                <Text style={styles.gameMode}>{game.mode}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </View>
          ))
        )}
      </View>

      {/* Leaderboard */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Players</Text>
        {leaderboard.map((player, index) => (
          <View key={player._id || index} style={styles.leaderboardItem}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player.username}</Text>
              <Text style={styles.playerScore}>{player.score?.toLocaleString()} pts</Text>
            </View>
            {index < 3 && (
              <Ionicons 
                name="trophy" 
                size={20} 
                color={index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : '#cd7f32'} 
              />
            )}
          </View>
        ))}
      </View>

      {/* Quick Links */}
      <View style={styles.quickLinks}>
        <TouchableOpacity style={styles.quickLink}>
          <Ionicons name="trophy-outline" size={24} color="#2563eb" />
          <Text style={styles.quickLinkText}>Tournaments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickLink}>
          <Ionicons name="people-outline" size={24} color="#2563eb" />
          <Text style={styles.quickLinkText}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickLink}>
          <Ionicons name="time-outline" size={24} color="#2563eb" />
          <Text style={styles.quickLinkText}>History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 4,
  },
  sessionCard: {
    backgroundColor: '#1f2937',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTitle: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sessionText: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 4,
  },
  endButton: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  endButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  startButton: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    padding: 24,
  },
  gameCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameInfo: {
    flex: 1,
  },
  gameType: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  gameMode: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 2,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  playerScore: {
    color: '#2563eb',
    fontSize: 14,
  },
  quickLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  quickLink: {
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    width: 100,
  },
  quickLinkText: {
    color: '#9ca3af',
    marginTop: 8,
    fontSize: 12,
  },
});
