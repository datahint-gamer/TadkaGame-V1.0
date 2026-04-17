import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { adminApi } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ title, value, icon, color, subtitle, onPress }) => (
  <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={28} color={color} />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  </TouchableOpacity>
);

const QuickAction = ({ title, icon, onPress, color }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.quickActionText}>{title}</Text>
  </TouchableOpacity>
);

export default function AdminDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState({ users: [], transactions: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await adminApi.getDashboardStats();
      setStats(response.data.stats);
      setRecent(response.data.recent);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await fetchDashboardData();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Welcome back, {user?.displayName || user?.username || 'Admin'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationBtn}
          onPress={() => navigation.navigate('AdminNotifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Users"
          value={formatNumber(stats?.users?.total || 0)}
          subtitle={`+${stats?.users?.newToday || 0} today`}
          icon="people"
          color="#3b82f6"
          onPress={() => navigation.navigate('AdminUsers')}
        />
        <StatCard
          title="Active Users"
          value={formatNumber(stats?.users?.active || 0)}
          subtitle="Last 7 days"
          icon="pulse"
          color="#10b981"
          onPress={() => navigation.navigate('AdminUsers', { filter: 'active' })}
        />
        <StatCard
          title="Total Games"
          value={formatNumber(stats?.games?.total || 0)}
          subtitle={`+${stats?.games?.today || 0} today`}
          icon="game-controller"
          color="#8b5cf6"
          onPress={() => navigation.navigate('AdminAnalytics')}
        />
        <StatCard
          title="Revenue"
          value={`$${formatNumber(stats?.revenue?.total || 0)}`}
          subtitle="Last 30 days"
          icon="cash"
          color="#f59e0b"
          onPress={() => navigation.navigate('AdminTransactions')}
        />
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsRow}>
        <QuickAction
          title="Manage Users"
          icon="people"
          color="#3b82f6"
          onPress={() => navigation.navigate('AdminUsers')}
        />
        <QuickAction
          title="View Tickets"
          icon="ticket"
          color="#ef4444"
          onPress={() => navigation.navigate('AdminTickets')}
        />
        <QuickAction
          title="Shop Items"
          icon="cart"
          color="#8b5cf6"
          onPress={() => navigation.navigate('AdminShop')}
        />
        <QuickAction
          title="Analytics"
          icon="bar-chart"
          color="#10b981"
          onPress={() => navigation.navigate('AdminAnalytics')}
        />
      </View>

      {/* System Status */}
      <View style={styles.systemStatus}>
        <Text style={styles.sectionTitle}>System Status</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.statusText}>Server Online</Text>
            </View>
            <Text style={styles.statusValue}>100% Uptime</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.statusText}>Open Tickets</Text>
            </View>
            <Text style={styles.statusValue}>{stats?.support?.openTickets || 0}</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: '#3b82f6' }]} />
              <Text style={styles.statusText}>Active Games</Text>
            </View>
            <Text style={styles.statusValue}>{stats?.games?.week || 0} this week</Text>
          </View>
        </View>
      </View>

      {/* Recent Users */}
      <Text style={styles.sectionTitle}>Recent Users</Text>
      <View style={styles.recentCard}>
        {recent.users?.slice(0, 5).map((user, index) => (
          <TouchableOpacity
            key={user._id || index}
            style={styles.recentUserItem}
            onPress={() => navigation.navigate('AdminUserDetail', { userId: user._id })}
          >
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {(user.displayName || user.username || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.displayName || user.username}</Text>
              <Text style={styles.userDate}>
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() => navigation.navigate('AdminUsers')}
        >
          <Text style={styles.viewAllText}>View All Users</Text>
          <Ionicons name="arrow-forward" size={16} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statTitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  systemStatus: {
    marginTop: 8,
  },
  statusCard: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#e2e8f0',
    fontSize: 14,
  },
  statusValue: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  recentCard: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 12,
  },
  recentUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  userDate: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  viewAllText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  bottomPadding: {
    height: 40,
  },
});
