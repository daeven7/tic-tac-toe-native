import React from 'react';
import { StyleSheet, View } from 'react-native';
import TicTacToe from '../../components/TicTacToe';

export default function GameScreen() {
  return (
    <View style={styles.container}>
      <TicTacToe />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 