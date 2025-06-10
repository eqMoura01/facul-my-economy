import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { expenses } from '../services/api';

export default function Expenses({ navigation }) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [mesSelected, setMesSelected] = useState('');
  const [mesHistoricoSelected, setMesHistoricoSelected] = useState('');
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carregar despesas do mês atual ao iniciar
  useEffect(() => {
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth() + 1;
    const anoAtual = dataAtual.getFullYear();
    carregarDespesas(mesAtual, anoAtual);
  }, []);

  // Carregar despesas quando mudar o mês selecionado no histórico
  useEffect(() => {
    if (mesHistoricoSelected) {
      const [mes, ano] = mesHistoricoSelected.split('/');
      const meses = {
        'Janeiro': 1, 'Fevereiro': 2, 'Março': 3, 'Abril': 4,
        'Maio': 5, 'Junho': 6, 'Julho': 7, 'Agosto': 8,
        'Setembro': 9, 'Outubro': 10, 'Novembro': 11, 'Dezembro': 12
      };
      carregarDespesas(meses[mes], parseInt(ano));
    }
  }, [mesHistoricoSelected]);

  const carregarDespesas = async (mes, ano) => {
    try {
      setLoading(true);
      const response = await expenses.listarPorMes(mes, ano);
      setHistorico(response.data.despesas);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as despesas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Gerar lista de meses futuros
  const getMesesFuturos = () => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth();
    const anoAtual = dataAtual.getFullYear();
    
    let opcoesMeses = [];
    for (let i = mesAtual; i < mesAtual + 12; i++) {
      const mes = i % 12;
      const ano = anoAtual + Math.floor(i / 12);
      opcoesMeses.push(`${meses[mes]}/${ano}`);
    }
    return opcoesMeses;
  };

  const handleSalvar = async () => {
    if (!descricao.trim() || !valor.trim() || !mesSelected) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      const valorNumerico = parseFloat(valor.replace('R$ ', '').replace(',', '.'));
      const [mes, ano] = mesSelected.split('/');
      const meses = {
        'Janeiro': 1, 'Fevereiro': 2, 'Março': 3, 'Abril': 4,
        'Maio': 5, 'Junho': 6, 'Julho': 7, 'Agosto': 8,
        'Setembro': 9, 'Outubro': 10, 'Novembro': 11, 'Dezembro': 12
      };

      const data = new Date(parseInt(ano), meses[mes] - 1, 1);
      
      await expenses.criar({
        descricao: descricao.trim(),
        valor: valorNumerico,
        data: data.toISOString().split('T')[0],
        categoria: 'Geral' // Por enquanto vamos usar uma categoria padrão
      });

      Alert.alert('Sucesso', 'Despesa salva com sucesso!');
      setDescricao('');
      setValor('');
      setMesSelected('');

      // Recarrega as despesas do mês selecionado
      if (mesHistoricoSelected) {
        const [mesHist, anoHist] = mesHistoricoSelected.split('/');
        carregarDespesas(meses[mesHist], parseInt(anoHist));
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a despesa');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatarValor = (text) => {
    // Remove tudo que não é número
    const numerico = text.replace(/[^0-9]/g, '');
    
    // Converte para formato de moeda
    if (numerico) {
      const valor = (parseInt(numerico) / 100).toFixed(2);
      return `R$ ${valor}`;
    }
    return '';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Despesa</Text>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Digite a descrição"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Valor</Text>
          <TextInput
            style={styles.input}
            value={valor}
            onChangeText={(text) => {
              const valorFormatado = formatarValor(text);
              setValor(valorFormatado);
            }}
            placeholder="R$ 0,00"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mês</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={mesSelected}
              onValueChange={(itemValue) => setMesSelected(itemValue)}
              style={styles.picker}
              dropdownIconColor="#fff"
            >
              <Picker.Item label="Selecione um mês" value="" />
              {getMesesFuturos().map((mes, index) => (
                <Picker.Item key={index} label={mes} value={mes} />
              ))}
            </Picker>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
          <Text style={styles.saveButtonText}>SALVAR</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historicoHeader}>
        <Text style={styles.historicoTitle}>Histórico</Text>
        <View style={styles.historicoPickerContainer}>
          <Picker
            selectedValue={mesHistoricoSelected}
            onValueChange={(itemValue) => setMesHistoricoSelected(itemValue)}
            style={styles.historicoPicker}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Todos os meses" value="" />
            {getMesesFuturos().map((mes, index) => (
              <Picker.Item key={index} label={mes} value={mes} />
            ))}
          </Picker>
        </View>
      </View>
      
      <ScrollView style={styles.historicoContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : historico.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma despesa encontrada</Text>
          </View>
        ) : (
          historico.map((item) => (
            <View key={item.id} style={styles.historicoItem}>
              <View style={styles.historicoInfo}>
                <Text style={styles.historicoDescricao}>{item.descricao}</Text>
                <Text style={styles.historicoValor}>R$ {parseFloat(item.valor).toFixed(2)}</Text>
                <Text style={styles.historicoMes}>
                  {new Date(item.data).toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </Text>
              </View>
              <View style={styles.historicoAcoes}>
                <TouchableOpacity style={styles.editButton}>
                  <Text style={styles.actionButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton}>
                  <Text style={styles.actionButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

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
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>💰</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={[styles.iconCircle, styles.activeIcon]}>
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
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    margin: 20,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historicoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  historicoTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  historicoPickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  historicoPicker: {
    height: 40,
    color: '#fff',
  },
  historicoContainer: {
    flex: 1,
    marginHorizontal: 20,
  },
  historicoItem: {
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historicoInfo: {
    flex: 1,
  },
  historicoDescricao: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  historicoValor: {
    color: '#4CAF50',
    fontSize: 14,
    marginBottom: 2,
  },
  historicoMes: {
    color: '#888',
    fontSize: 12,
  },
  historicoAcoes: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    padding: 5,
  },
  deleteButton: {
    padding: 5,
  },
  actionButtonText: {
    fontSize: 20,
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
}); 