import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getTransactions } from '../utils/storage';

type Transaction = {
  id: string;
  ticker: string;
  shares: number;
  price: number;
  date: string;
};

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await getTransactions();
      setTransactions(data.reverse());
    };

    load(); // nie musisz robić unsubscribe, bo to nie jest subskrypcja
  }, []);

  if (transactions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Brak transakcji 😕</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historia transakcji</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.ticker}>{item.ticker}</Text>
            <Text>{item.shares} szt. @ ${item.price}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  card: {
    padding: 12,
    backgroundColor: '#eee',
    marginBottom: 12,
    borderRadius: 8,
  },
  ticker: { fontSize: 18, fontWeight: '600' },
  date: { fontSize: 12, color: '#666', marginTop: 4 },
});