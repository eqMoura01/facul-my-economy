import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import DatePicker from './DatePicker';

export default function EditExpenseModal({ 
  visible, 
  expense, 
  onClose, 
  onSave 
}) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [mesSelected, setMesSelected] = useState('');
  const [loading, setLoading] = useState(false);

  //Carregar dados da despesa quando modal abrir
  useEffect(() => {
    if (visible && expense) {
      setDescricao(expense.descricao || '');
      setValor(`R$ ${parseFloat(expense.valor).toFixed(2)}` || '');
      
      //Formatar data para o picker
      const dataExpense = new Date(expense.data);
      const mes = dataExpense.getMonth() + 1;
      const ano = dataExpense.getFullYear();
      setMesSelected(`${mes}-${ano}`);
    }
  }, [visible, expense]);

  //Limpar campos quando fechar
  useEffect(() => {
    if (!visible) {
      setDescricao('');
      setValor('');
      setMesSelected('');
    }
  }, [visible]);

  const formatarValor = (text) => {
    //Remove tudo que não é número
    const numerico = text.replace(/[^0-9]/g, '');
    
    //Converte para formato de moeda
    if (numerico) {
      const valor = (parseInt(numerico) / 100).toFixed(2);
      return `R$ ${valor}`;
    }
    return '';
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

      //Pega o dia atual para manter no mesmo mês
      const dataAtual = new Date();
      const data = new Date(parseInt(ano), mes - 1, dataAtual.getDate());
      
      const dadosAtualizados = {
        descricao: descricao.trim(),
        valor: valorNumerico,
        data: data.toISOString().split('T')[0],
        categoria: 'Geral' //Por enquanto vamos usar uma categoria padrão
      };

      await onSave(expense.id, dadosAtualizados);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar Despesa</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

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

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>CANCELAR</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveButton, loading && styles.disabledButton]} 
                onPress={handleSalvar}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'SALVANDO...' : 'SALVAR'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  formContainer: {
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
}); 