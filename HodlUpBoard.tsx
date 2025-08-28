import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Hexagon component
const Hexagon = ({ number, x, y, onPress, hasBitcoin, isNumbered, bitcoinCount }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress && number) {
      onPress(number);
    }
  };

  // Determine hex color based on position
  const getHexColor = () => {
    if (number === 11) return '#1e5128'; // Start - green
    if (number === 31) return '#8b0000'; // End - red
    if (isNumbered) return '#2d2d44'; // Numbered hexes - dark blue
    return '#1a1a2e'; // Bitcoin hexes - darker background
  };

  const hexColor = getHexColor();
  const borderColor = isNumbered ? '#ffd700' : '#4a4a6a'; // Gold for numbered, gray for others

  return (
    <TouchableOpacity
      style={[styles.hexContainer, { left: x, top: y }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={[styles.hexTop, { borderBottomColor: hexColor }]} />
        <View style={[styles.hexMiddle, { backgroundColor: hexColor, borderColor: borderColor }]}>
          {isNumbered ? (
            <Text style={styles.hexNumber}>{number}</Text>
          ) : hasBitcoin ? (
            <View style={styles.bitcoinContainer}>
              {bitcoinCount > 1 ? (
                <>
                  <Text style={[styles.bitcoinSymbol, styles.bitcoinSmall]}>₿ ₿</Text>
                  {bitcoinCount > 2 && <Text style={[styles.bitcoinSymbol, styles.bitcoinSmall]}>₿ ₿</Text>}
                </>
              ) : (
                <Text style={styles.bitcoinSymbol}>₿</Text>
              )}
            </View>
          ) : null}
        </View>
        <View style={[styles.hexBottom, { borderTopColor: hexColor }]} />
        {isNumbered && (
          <View style={[styles.hexBorder, { borderColor: borderColor }]} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Main Board Component
const HODLUPBoard = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const hexSize = 36;
  const hexWidth = hexSize;
  const hexHeight = hexSize * 0.866;
  const horizontalSpacing = hexSize * 0.76;
  const verticalSpacing = hexSize * 0.88;
  const startX = 10;

  // Generate all hexagon positions
  const hexPositions = [];

  // Top row - Bitcoin hexagons (3 groups)
  // Left group
  hexPositions.push({ x: startX, y: 10, hasBitcoin: true });
  hexPositions.push({ x: startX + horizontalSpacing, y: 10, hasBitcoin: true });
  hexPositions.push({ x: startX + horizontalSpacing * 2, y: 10, hasBitcoin: true });

  // Middle-left group (connected to main chain)
  hexPositions.push({ x: startX + horizontalSpacing * 7, y: 10, hasBitcoin: true, bitcoinCount: 4 });
  hexPositions.push({ x: startX + horizontalSpacing * 8, y: 10, hasBitcoin: true, bitcoinCount: 4 });

  // Right group
  hexPositions.push({ x: startX + horizontalSpacing * 13, y: 10, hasBitcoin: true });
  hexPositions.push({ x: startX + horizontalSpacing * 14, y: 10, hasBitcoin: true });
  hexPositions.push({ x: startX + horizontalSpacing * 15, y: 10, hasBitcoin: true });
  hexPositions.push({ x: startX + horizontalSpacing * 16, y: 10, hasBitcoin: true });

  // Far right group
  hexPositions.push({ x: startX + horizontalSpacing * 19, y: 10, hasBitcoin: true });
  hexPositions.push({ x: startX + horizontalSpacing * 20, y: 10, hasBitcoin: true });

  // Main numbered row (11-31)
  for (let i = 0; i < 21; i++) {
    hexPositions.push({
      x: startX + (horizontalSpacing * i),
      y: 10 + verticalSpacing,
      number: 11 + i,
      isNumbered: true
    });
  }

  // Bottom row - Bitcoin hexagons
  // Left section
  hexPositions.push({ x: startX, y: 10 + verticalSpacing * 2, hasBitcoin: true });
  hexPositions.push({ x: startX + horizontalSpacing, y: 10 + verticalSpacing * 2, hasBitcoin: true });
  hexPositions.push({ x: startX + horizontalSpacing * 2, y: 10 + verticalSpacing * 2, hasBitcoin: true });
  
  // Middle section
  for (let i = 3; i < 13; i++) {
    hexPositions.push({
      x: startX + horizontalSpacing * i,
      y: 10 + verticalSpacing * 2,
      hasBitcoin: true,
      bitcoinCount: i >= 5 && i <= 8 ? 2 : 1
    });
  }

  // Right section
  hexPositions.push({ x: startX + horizontalSpacing * 14, y: 10 + verticalSpacing * 2, hasBitcoin: true, bitcoinCount: 2 });
  hexPositions.push({ x: startX + horizontalSpacing * 15, y: 10 + verticalSpacing * 2, hasBitcoin: true, bitcoinCount: 2 });
  hexPositions.push({ x: startX + horizontalSpacing * 16, y: 10 + verticalSpacing * 2, hasBitcoin: true, bitcoinCount: 2 });
  hexPositions.push({ x: startX + horizontalSpacing * 17, y: 10 + verticalSpacing * 2, hasBitcoin: true, bitcoinCount: 2 });

  // Far right
  hexPositions.push({ x: startX + horizontalSpacing * 19, y: 10 + verticalSpacing * 2, hasBitcoin: true });
  hexPositions.push({ x: startX + horizontalSpacing * 20, y: 10 + verticalSpacing * 2, hasBitcoin: true });

  const handleHexPress = (hexNumber) => {
    console.log(`Hex ${hexNumber} pressed`);
  };

  const boardWidth = (horizontalSpacing * 21) + hexSize + 20;

  return (
    <Animated.View style={[styles.boardContainer, { opacity: fadeAnim }]}>
      <View style={styles.boardHeader}>
        <Text style={styles.boardTitle}>HODL UP®</Text>
        <Text style={styles.boardSubtitle}>2024 HALVING COLLECTOR'S EDITION</Text>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        style={styles.scrollView}
        contentContainerStyle={{ width: boardWidth }}
      >
        <View style={[styles.board, { width: boardWidth, height: 140 }]}>
          {hexPositions.map((pos, index) => (
            <Hexagon
              key={index}
              number={pos.number}
              x={pos.x}
              y={pos.y}
              isNumbered={pos.isNumbered}
              hasBitcoin={pos.hasBitcoin}
              bitcoinCount={pos.bitcoinCount}
              onPress={handleHexPress}
            />
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  boardContainer: {
    backgroundColor: '#0f0f1a',
    borderRadius: 20,
    padding: 15,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#2a2a3e',
  },
  boardHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  boardTitle: {
    color: '#ffd700',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  boardSubtitle: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.7,
    letterSpacing: 1,
    marginTop: 3,
  },
  scrollView: {
    height: 150,
  },
  board: {
    position: 'relative',
  },
  hexContainer: {
    position: 'absolute',
    width: 36,
    height: 41,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexTop: {
    width: 0,
    height: 0,
    borderLeftWidth: 18,
    borderLeftColor: 'transparent',
    borderRightWidth: 18,
    borderRightColor: 'transparent',
    borderBottomWidth: 10.4,
  },
  hexMiddle: {
    width: 36,
    height: 20.8,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderStyle: 'solid',
  },
  hexBottom: {
    width: 0,
    height: 0,
    borderLeftWidth: 18,
    borderLeftColor: 'transparent',
    borderRightWidth: 18,
    borderRightColor: 'transparent',
    borderTopWidth: 10.4,
  },
  hexBorder: {
    position: 'absolute',
    top: -10.4,
    left: -18,
    width: 36,
    height: 41,
    borderWidth: 1,
    borderColor: '#ffd700',
    opacity: 0.3,
  },
  hexNumber: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bitcoinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bitcoinSymbol: {
    color: '#ffd700',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bitcoinSmall: {
    fontSize: 8,
    lineHeight: 10,
  },
});

export default HODLUPBoard;