import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();

  const MenuItem = ({ icon, title, subtitle, onPress, colors }) => (
    <TouchableOpacity onPress={onPress}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.menuItem}
      >
        <Ionicons name={icon} size={32} color="#fff" />
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1e1b4b', '#312e81']}
        style={styles.header}
      >
        <View style={styles.userInfo}>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.username}>{user?.displayName || user?.username}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Level {user?.level || 1}</Text>
          </View>
        </View>
        
        <View style={styles.currencyContainer}>
          <View style={styles.currency}>
            <Ionicons name="logo-bitcoin" size={20} color="#fbbf24" />
            <Text style={styles.currencyText}>{user?.coins?.toLocaleString() || 0}</Text>
          </View>
          <View style={styles.currency}>
            <Ionicons name="diamond" size={20} color="#3b82f6" />
            <Text style={styles.currencyText}>{user?.gems?.toLocaleString() || 0}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.menuContainer}>
        <MenuItem
          icon="game-controller"
          title="Play Now"
          subtitle="Start a new game"
          colors={['#3b82f6', '#2563eb']}
          onPress={() => navigation.navigate('Play')}
        />
        
        <MenuItem
          icon="trophy"
          title="Tournaments"
          subtitle="Compete for prizes"
          colors={['#f59e0b', '#d97706']}
          onPress={() => navigation.navigate('Tournaments')}
        />
        
        <MenuItem
          icon="people"
          title="Friends"
          subtitle="Play with friends"
          colors={['#10b981', '#059669']}
          onPress={() => navigation.navigate('Friends')}
        />
        
        <MenuItem
          icon="briefcase"
          title="Inventory"
          subtitle="View your items"
          colors={['#8b5cf6', '#7c3aed']}
          onPress={() => navigation.navigate('Inventory')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  header: { padding: 24, paddingTop: 60 },
  userInfo: { marginBottom: 24 },
  welcome: { color: '#c7d2fe', fontSize: 16 },
  username: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  levelBadge: { 
    backgroundColor: 'rgba(251,191,36,0.2)', 
    paddingHorizontal: 12, 
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8
  },
  levelText: { color: '#fbbf24', fontWeight: '600' },
  currencyContainer: { flexDirection: 'row', gap: 16 },
  currency: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12
  },
  currencyText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  menuContainer: { padding: 16, gap: 12 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 16
  },
  menuText: { flex: 1 },
  menuTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  menuSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 }
});
