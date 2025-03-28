export const FINNHUB_TOKEN = 'cvjc3ehr01qlscpb681gcvjc3ehr01qlscpb6820'; // Eksportujemy token
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1/quote';
const BINANCE_BASE_URL = 'https://api.binance.com/api/v3/ticker/price';
const STOOQ_BASE_URL = 'https://stooq.pl/q/d/l/?s='; // URL dla Stooq

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
      // 2. Sprawdzamy cenę akcji na Stooq.pl
      const stooqUrl = `${STOOQ_BASE_URL}${upperTicker}.csv`;
      const stooqResponse = await fetch(stooqUrl);

      // Logujemy odpowiedź Stooq, aby sprawdzić, co otrzymujemy
      console.log('Stooq response status:', stooqResponse.status); // Status odpowiedzi (powinno być 200)
      
      // Jeśli dane są dostępne
      if (stooqResponse.ok) {
        const data = await stooqResponse.text();
        console.log('Dane z Stooq:', data); // Logujemy pobrane dane z Stooq

        // Sprawdzamy, czy dane zawierają linię z ceną (ostatnia linia w CSV)
        const rows = data.split('\n');
        const lastRow = rows[rows.length - 2]; // Ostatnia linia z danymi (pomijamy pustą ostatnią linię)
        console.log('Ostatnia linia:', lastRow); // Logujemy ostatnią linię

        if (lastRow) {
          const columns = lastRow.split(';'); // CSV jest oddzielony średnikami
          console.log('Kolumny w ostatniej linii:', columns); // Logujemy kolumny w ostatniej linii
          const price = parseFloat(columns[4]); // 5-ta kolumna zawiera cenę (sprawdź, czy jest to rzeczywiście ta kolumna)
          if (!isNaN(price)) {
            console.log('Cena z Stooq:', price); // Logujemy znalezioną cenę
            return price; // Zwracamy cenę
          } else {
            console.log('Błąd: Cena z Stooq jest NaN'); // Jeśli cena jest NaN
          }
        } else {
          console.log('Błąd: Brak danych w ostatniej linii CSV'); // Jeśli nie ma ostatniej linii danych
        }
      } else {
        console.log('Błąd: Stooq odpowiedź nie jest OK'); // Jeśli odpowiedź z Stooq nie jest OK (np. 404)
      }

      // 3. Jeśli na Stooq.pl brak danych, sprawdzamy na Finnhub
      console.log('Sprawdzam cenę na Finnhub, jeśli Stooq nie zwrócił ceny');
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