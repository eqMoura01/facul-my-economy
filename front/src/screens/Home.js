import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { expenses } from '../services/api';

export default function Home() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(false);
  const [resumoMensal, setResumoMensal] = useState(null);
  const navigation = useNavigation();

  // Carregar dados do mês atual ao iniciar
  useEffect(() => {
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth() + 1;
    const anoAtual = dataAtual.getFullYear();
    setSelectedMonth(mesAtual.toString());
    carregarDados(mesAtual, anoAtual);
  }, []);

  // Carregar dados quando mudar o mês selecionado
  useEffect(() => {
    if (selectedMonth) {
      const dataAtual = new Date();
      const anoAtual = dataAtual.getFullYear();
      carregarDados(parseInt(selectedMonth), anoAtual);
    }
  }, [selectedMonth]);

  const carregarDados = async (mes, ano) => {
    try {
      setLoading(true);
      const response = await expenses.listarPorMes(mes, ano);
      setResumoMensal(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calcularPorcentagem = () => {
    if (!resumoMensal || !resumoMensal.limite) return 0;
    const porcentagem = ((resumoMensal.totalDespesas / resumoMensal.limite) * 100);
    return Math.min(100, porcentagem); // Limita a 100% mesmo se ultrapassar
  };

  const getStatusColor = () => {
    if (!resumoMensal || !resumoMensal.limite) return '#888';
    const porcentagem = (resumoMensal.totalDespesas / resumoMensal.limite) * 100;
    if (porcentagem >= 100) return '#FF5252'; // Vermelho
    if (porcentagem >= 80) return '#FFA726'; // Laranja
    return '#4CAF50'; // Verde
  };

  const getMesNome = (mesNumero) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mesNumero - 1];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Home - {selectedMonth ? getMesNome(parseInt(selectedMonth)) : 'Mês corrente'}
        </Text>
      </View>

      {/* Greeting Section */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Olá João 👋</Text>
        <Text style={styles.subText}>É bom te ver por aqui!</Text>
      </View>

      {/* Month Picker */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedMonth}
          onValueChange={(itemValue) => setSelectedMonth(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Selecione um mês" value="" />
          {Array.from({ length: 12 }, (_, i) => (
            <Picker.Item 
              key={i + 1} 
              label={getMesNome(i + 1)} 
              value={(i + 1).toString()} 
            />
          ))}
        </Picker>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : !resumoMensal || !resumoMensal.limite ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emojiText}>🎯</Text>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => navigation.navigate('Limit')}
          >
            <Text style={styles.continueText}>Definir Limite Mensal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {/* Valor Total e Limite */}
          <View style={styles.valoresContainer}>
            <View style={styles.valorBox}>
              <Text style={styles.valorLabel}>Total Gasto</Text>
              <Text style={[
                styles.valorText,
                { color: getStatusColor() }
              ]}>
                R$ {resumoMensal.totalDespesas.toFixed(2)}
              </Text>
            </View>
            <View style={styles.valorBox}>
              <Text style={styles.valorLabel}>Limite Mensal</Text>
              <Text style={styles.valorText}>
                R$ {parseFloat(resumoMensal.limite).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Barra de Progresso */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill,
                  {
                    width: `${calcularPorcentagem()}%`,
                    backgroundColor: getStatusColor()
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressStatus, { color: getStatusColor() }]}>
              {calcularPorcentagem() >= 100 ? (
                'Limite Excedido!'
              ) : calcularPorcentagem() >= 80 ? (
                'Atenção! Próximo ao limite'
              ) : (
                'Dentro do limite'
              )}
            </Text>
          </View>

          {/* Valor Disponível */}
          <View style={styles.disponibilidadeContainer}>
            <Text style={styles.disponibilidadeLabel}>
              {resumoMensal.totalDespesas > resumoMensal.limite ? 
                'Valor Excedido:' : 
                'Valor Disponível:'
              }
            </Text>
            <Text style={[
              styles.disponibilidadeValor,
              { color: getStatusColor() }
            ]}>
              R$ {Math.abs(resumoMensal.limite - resumoMensal.totalDespesas).toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>👤</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={[styles.iconCircle, styles.activeIcon]}>
            <Text style={styles.iconText}>💰</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Expenses')}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>📊</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Limit')}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>⚙️</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
  },
  greetingContainer: {
    padding: 20,
  },
  greetingText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subText: {
    color: '#fff',
    marginTop: 5,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 50,
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
  },
  contentContainer: {
    padding: 20,
  },
  valoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    backgroundColor: '#2C2C2C',
    padding: 20,
    borderRadius: 15,
    elevation: 5,
  },
  valorBox: {
    alignItems: 'center',
    flex: 1,
  },
  valorLabel: {
    color: '#888',
    marginBottom: 8,
    fontSize: 14,
  },
  valorText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginBottom: 30,
    backgroundColor: '#2C2C2C',
    padding: 20,
    borderRadius: 15,
    elevation: 5,
  },
  progressBarBackground: {
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
    transition: 'width 0.5s ease-in-out',
  },
  progressStatus: {
    color: '#fff',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  disponibilidadeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
    padding: 20,
    borderRadius: 15,
    elevation: 5,
  },
  disponibilidadeLabel: {
    color: '#888',
    fontSize: 14,
  },
  disponibilidadeValor: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 15,
    justifyContent: 'space-around',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  iconText: {
    fontSize: 20,
  },
}); 