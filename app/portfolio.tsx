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
  assetType: 'stock' | 'crypto';
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
          // Prosta logika: jeśli ticker to BTC lub ETH, to krypto
          const assetType: 'stock' | 'crypto' = 
            item.ticker === 'BTC' || item.ticker === 'ETH' ? 'crypto' : 'stock';
          const price = await getPriceForTicker(item.ticker, assetType);
          return {
            ...item,
            currentPrice: price ?? null,
            assetType,
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
                    {item.shares} szt. @ ${item.avgPrice.toFixed(2)}
                  </Text>
                  <Text style={[styles.text, { color: item.shares > 0 ? 'lightgreen' : 'red' }, { fontWeight: 'bold' }]}>
                    ${Math.abs(item.shares * item.avgPrice).toFixed(2)}
                  </Text>
                  {item.currentPrice !== null ? (
                    <>
                      <Text style={styles.price}>Aktualny kurs: ${item.currentPrice.toFixed(2)}</Text>
                      {profit !== null && profitPercent !== null ? (
                        <Text
                          style={[
                            styles.profit,
                            { color: profit >= 0 ? '#88ff88' : 'red' },
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
});