import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { getTransactions } from '../../utils/storage';

type Transaction = {
  id: string;
  ticker: string;
  shares: number;
  price: number;
  date: string;
};

export default function AssetDetailsScreen() {
  const { ticker } = useLocalSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const load = async () => {
      const all = await getTransactions();
      const filtered = all.filter((tx: Transaction) => tx.ticker.toUpperCase() === String(ticker).toUpperCase());      setTransactions(filtered);
    };

    load();
  }, [ticker]);

  if (!transactions.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{ticker}</Text>
        <Text style={styles.info}>Brak transakcji dla tego aktywa 😕</Text>
      </View>
    );
  }

  const totalShares = transactions.reduce((acc, tx) => acc + tx.shares, 0);
  const totalCost = transactions.reduce((acc, tx) => acc + tx.shares * tx.price, 0);
  const avgPrice = totalCost / totalShares;
  const value = totalShares * avgPrice;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{ticker}</Text>
      <Text style={styles.info}>Ilość: {totalShares} szt.</Text>
      <Text style={styles.info}>Średnia cena zakupu: ${avgPrice.toFixed(2)}</Text>
      <Text style={styles.info}>Wartość: ${value.toFixed(2)}</Text>
      <Text style={styles.subtitle}>Transakcje:</Text>
      {transactions.map((tx) => (
        <View key={tx.id} style={styles.card}>
          <Text style={styles.cardText}>
            {tx.shares} szt. @ ${tx.price}
          </Text>
          <Text style={styles.cardDate}>{tx.date}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#121212' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12, color: '#fff' },
  subtitle: { fontSize: 20, fontWeight: 'bold', marginTop: 24, marginBottom: 12, color: '#fff' },
  info: { fontSize: 16, color: '#ccc', marginBottom: 6 },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardText: { color: '#ffffff', fontSize: 16 },
  cardDate: { color: '#777', fontSize: 12, marginTop: 4 },
});