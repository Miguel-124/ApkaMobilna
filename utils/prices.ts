// prices.ts

export const FINNHUB_TOKEN = 'cvjc3ehr01qlscpb681gcvjc3ehr01qlscpb6820'; // Eksportujemy token
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1/quote';
const BINANCE_BASE_URL = 'https://api.binance.com/api/v3/ticker/price';

// Lista kryptowalut, które sprawdzamy przez Binance
const CRYPTO_TICKERS = ['BTC', 'ETH', 'SOL', 'BNB'];

export async function getPriceForTicker(ticker: string, assetType: 'stock' | 'crypto'): Promise<number | null> {
  const upperTicker = ticker.toUpperCase();

  try {
    if (assetType === 'crypto' && CRYPTO_TICKERS.includes(upperTicker)) {
      // 1. Pobieramy cenę dla kryptowalut z Binance
      const symbol = `${upperTicker}USDT`;
      const res = await fetch(`${BINANCE_BASE_URL}?symbol=${symbol}`);
      const data = await res.json();
      return parseFloat(data.price); // Cena krypto w USDT
    }

    if (assetType === 'stock') {
      // 2. Pobieramy cenę dla akcji/ETF z Finnhub
      const url = `${FINNHUB_BASE_URL}?symbol=${upperTicker}&token=${FINNHUB_TOKEN}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data && data.c) {
        return parseFloat(data.c); // current price z Finnhub
      }
    }

    return null; // Jeśli nie znaleziono danych, zwróć null
  } catch (err) {
    console.error(`Błąd pobierania ceny dla ${ticker}:`, err);
    return null;
  }
}