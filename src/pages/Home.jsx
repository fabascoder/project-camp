import React from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { GlobalContext } from "../context/GlobalContext";
import { useNavigation } from "@react-navigation/native";

export const Home = () => {
  const dataContext = React.useContext(GlobalContext);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {dataContext.data.escola && dataContext.data.funcionario ? (
          <>
            <Text style={styles.title}>
              Olá, {dataContext.data.funcionario.nome}
            </Text>

            <Pressable
              style={styles.mainButton}
              onPress={() => navigation.navigate("Planilhas")}
            >
              <Text style={styles.mainButtonText}>Ir para Planilhas</Text>
            </Pressable>

            {dataContext.data.escola.horarios.map((horario) => (
              <View key={horario.id} style={styles.item}>
                <Pressable
                  style={({ hovered }) => [
                    styles.pressable,
                    hovered && styles.pressableHover,
                  ]}
                  onPress={() =>
                    navigation.navigate("Horarios", {
                      id: horario.id,
                    })
                  }
                >
                  <Text style={styles.itemTitle}>{horario.nome}</Text>
                  <Text>Início: {horario.inicio}</Text>
                  <Text>Fim: {horario.fim}</Text>
                  <Text>Amostra: {horario.horarioAmostra}</Text>
                </Pressable>
              </View>
            ))}
          </>
        ) : (
          <Text>Carregando...</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 500,
    padding: 20,
    borderWidth: 1,
    borderColor: "#000",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  mainButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  mainButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  item: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingVertical: 12,
  },
  pressable: {
    padding: 12,
  },
  pressableHover: {
    backgroundColor: "#e8e8e8",
  },
  itemTitle: {
    fontWeight: "700",
  },
});

export default Home;
