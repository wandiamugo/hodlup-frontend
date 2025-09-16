import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function NewBoard() {
  return (
    <View style={styles.boardContainer}>
      <Image
        source={require('./assets/images/casinoboard.png')}
        style={styles.boardImage}
        resizeMode="contain"
      />
      {/* Overlay interactive elements here */}
    </View>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardImage: {
    width: width,
    height: width, // Adjust height as needed for your layout
  },
});