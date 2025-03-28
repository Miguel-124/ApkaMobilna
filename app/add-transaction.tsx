import { useState } from 'react';
import { View, Text, TextInput, Button, Alert, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { saveTransaction } from '../utils/storage';
import { searchAssets } from '../utils/assets'; // Funkcja wyszukiwania aktywów
import { getPriceForTicker } from '../utils/prices'; // Funkcja pobierania cen
import { useDebouncedCallback } from 'use-debounce'; // Debounced callback

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
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetType, setAssetType] = useState<'stock' | 'crypto'>('stock'); // Typ aktywa

  // Debounced wyszukiwanie aktywów
  const debouncedSearch = useDebouncedCallback(async (query: string) => {
    if (!query) return;
    const results = await searchAssets(query, assetType); // Wyszukiwanie aktywów
    setAssets(results);
  }, 500);

  const handleSearch = (query: string) => {
    setTicker(query); // Ustawienie tickeru
    debouncedSearch(query); // Wyszukiwanie po zmianie
  };

  const handleSelectAsset = async (asset: Asset) => {
    setSelectedAsset(asset);
    setTicker(asset.symbol.toUpperCase());
  
    if (asset.current_price === null) {
      // Jeśli cena nie jest dostępna (np. dla akcji), pobieramy ją z Finnhub
      const price = await getPriceForTicker(asset.symbol, assetType); // Przekazujemy assetType
      setPrice(price ? price.toString() : ''); // Ustawiamy cenę zakupu na bieżącą cenę
    } else {
      setPrice(asset.current_price.toString()); // Ustawiamy cenę zakupu dla kryptowalut
    }
  
    setAssets([]);
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

      <View style={styles.assetTypeContainer}>
        <Button
          title="Akcje/ETF"
          onPress={() => setAssetType('stock')}
          color={assetType === 'stock' ? '#00f' : '#fff'}
        />
        <Button
          title="Kryptowaluty"
          onPress={() => setAssetType('crypto')}
          color={assetType === 'crypto' ? '#00f' : '#fff'}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Wyszukaj aktywo (np. Tesla, BTC)"
        value={ticker}
        onChangeText={handleSearch} // Używamy debounced wyszukiwania
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
  assetTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
});