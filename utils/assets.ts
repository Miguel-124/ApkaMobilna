import axios from 'axios';

const API_URL = 'https://api.coingecko.com/api/v3/';

export async function searchAssets(query: string) {
  try {
    // Pierwsze zapytanie: wyszukiwanie aktywów na podstawie nazwy lub symbolu
    const searchResponse = await axios.get(`${API_URL}search?query=${query}`);
    
    // Mapowanie wyników wyszukiwania
    const coins = searchResponse.data.coins;

    // Zapytanie o ceny aktywów
    const pricesResponse = await axios.get(`${API_URL}simple/price?ids=${coins.map((coin: any) => coin.id).join(',')}&vs_currencies=usd`);

    // Łączenie wyników wyszukiwania z cenami
    return coins.map((coin: any) => ({
      id: coin.id, // id dla CoinGecko
      symbol: coin.symbol, // symbol aktywa (np. BTC, ETH)
      name: coin.name, // nazwa aktywa (np. Bitcoin)
      current_price: pricesResponse.data[coin.id]?.usd || null, // Cena aktywa w USD
    }));
  } catch (error) {
    console.error('Błąd podczas wyszukiwania aktywów', error);
    return [];
  }
}