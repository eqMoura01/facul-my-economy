import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';

export default function DatePicker({ 
  selectedDate, 
  onDateChange, 
  label = "Selecione o Mês",
  showPastMonths = false, // Se true, mostra meses passados
  monthsRange = 12 // Quantidade de meses para mostrar
}) {
  const [showModal, setShowModal] = useState(false);
  const [availableMonths, setAvailableMonths] = useState([]);

  useEffect(() => {
    generateMonthsList();
  }, [showPastMonths, monthsRange]);

  const getMesNome = (mesNumero) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mesNumero];
  };

  const generateMonthsList = () => {
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth(); // 0-11
    const anoAtual = dataAtual.getFullYear();
    
    let opcoesMeses = [];
    let startOffset = showPastMonths ? -Math.floor(monthsRange/2) : 0;
    let endOffset = showPastMonths ? Math.floor(monthsRange/2) : monthsRange;

    for (let i = startOffset; i <= endOffset; i++) {
      let mes = (mesAtual + i);
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

      opcoesMeses.push({
        mes: mes,
        ano: ano,
        label: `${getMesNome(mes)}/${ano}`,
        value: `${mes + 1}-${ano}` // formato: "mes-ano"
      });
    }
    setAvailableMonths(opcoesMeses);
  };

  const formatSelectedDate = (dateString) => {
    if (!dateString) return 'Selecione um mês';
    const [mes, ano] = dateString.split('-');
    return `${getMesNome(parseInt(mes) - 1)}/${ano}`;
  };

  return (
    <View>
      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.dateButtonText}>
          {formatSelectedDate(selectedDate)}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.monthsList}>
              {availableMonths.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.monthItem,
                    selectedDate === item.value && styles.selectedMonth
                  ]}
                  onPress={() => {
                    onDateChange(item.value);
                    setShowModal(false);
                  }}
                >
                  <Text style={[
                    styles.monthText,
                    selectedDate === item.value && styles.selectedMonthText
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  dateButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
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
  monthsList: {
    padding: 10,
  },
  monthItem: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
  },
  selectedMonth: {
    backgroundColor: '#4CAF50',
  },
  monthText: {
    fontSize: 16,
    color: '#333',
  },
  selectedMonthText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 