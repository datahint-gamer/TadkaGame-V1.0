import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminApi } from '../../api/adminApi';

const UserItem = ({ user, onPress, onBan, onEdit }) => (
  <TouchableOpacity style={styles.userCard} onPress={() => onPress(user)}>
    <View style={styles.userHeader}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(user.displayName || user.username || '?').charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{user.displayName || user.username}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: user.role === 'admin' ? '#ef4444' : '#3b82f6' }]}>
            <Text style={styles.badgeText}>{user.role || 'user'}</Text>
          </View>
          {user.isBanned && (
            <View style={[styles.badge, { backgroundColor: '#dc2626' }]}>
              <Text style={styles.badgeText}>BANNED</Text>
            </View>
          )}
          {user.isVerified && (
            <View style={[styles.badge, { backgroundColor: '#10b981' }]}>
              <Text style={styles.badgeText}>VERIFIED</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.userStats}>
        <Text style={styles.currency}>💰 {user.coins || 0}</Text>
        <Text style={styles.currency}>💎 {user.gems || 0}</Text>
        <Text style={styles.level}>Lv.{user.level || 1}</Text>
      </View>
    </View>
    <View style={styles.userActions}>
      <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(user)}>
        <Ionicons name="create-outline" size={18} color="#3b82f6" />
        <Text style={[styles.actionText, { color: '#3b82f6' }]}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.actionBtn} 
        onPress={() => onBan(user)}
      >
        <Ionicons 
          name={user.isBanned ? "checkmark-circle-outline" : "ban-outline"} 
          size={18} 
          color={user.isBanned ? '#10b981' : '#ef4444'} 
        />
        <Text style={[styles.actionText, { color: user.isBanned ? '#10b981' : '#ef4444' }]}>
          {user.isBanned ? 'Unban' : 'Ban'}
        </Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export default function AdminUsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, admin, banned, active
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchUsers = useCallback(async (pageNum = 1, shouldRefresh = false) => {
    try {
      const params = {
        page: pageNum,
        limit: 20,
        search: searchQuery || undefined,
      };

      if (filter === 'admin') params.role = 'admin';
      if (filter === 'banned') params.isBanned = 'true';

      const response = await adminApi.getUsers(params);
      
      if (shouldRefresh) {
        setUsers(response.data.users);
      } else {
        setUsers(prev => [...prev, ...response.data.users]);
      }
      
      setHasMore(response.data.users.length === 20);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      Alert.alert('Error', 'Failed to load users');
    }
  }, [searchQuery, filter]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    await fetchUsers(1, true);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchUsers(1, true);
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchUsers(nextPage);
  };

  const handleSearch = () => {
    setPage(1);
    setUsers([]);
    loadUsers();
  };

  const handleBanUser = async (user) => {
    const action = user.isBanned ? 'unban' : 'ban';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} ${user.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.toUpperCase(),
          style: user.isBanned ? 'default' : 'destructive',
          onPress: async () => {
            try {
              if (user.isBanned) {
                await adminApi.unbanUser(user._id);
              } else {
                // For ban, show another alert for reason
                Alert.prompt(
                  'Ban Reason',
                  'Enter reason for banning:',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'BAN',
                      style: 'destructive',
                      onPress: async (reason) => {
                        await adminApi.banUser(user._id, reason, null);
                        onRefresh();
                      }
                    }
                  ]
                );
                return;
              }
              onRefresh();
            } catch (error) {
              Alert.alert('Error', `Failed to ${action} user`);
            }
          }
        }
      ]
    );
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleAddCurrency = async () => {
    Alert.prompt(
      'Add Currency',
      'Enter amount of coins to add:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'ADD',
          onPress: async (amount) => {
            try {
              await adminApi.addCurrency(selectedUser._id, parseInt(amount) || 0, 0, 'Admin grant');
              Alert.alert('Success', 'Currency added successfully');
              onRefresh();
            } catch (error) {
              Alert.alert('Error', 'Failed to add currency');
            }
          }
        }
      ],
      'plain-text',
      '0'
    );
  };

  const filters = [
    { key: 'all', label: 'All', icon: 'people' },
    { key: 'admin', label: 'Admins', icon: 'shield' },
    { key: 'banned', label: 'Banned', icon: 'ban' },
    { key: 'active', label: 'Active', icon: 'pulse' },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748b" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchQuery(''); handleSearch(); }}>
            <Ionicons name="close-circle" size={20} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => { setFilter(f.key); setPage(1); loadUsers(); }}
          >
            <Ionicons 
              name={f.icon} 
              size={16} 
              color={filter === f.key ? '#fff' : '#94a3b8'} 
            />
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Users List */}
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <UserItem
            user={item}
            onPress={(user) => navigation.navigate('AdminUserDetail', { userId: user._id })}
            onBan={handleBanUser}
            onEdit={handleEditUser}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#475569" />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />

      {/* Edit User Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit User</Text>
            {selectedUser && (
              <>
                <Text style={styles.modalUser}>{selectedUser.username}</Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalBtn} onPress={handleAddCurrency}>
                    <Ionicons name="cash-outline" size={20} color="#f59e0b" />
                    <Text style={styles.modalBtnText}>Add Currency</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.modalBtn}
                    onPress={() => {
                      setModalVisible(false);
                      navigation.navigate('AdminUserDetail', { userId: selectedUser._id });
                    }}
                  >
                    <Ionicons name="eye-outline" size={20} color="#3b82f6" />
                    <Text style={styles.modalBtnText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            <TouchableOpacity 
              style={styles.modalClose}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#1e293b',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  filterContainer: {
    maxHeight: 50,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterText: {
    color: '#94a3b8',
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  userCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userStats: {
    alignItems: 'flex-end',
  },
  currency: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '500',
  },
  level: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#64748b',
    marginTop: 16,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  modalUser: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  modalActions: {
    gap: 12,
  },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  modalClose: {
    marginTop: 20,
    padding: 12,
  },
  modalCloseText: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 15,
  },
});
