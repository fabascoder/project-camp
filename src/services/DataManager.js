import AsyncStorage from '@react-native-async-storage/async-storage';
import escolaData from '../api/escola.json';

const STORAGE_KEY = 'escola_data';

export const DataManager = {
  // Carrega os dados salvos ou retorna os dados iniciais
  async loadData() {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
      return escolaData;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      return escolaData;
    }
  },

  // Salva os dados no AsyncStorage
  async saveData(data) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      return false;
    }
  },

  // Adiciona um alimento a um horário de uma escola
  async adicionarAlimentoAHorario(escolaId, horarioId, alimentoId, temperatura, cadastradoPor, allData) {
    const dataCopy = JSON.parse(JSON.stringify(allData)); // Deep copy
    
    const escola = dataCopy.escolas.find((esc) => esc.id === escolaId);
    if (!escola) return null;

    const horario = escola.horarios.find((h) => h.id === horarioId);
    if (!horario) return null;

    // Cria o novo alimento com o campo cadastradoPor
    const novoAlimento = {
      alimentoId: Number(alimentoId),
      temperatura: Number(temperatura),
      cadastradoPor: cadastradoPor || "Desconhecido",
    };

    // Adiciona à array de alimentos
    if (!horario.alimentos) {
      horario.alimentos = [];
    }
    horario.alimentos.push(novoAlimento);

    // Salva no storage
    await this.saveData(dataCopy);

    return dataCopy;
  },

  // Remove um alimento de um horário
  async removerAlimentoDeHorario(escolaId, horarioId, alimentoIndex, allData) {
    const dataCopy = JSON.parse(JSON.stringify(allData)); // Deep copy
    
    const escola = dataCopy.escolas.find((esc) => esc.id === escolaId);
    if (!escola) return null;

    const horario = escola.horarios.find((h) => h.id === horarioId);
    if (!horario || !horario.alimentos) return null;

    // Remove o alimento usando splice
    horario.alimentos.splice(alimentoIndex, 1);

    // Salva no storage
    await this.saveData(dataCopy);

    return dataCopy;
  },

  // Limpa todos os dados (útil para testes)
  async clearData() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      return false;
    }
  },
};

export default DataManager;
