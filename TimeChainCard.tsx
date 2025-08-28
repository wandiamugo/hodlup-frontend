import React, { useState, useRef, useEffect } from 'react';
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

// Individual Time-Chain Card Component
const TimeChainCard = ({ 
  cardNumber, 
  bitcoinTokens, 
  isGenesis, 
  isCurrent,
  hasBeenMined,
  onPress,
  position 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isCurrent) {
      // Pulse animation for current block
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isCurrent]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) {
      onPress(cardNumber);
    }
  };

  // Render gold bars around the edge based on card number
  const renderGoldBars = () => {
    const bars = [];
    const barCount = cardNumber;
    const angleStep = 360 / 6; // Hexagon has 6 sides
    
    // Distribute bars around the hexagon edges
    for (let i = 0; i < Math.min(barCount, 6); i++) {
      bars.push(
        <View 
          key={`bar-${i}`} 
          style={[
            styles.goldBar, 
            { 
              transform: [
                { rotate: `${i * angleStep}deg` },
                { translateY: -25 }
              ]
            }
          ]} 
        />
      );
    }
    return bars;
  };

  const getCardColor = () => {
    if (isGenesis) return '#2a5a3e'; // Genesis block - darker green
    if (hasBeenMined) return '#1a3a2e'; // Mined block - dark green
    if (isCurrent) return '#3a3a5e'; // Current block - highlighted
    return '#2a2a3e'; // Unmined block - dark gray
  };

  const cardColor = getCardColor();
  const borderColor = isCurrent ? '#ffd700' : hasBeenMined ? '#4a7c59' : '#3a3a4e';

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        position && { 
          position: 'absolute',
          left: position.x,
          top: position.y
        },
        {
          transform: [{ scale: scaleAnim }],
          opacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.8],
          }),
        }
      ]}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <View style={styles.hexagonWrapper}>
          {/* Hexagon shape */}
          <View style={[styles.hexagonTop, { borderBottomColor: cardColor }]} />
          <View style={[
            styles.hexagonMiddle, 
            { 
              backgroundColor: cardColor,
              borderColor: borderColor,
              borderWidth: isCurrent ? 2 : 1,
            }
          ]}>
            {/* Card content */}
            <View style={styles.cardContent}>
              {isGenesis && (
                <Text style={styles.genesisLabel}>GENESIS</Text>
              )}
              <Text style={styles.cardNumber}>{cardNumber}</Text>
              <View style={styles.bitcoinDisplay}>
                <Text style={styles.bitcoinSymbol}>₿</Text>
                <Text style={styles.bitcoinAmount}>{bitcoinTokens}</Text>
              </View>
              {hasBeenMined && (
                <Text style={styles.minedLabel}>✓ MINED</Text>
              )}
            </View>
            
            {/* Gold bars indicator */}
            <View style={styles.goldBarContainer}>
              {renderGoldBars()}
            </View>
          </View>
          <View style={[styles.hexagonBottom, { borderTopColor: cardColor }]} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Main Time-Chain Board Component
const HODLUPTimeChain = ({ gameState }) => {
  const [currentBlock, setCurrentBlock] = useState(1);
  const [timeChain, setTimeChain] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initialize time chain with 17 cards
    const initialChain = Array.from({ length: 17 }, (_, i) => ({
      id: i + 1,
      bitcoinTokens: i === 0 ? 6 : Math.floor(Math.random() * 4) + 1, // Genesis has 6, others random 1-4
      hasBeenMined: false,
      isGenesis: i === 0,
    }));
    setTimeChain(initialChain);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCardPress = (cardNumber) => {
    console.log(`Time-chain card ${cardNumber} pressed`);
    // Handle card interaction
  };

  // Calculate positions for hexagon arrangement
  const calculateCardPositions = () => {
    const hexSize = 65;
    const horizontalSpacing = hexSize * 0.9;
    const verticalSpacing = hexSize * 0.78;
    const positions = [];
    
    // Create a snake-like pattern for the time chain
    // Row 1 (cards 1-5)
    for (let i = 0; i < 5; i++) {
      positions.push({
        x: 10 + (i * horizontalSpacing),
        y: 10,
      });
    }
    
    // Row 2 (cards 6-11) - offset
    for (let i = 0; i < 6; i++) {
      positions.push({
        x: 10 + (horizontalSpacing * 0.5) + (i * horizontalSpacing),
        y: 10 + verticalSpacing,
      });
    }
    
    // Row 3 (cards 12-17)
    for (let i = 0; i < 6; i++) {
      positions.push({
        x: 10 + (i * horizontalSpacing),
        y: 10 + (verticalSpacing * 2),
      });
    }
    
    return positions;
  };

  const cardPositions = calculateCardPositions();
  const boardWidth = Math.max(...cardPositions.map(p => p.x)) + 80;
  const boardHeight = Math.max(...cardPositions.map(p => p.y)) + 100;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>⛓️ Time-Chain</Text>
        <Text style={styles.subtitle}>Block {currentBlock} of 17</Text>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        style={styles.scrollView}
        contentContainerStyle={{ width: boardWidth }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ height: boardHeight }}
        >
          <View style={[styles.board, { width: boardWidth, height: boardHeight }]}>
            {timeChain.map((card, index) => (
              <TimeChainCard
                key={card.id}
                cardNumber={card.id}
                bitcoinTokens={card.bitcoinTokens}
                isGenesis={card.isGenesis}
                isCurrent={card.id === currentBlock}
                hasBeenMined={card.hasBeenMined}
                onPress={handleCardPress}
                position={cardPositions[index]}
              />
            ))}
            
            {/* Connection lines between cards */}
            {cardPositions.slice(0, -1).map((pos, index) => {
              const nextPos = cardPositions[index + 1];
              const angle = Math.atan2(nextPos.y - pos.y, nextPos.x - pos.x) * 180 / Math.PI;
              const distance = Math.sqrt(
                Math.pow(nextPos.x - pos.x, 2) + Math.pow(nextPos.y - pos.y, 2)
              );
              
              return (
                <View
                  key={`line-${index}`}
                  style={[
                    styles.connectionLine,
                    {
                      left: pos.x + 32,
                      top: pos.y + 37,
                      width: distance - 20,
                      transform: [{ rotate: `${angle}deg` }],
                    }
                  ]}
                />
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#2a5a3e' }]} />
          <Text style={styles.legendText}>Genesis Block</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#3a3a5e' }]} />
          <Text style={styles.legendText}>Current Block</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#1a3a2e' }]} />
          <Text style={styles.legendText}>Mined</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
  },
  header: {
    marginBottom: 15,
  },
  title: {
    color: '#ffd700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
  },
  scrollView: {
    height: 250,
  },
  board: {
    position: 'relative',
  },
  cardContainer: {
    width: 65,
    height: 75,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  hexagonWrapper: {
    width: 65,
    height: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexagonTop: {
    width: 0,
    height: 0,
    borderLeftWidth: 32.5,
    borderLeftColor: 'transparent',
    borderRightWidth: 32.5,
    borderRightColor: 'transparent',
    borderBottomWidth: 18.75,
  },
  hexagonMiddle: {
    width: 65,
    height: 37.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  hexagonBottom: {
    width: 0,
    height: 0,
    borderLeftWidth: 32.5,
    borderLeftColor: 'transparent',
    borderRightWidth: 32.5,
    borderRightColor: 'transparent',
    borderTopWidth: 18.75,
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  bitcoinDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bitcoinSymbol: {
    color: '#ffd700',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 3,
  },
  bitcoinAmount: {
    color: '#ffd700',
    fontSize: 12,
  },
  genesisLabel: {
    color: '#4ade80',
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  minedLabel: {
    color: '#4ade80',
    fontSize: 8,
    marginTop: 2,
  },
  goldBarContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldBar: {
    position: 'absolute',
    width: 3,
    height: 8,
    backgroundColor: '#ffd700',
    opacity: 0.6,
  },
  connectionLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#ffd700',
    opacity: 0.3,
    zIndex: 1,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 5,
  },
  legendText: {
    color: '#888',
    fontSize: 10,
  },
});

export default TimeChainCard;