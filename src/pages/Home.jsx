import React from "react";
import { View, StyleSheet, Text, Pressable, ScrollView } from "react-native";
import { GlobalContext } from "../context/GlobalContext";
import { useNavigation } from "@react-navigation/native";

export const Home = () => {
  const dataContext = React.useContext(GlobalContext);
  const navigation = useNavigation();

  const menuItems = [
    {
      key: "planilhas",
      title: "Planilhas",
      description: "Registrar alimentos e acompanhar cadastros",
      action: () => navigation.navigate("Planilhas"),
      accent: "#2563eb",
    },
    {
      key: "refeicoes",
      title: "Refeições",
      description: "Marcar alimentos em cada horário do cardápio",
      action: () => navigation.navigate("Refeicoes"),
      accent: "#2563eb",
    },
    {
      key: "funcionalidade-1",
      title: "Funcionalidade 1",
      description: "Espaço reservado para uma nova função futura",
      action: () => {},
      accent: "#2563eb",
    },
    {
      key: "funcionalidade-2",
      title: "Funcionalidade 2",
      description: "Espaço reservado para outra nova função futura",
      action: () => {},
      accent: "#2563eb",
    },
  ];

  function logout() {
    dataContext.setData({
      escola: null,
      funcionario: null,
      alimentosGlobais: dataContext.data.alimentosGlobais,
    });
    dataContext.setCodeAcess("");
    dataContext.setMatricula("");
    navigation.navigate("Login");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {dataContext.data.escola && dataContext.data.funcionario ? (
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Bem-vindo(a)</Text>
                <Text style={styles.title}>
                  {dataContext.data.funcionario.nome}
                </Text>
              </View>
              <Pressable style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutText}>Sair</Text>
              </Pressable>
            </View>

            <Text style={styles.sectionTitle}>Painel de funcionalidades</Text>
            <View style={styles.menuGrid}>
              {menuItems.map((item) => (
                <Pressable
                  key={item.key}
                  style={[styles.menuCard, { borderColor: item.accent }]}
                  onPress={item.action}
                >
                  <Text style={[styles.menuTitle, { color: item.accent }]}>
                    {item.title}
                  </Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Escola</Text>
              <Text style={styles.summaryText}>
                {dataContext.data.escola.nome}
              </Text>
              <Text style={styles.summarySubtitle}>
                Essa é a escola que você está vinculado(a)
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.loadingText}>Carregando...</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  greeting: {
    color: "#64748b",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  logoutButton: {
    backgroundColor: "#fee2e2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  logoutText: {
    color: "#b91c1c",
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 12,
  },
  menuGrid: {
    gap: 12,
    marginBottom: 16,
  },
  menuCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#f8fafc",
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  menuDescription: {
    color: "#475569",
    fontSize: 13,
  },
  summaryCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1d4ed8",
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  summarySubtitle: {
    color: "#475569",
    fontSize: 13,
  },
  loadingText: {
    color: "#64748b",
    fontSize: 15,
  },
});

export default Home;
