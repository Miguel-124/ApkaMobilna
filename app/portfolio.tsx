import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { getTransactions } from '../utils/storage';
import { getPortfolioFromTransactions } from '../utils/portfolio';
import { getPriceForTicker } from '../utils/prices';

type PortfolioItem = {
  ticker: string;
  shares: number;
  avgPrice: number;
};

type ExtendedItem = PortfolioItem & {
  currentPrice: number | null;
};

export default function PortfolioScreen() {
  const [portfolio, setPortfolio] = useState<ExtendedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const transactions = await getTransactions();
      const basePortfolio = getPortfolioFromTransactions(transactions);

      const enrichedPortfolio: ExtendedItem[] = await Promise.all(
        basePortfolio.map(async (item) => {
          const price = await getPriceForTicker(item.ticker);
          return {
            ...item,
            currentPrice: price ?? null,
          };
        })
      );

      setPortfolio(enrichedPortfolio);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Twoje aktywa</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : portfolio.length === 0 ? (
        <Text style={styles.noData}>Brak danych 😕</Text>
      ) : (
        <FlatList
          data={portfolio}
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
                    {item.shares} szt. @ ${item.avgPrice}
                  </Text>
                  {item.currentPrice !== null ? (
                    <>
                      <Text style={styles.price}>Kurs: ${item.currentPrice.toFixed(2)}</Text>
                      <Text style={styles.profit}>
                        {profit !== null && profitPercent !== null ? (
                        <Text style={[styles.profit, { color: profit >= 0 ? '#88ff88' : '#ff8888' }]}>
                            {profit >= 0 ? '📈' : '📉'} {profit.toFixed(2)} USD ({profitPercent.toFixed(1)}%)
                        </Text>
                        ) : (
                        <Text style={styles.price}>Zysk niedostępny</Text>
                        )}
                      </Text>
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
  container: { flex: 1, padding: 24, backgroundColor: '#121212' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#ffffff' },
  noData: { fontSize: 16, color: '#999', textAlign: 'center' },
  card: {
    padding: 12,
    backgroundColor: '#1e1e1e',
    marginBottom: 12,
    borderRadius: 8,
  },
  ticker: { fontSize: 18, fontWeight: '600', color: '#ffffff' },
  text: { fontSize: 14, color: '#cccccc' },
  price: { fontSize: 14, color: '#aaa' },
  profit: { fontSize: 14, marginTop: 4, color: '#88ff88' },
});