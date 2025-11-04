import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Hexagon from './Hexagon';

const { width, height } = Dimensions.get('window');

interface PhysicalBoardProps {
  gameBoard: {
    blocks: Array<{
      id: number;
      owner?: string;
      bitcoinTokens: number;
      transactions: any[];
      isGenesis?: boolean;
    }>;
  };
  currentBlock: number;
  onTilePress?: (tileNumber: number) => void;
  theme: any;
}

interface HexPosition {
  x: number;
  y: number;
  bitcoins: number;
  id: string;
}

export default function PhysicalBoard({
  gameBoard,
  currentBlock,
  onTilePress,
  theme,
}: PhysicalBoardProps) {
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [selectedHex, setSelectedHex] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const scale = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const handleBlockPress = (blockNumber: number) => {
    setSelectedBlock(selectedBlock === blockNumber ? null : blockNumber);
    onTilePress?.(blockNumber);
  };

  const handleHexPress = (hexId: string) => {
    setSelectedHex(selectedHex === hexId ? null : hexId);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel * 1.3, 3);
    setZoomLevel(newZoom);
    Animated.spring(scale, {
      toValue: newZoom,
      useNativeDriver: true,
      friction: 7,
    }).start();
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel / 1.3, 0.5);
    setZoomLevel(newZoom);
    Animated.spring(scale, {
      toValue: newZoom,
      useNativeDriver: true,
      friction: 7,
    }).start();
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
    }).start();
  };

  // Time Chain blocks 11-31
  const timeChainBlocks = Array.from({ length: 21 }, (_, i) => i + 11);

  // Hexagon size (larger to wrap around time chain)
  const hexSize = 70;

  // Hexagon positions forming a chain around the time chain (17 blocks total)
  // Time chain is at y: 200, so hexagons need to be well above (y < 120) and well below (y > 280)
  // Genesis block is above time block 26, final block is above time block 16
  // Block 26 is at x position around 1040, Block 16 is at x position around 380

  // Left side - starting blocks (blocks 1-3)
  const leftSideHexagons: HexPosition[] = [
    { x: 30, y: 20, bitcoins: 1, id: 'hex-1' },
    { x: 30, y: 105, bitcoins: 1, id: 'hex-2' },
    { x: 110, y: 330, bitcoins: 1, id: 'hex-3' },
  ];

  // Bottom chain continuing left to right (blocks 4-11)
  const bottomChainHexagons: HexPosition[] = [
    { x: 195, y: 350, bitcoins: 1, id: 'hex-4' },
    { x: 280, y: 330, bitcoins: 2, id: 'hex-5' },
    { x: 365, y: 350, bitcoins: 1, id: 'hex-6' },
    { x: 450, y: 330, bitcoins: 2, id: 'hex-7' },
    { x: 535, y: 350, bitcoins: 1, id: 'hex-8' },
    { x: 620, y: 330, bitcoins: 1, id: 'hex-9' },
    { x: 705, y: 350, bitcoins: 2, id: 'hex-10' },
    { x: 790, y: 330, bitcoins: 1, id: 'hex-11' },
  ];

  // Bottom to top right transition (blocks 12-14) - Genesis block is #14 above block 26
  const rightTransitionHexagons: HexPosition[] = [
    { x: 875, y: 350, bitcoins: 2, id: 'hex-12' },
    { x: 960, y: 330, bitcoins: 1, id: 'hex-13' },
    { x: 1045, y: 105, bitcoins: 2, id: 'hex-14-genesis' }, // Genesis block above time block 26 (x~1040)
  ];

  // Top chain returning left (blocks 15-17) - Final block is #17 above block 16
  const topChainHexagons: HexPosition[] = [
    { x: 790, y: 20, bitcoins: 1, id: 'hex-15' },
    { x: 535, y: 40, bitcoins: 1, id: 'hex-16' },
    { x: 380, y: 20, bitcoins: 1, id: 'hex-17-final' }, // Final block above time block 16 (x~380)
  ];

  // Combine all hexagons (17 total)
  const allHexagons = [
    ...leftSideHexagons,
    ...bottomChainHexagons,
    ...rightTransitionHexagons,
    ...topChainHexagons,
  ];

  // Connectors between hexagons (yellow squares) - connecting all 17 blocks in sequence
  const connectors = [
    // hex-1 to hex-2 (left side)
    { x1: 30, y1: 20, x2: 30, y2: 105 },
    // hex-2 to hex-3 (transitioning to bottom)
    { x1: 30, y1: 105, x2: 110, y2: 330 },
    // Bottom chain (hex-3 to hex-11)
    { x1: 110, y1: 330, x2: 195, y2: 350 },
    { x1: 195, y1: 350, x2: 280, y2: 330 },
    { x1: 280, y1: 330, x2: 365, y2: 350 },
    { x1: 365, y1: 350, x2: 450, y2: 330 },
    { x1: 450, y1: 330, x2: 535, y2: 350 },
    { x1: 535, y1: 350, x2: 620, y2: 330 },
    { x1: 620, y1: 330, x2: 705, y2: 350 },
    { x1: 705, y1: 350, x2: 790, y2: 330 },
    // Right transition (hex-11 to genesis hex-14)
    { x1: 790, y1: 330, x2: 875, y2: 350 },
    { x1: 875, y1: 350, x2: 960, y2: 330 },
    { x1: 960, y1: 330, x2: 1045, y2: 105 },
    // Transition from bottom to top (genesis to hex-15)
    { x1: 1045, y1: 105, x2: 790, y2: 20 },
    // Top chain returning left (hex-15 to final hex-17)
    { x1: 790, y1: 20, x2: 535, y2: 40 },
    { x1: 535, y1: 40, x2: 380, y2: 20 },
  ];

  const getBlockData = (blockNumber: number) => {
    return gameBoard.blocks.find((b) => b.id === blockNumber) || {
      id: blockNumber,
      bitcoinTokens: 0,
      transactions: [],
      owner: undefined,
    };
  };

  const renderConnector = (connector: { x1: number; y1: number; x2: number; y2: number }, index: number) => {
    const midX = (connector.x1 + connector.x2) / 2;
    const midY = (connector.y1 + connector.y2) / 2;

    return (
      <View
        key={`connector-${index}`}
        style={[
          styles.connector,
          {
            position: 'absolute',
            left: midX - 6,
            top: midY - 6,
            backgroundColor: theme.colors.warning || '#FFD700',
          },
        ]}
      />
    );
  };

  const renderHexagon = (hex: HexPosition) => {
    const isSelected = hex.id === selectedHex;

    return (
      <View
        key={hex.id}
        style={{
          position: 'absolute',
          left: hex.x,
          top: hex.y,
        }}
      >
        <Hexagon
          size={hexSize}
          bitcoins={hex.bitcoins}
          isSelected={isSelected}
          onPress={() => handleHexPress(hex.id)}
          theme={theme}
        />
      </View>
    );
  };

  const renderTimeBlock = (blockNumber: number, index: number) => {
    const blockData = getBlockData(blockNumber);
    const isCurrentBlock = blockNumber === currentBlock;
    const isPastBlock = blockNumber < currentBlock;
    const isSelected = blockNumber === selectedBlock;

    return (
      <View key={blockNumber} style={styles.blockWrapper}>
        <TouchableOpacity
          style={[
            styles.timeBlock,
            { borderColor: theme.colors.border },
            isCurrentBlock && {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.accent,
              borderWidth: 3,
            },
            isPastBlock && {
              backgroundColor: theme.colors.success,
              opacity: 0.7,
            },
            !isPastBlock && !isCurrentBlock && {
              backgroundColor: theme.colors.cardBackground,
            },
            isSelected && {
              borderColor: theme.colors.accent,
              borderWidth: 3,
            },
          ]}
          onPress={() => handleBlockPress(blockNumber)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.blockNumber,
              { color: theme.colors.text.primary },
              isPastBlock && { color: theme.colors.text.secondary },
            ]}
          >
            {blockNumber}
          </Text>
        </TouchableOpacity>

        {/* Connector between time blocks */}
        {index < timeChainBlocks.length - 1 && (
          <View
            style={[
              styles.timeBlockConnector,
              {
                backgroundColor: isPastBlock
                  ? theme.colors.success
                  : theme.colors.border,
              },
            ]}
          />
        )}
      </View>
    );
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>₿</Text>
          </View>
          <Text style={styles.headerTitle}>HODL UP®</Text>
        </View>
        <Text style={styles.headerSubtitle}>2024 HALVING COLLECTORS EDITION</Text>
      </View>

      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={[styles.zoomButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleZoomIn}
        >
          <Text style={[styles.zoomButtonText, { color: theme.colors.text.primary }]}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.zoomButton, { backgroundColor: theme.colors.secondary }]}
          onPress={handleZoomOut}
        >
          <Text style={[styles.zoomButtonText, { color: theme.colors.text.primary }]}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.zoomButton, { backgroundColor: theme.colors.accent }]}
          onPress={handleZoomReset}
        >
          <Text style={[styles.zoomButtonText, { color: theme.colors.text.primary }]}>⟲</Text>
        </TouchableOpacity>
        <View style={[styles.zoomIndicator, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.zoomIndicatorText, { color: theme.colors.text.secondary }]}>
            {Math.round(zoomLevel * 100)}%
          </Text>
        </View>
      </View>

      {/* Main Board Container */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.boardScrollContent}
        style={styles.boardScroll}
        scrollEnabled={true}
      >
        <ScrollView
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          contentContainerStyle={styles.verticalScrollContent}
        >
          <Animated.View style={[styles.boardContainer, { transform: [{ scale }] }]}>
            {/* Connectors between hexagons */}
            {connectors.map((connector, index) => renderConnector(connector, index))}

            {/* Hexagon blocks forming chain around time chain */}
            {allHexagons.map((hex) => renderHexagon(hex))}

            {/* Time Chain - Horizontal blocks 11-31 */}
            <View style={styles.timeChainContainer}>
              {timeChainBlocks.map((blockNum, index) => renderTimeBlock(blockNum, index))}
            </View>
          </Animated.View>
        </ScrollView>
      </ScrollView>

      {/* Block Info Panel */}
      {selectedBlock !== null && (
        <View style={[styles.infoPanel, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.infoPanelHeader}>
            <Text style={[styles.infoPanelTitle, { color: theme.colors.text.primary }]}>
              Block {selectedBlock}
            </Text>
            <TouchableOpacity onPress={() => setSelectedBlock(null)}>
              <Text style={[styles.closeButton, { color: theme.colors.error }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoPanelContent}>
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              Bitcoin: ₿{getBlockData(selectedBlock).bitcoinTokens}
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              Transactions: {getBlockData(selectedBlock).transactions.length}
            </Text>
            {getBlockData(selectedBlock).owner && (
              <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
                Owner: {getBlockData(selectedBlock).owner}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Hexagon Info Panel */}
      {selectedHex !== null && (
        <View style={[styles.infoPanel, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.infoPanelHeader}>
            <Text style={[styles.infoPanelTitle, { color: theme.colors.text.primary }]}>
              Bitcoin Block
            </Text>
            <TouchableOpacity onPress={() => setSelectedHex(null)}>
              <Text style={[styles.closeButton, { color: theme.colors.error }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoPanelContent}>
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              Contains: {allHexagons.find(h => h.id === selectedHex)?.bitcoins} ₿
            </Text>
          </View>
        </View>
      )}

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentBlock - 11) / 20) * 100}%`,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.colors.text.secondary }]}>
          Block {currentBlock} / 31 ({Math.round(((currentBlock - 11) / 20) * 100)}%)
        </Text>
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      alignItems: 'center',
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.large,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.border,
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.small,
    },
    logo: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      letterSpacing: 2,
    },
    headerSubtitle: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.accent,
      letterSpacing: 1.5,
      marginTop: 4,
    },
    boardScroll: {
      flex: 1,
    },
    boardScrollContent: {
      paddingHorizontal: theme.spacing.medium,
    },
    verticalScrollContent: {
      paddingVertical: theme.spacing.xl,
    },
    boardContainer: {
      width: 1400,
      height: 450,
      position: 'relative',
      backgroundColor: theme.colors.background,
    },
    connector: {
      width: 12,
      height: 12,
      borderRadius: 2,
    },
    zoomControls: {
      position: 'absolute',
      top: 80,
      right: 16,
      zIndex: 100,
      gap: 8,
    },
    zoomButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    zoomButtonText: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    zoomIndicator: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      alignItems: 'center',
    },
    zoomIndicatorText: {
      fontSize: 12,
      fontWeight: '600',
    },
    timeChainContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      position: 'absolute',
      top: 200,
      left: 100,
    },
    blockWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    timeBlock: {
      width: 50,
      height: 50,
      borderRadius: 25,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 2,
    },
    blockNumber: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    timeBlockConnector: {
      width: 16,
      height: 4,
      borderRadius: 2,
    },
    infoPanel: {
      margin: theme.spacing.medium,
      padding: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    infoPanelHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.small,
    },
    infoPanelTitle: {
      fontSize: theme.fonts.sizes.large,
      fontWeight: theme.fonts.weights.bold,
    },
    closeButton: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    infoPanelContent: {
      gap: theme.spacing.small,
    },
    infoText: {
      fontSize: theme.fonts.sizes.medium,
    },
    progressContainer: {
      padding: theme.spacing.medium,
      borderTopWidth: 2,
      borderTopColor: theme.colors.border,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: theme.spacing.small,
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    progressText: {
      fontSize: theme.fonts.sizes.small,
      textAlign: 'center',
      fontWeight: theme.fonts.weights.medium,
    },
  });
