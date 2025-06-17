import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

export default function FinancialProgress({ 
  totalDespesas, 
  limite,
  showMotivational = true
}) {
  const calcularPorcentagem = () => {
    if (!limite) return 0;
    const porcentagem = ((totalDespesas / limite) * 100);
    return Math.min(100, porcentagem); // Limita a 100% mesmo se ultrapassar
  };

  const getStatusColor = () => {
    if (!limite) return '#888';
    const porcentagem = (totalDespesas / limite) * 100;
    if (porcentagem >= 100) return '#FF5252'; // Vermelho
    if (porcentagem >= 80) return '#FFA726'; // Laranja
    return '#4CAF50'; // Verde
  };

  const getStatusEmoji = () => {
    const porcentagem = calcularPorcentagem();
    if (porcentagem >= 100) return '😡';
    if (porcentagem >= 80) return '😰';
    return '😊';
  };

  const getStatusMessage = () => {
    const porcentagem = calcularPorcentagem();
    if (porcentagem >= 100) return 'Limite Excedido! Hora de controlar os gastos!';
    if (porcentagem >= 80) return 'Atenção! Você está próximo ao limite!';
    return 'Continue assim! Você está gerenciando bem seus gastos!';
  };

  return (
    <View style={styles.container}>
      {/* Valor Total e Limite */}
      <View style={styles.valoresContainer}>
        <View style={styles.valorBox}>
          <Text style={styles.valorLabel}>Total Gasto</Text>
          <Text style={[
            styles.valorText,
            { color: getStatusColor() }
          ]}>
            R$ {totalDespesas.toFixed(2)}
          </Text>
        </View>
        <View style={styles.valorBox}>
          <Text style={styles.valorLabel}>Limite Mensal</Text>
          <Text style={styles.valorText}>
            R$ {parseFloat(limite).toFixed(2)}
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
          {calcularPorcentagem().toFixed(1)}% utilizado
        </Text>
        <View style={styles.statusContainer}>
          <Text style={styles.emojiText}>{getStatusEmoji()}</Text>
          <Text style={[styles.statusMessage, { color: getStatusColor() }]}>
            {getStatusMessage()}
          </Text>
        </View>
      </View>

      {/* Valor Disponível */}
      <View style={styles.disponibilidadeContainer}>
        <Text style={styles.disponibilidadeLabel}>
          {totalDespesas > limite ? 'Valor Excedido:' : 'Valor Disponível:'}
        </Text>
        <Text style={[
          styles.disponibilidadeValor,
          { color: getStatusColor() }
        ]}>
          R$ {Math.abs(limite - totalDespesas).toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
  statusContainer: {
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
  },
  emojiText: {
    fontSize: 40,
    marginBottom: 10,
  },
  statusMessage: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
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
}); 