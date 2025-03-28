import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { getTransactions } from '../utils/storage';
import { getPortfolioFromTransactions } from '../utils/portfolio';

type PortfolioItem = {
  ticker: string;
  shares: number;
  avgPrice: number;
};

export default function PortfolioScreen() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const transactions = await getTransactions();
      const data = getPortfolioFromTransactions(transactions);
      setPortfolio(data);
    };

    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Twoje aktywa</Text>
      <FlatList
        data={portfolio}
        keyExtractor={(item) => item.ticker}
        renderItem={({ item }) => (
          <Link href={`/portfolio/${item.ticker}`} asChild>
            <Pressable style={styles.card}>
              <Text style={styles.ticker}>{item.ticker}</Text>
              <Text style={styles.text}>
                {item.shares} szt. | ${item.avgPrice}
              </Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#121212' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#ffffff' },
  card: {
    padding: 12,
    backgroundColor: '#1e1e1e',
    marginBottom: 12,
    borderRadius: 8,
  },
  ticker: { fontSize: 18, fontWeight: '600', color: '#ffffff' },
  text: { fontSize: 14, color: '#cccccc' },
});