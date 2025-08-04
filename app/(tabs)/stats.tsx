import React from 'react';
import { StyleSheet, View } from 'react-native';
import UserStats from '../../components/UserStats';

export default function StatsScreen() {
  return (
    <View style={styles.container}>
      <UserStats />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 