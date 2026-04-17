import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TournamentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>TournamentsScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' },
  text: { color: '#fff', fontSize: 24, fontWeight: 'bold' }
});
