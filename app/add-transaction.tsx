import { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { saveTransaction } from '../utils/storage';


export default function AddTransactionScreen() {
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [price, setPrice] = useState('');

  const handleAdd = async () => {
    if (!ticker || !shares || !price) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola!');
      return;
    }
  
    const newTransaction = {
      id: Date.now().toString(),
      ticker: ticker.toUpperCase(),
      shares: Number(shares),
      price: Number(price),
      date: new Date().toISOString().split('T')[0],
    };
  
    await saveTransaction(newTransaction);
  
    Alert.alert('Sukces 🎉', `Dodano transakcję:\n${shares} x ${ticker.toUpperCase()} @ $${price}`);
  
    setTicker('');
    setShares('');
    setPrice('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dodaj transakcję</Text>

      <TextInput
        style={styles.input}
        placeholder="Ticker (np. AAPL)"
        value={ticker}
        onChangeText={setTicker}
        autoCapitalize="characters"
      />
      <TextInput
        style={styles.input}
        placeholder="Ilość akcji"
        value={shares}
        onChangeText={setShares}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Cena zakupu"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Button title="Dodaj" onPress={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
});