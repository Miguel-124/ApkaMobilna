//storage/transactions.ts
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

export async function deleteTransaction(id: string) {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    const data = json ? JSON.parse(json) : [];
    const updated = data.filter((tx: any) => tx.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Błąd usuwania transakcji:', err);
  }
}

export async function removeTransactionById(id: string) {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    const data = json ? JSON.parse(json) : [];

    const updated = data.filter((tx: any) => tx.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Błąd podczas usuwania transakcji:', err);
  }
}