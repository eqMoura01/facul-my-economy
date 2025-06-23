import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../services/api';
import { TOKEN_KEY } from '../config/env';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      const response = await auth.login(email, senha);
      const { token, data } = response.data;

      //Salvar o token
      await AsyncStorage.setItem(TOKEN_KEY, token);

      //Navegar para a Home
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      Alert.alert(
        'Erro',
        error.mensagem || 'Erro ao fazer login. Verifique suas credenciais.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ENTRAR</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#666"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        placeholderTextColor="#666"
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.registerLink}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.registerText}>Não possui conta? Crie aqui</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#1C1C1C',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#fff',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#2C2C2C',
    color: '#fff',
  },
  button: {
    backgroundColor: '#4CAF50',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 15,
    alignItems: 'center',
  },
  registerText: {
    color: '#4CAF50',
    fontSize: 14,
  },
}); 