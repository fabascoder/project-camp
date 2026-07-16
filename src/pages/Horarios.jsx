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
} from "react-native";

export const Horarios = () => {
  const route = useRoute();
  const { data, setData } = React.useContext(GlobalContext);

  const { id } = route.params;

  const horario = data.escola?.horarios?.find((item) => item.id === Number(id));

  const [alimentoSelecionado, setAlimentoSelecionado] = React.useState("");
  const [temperatura, setTemperatura] = React.useState("");
  const [showPicker, setShowPicker] = React.useState(false);

  const alimentosOptions = data.alimentosGlobais || [];

  const selectedAlimentoNome = alimentosOptions.find(
    (item) => String(item.id) === alimentoSelecionado
  )?.nome;

  function getAlimentoNome(alimentoId) {
    return (
      alimentosOptions.find((item) => item.id === Number(alimentoId))?.nome ||
      "Desconhecido"
    );
  }

  function adicionarAlimento() {
    if (!alimentoSelecionado || !temperatura) return;

    const novoAlimento = {
      id: Date.now(),
      alimentoId: Number(alimentoSelecionado),
      temperatura: Number(temperatura),
    };

    setData((prev) => ({
      ...prev,
      escola: {
        ...prev.escola,
        horarios: prev.escola.horarios.map((h) =>
          h.id === horario.id
            ? { ...h, alimentos: [...(h.alimentos || []), novoAlimento] }
            : h
        ),
      },
    }));

    setAlimentoSelecionado("");
    setTemperatura("");
    setShowPicker(false);
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

            <Pressable style={styles.button} onPress={adicionarAlimento}>
              <Text style={styles.buttonText}>Enviar</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Alimentos cadastrados:</Text>
          {(horario.alimentos || []).map((alimento, index) => (
            <Text key={`${alimento.alimentoId}-${alimento.temperatura}-${index}`}>
              {getAlimentoNome(alimento.alimentoId)} - {alimento.temperatura}°C
            </Text>
          ))}
        </View>
      )}
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
});

export default Horarios;