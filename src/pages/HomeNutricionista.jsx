import React from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { GlobalContext } from "../context/GlobalContext";
import { colors, commonStyles, radius } from "../theme/theme";

export const HomeNutricionista = () => {
  const { data, escolas, logout } = React.useContext(GlobalContext);
  const navigation = useNavigation();
  const [busca, setBusca] = React.useState("");

  const escolasFiltradas = (escolas || []).filter((escola) =>
    escola.nome.toLowerCase().includes(busca.trim().toLowerCase()),
  );

  function sair() {
    logout();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  return (
    <ScrollView contentContainerStyle={commonStyles.screen}>
      <View style={commonStyles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerTexts}>
            <Text style={commonStyles.title}>
              Olá, {data.nutricionista?.nome || "Nutricionista"}
            </Text>
            <Text style={commonStyles.subtitle}>
              Selecione uma escola para consultar os dashboards.
            </Text>
          </View>
          <Pressable style={styles.logoutButton} onPress={sair}>
            <Text style={styles.logoutButtonText}>Sair</Text>
          </Pressable>
        </View>

        <TextInput
          style={commonStyles.input}
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar escola pelo nome"
          placeholderTextColor={colors.textSecondary}
        />

        {escolasFiltradas.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma escola encontrada.</Text>
        ) : (
          escolasFiltradas.map((escola) => (
            <Pressable
              key={escola.id}
              style={({ hovered }) => [styles.item, hovered && styles.itemHover]}
              onPress={() =>
                navigation.navigate("EscolaNutricionista", { escolaId: escola.id })
              }
            >
              <Text style={styles.itemTitle}>{escola.nome}</Text>
              <Text style={styles.itemText}>{escola.numeroAlunos} alunos</Text>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
    gap: 12,
  },
  headerTexts: {
    flex: 1,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerLight,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
  },
  logoutButtonText: {
    color: colors.danger,
    fontWeight: "700",
  },
  emptyText: {
    color: colors.textSecondary,
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

export default HomeNutricionista;
