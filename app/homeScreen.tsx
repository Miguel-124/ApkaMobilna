import React, { useState, useCallback, forwardRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, TouchableOpacityProps } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { PieChart } from 'react-native-chart-kit';
import { getTransactions } from '../lib/storage/transactions';
import { getPortfolioFromTransactions } from '../lib/services/portfolio';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../lib/storage/auth';

type PortfolioItem = {
  ticker: string;
  shares: number;
  avgPrice: number;
};

type Props = {
  title: string;
  style?: any;
} & TouchableOpacityProps;

const CustomButton = forwardRef<React.ElementRef<typeof TouchableOpacity>, Props>(
  ({ title, style, ...props }, ref) => {
    return (
      <TouchableOpacity ref={ref} style={[styles.customButton, style]} {...props}>
        <Text style={styles.customButtonText}>{title}</Text>
      </TouchableOpacity>
    );
  }
);

export default function Index() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const transactions = await getTransactions();
        const portfolioData = getPortfolioFromTransactions(transactions);
        setPortfolio(portfolioData);
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
    const percent = totalValue > 0 ? (value / totalValue) * 100 : 0;

    return {
      name: asset.ticker,
      population: percent,
      color: getColor(asset.ticker),
      legendFontColor: '#00FFFF',
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
      <Text style={styles.subtitle}>
        Wartość portfela: ${totalValue.toFixed(2)}
      </Text>

      {portfolio.length > 0 ? (
        <View style={styles.chartContainer}>
          <PieChart
            data={pieData}
            width={Dimensions.get('window').width - 32}
            height={240}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[0, 0]}
            absolute={false}
            style={styles.chart}
          />
        </View>
      ) : (
        <Text style={styles.noData}>Brak danych do wykresu</Text>
      )}

      <View style={styles.buttonContainer}>
        <Link href="/portfolio" asChild>
          <CustomButton title="Zobacz portfolio" />
        </Link>
        <Link href="/addTransaction" asChild>
          <CustomButton title="Dodaj transakcję" />
        </Link>
        <Link href="/transactionsHistory" asChild>
          <CustomButton title="Historia transakcji" />
        </Link>
      </View>

      <TouchableOpacity
        onPress={() => {
          logout();
          router.replace('/login');
        }}
        style={styles.logoutButton}
      >
        <Text style={styles.logoutButtonText}>Wyloguj</Text>
      </TouchableOpacity>
    </View>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#0F2027',
  backgroundGradientTo: '#2C5364',
  color: (opacity = 1) => `rgba(0, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 255, 255, ${opacity})`,
  strokeWidth: 2,
  useShadowColorFromDataset: false,
};

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
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#121212',
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 12,
    marginTop: -26,
    borderRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#00FFFF',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 24,
    color: '#CCCCCC',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -18,
    backgroundColor: '#0a1a1a',
    borderRadius: 50,
    padding: 20,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  chart: {
    margin: -18,
  },
  noData: {
    color: '#777',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    marginTop: 32,
    gap: 6,
  },
  customButton: {
    borderWidth: 2,
    borderColor: '#00FFFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginVertical: 2,
  },
  customButtonText: {
    color: '#00FFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 32,
    alignSelf: 'center',
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#ccc',
    fontSize: 14,
  },
});