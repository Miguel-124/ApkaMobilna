import { useState, useCallback } from 'react';
import { View, Text, TextInput, Button, Alert, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { saveTransaction } from '../utils/storage';
import { searchAssets } from '../utils/assets'; // Zaimportuj funkcję wyszukiwania aktywów
import { useDebouncedCallback } from 'use-debounce'; // Zainstaluj bibliotekę 'use-debounce'

// Typ dla aktywów
type Asset = {
  id: string;
  symbol: string;
  name: string;
  current_price: number | null;
};

export default function AddTransactionScreen() {
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [price, setPrice] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]); // Określamy typ danych
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Debounced search function
  const handleSearch = useDebouncedCallback(async (query: string) => {
    if (!query) return;
    const results = await searchAssets(query);
    setAssets(results);
  }, 500); // 500ms debounce

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setTicker(asset.symbol.toUpperCase()); // Ustawiamy ticker na podstawie wybranego aktywa
    setPrice(asset.current_price ? asset.current_price.toString() : ''); // Automatycznie ustawiamy cenę zakupu na bieżącą cenę
    setAssets([]); // Usuwamy listę wyników po wyborze aktywa
  };

  const handleAdd = async () => {
    if (!selectedAsset || !shares || !price) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola!');
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      ticker: selectedAsset.symbol.toUpperCase(),
      shares: Number(shares),
      price: Number(price),
      date: new Date().toISOString().split('T')[0],
    };

    await saveTransaction(newTransaction);

    Alert.alert('Sukces 🎉', `Dodano transakcję:\n${shares} x ${selectedAsset.symbol.toUpperCase()} @ $${price}`);

    setTicker('');
    setShares('');
    setPrice('');
    setSelectedAsset(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dodaj transakcję</Text>

      <TextInput
        style={styles.input}
        placeholder="Wyszukaj aktywo (np. Tesla, BTC)"
        value={ticker}
        onChangeText={(text) => {
          setTicker(text);
          handleSearch(text); // Wyszukiwanie na bieżąco z debouncingiem
        }}
        autoCapitalize="characters"
        placeholderTextColor="#777"
      />

      {assets.length > 0 && (
        <FlatList
          data={assets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectAsset(item)}>
              <Text style={styles.suggestion}>{item.name} ({item.symbol.toUpperCase()})</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Ilość"
        value={shares}
        onChangeText={setShares}
        keyboardType="numeric"
        placeholderTextColor="#777"
      />
      <TextInput
        style={styles.input}
        placeholder="Cena zakupu"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        placeholderTextColor="#777"
      />

      <Button title="Dodaj" onPress={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12, backgroundColor: '#121212' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, color: '#ffffff' },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  suggestion: {
    color: '#88ff88',
    fontSize: 16,
    marginVertical: 4,
  },
});