import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { expenses, auth } from '../services/api';

export default function Home() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(false);
  const [resumoMensal, setResumoMensal] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const navigation = useNavigation();

  // Carregar dados do usuário ao iniciar
  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  const carregarDadosUsuario = async () => {
    try {
      const response = await auth.perfil();
      setUserData(response.data.data.usuario);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  // Carregar dados do mês atual ao iniciar
  useEffect(() => {
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth() + 1;
    const anoAtual = dataAtual.getFullYear();
    setSelectedMonth(`${mesAtual}-${anoAtual}`); // formato: "mes-ano"
    carregarDados(mesAtual, anoAtual);
  }, []);

  // Carregar dados quando mudar o mês selecionado
  useEffect(() => {
    if (selectedMonth) {
      const [mes, ano] = selectedMonth.split('-').map(Number);
      carregarDados(mes, ano);
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

  const getMesesComAno = () => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth(); // 0-11
    const anoAtual = dataAtual.getFullYear();
    
    let opcoes = [];
    // Inclui 6 meses anteriores e 6 meses futuros
    for (let i = -6; i <= 6; i++) {
      let mes = mesAtual + i;
      let ano = anoAtual;

      // Ajusta o ano se necessário
      while (mes < 0) {
        mes += 12;
        ano--;
      }
      while (mes >= 12) {
        mes -= 12;
        ano++;
      }

      opcoes.push({
        label: `${meses[mes]}/${ano}`,
        value: `${mes + 1}-${ano}` // formato: "mes-ano"
      });
    }
    return opcoes;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Home - {selectedMonth ? 
            `${getMesNome(parseInt(selectedMonth.split('-')[0]))}/${selectedMonth.split('-')[1]}` : 
            'Mês corrente'}
        </Text>
      </View>

      {/* Greeting Section */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Olá {userData ? userData.nome.split(' ')[0] : ''} 👋</Text>
        <Text style={styles.subText}>É bom te ver por aqui!</Text>
      </View>

      {/* Month Selector Button */}
      <TouchableOpacity 
        style={styles.monthSelectorButton}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.monthSelectorText}>
          {selectedMonth ? 
            `${getMesNome(parseInt(selectedMonth.split('-')[0]))}/${selectedMonth.split('-')[1]}` : 
            'Selecione um mês'}
        </Text>
      </TouchableOpacity>

      {/* Month Picker Modal */}
      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Selecione o Mês</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowPicker(false)}
              >
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(itemValue) => {
                setSelectedMonth(itemValue);
                setShowPicker(false);
                if (itemValue) {
                  const [mes, ano] = itemValue.split('-').map(Number);
                  carregarDados(mes, ano);
                }
              }}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              dropdownIconColor="#333"
              mode="dropdown"
            >
              <Picker.Item 
                label="Selecione um mês" 
                value="" 
                color="#333"
              />
              {getMesesComAno().map((item) => (
                <Picker.Item 
                  key={item.value} 
                  label={item.label} 
                  value={item.value}
                  color="#333"
                />
              ))}
            </Picker>
          </View>
        </View>
      </Modal>

      {/* Main Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : !resumoMensal || !resumoMensal.limite ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emojiText}>🤔</Text>
          <Text style={styles.emptyText}>Progresso não encontrado</Text>
          <Text style={styles.emptySubText}>Você ainda não definiu um limite mensal</Text>
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
            {calcularPorcentagem() < 80 && (
              <View style={styles.motivationalContainer}>
                <Text style={styles.emojiText}>😊</Text>
                <Text style={[styles.motivationalText, { color: getStatusColor() }]}>
                  Continue assim! Você está gerenciando bem seus gastos!
                </Text>
              </View>
            )}
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
  monthSelectorButton: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  monthSelectorText: {
    fontSize: 16,
    color: '#333',
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
    paddingHorizontal: 20,
  },
  emojiText: {
    fontSize: 50,
    marginBottom: 20,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
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
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 80,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  picker: {
    height: 50,
    color: '#333', // Cor do texto do Picker
  },
  pickerItem: {
    color: '#333', // Cor do texto dos itens do Picker
    backgroundColor: '#fff', // Fundo dos itens
  },
  motivationalContainer: {
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
  },
  motivationalText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
}); 