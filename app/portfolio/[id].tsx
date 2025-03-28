import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { mockPortfolio } from '../../data/portfolio';

export default function AssetDetailsScreen() {
  const { id } = useLocalSearchParams();

  const asset = mockPortfolio.find((item) => item.id === id);

  if (!asset) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Nie znaleziono aktywa</Text>
      </View>
    );
  }

  const invested = asset.shares * asset.avgPrice;
  const currentValue = asset.shares * asset.currentPrice;
  const profit = currentValue - invested;
  const profitPercent = (profit / invested) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{asset.name} ({asset.ticker})</Text>
      <Text>Ilość: {asset.shares}</Text>
      <Text>Śr. cena zakupu: ${asset.avgPrice}</Text>
      <Text>Aktualna cena: ${asset.currentPrice}</Text>
      <Text style={profit >= 0 ? styles.profit : styles.loss}>
        Zysk/Strata: ${profit.toFixed(2)} ({profitPercent.toFixed(2)}%)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  error: { fontSize: 18, color: 'red' },
  profit: { marginTop: 16, color: 'green', fontSize: 18 },
  loss: { marginTop: 16, color: 'red', fontSize: 18 },
});