import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { adminService } from '../api/services';

const AdminDashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      Alert.alert('Error', 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardStats();
  };

  const StatCard = ({ title, value, subtitle, icon, color, onPress }) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
        style={styles.cardGradient}
      >
        <View style={styles.statIconContainer}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statValue}>{value?.toLocaleString() || 0}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const MenuItem = ({ icon, title, subtitle, onPress, color = '#2563eb' }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6b7280" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading admin dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#111827', '#1f2937']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Manage your game platform</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Users"
            value={stats?.users?.total}
            subtitle={`+${stats?.users?.newToday || 0} today`}
            icon="people"
            color="#3b82f6"
            onPress={() => navigation.navigate('AdminUsers')}
          />
          <StatCard
            title="Active Users"
            value={stats?.users?.active}
            subtitle="Last 7 days"
            icon="pulse"
            color="#10b981"
          />
          <StatCard
            title="Total Games"
            value={stats?.games?.total}
            subtitle={`${stats?.games?.today || 0} today`}
            icon="game-controller"
            color="#f59e0b"
          />
          <StatCard
            title="Revenue"
            value={`$${stats?.revenue?.total || 0}`}
            subtitle="Last 30 days"
            icon="cash"
            color="#8b5cf6"
          />
        </View>

        {/* Open Tickets Alert */}
        {(stats?.support?.openTickets || 0) > 0 && (
          <TouchableOpacity 
            style={styles.alertCard}
            onPress={() => navigation.navigate('AdminTickets')}
          >
            <Ionicons name="warning" size={24} color="#f59e0b" />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Open Support Tickets</Text>
              <Text style={styles.alertText}>
                {stats.support.openTickets} ticket{stats.support.openTickets > 1 ? 's' : ''} need attention
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#f59e0b" />
          </TouchableOpacity>
        )}

        {/* Management Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Management</Text>
          
          <MenuItem
            icon="people-outline"
            title="User Management"
            subtitle="View, edit, ban users"
            onPress={() => navigation.navigate('AdminUsers')}
            color="#3b82f6"
          />
          
          <MenuItem
            icon="cart-outline"
            title="Shop Management"
            subtitle="Manage items & inventory"
            onPress={() => navigation.navigate('AdminShop')}
            color="#10b981"
          />
          
          <MenuItem
            icon="trophy-outline"
            title="Tournaments"
            subtitle="Create & manage tournaments"
            onPress={() => navigation.navigate('AdminTournaments')}
            color="#f59e0b"
          />
          
          <MenuItem
            icon="chatbubbles-outline"
            title="Support Tickets"
            subtitle={`${stats?.support?.openTickets || 0} open tickets`}
            onPress={() => navigation.navigate('AdminTickets')}
            color="#8b5cf6"
          />
          
          <MenuItem
            icon="bar-chart-outline"
            title="Analytics"
            subtitle="View detailed statistics"
            onPress={() => navigation.navigate('AdminAnalytics')}
            color="#ec4899"
          />
          
          <MenuItem
            icon="cash-outline"
            title="Transactions"
            subtitle="View payment history"
            onPress={() => navigation.navigate('AdminTransactions')}
            color="#14b8a6"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('AdminAddCurrency')}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#f59e0b20' }]}>
                <Ionicons name="add-circle" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.quickText}>Add Currency</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('AdminAnnouncements')}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#3b82f620' }]}>
                <Ionicons name="megaphone" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.quickText}>Announcement</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('AdminSettings')}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#6b728020' }]}>
                <Ionicons name="settings" size={24} color="#6b7280" />
              </View>
              <Text style={styles.quickText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: -20,
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statContent: {
    justifyContent: 'flex-end',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statTitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 11,
    color: '#10b981',
    marginTop: 4,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  alertText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  menuSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    width: '31%',
  },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});

export default AdminDashboardScreen;
