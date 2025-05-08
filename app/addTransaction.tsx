//app/addTransaction.tsx
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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useDebouncedCallback } from 'use-debounce';
import DateTimePicker from '@react-native-community/datetimepicker';
import { v4 as uuidv4 } from 'uuid';

import { saveTransaction } from '@/lib/storage/transactions';
import { searchAssets } from '@/lib/constants/assets';
import { getPriceForTicker } from '@/lib/services/prices';
import { Transaction, Asset } from '@/lib/constants/types';

export default function AddTransactionScreen() {
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [price, setPrice] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetType, setAssetType] = useState<'stock' | 'crypto'>('stock');
  const [date, setDate] = useState(new Date());

  const debouncedSearch = useDebouncedCallback(async (query: string) => {
    if (!query) return;
    const results = await searchAssets(query, assetType);
    setAssets(results);
  }, 500);

  const handleSearch = (query: string) => {
    setTicker(query);
    debouncedSearch(query);
  };

  const handleSharesChange = (value: string) => {
    setShares(value);
    if (price && value) {
      setTotalAmount((Number(value) * Number(price)).toString());
    }
  };

  const handlePriceChange = (value: string) => {
    setPrice(value);
    if (shares && value) {
      setTotalAmount((Number(shares) * Number(value)).toString());
    }
  };

  const handleTotalAmountChange = (value: string) => {
    setTotalAmount(value);
    if (value && price) {
      setShares((Number(value) / Number(price)).toString());
    }
  };

  const handleSelectAsset = async (asset: Asset) => {
    setSelectedAsset(asset);
    setTicker(asset.symbol.toUpperCase());

    const currentPrice = asset.current_price ?? await getPriceForTicker(asset.symbol, assetType);
    setPrice(currentPrice ? currentPrice.toString() : '');
    setAssets([]);
  };

  const handleAdd = async () => {
    if (!selectedAsset || !shares || !price || !totalAmount) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola!');
      return;
    }

    const newTransaction: Transaction = {
      id: uuidv4(),
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
    setDate(new Date());
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Dodaj transakcję</Text>

        <View style={styles.assetTypeContainer}>
          {(['stock', 'crypto'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.assetTypeButton,
                assetType === type && styles.assetTypeButtonActive,
              ]}
              onPress={() => setAssetType(type)}
            >
              <Text
                style={[
                  styles.assetTypeText,
                  assetType === type && styles.assetTypeTextActive,
                ]}
              >
                {type === 'stock' ? 'Akcje/ETF' : 'Kryptowaluty'}
              </Text>
            </TouchableOpacity>
          ))}
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
            style={{ maxHeight: 150 }}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
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