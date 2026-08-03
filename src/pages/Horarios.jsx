import React from "react";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GlobalContext } from "../context/GlobalContext";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { colors, commonStyles, radius } from "../theme/theme";
import {
  getTemperaturaStorageKey,
  getRegistrosVazios,
  isMesmoDia,
  validarTemperaturaAlimento,
  formatTemperaturaAlimento,
} from "../utils/temperaturaAlimentos";

export const Horarios = () => {
  const route = useRoute();
  const { data } = React.useContext(GlobalContext);

  const { id } = route.params;

  const horario = data.escola?.horarios?.find((item) => item.id === Number(id));

  const [alimentoSelecionado, setAlimentoSelecionado] = React.useState("");
  const [temperatura, setTemperatura] = React.useState("");
  const [showPicker, setShowPicker] = React.useState(false);
  const [registros, setRegistros] = React.useState(getRegistrosVazios());
  const [carregado, setCarregado] = React.useState(false);
  const [erro, setErro] = React.useState("");

  const alimentosOptions = data.alimentosGlobais || [];
  const storageKey = getTemperaturaStorageKey(data.escola);
  const responsavelNome = data?.funcionario?.nome || "Usuário não identificado";
  const hoje = new Date();

  const selectedAlimentoNome = alimentosOptions.find(
    (item) => String(item.id) === alimentoSelecionado
  )?.nome;

  const registrosDeHoje = registros
    .filter((item) => item.horarioId === Number(id) && isMesmoDia(item.dataLancamentoISO, hoje))
    .sort((a, b) => (b.dataLancamentoISO || "").localeCompare(a.dataLancamentoISO || ""));

  useFocusEffect(
    React.useCallback(() => {
      let ativo = true;

      async function carregarRegistros() {
        try {
          const salvo = await AsyncStorage.getItem(storageKey);
          if (ativo) {
            setRegistros(salvo ? JSON.parse(salvo) : getRegistrosVazios());
          }
        } catch (error) {
          console.log("Erro ao carregar temperaturas", error);
        } finally {
          if (ativo) setCarregado(true);
        }
      }

      carregarRegistros();

      return () => {
        ativo = false;
      };
    }, [storageKey]),
  );

  React.useEffect(() => {
    if (!carregado) return;

    async function salvarRegistros() {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(registros));
      } catch (error) {
        console.log("Erro ao salvar temperaturas", error);
      }
    }

    salvarRegistros();
  }, [carregado, registros, storageKey]);

  function adicionarAlimento() {
    if (!horario) return;

    if (!alimentoSelecionado) {
      setErro("Selecione um alimento.");
      return;
    }

    const validacao = validarTemperaturaAlimento(temperatura);
    if (!validacao.valido) {
      setErro(validacao.mensagem);
      return;
    }

    const dataLancamento = new Date();
    const novoRegistro = {
      id: Date.now(),
      horarioId: horario.id,
      horarioNome: horario.nome,
      alimentoId: Number(alimentoSelecionado),
      alimentoNome: selectedAlimentoNome || "Desconhecido",
      temperatura: validacao.valor,
      responsavel: responsavelNome,
      dataLancamento: dataLancamento.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      dataLancamentoISO: dataLancamento.toISOString(),
    };

    setRegistros((prev) => [...prev, novoRegistro]);

    setErro("");
    setAlimentoSelecionado("");
    setTemperatura("");
    setShowPicker(false);
  }

  return (
    <ScrollView contentContainerStyle={commonStyles.screen}>
      {horario && (
        <View style={commonStyles.card}>
          <Text style={commonStyles.title}>{horario.nome}</Text>
          <Text style={commonStyles.subtitle}>
            {horario.inicio} — {horario.fim}
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Adicionar alimento</Text>

            <Pressable
              style={styles.select}
              onPress={() => setShowPicker((prev) => !prev)}
            >
              <Text
                style={
                  selectedAlimentoNome
                    ? styles.selectText
                    : styles.selectPlaceholder
                }
              >
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
                      <Text
                        style={selected ? styles.optionTextSelected : styles.optionText}
                      >
                        {alimento.nome}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <Text style={styles.helperText}>
              Digite a temperatura em °C (ex: 65) ou "TA" para temperatura
              ambiente (frituras).
            </Text>
            <TextInput
              placeholder="Temperatura ou TA"
              placeholderTextColor={colors.textSecondary}
              value={temperatura}
              onChangeText={(text) => {
                setTemperatura(text);
                if (erro) setErro("");
              }}
              style={commonStyles.input}
              autoCapitalize="characters"
            />

            {erro ? (
              <View style={commonStyles.errorBanner}>
                <Text style={commonStyles.errorBannerText}>{erro}</Text>
              </View>
            ) : null}

            <Pressable style={commonStyles.button} onPress={adicionarAlimento}>
              <Text style={commonStyles.buttonText}>Enviar</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Alimentos cadastrados hoje</Text>
          {registrosDeHoje.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum alimento cadastrado hoje.</Text>
          ) : (
            registrosDeHoje.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Text style={styles.itemTitle}>{item.alimentoNome}</Text>
                <Text style={styles.itemText}>
                  {formatTemperaturaAlimento(item.temperatura)}
                </Text>
                <Text style={styles.itemMeta}>
                  {item.responsavel} · {item.dataLancamento}
                </Text>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 10,
  },
  select: {
    padding: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.sm,
    marginBottom: 10,
    backgroundColor: colors.white,
  },
  selectText: {
    color: colors.textPrimary,
  },
  selectPlaceholder: {
    color: colors.textSecondary,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    marginBottom: 12,
    overflow: "hidden",
  },
  option: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  optionSelected: {
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    color: colors.textPrimary,
  },
  optionTextSelected: {
    color: colors.primaryDark,
    fontWeight: "600",
  },
  emptyText: {
    color: colors.textSecondary,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 6,
  },
  itemCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fcfdff",
  },
  itemTitle: {
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  itemText: {
    color: colors.textSecondary,
  },
  itemMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
});

export default Horarios;
