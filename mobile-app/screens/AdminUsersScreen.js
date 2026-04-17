import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../api/services';

const AdminUsersScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchUsers = async (pageNum = 1, searchQuery = '') => {
    try {
      const params = {
        page: pageNum,
        limit: 20,
        search: searchQuery,
      };
      const data = await adminService.getUsers(params);
      setUsers(pageNum === 1 ? data.users : [...users, ...data.users]);
      setTotalPages(data.totalPages);
      setPage(data.currentPage);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers(1, search);
  };

  const handleSearch = (text) => {
    setSearch(text);
    fetchUsers(1, text);
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      fetchUsers(page + 1, search);
    }
  };

  const handleBanUser = async (user) => {
    Alert.alert(
      user.isBanned ? 'Unban User' : 'Ban User',
      `Are you sure you want to ${user.isBanned ? 'unban' : 'ban'} ${user.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: user.isBanned ? 'Unban' : 'Ban',
          style: 'destructive',
          onPress: async () => {
            try {
              if (user.isBanned) {
                await adminService.unbanUser(user._id);
              } else {
                await adminService.banUser(user._id, 'Violation of terms', null);
              }
              onRefresh();
              Alert.alert('Success', `User ${user.isBanned ? 'unbanned' : 'banned'} successfully`);
            } catch (error) {
              Alert.alert('Error', 'Failed to update user');
            }
          },
        },
      ]
    );
  };

  const handleAddCurrency = () => {
    setModalVisible(false);
    navigation.navigate('AdminAddCurrency', { userId: selectedUser._id, username: selectedUser.username });
  };

  const UserCard = ({ user }) => (
    <TouchableOpacity 
      style={[styles.userCard, user.isBanned && styles.bannedCard]}
      onPress={() => {
        setSelectedUser(user);
        setModalVisible(true);
      }}
    >
      <View style={styles.userInfo}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{user.username[0].toUpperCase()}</Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.userMeta}>
            <Text style={styles.roleBadge}>{user.role}</Text>
            <Text style={styles.levelText}>Lvl {user.level}</Text>
            {user.isBanned && <Text style={styles.bannedBadge}>BANNED</Text>}
          </View>
        </View>
      </View>
      <View style={styles.userStats}>
        <Text style={styles.currencyText}>💰 {user.coins}</Text>
        <Text style={styles.currencyText}>💎 {user.gems}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor="#6b7280"
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <UserCard user={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading && page > 1 ? <ActivityIndicator color="#2563eb" /> : null}
      />

      {/* User Actions Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>User Actions</Text>
            {selectedUser && (
              <>
                <Text style={styles.modalUsername}>{selectedUser.username}</Text>
                
                <TouchableOpacity style={styles.modalButton} onPress={handleAddCurrency}>
                  <Ionicons name="add-circle" size={20} color="#f59e0b" />
                  <Text style={styles.modalButtonText}>Add Currency</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.modalButton} onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('AdminUserDetail', { userId: selectedUser._id });
                }}>
                  <Ionicons name="person" size={20} color="#3b82f6" />
                  <Text style={styles.modalButtonText}>View Details</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.dangerButton]} 
                  onPress={() => {
                    setModalVisible(false);
                    handleBanUser(selectedUser);
                  }}
                >
                  <Ionicons name={selectedUser?.isBanned ? "checkmark-circle" : "ban"} size={20} color="#ef4444" />
                  <Text style={[styles.modalButtonText, styles.dangerText]}>
                    {selectedUser?.isBanned ? 'Unban User' : 'Ban User'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    paddingVertical: 12,
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannedCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  email: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    marginTop: 6,
    alignItems: 'center',
  },
  roleBadge: {
    backgroundColor: 'rgba(37,99,235,0.3)',
    color: '#60a5fa',
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
    textTransform: 'uppercase',
  },
  levelText: {
    color: '#10b981',
    fontSize: 11,
    marginRight: 8,
  },
  bannedBadge: {
    backgroundColor: 'rgba(239,68,68,0.3)',
    color: '#ef4444',
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  userStats: {
    alignItems: 'flex-end',
  },
  currencyText: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  modalUsername: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 20,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  dangerButton: {
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  dangerText: {
    color: '#ef4444',
  },
  cancelButton: {
    marginTop: 10,
    padding: 16,
    alignItems: 'center',
  },
  cancelText: {
    color: '#6b7280',
    fontSize: 16,
  },
});

export default AdminUsersScreen;
