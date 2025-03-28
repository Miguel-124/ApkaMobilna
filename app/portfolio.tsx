import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { mockPortfolio } from '../data/portfolio';
import { Link } from 'expo-router';

export default function PortfolioScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Twoje aktywa</Text>
      <FlatList
        data={mockPortfolio}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/portfolio/${item.id}`}>
            <Pressable style={styles.assetCard}>
              <Text style={styles.ticker}>{item.ticker}</Text>
              <Text>{item.shares} szt. @ ${item.avgPrice}</Text>
              <Text>Aktualnie: ${item.currentPrice}</Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  assetCard: {
    padding: 12,
    backgroundColor: '#eee',
    marginBottom: 12,
    borderRadius: 8,
  },
  ticker: { fontSize: 18, fontWeight: '600' },
});