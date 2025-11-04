import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

interface HexagonProps {
  size: number;
  bitcoins: number;
  isSelected: boolean;
  onPress: () => void;
  theme: any;
}

export default function Hexagon({ size, bitcoins, isSelected, onPress, theme }: HexagonProps) {
  // Calculate hexagon points for a flat-top hexagon
  const width = size;
  const height = size * 0.866; // √3/2 ratio for regular hexagon

  // Hexagon vertices (flat-top orientation)
  const points = [
    { x: width * 0.25, y: 0 },           // Top-left
    { x: width * 0.75, y: 0 },           // Top-right
    { x: width, y: height * 0.5 },       // Right
    { x: width * 0.75, y: height },      // Bottom-right
    { x: width * 0.25, y: height },      // Bottom-left
    { x: 0, y: height * 0.5 },           // Left
  ];

  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');

  const bitcoinSymbols = '₿'.repeat(bitcoins);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.container, { width, height }]}
    >
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Polygon
          points={pointsString}
          fill={isSelected ? theme.colors.primary + '40' : theme.colors.cardBackground}
          stroke={isSelected ? theme.colors.accent : theme.colors.border}
          strokeWidth={isSelected ? 3 : 2}
        />
      </Svg>
      <View style={styles.contentContainer}>
        <Text style={[styles.bitcoinText, { color: theme.colors.accent }]}>
          {bitcoinSymbols}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  contentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bitcoinText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
