import React from "react";
import { View, StyleSheet, Text, Pressable, ScrollView } from "react-native";
import { GlobalContext } from "../context/GlobalContext";
import { useNavigation } from "@react-navigation/native";
import { colors, commonStyles, radius } from "../theme/theme";

export const Home = () => {
  const dataContext = React.useContext(GlobalContext);
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={commonStyles.screen}>
      <View style={commonStyles.card}>
        {dataContext.data.escola && dataContext.data.funcionario ? (
          <>
            <Text style={commonStyles.title}>
              Olá, {dataContext.data.funcionario.nome}
            </Text>
            <Text style={commonStyles.subtitle}>{dataContext.data.escola.nome}</Text>

            <View style={styles.actionsRow}>
              <Pressable
                style={styles.mainButton}
                onPress={() => navigation.navigate("Planilhas")}
              >
                <Text style={commonStyles.buttonText}>Ir para Planilhas</Text>
              </Pressable>

              <Pressable
                style={styles.secondaryButton}
                onPress={() => navigation.navigate("Dashboard")}
              >
                <Text style={commonStyles.secondaryButtonText}>Ver Dashboard</Text>
              </Pressable>
            </View>

            <Text style={styles.sectionTitle}>Horários</Text>

            {dataContext.data.escola.horarios.map((horario) => (
              <Pressable
                key={horario.id}
                style={({ hovered }) => [
                  styles.item,
                  hovered && styles.itemHover,
                ]}
                onPress={() =>
                  navigation.navigate("Horarios", {
                    id: horario.id,
                  })
                }
              >
                <Text style={styles.itemTitle}>{horario.nome}</Text>
                <Text style={styles.itemText}>Início: {horario.inicio}</Text>
                <Text style={styles.itemText}>Fim: {horario.fim}</Text>
                <Text style={styles.itemText}>Amostra: {horario.horarioAmostra}</Text>
              </Pressable>
            ))}
          </>
        ) : (
          <Text style={commonStyles.subtitle}>Carregando...</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  mainButton: {
    flexGrow: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  secondaryButton: {
    flexGrow: 1,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryLightBorder,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 10,
  },
  item: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#fafafa",
  },
  itemHover: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryLightBorder,
  },
  itemTitle: {
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  itemText: {
    color: colors.textSecondary,
  },
});

export default Home;
