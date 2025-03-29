//utils/assets.ts
import axios from 'axios';
import { FINNHUB_TOKEN } from './prices'; // Zaimportuj token Finnhub

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/search';
const FINNHUB_API_URL = 'https://finnhub.io/api/v1/search';
const ALPHA_VANTAGE_API_URL = 'https://www.alphavantage.co/query'; // URL dla Alpha Vantage
const ALPHA_VANTAGE_API_KEY = 'SZ842O6PT1AMVFGH'; // Twój klucz Alpha Vantage

// Funkcja do wyszukiwania aktywów
export async function searchAssets(query: string, assetType: 'stock' | 'crypto') {
  try {
    if (assetType === 'crypto') {
      // Zapytanie dla kryptowalut z CoinGecko
      const response = await axios.get(`${COINGECKO_API_URL}?query=${query}`);
      return response.data.coins.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        current_price: null,
      }));
    }

    if (assetType === 'stock') {
      // Warunek - wyszukujemy dopiero dla zapytania o długości co najmniej 3 znaków
      if (query.length < 3) {
        return []; // lub możesz zwrócić jakiś komunikat/stan ładowania
      }

      // Debounce - opóźnienie 500ms przed wykonaniem zapytania
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log(`Szukam akcji: ${query.toUpperCase()} na Alpha Vantage`);

      // Zapytanie do GLOBAL_QUOTE, które zwraca tylko aktualną cenę
      const alphaVantageUrl = `${ALPHA_VANTAGE_API_URL}?function=GLOBAL_QUOTE&symbol=${query.toUpperCase()}&apikey=${ALPHA_VANTAGE_API_KEY}`;
      const alphaVantageResponse = await axios.get(alphaVantageUrl);

      if (alphaVantageResponse.status === 200) {
        console.log('Odpowiedź z Alpha Vantage otrzymana:', alphaVantageResponse.data);
        const data = alphaVantageResponse.data;
        if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
          const price = parseFloat(data["Global Quote"]["05. price"]);
          return [{
            id: query.toUpperCase(),
            symbol: query.toUpperCase(),
            name: query.toUpperCase(),
            current_price: price,
          }];
        }
      } else {
        console.log('Błąd odpowiedzi z Alpha Vantage, status:', alphaVantageResponse.status);
      }

      // Fallback: Jeśli Alpha Vantage nie zwrócił ceny, sprawdzamy na Finnhub
      console.log('Sprawdzam cenę na Finnhub, jeśli Alpha Vantage nie zwrócił ceny');
      const response = await axios.get(`${FINNHUB_API_URL}?q=${query}&token=${FINNHUB_TOKEN}`);
      return response.data.result.map((asset: any) => ({
        id: asset.symbol,
        symbol: asset.symbol,
        name: asset.description,
        current_price: null,
      }));
    }

    return [];
  } catch (error) {
    console.error('Błąd podczas wyszukiwania aktywów', error);
    return [];
  }
}