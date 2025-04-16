// app/portfolio/[ticker].tsx
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, Pressable } from 'react-native';
import { getTransactions, deleteTransactionById, saveTransaction } from '@/lib/storage/transactions';
import { getPriceForTicker } from '@/lib/services/prices';
import moment from 'moment';
import { usePortfolio } from '@/lib/hooks/usePortfolio';
import { Transaction } from '@/lib/constants/types';

export default function AssetDetailScreen() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  const { portfolio } = usePortfolio();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastDeleted, setLastDeleted] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  const asset = portfolio.find((item) => item.ticker === ticker);

  useEffect(() => {
    const load = async () => {
      const all = await getTransactions();
      const filtered = all.filter((tx: Transaction) => tx.ticker === ticker);
      setTransactions(filtered);
      setLoading(false);
    };
    load();
  }, [ticker]);

  useEffect(() => {
    if (lastDeleted) {
      const timeout = setTimeout(() => {
        setLastDeleted(null);
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [lastDeleted]);

  const handleDelete = (id: string) => {
    Alert.alert('Usuń transakcję', 'Czy na pewno chcesz usunąć tę transakcję?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          const toDelete = transactions.find((tx) => tx.id === id);
          if (!toDelete) return;
          await deleteTransactionById(id);
          setTransactions((prev) => prev.filter((tx) => tx.id !== id));
          setLastDeleted(toDelete);
        },
      },
    ]);
  };

  const handleDeleteAll = () => {
    if (transactions.length === 0) return;
    Alert.alert(
      'Usuń wszystkie transakcje',
      `Na pewno chcesz usunąć WSZYSTKIE transakcje dla ${ticker?.toUpperCase()}?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń wszystkie',
          style: 'destructive',
          onPress: async () => {
            await Promise.all(transactions.map((tx) => deleteTransactionById(tx.id)));
            setTransactions([]);
            setLastDeleted(null);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.title, { alignSelf: 'center' }]}>{ticker?.toUpperCase()}</Text>
      {loading || !asset ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : (
        <>
          <Text style={styles.line}>📦 Ilość: <Text style={styles.value}>{asset.shares}</Text></Text>
          <Text style={styles.line}>💰 Średnia cena zakupu: <Text style={styles.value}>${asset.avgPrice.toFixed(2)}</Text></Text>
          <Text style={styles.line}>💸 Koszt zakupu: <Text style={styles.value}>${(asset.shares * asset.avgPrice).toFixed(2)}</Text></Text>
          <Text style={styles.line}>📈 Kurs rynkowy: <Text style={styles.value}>{asset.currentPrice !== null ? `$${asset.currentPrice.toFixed(2)}` : 'Brak danych'}</Text></Text>
          <Text style={styles.line}>💼 Wartość rynkowa: <Text style={styles.value}>{asset.marketValue !== null ? `$${asset.marketValue.toFixed(2)}` : 'Brak danych'}</Text></Text>
          <Text style={styles.line}>📊 Zysk: {asset.profit !== null && asset.profitPercent !== null ? (
            <Text style={{ color: asset.profit >= 0 ? '#88ff88' : '#ff8888' }}>
              {asset.profit >= 0 ? '📈' : '📉'} {asset.profit.toFixed(2)} USD ({asset.profitPercent.toFixed(1)}%)
            </Text>
          ) : (
            <Text style={{ color: '#aaa' }}>Brak danych</Text>
          )}</Text>

          <View style={styles.transactions}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.subtitle, { flex: 1, textAlign: 'center' }]}>Transakcje:</Text>
              <Pressable onPress={handleDeleteAll}>
                <Text style={{ color: '#ff5555', fontWeight: 'bold' }}>🗑️</Text>
              </Pressable>
            </View>

            {transactions.length === 0 ? (
              <Text style={styles.text}>Brak transakcji dla tego aktywa.</Text>
            ) : (
              transactions.slice().reverse().map((tx) => (
                <View key={tx.id} style={styles.txCard}>
                  <View style={styles.txRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.txText}>📅 {moment(tx.date).format('DD.MM.YYYY HH:mm')} | {tx.shares.toFixed(5)} szt. ${tx.price}</Text>
                    </View>
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
        <Pressable
          style={styles.undoContainer}
          onPress={async () => {
            await saveTransaction(lastDeleted);
            setTransactions((prev) => [...prev, lastDeleted]);
            setLastDeleted(null);
          }}
        >
          <Text style={styles.undoText}>Cofnij usunięcie transakcji</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#121212' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#00FFFF',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  line: { fontSize: 16, marginBottom: 12, color: '#cccccc' },
  value: { fontWeight: '600', color: '#ffffff' },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'left',
    color: '#00FFFF',
    textShadowColor: '#00CFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  transactions: { marginTop: 12 },
  txCard: {
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    paddingRight: 22,
    borderWidth: 2,
    borderColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 10,
  },
  txText: { color: '#cccccc', fontSize: 14 },
  text: { color: '#aaaaaa', fontSize: 14 },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 18,
    marginLeft: -9,
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