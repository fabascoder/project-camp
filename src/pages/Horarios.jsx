import React from "react";
import { useRoute } from "@react-navigation/native";
import { GlobalContext } from "../context/GlobalContext";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Modal,
} from "react-native";

export const Horarios = () => {
  const route = useRoute();
  const { data, adicionarAlimento, removerAlimento, allData } =
    React.useContext(GlobalContext);

  const { id } = route.params;

  const horario = data.escola?.horarios?.find((item) => item.id === Number(id));

  const [alimentoSelecionado, setAlimentoSelecionado] = React.useState("");
  const [temperatura, setTemperatura] = React.useState("");
  const [showPicker, setShowPicker] = React.useState(false);
  const [showAssinaturaModal, setShowAssinaturaModal] = React.useState(false);
  const [assinatura, setAssinatura] = React.useState("");

  const alimentosOptions = data.alimentosGlobais || [];

  // Extrair primeiro nome do usuário
  const primeiroNomeUsuario = data.funcionario?.nome?.split(" ")[0] || "";

  const selectedAlimentoNome = alimentosOptions.find(
    (item) => String(item.id) === alimentoSelecionado
  )?.nome;

  function getAlimentoNome(alimentoId) {
    return (
      alimentosOptions.find((item) => item.id === Number(alimentoId))?.nome ||
      "Desconhecido"
    );
  }

  async function validarAssinaturaSalvar() {
    if (assinatura.trim().toLowerCase() !== primeiroNomeUsuario.toLowerCase()) {
      Alert.alert(
        "Erro de Verificação",
        `Digite seu primeiro nome corretamente. Esperado: "${primeiroNomeUsuario}"`
      );
      return;
    }

    // Assinatura válida, adicionar alimento
    const sucesso = await adicionarAlimento(
      data.escola.id,
      horario.id,
      Number(alimentoSelecionado),
      Number(temperatura),
      primeiroNomeUsuario
    );

    if (sucesso) {
      setAlimentoSelecionado("");
      setTemperatura("");
      setAssinatura("");
      setShowAssinaturaModal(false);
      setShowPicker(false);
      Alert.alert("Sucesso", "Alimento adicionado com sucesso!");
    } else {
      Alert.alert("Erro", "Não foi possível adicionar o alimento");
    }
  }

  async function adicionarAlimentoHandler() {
    if (!alimentoSelecionado || !temperatura) {
      Alert.alert("Erro", "Selecione um alimento e insira a temperatura");
      return;
    }

    // Abrir modal de assinatura
    setShowAssinaturaModal(true);
  }

  async function removerAlimentoHandler(index) {
    const sucesso = await removerAlimento(
      data.escola.id,
      horario.id,
      index
    );

    if (sucesso) {
      Alert.alert("Sucesso", "Alimento removido com sucesso!");
    } else {
      Alert.alert("Erro", "Não foi possível remover o alimento");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {horario && (
        <View style={styles.card}>
          <Text style={styles.title}>{horario.nome}</Text>
          <Text>Início: {horario.inicio}</Text>
          <Text>Fim: {horario.fim}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Adicionar alimento</Text>

            <Pressable
              style={styles.select}
              onPress={() => setShowPicker((prev) => !prev)}
            >
              <Text style={styles.selectText}>
                {selectedAlimentoNome || "Selecione um alimento"}
              </Text>
            </Pressable>

            {showPicker && (
              <View style={styles.dropdown}>
                {alimentosOptions.map((alimento) => {
                  const selected = String(alimento.id) === alimentoSelecionado;
                  return (
                    <Pressable
                      key={alimento.id}
                      style={[
                        styles.option,
                        selected && styles.optionSelected,
                      ]}
                      onPress={() => {
                        setAlimentoSelecionado(String(alimento.id));
                        setShowPicker(false);
                      }}
                    >
                      <Text>{alimento.nome}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <TextInput
              keyboardType="numeric"
              placeholder="Temperatura"
              value={temperatura}
              onChangeText={setTemperatura}
              style={styles.input}
            />

            <Pressable
              style={styles.button}
              onPress={adicionarAlimentoHandler}
            >
              <Text style={styles.buttonText}>Enviar</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Alimentos cadastrados:</Text>
          <View>
            {(horario.alimentos || []).map((alimento, index) => (
              <View key={`${alimento.alimentoId}-${index}`} style={styles.alimentoItem}>
                <View style={styles.alimentoInfo}>
                  <Text style={styles.alimentoNome}>
                    {getAlimentoNome(alimento.alimentoId)} - {alimento.temperatura}°C
                  </Text>
                  {alimento.cadastradoPor && (
                    <Text style={styles.cadastradoPor}>
                      Por: {alimento.cadastradoPor}
                    </Text>
                  )}
                </View>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => removerAlimentoHandler(index)}
                >
                  <Text style={styles.deleteButtonText}>Remover</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Modal de Assinatura */}
      <Modal
        visible={showAssinaturaModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAssinaturaModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Verificação de Cadastro</Text>
            <Text style={styles.modalSubtitle}>
              Digite seu primeiro nome para confirmar o cadastro
            </Text>

            <TextInput
              placeholder={`Seu nome: ${primeiroNomeUsuario}`}
              value={assinatura}
              onChangeText={setAssinatura}
              style={styles.modalInput}
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAssinaturaModal(false);
                  setAssinatura("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={validarAssinaturaSalvar}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 16,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  card: {
    width: "100%",
    maxWidth: 500,
    padding: 20,
    borderWidth: 1,
    borderColor: "#000",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  select: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 10,
  },
  selectText: {
    color: "#000",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 12,
  },
  option: {
    padding: 12,
  },
  optionSelected: {
    backgroundColor: "#ddd",
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 12,
    marginBottom: 12,
    width: "100%",
  },
  button: {
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#000",
    fontWeight: "700",
  },
  alimentoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  alimentoInfo: {
    flex: 1,
  },
  alimentoNome: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  cadastradoPor: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },
  deleteButton: {
    padding: 8,
    backgroundColor: "#ff6b6b",
    borderRadius: 4,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "85%",
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#e0e0e0",
    borderWidth: 1,
    borderColor: "#999",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    borderWidth: 1,
    borderColor: "#45a049",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default Horarios;