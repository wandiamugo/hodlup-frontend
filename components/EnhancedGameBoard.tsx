import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Text,
  Animated
} from 'react-native';
import HexagonTile from './HexagonTile';

const { width, height } = Dimensions.get('window');

interface EnhancedGameBoardProps {
  gameBoard: {
    blocks: Array<{
      id: number;
      owner?: string;
      bitcoinTokens: number;
      transactions: any[];
      isGenesis?: boolean;
    }>;
  };
  currentBlock?: number;
  onTilePress?: (tileNumber: number) => void;
  theme: any;
  zoomLevel?: number;
  showTileDetails?: boolean;
}

export default function EnhancedGameBoard({
  gameBoard,
  currentBlock = 1,
  onTilePress,
  theme,
  zoomLevel = 1,
  showTileDetails = true
}: EnhancedGameBoardProps) {
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [zoomedTile, setZoomedTile] = useState<number | null>(null);
  const [currentZoom, setCurrentZoom] = useState(1);

  const styles = createStyles(theme);

  // Define tile positions for hex layout (same as original but enhanced)
  const hexPositions = [
    // Top row (12, 13, 14)
    { number: 12, left: '20%', top: '15%' },
    { number: 13, left: '35%', top: '8%' },
    { number: 14, left: '50%', top: '15%' },

    // Second row (15, 16, 17, 18)
    { number: 15, left: '12%', top: '28%' },
    { number: 16, left: '28%', top: '22%' },
    { number: 17, left: '42%', top: '22%' },
    { number: 18, left: '58%', top: '28%' },

    // Third row (19, 20, 21, 22, 23)
    { number: 19, left: '8%', top: '42%' },
    { number: 20, left: '22%', top: '35%' },
    { number: 21, left: '35%', top: '35%' },
    { number: 22, left: '48%', top: '35%' },
    { number: 23, left: '62%', top: '42%' },

    // Fourth row (24, 25, 26, 27, 28, 29)
    { number: 24, left: '5%', top: '55%' },
    { number: 25, left: '18%', top: '48%' },
    { number: 26, left: '30%', top: '48%' },
    { number: 27, left: '42%', top: '48%' },
    { number: 28, left: '54%', top: '48%' },
    { number: 29, left: '67%', top: '55%' },

    // Bottom row (30, 31, 32, 33, 34)
    { number: 30, left: '15%', top: '68%' },
    { number: 31, left: '28%', top: '62%' },
    { number: 32, left: '42%', top: '62%' },
    { number: 33, left: '56%', top: '62%' },
    { number: 34, left: '70%', top: '68%' },
  ];

  const handleTilePress = (tileNumber: number) => {
    if (selectedTile === tileNumber) {
      // If same tile clicked, toggle zoom mode
      setZoomedTile(zoomedTile === tileNumber ? null : tileNumber);
    } else {
      setSelectedTile(tileNumber);
      setZoomedTile(null);
    }
    onTilePress?.(tileNumber);
  };

  const getTileData = (tileNumber: number) => {
    const blockData = gameBoard.blocks.find(block => block.id === tileNumber) || {
      id: tileNumber,
      bitcoinTokens: Math.floor(Math.random() * 4) + 1,
      transactions: [],
      owner: undefined
    };

    return {
      ...blockData,
      isGenesis: tileNumber === 12,
      isCurrentBlock: tileNumber === currentBlock,
      isPreviousBlock: tileNumber === currentBlock - 1,
      isNextBlock: tileNumber === currentBlock + 1,
    };
  };

  const getAdjacentTiles = (tileNumber: number) => {
    // Define adjacency relationships for hex grid
    const adjacencyMap: { [key: number]: number[] } = {
      12: [13, 15, 16],
      13: [12, 14, 16, 17],
      14: [13, 17, 18],
      15: [12, 16, 19, 20],
      16: [12, 13, 15, 17, 20, 21],
      17: [13, 14, 16, 18, 21, 22],
      18: [14, 17, 22, 23],
      19: [15, 20, 24, 25],
      20: [15, 16, 19, 21, 25, 26],
      21: [16, 17, 20, 22, 26, 27],
      22: [17, 18, 21, 23, 27, 28],
      23: [18, 22, 28, 29],
      24: [19, 25, 30],
      25: [19, 20, 24, 26, 30, 31],
      26: [20, 21, 25, 27, 31, 32],
      27: [21, 22, 26, 28, 32, 33],
      28: [22, 23, 27, 29, 33, 34],
      29: [23, 28, 34],
      30: [24, 25, 31],
      31: [25, 26, 30, 32],
      32: [26, 27, 31, 33],
      33: [27, 28, 32, 34],
      34: [28, 29, 33],
    };

    return adjacencyMap[tileNumber] || [];
  };

  const renderZoomedView = () => {
    if (!zoomedTile) return null;

    const mainTile = zoomedTile;
    const adjacentTiles = getAdjacentTiles(mainTile);
    const allTiles = [mainTile, ...adjacentTiles];

    return (
      <View style={styles.zoomedViewOverlay}>
        <View style={styles.zoomedViewContainer}>
          <View style={styles.zoomedViewHeader}>
            <Text style={styles.zoomedViewTitle}>Block {mainTile} Detail</Text>
            <TouchableOpacity
              style={styles.closeZoomButton}
              onPress={() => setZoomedTile(null)}
            >
              <Text style={styles.closeZoomButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.zoomedTilesContainer}>
            {/* Main tile in center */}
            <View style={styles.mainTileContainer}>
              <HexagonTile
                tileNumber={mainTile}
                tileData={getTileData(mainTile)}
                position={{ left: '50%', top: '50%' }}
                isSelected={true}
                onPress={handleTilePress}
                theme={theme}
                showDetails={true}
                size={70}
              />
            </View>

            {/* Adjacent tiles around it */}
            <View style={styles.adjacentTilesContainer}>
              {adjacentTiles.map((tileNum, index) => {
                const angle = (index * 360) / adjacentTiles.length;
                const radius = 80;
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;

                return (
                  <View
                    key={tileNum}
                    style={[
                      styles.adjacentTilePosition,
                      {
                        transform: [
                          { translateX: x },
                          { translateY: y }
                        ]
                      }
                    ]}
                  >
                    <HexagonTile
                      tileNumber={tileNum}
                      tileData={getTileData(tileNum)}
                      position={{ left: '0%', top: '0%' }}
                      isSelected={false}
                      onPress={handleTilePress}
                      theme={theme}
                      showDetails={false}
                      size={50}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        maximumZoomScale={3}
        minimumZoomScale={0.5}
        zoomEnabled={true}
        pinchGestureEnabled={true}
        scrollEnabled={true}
      >
        <View style={[styles.boardContainer, { transform: [{ scale: currentZoom }] }]}>
          {/* Render hexagonal tiles */}
          {hexPositions.map((hex) => (
            <HexagonTile
              key={hex.number}
              tileNumber={hex.number}
              tileData={getTileData(hex.number)}
              position={{ left: hex.left, top: hex.top }}
              isSelected={selectedTile === hex.number}
              onPress={handleTilePress}
              theme={theme}
              showDetails={showTileDetails}
              size={50}
            />
          ))}
        </View>
      </ScrollView>

      {/* Zoom control buttons */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={[styles.zoomButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            const newZoom = Math.min(currentZoom * 1.2, 3);
            setCurrentZoom(newZoom);
          }}
        >
          <Text style={styles.zoomButtonText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.zoomButton, { backgroundColor: theme.colors.secondary }]}
          onPress={() => {
            const newZoom = Math.max(currentZoom * 0.8, 0.5);
            setCurrentZoom(newZoom);
          }}
        >
          <Text style={styles.zoomButtonText}>-</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.zoomButton, { backgroundColor: theme.colors.accent }]}
          onPress={() => {
            setCurrentZoom(1);
          }}
        >
          <Text style={styles.zoomButtonText}>⌂</Text>
        </TouchableOpacity>
      </View>

      {/* Zoomed tile view overlay */}
      {renderZoomedView()}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },

  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.medium,
  },

  boardContainer: {
    width: width * 0.95,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.large,
    borderWidth: 2,
    borderColor: theme.colors.border,
    ...theme.shadows.medium,
  },

  zoomControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'column',
    gap: theme.spacing.small,
  },

  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },

  zoomButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },

  zoomedViewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  zoomedViewContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.large,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },

  zoomedViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.large,
  },

  zoomedViewTitle: {
    fontSize: theme.fonts.sizes.xlarge,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
  },

  closeZoomButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.error || '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeZoomButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },

  zoomedTilesContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  mainTileContainer: {
    position: 'absolute',
    zIndex: 10,
  },

  adjacentTilesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  adjacentTilePosition: {
    position: 'absolute',
  },
});