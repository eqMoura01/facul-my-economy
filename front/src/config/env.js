import { Platform } from 'react-native';

// Detecta se está rodando em um emulador Android
const isAndroidEmulator = Platform.OS === 'android' && __DEV__;

// Define a URL base da API baseado no ambiente
export const API_URL = isAndroidEmulator
  ? 'http://10.0.2.2:3000/api'  // Android Emulator
  : 'http://192.168.1.100:3000/api';  // Dispositivo físico ou iOS (substitua pelo seu IP)

// Outras configurações
export const APP_NAME = 'MyEconomy';
export const TOKEN_KEY = '@MyEconomy:token'; 