// app/transactions.tsx
import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Pressable } from 'react-native';
import { getTransactions, deleteTransaction } from '../utils/storage';
import moment from 'moment';


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
    load();
  }, []);

  const load = async () => {
    const data = await getTransactions();
    setTransactions(data.reverse());
  };

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
            await deleteTransaction(id);
            load(); // odśwież listę
          },
        },
      ]
    );
  };

  if (transactions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Brak transakcji</Text>
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
          <Pressable
            onLongPress={() => handleDelete(item.id)}
            style={styles.card}
          >
            <Text style={styles.ticker}>{item.ticker}</Text>
            <Text style={styles.text}>{item.shares} szt. ${item.price}</Text>
            <Text style={[styles.text, { color: item.shares > 0 ? 'green' : 'red' }]}>
            {item.shares > 0 ? 'Kupno' : 'Sprzedaż'}: ${Math.abs(item.shares * item.price).toFixed(2)}
            </Text>
            <Text style={styles.date}>{moment(item.date).format('DD.MM.YYYY HH:mm')}</Text>
          </Pressable>
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
  text: { color: '#cccccc' },
  date: { fontSize: 12, color: '#777', marginTop: 4 },
});