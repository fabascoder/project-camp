import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { GlobalContext } from "../context/GlobalContext";

export const Refeicoes = () => {
  const navigation = useNavigation();
  const { data } = React.useContext(GlobalContext);

  const horarios = data?.escola?.horarios || [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Refeições</Text>
        <Text style={styles.subtitle}>
          Selecione um horário para registrar alimentos e temperaturas.
        </Text>

        {horarios.length === 0 ? (
          <Text style={styles.emptyText}>
            Nenhum horário disponível no momento.
          </Text>
        ) : (
          horarios.map((horario) => (
            <Pressable
              key={horario.id}
              style={styles.itemCard}
              onPress={() =>
                navigation.navigate("Horarios", { id: horario.id })
              }
            >
              <Text style={styles.itemTitle}>{horario.nome}</Text>
              <Text style={styles.itemMeta}>Início: {horario.inicio}</Text>
              <Text style={styles.itemMeta}>Fim: {horario.fim}</Text>
              <Text style={styles.itemMeta}>
                Amostra: {horario.horarioAmostra}
              </Text>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f3f6fb",
    padding: 16,
    justifyContent: "flex-start",
  },
  card: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  emptyText: {
    color: "#64748b",
    fontStyle: "italic",
  },
  itemCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#f8fafc",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  itemMeta: {
    color: "#475569",
  },
});

export default Refeicoes;
