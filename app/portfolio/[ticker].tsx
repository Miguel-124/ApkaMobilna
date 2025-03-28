// app/portfolio/[ticker].tsx
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getTransactions, removeTransactionById, saveTransaction } from '../../utils/storage';
import { getPriceForTicker } from '../../utils/prices';
import { Alert, Pressable } from 'react-native';
import moment from 'moment';

type Transaction = {
  id: string;
  ticker: string;
  shares: number;
  price: number;
  date: string;
};

export default function AssetDetailScreen() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastDeleted, setLastDeleted] = useState<Transaction | null>(null);

  // Logika przypisania typu aktywa na podstawie tickera
  const getAssetType = (ticker: string): 'stock' | 'crypto' => {
    const cryptoTickers = ['BTC', 'ETH', 'SOL', 'BNB']; // lista kryptowalut
    return cryptoTickers.includes(ticker.toUpperCase()) ? 'crypto' : 'stock';
  };

  useEffect(() => {
    const load = async () => {
      const all = await getTransactions();
      const filtered = all.filter((tx: Transaction) => tx.ticker === ticker);

      setTransactions(filtered);

      const assetType = getAssetType(ticker); // Uzyskujemy typ aktywa
      const price = await getPriceForTicker(ticker, assetType); // Przekazujemy typ aktywa do funkcji
      setCurrentPrice(price ?? null);

      setLoading(false);
    };

    load();
  }, [ticker]);

  useEffect(() => {
    if (lastDeleted) {
      const timeout = setTimeout(() => {
        setLastDeleted(null); // po kilku sekundach znika możliwość cofnięcia
      }, 6000);
  
      return () => clearTimeout(timeout);
    }
  }, [lastDeleted]);

  const totalShares = transactions.reduce((sum, tx) => sum + tx.shares, 0);
  const totalCost = transactions.reduce((sum, tx) => sum + tx.shares * tx.price, 0);
  const avgPrice = totalShares > 0 ? totalCost / totalShares : 0;
  const marketValue = currentPrice !== null ? currentPrice * totalShares : null;
  const profit = marketValue !== null ? marketValue - totalCost : null;
  const profitPercent = profit !== null ? (profit / totalCost) * 100 : null;

  const handleDelete = (id: string) => {
    Alert.alert(
      'Usuń transakcję',
      'Czy na pewno chcesz usunąć tę transakcję?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            const toDelete = transactions.find((tx) => tx.id === id);
            if (!toDelete) return;
          
            await removeTransactionById(id);
            setTransactions((prev) => prev.filter((tx) => tx.id !== id));
            setLastDeleted(toDelete);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.title, { alignSelf: 'center' }]}>{ticker?.toUpperCase()}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : (
        <>
          <Text style={styles.line}>
            📦 Ilość: <Text style={styles.value}>{totalShares}</Text>
          </Text>
          <Text style={styles.line}>
            💰 Średnia cena zakupu: <Text style={styles.value}>${avgPrice.toFixed(2)}</Text>
          </Text>
          <Text style={styles.line}>
            📈 Kurs rynkowy:{" "}
            <Text style={styles.value}>
              {currentPrice !== null ? `$${currentPrice.toFixed(2)}` : 'Brak danych'}
            </Text>
          </Text>
          <Text style={styles.line}>
            💼 Wartość rynkowa:{" "}
            <Text style={styles.value}>
              {marketValue !== null ? `$${marketValue.toFixed(2)}` : 'Brak danych'}
            </Text>
          </Text>
          <Text style={styles.line}>
            Profit:{' '}
            {profit !== null && profitPercent !== null ? (
              <Text style={{ color: profit >= 0 ? '#88ff88' : '#ff8888' }}>
                {profit >= 0 ? '📈' : '📉'} {profit.toFixed(2)} USD ({profitPercent.toFixed(1)}%)
              </Text>
            ) : (
              <Text style={{ color: '#aaa' }}>Brak danych</Text>
            )}
          </Text>
          <View style={styles.transactions}>
          <Text style={styles.subtitle}>Transakcje:</Text>
          {transactions.length === 0 ? (
            <Text style={styles.text}>Brak transakcji dla tego aktywa.</Text>
          ) : (
            transactions
              .slice()
              .reverse()
              .map((tx) => (
                <View key={tx.id} style={styles.txCard}>
                  <View style={styles.txRow}>
                    <Text style={styles.txText}>
                      📅 {moment(tx.date).format('DD.MM.YYYY HH:mm')} | {tx.shares.toFixed(5)} szt. ${tx.price}
                    </Text>
                    <Pressable onPress={() => handleDelete(tx.id)}>
                      <Text style={styles.deleteIcon}>🗑️</Text>
                    </Pressable>
                  </View>
                </View>
              ))
          )}
        </View>
        </>
      )}
      {lastDeleted && (
        <Pressable style={styles.undoContainer} onPress={async () => {
          await saveTransaction(lastDeleted);
          setTransactions((prev) => [...prev, lastDeleted]);
          setLastDeleted(null);
        }}>
          <Text style={styles.undoText}>Cofnij usunięcie transakcji</Text>
        </Pressable>
      )}
    </ScrollView>
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#121212' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: '#ffffff' },
  line: { fontSize: 16, marginBottom: 12, color: '#cccccc' },
  value: { fontWeight: '600', color: '#ffffff' },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    color: '#ffffff',
  },
  transactions: {
    marginTop: 12,
  },
  txCard: {
    backgroundColor: '#1e1e1e',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  txText: {
    color: '#cccccc',
    fontSize: 14,
  },
  text: {
    color: '#aaaaaa',
    fontSize: 14,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 18,
    color: '#ff5555',
    paddingHorizontal: 8,
  },
  undoContainer: {
    backgroundColor: '#333',
    padding: 12,
    marginTop: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  undoText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});