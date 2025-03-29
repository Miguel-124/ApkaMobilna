// app/addTransaction.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { saveTransaction } from '../utils/storage';
import { searchAssets } from '../utils/assets'; // Funkcja wyszukiwania aktywów
import { getPriceForTicker } from '../utils/prices'; // Funkcja pobierania cen
import { useDebouncedCallback } from 'use-debounce'; // Debounced callback
import DateTimePicker from '@react-native-community/datetimepicker';

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
  const [assetType, setAssetType] = useState<'stock' | 'crypto'>('stock');
  const [totalAmount, setTotalAmount] = useState('');
  const [date, setDate] = useState(new Date());

  // Debounced wyszukiwanie aktywów
  const debouncedSearch = useDebouncedCallback(async (query: string) => {
    if (!query) return;
    const results = await searchAssets(query, assetType);
    setAssets(results);
  }, 500);

  const handleSearch = (query: string) => {
    setTicker(query);
    debouncedSearch(query);
  };

  const handleSharesChange = (shares: string) => {
    setShares(shares);
    if (price && shares) {
      setTotalAmount((parseFloat(shares) * parseFloat(price)).toString());
    }
  };

  const handlePriceChange = (price: string) => {
    setPrice(price);
    if (shares && price) {
      setTotalAmount((parseFloat(shares) * parseFloat(price)).toString());
    }
  };

  const handleTotalAmountChange = (totalAmount: string) => {
    setTotalAmount(totalAmount);
    if (totalAmount && price) {
      setShares((parseFloat(totalAmount) / parseFloat(price)).toString());
    }
  };

  const handleSelectAsset = async (asset: Asset) => {
    setSelectedAsset(asset);
    setTicker(asset.symbol.toUpperCase());
    if (asset.current_price === null) {
      const fetchedPrice = await getPriceForTicker(asset.symbol, assetType);
      setPrice(fetchedPrice ? fetchedPrice.toString() : '');
    } else {
      setPrice(asset.current_price.toString());
    }
    setAssets([]);
  };

  const handleAdd = async () => {
    if (!selectedAsset || !shares || !price || !totalAmount) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola!');
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      ticker: selectedAsset.symbol.toUpperCase(),
      shares: Number(shares),
      price: Number(price),
      totalAmount: Number(totalAmount),
      date: date.toISOString(),
      assetType,
    };

    await saveTransaction(newTransaction);
    Alert.alert(
      'Sukces 🎉',
      `Dodano transakcję:\n${shares} x ${selectedAsset.symbol.toUpperCase()} @ $${price}`
    );

    setTicker('');
    setShares('');
    setPrice('');
    setTotalAmount('');
    setSelectedAsset(null);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Dodaj transakcję</Text>

        <View style={styles.assetTypeContainer}>
          <TouchableOpacity
            style={[
              styles.assetTypeButton,
              assetType === 'stock' && styles.assetTypeButtonActive,
            ]}
            onPress={() => setAssetType('stock')}
          >
            <Text
              style={[
                styles.assetTypeText,
                assetType === 'stock' && styles.assetTypeTextActive,
              ]}
            >
              Akcje/ETF
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.assetTypeButton,
              assetType === 'crypto' && styles.assetTypeButtonActive,
            ]}
            onPress={() => setAssetType('crypto')}
          >
            <Text
              style={[
                styles.assetTypeText,
                assetType === 'crypto' && styles.assetTypeTextActive,
              ]}
            >
              Kryptowaluty
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Wyszukaj aktywo (np. Tesla, BTC)"
          value={ticker}
          onChangeText={handleSearch}
          autoCapitalize="characters"
          placeholderTextColor="#777"
        />

        {assets.length > 0 && (
          <FlatList
            data={assets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectAsset(item)}>
                <Text style={styles.suggestion}>
                  {item.name} ({item.symbol.toUpperCase()})
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Ilość"
          value={shares}
          onChangeText={handleSharesChange}
          keyboardType="numeric"
          placeholderTextColor="#777"
        />
        <TextInput
          style={styles.input}
          placeholder="Cena zakupu"
          value={price}
          onChangeText={handlePriceChange}
          keyboardType="numeric"
          placeholderTextColor="#777"
        />
        <TextInput
          style={styles.input}
          placeholder="Kwota wydana"
          value={totalAmount}
          onChangeText={handleTotalAmountChange}
          keyboardType="numeric"
          placeholderTextColor="#777"
        />

        <View style={styles.datePickerContainer}>
          <Text style={styles.dateText}>Data transakcji:</Text>
          <DateTimePicker
            value={date}
            mode="datetime"
            onChange={(event, selectedDate) =>
              setDate(selectedDate || date)
            }
            style={styles.datePicker}
          />
        </View>

        <View style={styles.addButtonContainer}>
          <Button title="Dodaj" onPress={handleAdd} color="#00FFFF" />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#00FFFF',
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
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  assetTypeButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00FFFF',
    alignItems: 'center',
  },
  assetTypeButtonActive: {
    backgroundColor: '#00FFFF40',
  },
  assetTypeText: {
    color: '#ffffff',
    fontSize: 16,
  },
  assetTypeTextActive: {
    color: '#00FFFF',
    fontWeight: 'bold',
  },
  datePickerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
  datePicker: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#1e1e1e',
  },
  addButtonContainer: {
    marginTop: 20,
    alignSelf: 'center',
    width: '50%',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#00FFFF',
  },
});