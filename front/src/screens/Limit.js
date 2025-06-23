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
import { limits, expenses } from '../services/api';
import DatePicker from '../components/DatePicker';
import { useExpense } from '../contexts/ExpenseContext';

export default function Limit({ navigation }) {
  const [valor, setValor] = useState('');
  const [mesSelected, setMesSelected] = useState('');
  const [mesConsultaSelected, setMesConsultaSelected] = useState('');
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { triggerRefresh } = useExpense();

  //Verificar se é mês passado
  const isPastMonth = (mes, ano) => {
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth() + 1;
    const anoAtual = dataAtual.getFullYear();
    
    return (ano < anoAtual) || (ano === anoAtual && mes < mesAtual);
  };

  //Carregar dados do mês atual ao iniciar
  useEffect(() => {
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth() + 1;
    const anoAtual = dataAtual.getFullYear();
    const mesAtualFormatado = `${mesAtual}-${anoAtual}`;
    setMesSelected(mesAtualFormatado);
    setMesConsultaSelected(mesAtualFormatado);
    carregarDados(mesAtual, anoAtual);
  }, []);

  //Carregar dados quando mudar o mês selecionado na consulta
  useEffect(() => {
    if (mesConsultaSelected) {
      const [mes, ano] = mesConsultaSelected.split('-').map(Number);
      carregarDados(mes, ano);
    }
  }, [mesConsultaSelected]);

  const carregarDados = async (mes, ano) => {
    try {
      setLoading(true);
      const response = await expenses.listarPorMes(mes, ano);
      if (response.data.limite) {
        setHistorico([{
          id: `${mes}-${ano}`,
          limiteId: response.data.limiteId, //Precisamos do ID real do limite
          valor: response.data.limite,
          mes: mes,
          ano: ano,
          mesFormatado: `${getMesNome(mes)}/${ano}`,
          status: response.data.status
        }]);
      } else {
        setHistorico([]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getMesNome = (mesNumero) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mesNumero - 1];
  };

  const handleSalvar = async () => {
    if (!valor.trim() || !mesSelected) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      const valorNumerico = parseFloat(valor.replace('R$ ', '').replace(',', '.'));
      const [mes, ano] = mesSelected.split('-').map(Number);

      await limits.definir(mes, ano, valorNumerico);
      
      const mensagem = isEditMode ? 'Limite editado com sucesso!' : 'Limite salvo com sucesso!';
      Alert.alert('Sucesso', mensagem);
      
      // Limpar formulário e sair do modo de edição
      setValor('');
      setMesSelected('');
      setIsEditMode(false);
      setEditingItem(null);

      // Disparar refresh para outras telas
      console.log('Limit: Disparando refresh para outras telas');
      triggerRefresh();

      //Recarrega os dados do mês selecionado na consulta
      if (mesConsultaSelected) {
        const [mesConsulta, anoConsulta] = mesConsultaSelected.split('-').map(Number);
        carregarDados(mesConsulta, anoConsulta);
      }
    } catch (error) {
      Alert.alert('Erro', error.mensagem || 'Não foi possível salvar o limite');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  //Editar limite (reutiliza o formulário principal)
  const handleEditar = (item) => {
    if (isPastMonth(item.mes, item.ano)) {
      Alert.alert('Aviso', 'Não é possível editar limites de meses passados');
      return;
    }
    
    setMesSelected(item.id);
    setValor(`R$ ${parseFloat(item.valor).toFixed(2)}`);
    setIsEditMode(true);
    setEditingItem(item);
  };

  //Excluir limite
  const handleExcluir = (item) => {
    if (isPastMonth(item.mes, item.ano)) {
      Alert.alert('Aviso', 'Não é possível excluir limites de meses passados');
      return;
    }

    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o limite de ${item.mesFormatado}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              //Aqui precisamos do ID real do limite, não o composto
              //Por enquanto vou usar uma abordagem diferente
              await limits.excluir(item.limiteId);
              Alert.alert('Sucesso', 'Limite excluído com sucesso!');
              
              // Disparar refresh para outras telas
              console.log('Limit: Disparando refresh após exclusão');
              triggerRefresh();
              
              //Recarregar dados
              if (mesConsultaSelected) {
                const [mesConsulta, anoConsulta] = mesConsultaSelected.split('-').map(Number);
                carregarDados(mesConsulta, anoConsulta);
              }
            } catch (error) {
              Alert.alert('Erro', error.mensagem || 'Não foi possível excluir o limite');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatarValor = (text) => {
    const numerico = text.replace(/[^0-9]/g, '');
    if (numerico) {
      const valor = (parseInt(numerico) / 100).toFixed(2);
      return `R$ ${valor}`;
    }
    return '';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Limite</Text>

      <View style={styles.formContainer}>
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

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.disabledButton]} 
          onPress={handleSalvar}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'SALVANDO...' : (isEditMode ? 'SALVAR ALTERAÇÕES' : 'SALVAR')}
          </Text>
        </TouchableOpacity>

        {isEditMode && (
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => {
              setValor('');
              setMesSelected('');
              setIsEditMode(false);
              setEditingItem(null);
            }}
          >
            <Text style={styles.cancelButtonText}>CANCELAR</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.consultaTitle}>Consulta</Text>
      
      <View style={styles.consultaContainer}>
        <DatePicker
          selectedDate={mesConsultaSelected}
          onDateChange={setMesConsultaSelected}
          showPastMonths={true}
          monthsRange={12}
          label="Filtrar por Mês"
        />

        <ScrollView style={styles.historicoContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Carregando...</Text>
            </View>
          ) : historico.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum limite definido</Text>
            </View>
          ) : (
            historico.map((item) => {
              const isPassado = isPastMonth(item.mes, item.ano);
              return (
                <View key={item.id} style={styles.historicoItem}>
                  <View style={styles.historicoInfo}>
                    <Text style={styles.historicoValor}>R$ {parseFloat(item.valor).toFixed(2)}</Text>
                    <Text style={styles.historicoMes}>{item.mesFormatado}</Text>
                    <Text style={[
                      styles.historicoStatus,
                      item.status === 'abaixo_limite' && styles.statusAbaixo,
                      item.status === 'acima_limite' && styles.statusAcima,
                      item.status === 'sem_limite' && styles.statusSemLimite
                    ]}>
                      {item.status === 'abaixo_limite' ? 'Abaixo do limite' :
                       item.status === 'acima_limite' ? 'Acima do limite' :
                       'Sem despesas'}
                    </Text>
                  </View>
                  <View style={styles.historicoAcoes}>
                    <TouchableOpacity 
                      style={[
                        styles.editButton,
                        isPassado && styles.disabledButton
                      ]}
                      onPress={() => handleEditar(item)}
                      disabled={isPassado}
                    >
                      <Text style={styles.actionButtonText}>EDITAR</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.deleteButton,
                        isPassado && styles.disabledButton
                      ]}
                      onPress={() => handleExcluir(item)}
                      disabled={isPassado}
                    >
                      <Text style={styles.actionButtonText}>EXCLUIR</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>

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
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Expenses')}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>📊</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={[styles.iconCircle, styles.activeIcon]}>
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
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FF5252',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  consultaTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  consultaContainer: {
    marginHorizontal: 20,
    flex: 1,
  },
  historicoContainer: {
    marginTop: 10,
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
  historicoValor: {
    color: '#4CAF50',
    fontSize: 16,
    marginBottom: 5,
  },
  historicoMes: {
    color: '#888',
    fontSize: 12,
  },
  historicoStatus: {
    fontSize: 12,
    marginTop: 5,
  },
  statusAbaixo: {
    color: '#4CAF50',
  },
  statusAcima: {
    color: '#FF5252',
  },
  statusSemLimite: {
    color: '#888',
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
  disabledButton: {
    backgroundColor: '#888',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
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