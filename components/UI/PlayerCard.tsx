import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Player Card Component
export const PlayerCard = ({ card }: { card: any }) => {
  const getColorHex = (colorName: string) => {
    const colors: Record<string, string> = {
      orange: '#f97316',
      red: '#ef4444',
      yellow: '#facc15',
      white: '#ffffff',
      purple: '#a855f7',
      blue: '#3b82f6',
      green: '#22c55e',
    };
    return colors[colorName?.toLowerCase()] || '#f97316';
  };

  // Determine symbol based on color
  const getSymbolByColor = (colorName: string) => {
    const colorSymbols: Record<string, string> = {
      orange: 'pill',
      red: '∞',
      yellow: '⚡',
      white: '🐰',
      purple: '⚡',
      blue: '🧊',
      green: '🔧',
    };
    return colorSymbols[colorName?.toLowerCase()] || 'pill';
  };

  const accentColor = getColorHex(card.color);
  const symbolType = card.symbol || getSymbolByColor(card.color);
  const cardValue = card.value || card.number || '1';

  return (
    <View style={styles.playerCard}>
      {/* Side bars with accent color */}
      <View style={[styles.playerLeftBar, { backgroundColor: accentColor }]} />
      <View style={[styles.playerRightBar, { backgroundColor: accentColor }]} />

      {/* Top-left number */}
      <Text style={[styles.playerTopNumber, { color: accentColor }]}>
        {cardValue}
      </Text>

      {/* Center symbol */}
      <View style={styles.playerCenter}>
        {symbolType === 'pill' ? (
          <View style={styles.pillContainer}>
            <View style={[styles.pillHalfOutline, { borderColor: accentColor }]} />
            <View style={[styles.pillHalfFilled, { backgroundColor: accentColor }]} />
          </View>
        ) : (
          <Text style={[styles.playerSymbol, { color: accentColor }]}>
            {symbolType}
          </Text>
        )}
      </View>

      {/* Bottom-right number */}
      <Text style={[styles.playerBottomNumber, { color: accentColor }]}>
        {cardValue}
      </Text>
    </View>
  );
};

// Bitcoin Card Component
export const BitcoinCard = ({ card }: { card: any }) => {
  const value = card.value || 1;
  // Use the symbolCount from the card if available, otherwise calculate it
  const symbolCount = card.symbolCount || 1;

  // Adjust symbol size based on count (smaller for 4 symbols)
  const getSymbolSize = (count: number) => {
    if (count === 4) return { size: 16, fontSize: 9, borderWidth: 1 };
    if (count === 3) return { size: 18, fontSize: 10, borderWidth: 1.5 };
    return { size: 20, fontSize: 11, borderWidth: 1.5 };
  };

  const symbolStyle = getSymbolSize(symbolCount);

  return (
    <View style={styles.bitcoinCard}>
      {/* Side bars */}
      <View style={styles.bitcoinLeftBar} />
      <View style={styles.bitcoinRightBar} />

      {/* Top-left number */}
      <Text style={styles.bitcoinTopNumber}>{value}</Text>

      {/* Center Bitcoin symbols - arranged vertically */}
      <View style={styles.bitcoinCenter}>
        {Array.from({ length: symbolCount }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.bitcoinSymbol,
              {
                width: symbolStyle.size,
                height: symbolStyle.size,
                borderRadius: symbolStyle.size / 2,
                borderWidth: symbolStyle.borderWidth,
              }
            ]}
          >
            <Text style={[styles.bitcoinText, { fontSize: symbolStyle.fontSize }]}>₿</Text>
          </View>
        ))}
      </View>

      {/* Bottom-right number */}
      <Text style={styles.bitcoinBottomNumber}>{value}</Text>
    </View>
  );
};

// Hash Card Component
export const HashCard = ({ card }: { card: any }) => {
  const value = card.value ?? 0;  // Use ?? to allow negative values and 0
  const displayValue = value >= 0 ? `+${value}` : `${value}`;

  return (
    <View style={styles.hashCard}>
      {/* Side bars - white */}
      <View style={[styles.hashLeftBar, { backgroundColor: '#ffffff' }]} />
      <View style={[styles.hashRightBar, { backgroundColor: '#ffffff' }]} />

      {/* Top-left value */}
      <Text style={styles.hashTopNumber}>{displayValue}</Text>

      {/* Center SHA256 text */}
      <View style={styles.hashCenter}>
        <Text style={styles.hashSHA256}>SHA256</Text>
      </View>

      {/* Bottom-right value */}
      <Text style={styles.hashBottomNumber}>{displayValue}</Text>
    </View>
  );
};

// Generic Card Renderer
export const CardRenderer = ({ card }: { card: any }) => {
  if (!card) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>?</Text>
      </View>
    );
  }

  const cardType = card.type?.toLowerCase();

  switch (cardType) {
    case 'player':
      return <PlayerCard card={card} />;
    case 'bitcoin':
      return <BitcoinCard card={card} />;
    case 'hash':
      return <HashCard card={card} />;
    default:
      return (
        <View style={styles.unknownCard}>
          <Text style={styles.unknownText}>{card.type}</Text>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  // Player Card Styles
  playerCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',  // Black background
    borderRadius: 8,
    padding: 6,
    position: 'relative',
  },
  playerLeftBar: {
    position: 'absolute',
    left: 0,
    top: '45%',
    width: '20%',
    height: 20,
  },
  playerRightBar: {
    position: 'absolute',
    right: 0,
    top: '45%',
    width: '20%',
    height: 20,
  },
  playerTopNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    zIndex: 10,
  },
  playerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  playerSymbol: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  pillContainer: {
    flexDirection: 'row',
    width: 32,
    height: 16,
  },
  pillHalfOutline: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderRightWidth: 1,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    backgroundColor: 'transparent',
  },
  pillHalfFilled: {
    width: 16,
    height: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  playerBottomNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    zIndex: 10,
  },

  // Bitcoin Card Styles
  bitcoinCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',  // Black background
    borderRadius: 8,
    padding: 6,
    position: 'relative',
  },
  bitcoinLeftBar: {
    position: 'absolute',
    left: 0,
    top: '45%',
    width: '20%',
    height: 20,
    backgroundColor: '#facc15',  // Yellow bar
  },
  bitcoinRightBar: {
    position: 'absolute',
    right: 0,
    top: '45%',
    width: '20%',
    height: 20,
    backgroundColor: '#facc15',  // Yellow bar
  },
  bitcoinTopNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#facc15',  // Yellow text
    zIndex: 10,
  },
  bitcoinCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
  },
  bitcoinSymbol: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#facc15',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bitcoinText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#facc15',
  },
  bitcoinBottomNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#facc15',
    alignSelf: 'flex-end',
    zIndex: 10,
  },

  // Hash Card Styles
  hashCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',  // Black background
    borderRadius: 8,
    padding: 6,
    position: 'relative',
  },
  hashLeftBar: {
    position: 'absolute',
    left: 0,
    top: '45%',
    width: '20%',
    height: 20,
  },
  hashRightBar: {
    position: 'absolute',
    right: 0,
    top: '45%',
    width: '20%',
    height: 20,
  },
  hashTopNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',  // White text
    zIndex: 10,
  },
  hashCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  hashSHA256: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  hashBottomNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    alignSelf: 'flex-end',
    zIndex: 10,
  },

  // Fallback Styles
  emptyCard: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 24,
    color: '#9ca3af',
  },
  unknownCard: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  unknownText: {
    fontSize: 8,
    color: '#ffffff',
    textAlign: 'center',
  },
});