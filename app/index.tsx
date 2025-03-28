import { View, Text, Button, StyleSheet, Image, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { PieChart } from 'react-native-chart-kit';
import { getTransactions } from '../utils/storage';
import { getPortfolioFromTransactions } from '../utils/portfolio';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback,useState } from 'react';

type PortfolioItem = {
  ticker: string;
  shares: number;
  avgPrice: number;
};

export default function Index() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const transactions = await getTransactions();
        const portfolio = getPortfolioFromTransactions(transactions);
        setPortfolio(portfolio);
      };
  
      load();
    }, [])
  );

  const totalValue = portfolio.reduce(
    (acc, asset) => acc + asset.shares * asset.avgPrice,
    0
  );

  const pieData = portfolio.map((asset) => {
    const value = asset.shares * asset.avgPrice;
    return {
      name: asset.ticker,
      population: value,
      color: getColor(asset.ticker),
      legendFontColor: '#ffffff',
      legendFontSize: 14,
    };
  });

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo_SmartInwestor.jpeg')}
        style={styles.logo}
      />
      <Text style={styles.title}>SmartInwestor</Text>
      <Text style={styles.subtitle}>Wartość portfela: ${totalValue.toFixed(2)}</Text>

      {portfolio.length > 0 ? (
        <PieChart
          data={pieData}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={{
            color: () => '#ffffff',
            labelColor: () => '#ffffff',
            backgroundGradientFrom: '#121212',
            backgroundGradientTo: '#121212',
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[0, 0]}
          absolute
        />
      ) : (
        <Text style={styles.noData}>Brak danych do wykresu</Text>
      )}

      <View style={styles.buttonContainer}>
        <Link href="/portfolio" asChild>
          <Button title="Zobacz portfolio" />
        </Link>
        <Link href="/add-transaction" asChild>
          <Button title="Dodaj transakcję" />
        </Link>
        <Link href="/transactions" asChild>
          <Button title="Historia transakcji" />
        </Link>
      </View>
    </View>
  );
}

const colorPalette = [
    '#4CAF50', '#2196F3', '#FF9800', '#9C27B0',
    '#E91E63', '#00BCD4', '#CDDC39', '#FF5722',
    '#3F51B5', '#795548', '#009688', '#8BC34A',
  ];
  
  const colorMap = new Map<string, string>();
  
  function getColor(ticker: string) {
    if (!colorMap.has(ticker)) {
      const color = colorPalette[colorMap.size % colorPalette.length];
      colorMap.set(ticker, color);
    }
  
    return colorMap.get(ticker)!;
  }

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48, backgroundColor: '#121212' },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 12,
    borderRadius: 20,
  },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#ffffff' },
  subtitle: { fontSize: 18, textAlign: 'center', marginBottom: 24, color: '#cccccc' },
  noData: { color: '#777', fontSize: 16, textAlign: 'center', marginBottom: 24 },
  buttonContainer: { marginTop: 32, gap: 12 },
});