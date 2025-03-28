import { View, Text, Button, StyleSheet, Image, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { PieChart } from 'react-native-chart-kit';
import { mockPortfolio } from '../data/portfolio';

export default function Index() {
  const totalValue = mockPortfolio.reduce(
    (acc, asset) => acc + asset.shares * asset.currentPrice,
    0
  );

  const pieData = mockPortfolio.map((asset) => {
    const value = asset.shares * asset.currentPrice;
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

function getColor(ticker: string) {
  switch (ticker) {
    case 'AAPL':
      return '#4CAF50';
    case 'VOO':
      return '#2196F3';
    case 'TSLA':
      return '#FF9800';
    default:
      return '#9C27B0';
  }
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
    buttonContainer: { marginTop: 32, gap: 12 },
  });