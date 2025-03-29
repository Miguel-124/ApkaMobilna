export const FINNHUB_TOKEN = 'cvjc3ehr01qlscpb681gcvjc3ehr01qlscpb6820'; // Eksportujemy token
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1/quote';
const BINANCE_BASE_URL = 'https://api.binance.com/api/v3/ticker/price';
const ALPHA_VANTAGE_API_URL = 'https://www.alphavantage.co/query'; // URL dla Alpha Vantage

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
      // 2. Sprawdzamy cenę akcji z Alpha Vantage API
      const alphaVantageUrl = `${ALPHA_VANTAGE_API_URL}?function=TIME_SERIES_INTRADAY&symbol=${upperTicker}&interval=1min&apikey=N4HGRWO36EH2DMKL`;
      const alphaVantageResponse = await fetch(alphaVantageUrl);

      if (alphaVantageResponse.ok) {
        const data = await alphaVantageResponse.json();
        console.log('Dane z Alpha Vantage:', data); // Logujemy dane z Alpha Vantage

        // Sprawdzamy dostępność ceny
        if (data['Time Series (1min)']) {
          const latestTime = Object.keys(data['Time Series (1min)'])[0]; // Najnowszy czas
          const latestData = data['Time Series (1min)'][latestTime];
          const price = parseFloat(latestData['4. close']); // Cena zamknięcia (najwyższa wartość)
          if (!isNaN(price)) {
            console.log('Cena z Alpha Vantage:', price); // Logujemy cenę
            return price;
          }
        }
      }

      // 3. Jeśli na Alpha Vantage brak danych, sprawdzamy na Finnhub
      console.log('Sprawdzam cenę na Finnhub, jeśli Alpha Vantage nie zwrócił ceny');
      const url = `${FINNHUB_BASE_URL}?symbol=${upperTicker}&token=${FINNHUB_TOKEN}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data && data.c) {
        console.log('Cena z Finnhub:', data.c); // Logujemy cenę z Finnhub
        return parseFloat(data.c); // Cena z Finnhub
      }
    }

    return null; // Jeśli brak danych, zwróć null
  } catch (err) {
    console.error(`Błąd pobierania ceny dla ${ticker}:`, err);
    return null;
  }
}