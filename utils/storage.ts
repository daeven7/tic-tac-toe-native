import * as SecureStore from 'expo-secure-store';

const memoryStorage: { [key: string]: string } = {};

export const getItem = async (key: string): Promise<string | null> => {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value;
  } catch (error) {
    const value = memoryStorage[key] || null;
    return value;
  }
};

export const setItem = async (key: string, value: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    memoryStorage[key] = value;
  }
};

export const deleteItem = async (key: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    delete memoryStorage[key];
  }
}; 