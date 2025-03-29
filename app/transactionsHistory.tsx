// app/transactionsHistory.tsx
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
  assetType: 'stock' | 'crypto';
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
            <Text style={styles.text}>
              {item.shares} szt. @ ${item.price.toFixed(2)}
            </Text>
            <Text
              style={[
                styles.text,
                styles.boldText,
                { color: item.shares > 0 ? 'lightgreen' : 'red' },
              ]}
            >
              {item.shares > 0 ? 'Kupno' : 'Sprzedaż'}: ${Math.abs(item.shares * item.price).toFixed(2)}
            </Text>
            <Text style={styles.date}>
              {moment(item.date).format('DD.MM.YYYY HH:mm')}
            </Text>
          </Pressable>
        )}
      />
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
  },
  card: {
    padding: 16,
    backgroundColor: '#1e1e1e',
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00FFFF',
  },
  ticker: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: '#00CFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  text: {
    fontSize: 14,
    color: '#cccccc',
  },
  boldText: {
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    fontWeight: '600',
    color: '#777',
    marginTop: 4,
    // textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
});