import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'transactions';

export async function saveTransaction(transaction: any) {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    const data = json ? JSON.parse(json) : [];
    data.push(transaction);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Błąd zapisu transakcji:', err);
  }
}

export async function getTransactions() {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (err) {
    console.error('Błąd odczytu transakcji:', err);
    return [];
  }
}