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
import { expenses } from '../services/api';
import DatePicker from '../components/DatePicker';
import { useExpense } from '../contexts/ExpenseContext';

export default function Expenses({ navigation }) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [mesSelected, setMesSelected] = useState('');
  const [mesHistoricoSelected, setMesHistoricoSelected] = useState('');
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);
  const { triggerRefresh } = useExpense();

  const getMesNome = (mesNumero) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mesNumero - 1];
  };

  // Carregar despesas do mês atual ao iniciar
  useEffect(() => {
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth() + 1;
    const anoAtual = dataAtual.getFullYear();
    const mesAtualFormatado = `${mesAtual}-${anoAtual}`;
    setMesSelected(mesAtualFormatado);
    setMesHistoricoSelected(mesAtualFormatado);
    carregarDespesas(mesAtual, anoAtual);
  }, []);

  // Carregar despesas quando mudar o mês selecionado no histórico
  useEffect(() => {
    if (mesHistoricoSelected) {
      const [mes, ano] = mesHistoricoSelected.split('-').map(Number);
      carregarDespesas(mes, ano);
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

  const handleSalvar = async () => {
    if (!descricao.trim() || !valor.trim() || !mesSelected) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      const valorNumerico = parseFloat(valor.replace('R$ ', '').replace(',', '.'));
      const [mes, ano] = mesSelected.split('-').map(Number);

      // Pega o dia atual para manter no mesmo mês
      const dataAtual = new Date();
      const data = new Date(parseInt(ano), mes - 1, dataAtual.getDate());
      
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
        const [mesHist, anoHist] = mesHistoricoSelected.split('-').map(Number);
        carregarDespesas(mesHist, anoHist);
      }

      // Notifica outras telas para atualizar
      triggerRefresh();
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
          <DatePicker
            selectedDate={mesSelected}
            onDateChange={setMesSelected}
            showPastMonths={false}
            monthsRange={12}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
          <Text style={styles.saveButtonText}>SALVAR</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historicoHeader}>
        <Text style={styles.historicoTitle}>Histórico</Text>
        <View style={styles.historicoPickerContainer}>
          <DatePicker
            selectedDate={mesHistoricoSelected}
            onDateChange={setMesHistoricoSelected}
            showPastMonths={true}
            monthsRange={12}
            label="Filtrar por Mês"
          />
        </View>
      </View>
      
      <ScrollView style={styles.historicoContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : historico.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emojiText}>🤔</Text>
            <Text style={styles.emptyText}>Nenhuma despesa encontrada</Text>
            <Text style={styles.emptySubText}>Comece adicionando sua primeira despesa</Text>
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
    flex: 1,
    marginLeft: 10,
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
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: '#FF5252',
    padding: 8,
    borderRadius: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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
  },
}); 