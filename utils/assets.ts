// assets.ts

import axios from 'axios';
import { FINNHUB_TOKEN } from './prices'; // Zaimportuj token Finnhub

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/search';
const FINNHUB_API_URL = 'https://finnhub.io/api/v1/search';

// Funkcja do wyszukiwania aktywów
export async function searchAssets(query: string, assetType: 'stock' | 'crypto') {
  try {
    if (assetType === 'crypto') {
      // Zapytanie dla kryptowalut z CoinGecko
      const response = await axios.get(`${COINGECKO_API_URL}?query=${query}`);
      return response.data.coins.map((coin: any) => ({
        id: coin.id, // id dla CoinGecko
        symbol: coin.symbol, // symbol aktywa (np. BTC, ETH)
        name: coin.name, // nazwa aktywa (np. Bitcoin)
        current_price: null, // Cena krypto będzie później pobierana przez getPriceForTicker
      }));
    }

    if (assetType === 'stock') {
      // Zapytanie dla akcji z Finnhub
      const response = await axios.get(`${FINNHUB_API_URL}?q=${query}&token=${FINNHUB_TOKEN}`);
      return response.data.result.map((asset: any) => ({
        id: asset.symbol, // id dla Finnhub
        symbol: asset.symbol, // symbol akcji (np. AAPL)
        name: asset.description, // pełna nazwa akcji (np. Apple Inc.)
        current_price: null, // Cena dla akcji zostanie pobrana później
      }));
    }

    return [];
  } catch (error) {
    console.error('Błąd podczas wyszukiwania aktywów', error);
    return [];
  }
}