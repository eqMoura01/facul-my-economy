import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, TOKEN_KEY } from '../config/env';

// Criar instância do Axios com configurações base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros nas respostas
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Erro do servidor com resposta
      if (error.response.status === 401) {
        // Token inválido ou expirado
        await AsyncStorage.removeItem(TOKEN_KEY);
        // Aqui você pode adicionar lógica para redirecionar para a tela de login
      }
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Erro sem resposta do servidor
      return Promise.reject({
        status: 'erro',
        mensagem: 'Não foi possível conectar ao servidor. Verifique sua conexão.'
      });
    } else {
      // Erro na configuração da requisição
      return Promise.reject({
        status: 'erro',
        mensagem: 'Erro ao processar a requisição.'
      });
    }
  }
);

// Funções de API

// Autenticação
export const auth = {
  login: (email, senha) => api.post('/usuarios/login', { email, senha }),
  registro: (dados) => api.post('/usuarios/registro', dados),
  perfil: () => api.get('/usuarios/me'),
};

// Despesas
export const expenses = {
  // Criar nova despesa
  criar: (dados) => api.post('/expenses/despesa', dados),
  
  // Listar despesas do mês
  listarPorMes: (mes, ano) => api.get(`/expenses/resumo/${mes}/${ano}`),
};

// Limites
export const limits = {
  // Definir limite mensal
  definir: (mes, ano, valor) => api.post('/expenses/limite', { mes, ano, valor }),
};

export default api; 