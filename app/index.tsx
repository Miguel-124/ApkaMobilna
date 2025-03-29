import React, { useState, useCallback } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { PieChart } from 'react-native-chart-kit';
import { getTransactions } from '../utils/storage';
import { getPortfolioFromTransactions } from '../utils/portfolio';
import { useFocusEffect } from '@react-navigation/native';

type PortfolioItem = {
  ticker: string;
  shares: number;
  avgPrice: number;
};

function CustomButton({ title, style, ...props }: { title: string; style?: any } & any) {
    return (
      <TouchableOpacity style={[styles.customButton, style]} {...props}>
        <Text style={styles.customButtonText}>{title}</Text>
      </TouchableOpacity>
    );
  }

export default function Index() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

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

  // Przygotowanie danych do wykresu
  const pieData = portfolio.map((asset) => {
    const value = asset.shares * asset.avgPrice;  // Wartość aktywa
    const percent = totalValue > 0 ? (value / totalValue) * 100 : 0;
    
    return {
      name: asset.ticker,            // Tekst w legendzie
      population: percent,           // Używane do obliczeń w PieChart
      color: getColor(asset.ticker), // Kolor aktywa
      legendFontColor: '#00FFFF',    // Neonowy cyjan
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
            accessor="population" // klucz w obiekcie (pieData) używany do obliczeń
            backgroundColor="transparent"
            paddingLeft="15"
            center={[0, 0]}
            absolute={false}     // false => wyświetla % w segmentach
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
    </View>
  );
}

/** Ustawienia stylu i kolorów wykresu */
const chartConfig = {
  backgroundGradientFrom: '#0F2027',   // Początek gradientu
  backgroundGradientTo: '#2C5364',     // Koniec gradientu
  color: (opacity = 1) => `rgba(0, 255, 255, ${opacity})`,  // Neonowy cyjan
  labelColor: (opacity = 1) => `rgba(0, 255, 255, ${opacity})`,
  strokeWidth: 2,
  useShadowColorFromDataset: false,
};

/** Tablica kolorów do przydzielania segmentom */
const colorPalette = [
  '#4CAF50', '#2196F3', '#FF9800', '#9C27B0',
  '#E91E63', '#00BCD4', '#CDDC39', '#FF5722',
  '#3F51B5', '#795548', '#009688', '#8BC34A',
];

/** Mapa zapamiętująca, jaki ticker ma jaki kolor */
const colorMap = new Map<string, string>();

function getColor(ticker: string) {
  if (!colorMap.has(ticker)) {
    const color = colorPalette[colorMap.size % colorPalette.length];
    colorMap.set(ticker, color);
  }
  return colorMap.get(ticker)!;
}

/** Style ekranu i poszczególnych komponentów */
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
    color: '#00FFFF', // Neonowy cyjan
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
    // Kontener z "neonowym" efektem wokół wykresu
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -18,
    backgroundColor: '#0a1a1a', // Ciemne tło pod wykres
    borderRadius: 50,         // Duży promień => okrąg
    padding: 20,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10, // Dla Androida
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
});