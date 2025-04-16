import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { usePortfolio } from '@/lib/hooks/usePortfolio';

export default function PortfolioScreen() {
  const { portfolio, loading } = usePortfolio();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'name' | 'profit' | 'value'>('name');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const filteredPortfolio = portfolio
    .filter(item =>
      item.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.ticker.localeCompare(b.ticker);
        case 'profit':
          const profitA = (a.currentPrice ?? 0) * a.shares - a.avgPrice * a.shares;
          const profitB = (b.currentPrice ?? 0) * b.shares - b.avgPrice * b.shares;
          return profitB - profitA;
        case 'value':
          const valueA = a.shares * (a.currentPrice ?? 0);
          const valueB = b.shares * (b.currentPrice ?? 0);
          return valueB - valueA;
        default:
          return 0;
      }
    });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Twoje aktywa</Text>
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Wyszukaj..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        <Pressable onPress={() => setSortMenuVisible(prev => !prev)} style={styles.sortButton}>
          <Text style={styles.sortIcon}>⚙️</Text>
        </Pressable>
      </View>

      {sortMenuVisible && (
        <View style={styles.sortMenu}>
          {['name', 'profit', 'value'].map((option) => (
            <Pressable key={option} onPress={() => {
              setSortOption(option as any);
              setSortMenuVisible(false);
            }}>
              <Text style={styles.sortOption}>Sortuj: {option === 'name' ? 'Nazwa' : option === 'profit' ? 'Zysk' : 'Wartość'}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : portfolio.length === 0 ? (
        <Text style={styles.noData}>Brak danych 😕</Text>
      ) : (
        <FlatList
          data={filteredPortfolio}
          keyExtractor={(item) => item.ticker}
          renderItem={({ item }) => {
            const marketValue = item.currentPrice ? item.currentPrice * item.shares : null;
            const cost = item.avgPrice * item.shares;
            const profit = marketValue ? marketValue - cost : null;
            const profitPercent = profit && cost ? (profit / cost) * 100 : null;

            return (
              <Link href={`/portfolio/${item.ticker}`} asChild>
                <Pressable style={styles.card}>
                  <Text style={styles.ticker}>{item.ticker}</Text>
                  <Text style={styles.text}>
                    {item.shares} szt. @ ${item.avgPrice.toFixed(6)}
                  </Text>
                  <Text style={styles.text}>
                    💵 Zainwestowano:{' '}
                    <Text style={[styles.text, { color: 'lightgreen' }]}>
                      ${Math.abs(item.shares * item.avgPrice).toFixed(2)}
                    </Text>
                  </Text>
                  {item.currentPrice !== null ? (
                    <>
                      <Text style={styles.price}>Aktualny kurs: ${item.currentPrice.toFixed(2)}</Text>
                      {profit !== null && profitPercent !== null ? (
                        <Text
                          style={[
                            styles.profit,
                            { color: profit >= 0 ? '#88ff88' : 'red' },
                            { fontWeight: 'bold' },
                          ]}
                        >
                          {profit >= 0 ? '📈' : '📉'} {profit.toFixed(2)} USD ({profitPercent.toFixed(1)}%)
                        </Text>
                      ) : (
                        <Text style={styles.price}>Zysk niedostępny</Text>
                      )}
                    </>
                  ) : (
                    <Text style={styles.price}>Brak danych rynkowych</Text>
                  )}
                </Pressable>
              </Link>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#00FFFF',
    textAlign: 'center',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  noData: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  card: {
    padding: 16,
    backgroundColor: '#1e1e1e',
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00FFFF',
    // Neonowy cień
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
  },
  ticker: {
    fontSize: 20,
    fontWeight: '600',
    textShadowColor: '#00BFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    color: '#ffffff',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#cccccc',
  },
  boldText: {
    fontWeight: 'bold',
  },
  price: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
  },
  profit: {
    fontSize: 14,
    marginTop: 4,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00FFFF',
    marginRight: 8,
  },
  sortButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00FFFF',
    backgroundColor: '#1e1e1e',
  },
  sortIcon: {
    fontSize: 20,
    color: '#00FFFF',
  },
  sortMenu: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00FFFF',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sortOption: {
    color: '#00FFFF',
    paddingVertical: 4,
    fontSize: 14,
  },
});