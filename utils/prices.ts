const FINNHUB_TOKEN = 'cvjc3ehr01qlscpb681gcvjc3ehr01qlscpb6820';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1/quote';
const BINANCE_BASE_URL = 'https://api.binance.com/api/v3/ticker/price';

// Lista tickerów krypto, które sprawdzamy przez Binance
const CRYPTO_TICKERS = ['BTC', 'ETH', 'SOL', 'BNB'];

export async function getPriceForTicker(ticker: string): Promise<number | null> {
  const upperTicker = ticker.toUpperCase();

  try {
    // 1. Binance (krypto)
    if (CRYPTO_TICKERS.includes(upperTicker)) {
      const symbol = `${upperTicker}USDT`;
      const res = await fetch(`${BINANCE_BASE_URL}?symbol=${symbol}`);
      const data = await res.json();
      return parseFloat(data.price);
    }

    // 2. Finnhub (akcje/ETF)
    const url = `${FINNHUB_BASE_URL}?symbol=${upperTicker}&token=${FINNHUB_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data && data.c) {
      return parseFloat(data.c); // current price
    }

    return null; // fallback
  } catch (err) {
    console.error(`Błąd pobierania ceny dla ${ticker}:`, err);
    return null;
  }
}