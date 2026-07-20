import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GlobalContext } from "../context/GlobalContext";

const STORAGE_KEY = "@planilhas_data";

const tipos = [
  {
    key: "geladeira",
    title: "Geladeira",
    description: "Registro de alimentos que chegam na geladeira.",
  },
  {
    key: "rastreabilidade",
    title: "Rastreabilidade",
    description: "Cadastro de alimentos sem amostra.",
  },
  {
    key: "estoque",
    title: "Estoque",
    description: "Contagem mensal de estoque.",
  },
];

export const Planilhas = () => {
  const { data, setData } = React.useContext(GlobalContext);
  const [tipoAtivo, setTipoAtivo] = React.useState("geladeira");
  const [nome, setNome] = React.useState("");
  const [marca, setMarca] = React.useState("");
  const [temperatura, setTemperatura] = React.useState("");
  const [observacao, setObservacao] = React.useState("");
  const [quantidade, setQuantidade] = React.useState("");
  const [carregado, setCarregado] = React.useState(false);

  const planilhas = data.planilhas || {
    geladeira: [],
    rastreabilidade: [],
    estoque: [],
  };
  const responsavelNome = data?.funcionario?.nome || "Usuário não identificado";

  React.useEffect(() => {
    let ativo = true;

    async function carregarPlanilhas() {
      try {
        const salvo = await AsyncStorage.getItem(STORAGE_KEY);
        if (salvo && ativo) {
          const dadosSalvos = JSON.parse(salvo);
          setData((prev) => ({
            ...prev,
            planilhas: dadosSalvos,
          }));
        }
      } catch (error) {
        console.log("Erro ao carregar planilhas", error);
      } finally {
        if (ativo) {
          setCarregado(true);
        }
      }
    }

    carregarPlanilhas();

    return () => {
      ativo = false;
    };
  }, [setData]);

  React.useEffect(() => {
    if (!carregado) return;

    async function salvarPlanilhas() {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(planilhas));
      } catch (error) {
        console.log("Erro ao salvar planilhas", error);
      }
    }

    salvarPlanilhas();
  }, [carregado, planilhas]);

  function adicionarRegistro() {
    if (!nome.trim()) return;

    const dataLancamento = new Date();
    const novoRegistro = {
      nome: nome.trim(),
      marca: marca.trim(),
      temperatura: temperatura.trim(),
      observacao: observacao.trim(),
      quantidade: quantidade.trim(),
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

    setData((prev) => ({
      ...prev,
      planilhas: {
        ...(prev.planilhas || {}),
        [tipoAtivo]: [...(prev.planilhas?.[tipoAtivo] || []), novoRegistro],
      },
    }));

    setNome("");
    setMarca("");
    setTemperatura("");
    setObservacao("");
    setQuantidade("");
  }

  function removerRegistro(itemParaRemover) {
    setData((prev) => ({
      ...prev,
      planilhas: {
        ...(prev.planilhas || {}),
        [tipoAtivo]: (prev.planilhas?.[tipoAtivo] || []).filter(
          (item) => item !== itemParaRemover,
        ),
      },
    }));
  }

  const tipoSelecionado = tipos.find((item) => item.key === tipoAtivo);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Planilhas</Text>
        <Text style={styles.subtitle}>
          Cadastre alimentos nas planilhas da geladeira, rastreabilidade ou
          estoque.
        </Text>

        <View style={styles.optionsRow}>
          {tipos.map((tipo) => {
            const active = tipo.key === tipoAtivo;
            return (
              <Pressable
                key={tipo.key}
                style={[
                  styles.optionButton,
                  active && styles.optionButtonActive,
                ]}
                onPress={() => setTipoAtivo(tipo.key)}
              >
                <Text
                  style={[styles.optionText, active && styles.optionTextActive]}
                >
                  {tipo.title}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{tipoSelecionado?.title}</Text>
          <Text style={styles.formDescription}>
            {tipoSelecionado?.description}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nome do alimento"
            value={nome}
            onChangeText={setNome}
          />

          {tipoAtivo === "geladeira" && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Marca"
                value={marca}
                onChangeText={setMarca}
              />
              <TextInput
                style={styles.input}
                placeholder="Temperatura"
                value={temperatura}
                onChangeText={setTemperatura}
              />
            </>
          )}

          {tipoAtivo === "rastreabilidade" && (
            <TextInput
              style={styles.input}
              placeholder="Observação da rastreabilidade"
              value={observacao}
              onChangeText={setObservacao}
            />
          )}

          {tipoAtivo === "estoque" && (
            <TextInput
              style={styles.input}
              placeholder="Quantidade em estoque"
              value={quantidade}
              onChangeText={setQuantidade}
            />
          )}

          <Pressable style={styles.button} onPress={adicionarRegistro}>
            <Text style={styles.buttonText}>Salvar na planilha</Text>
          </Pressable>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Registros salvos</Text>
          {(planilhas[tipoAtivo] || []).length === 0 ? (
            <Text style={styles.emptyText}>Nenhum registro ainda.</Text>
          ) : (
            [...(planilhas[tipoAtivo] || [])]
              .sort((a, b) =>
                (b.dataLancamentoISO || "").localeCompare(
                  a.dataLancamentoISO || "",
                ),
              )
              .map((item, index) => (
                <View
                  key={`${item.nome}-${item.dataLancamentoISO || index}`}
                  style={styles.itemCard}
                >
                  <Text style={styles.itemTitle}>{item.nome}</Text>
                  {tipoAtivo === "geladeira" && (
                    <>
                      <Text>Marca: {item.marca || "-"}</Text>
                      <Text>Temperatura: {item.temperatura || "-"}</Text>
                    </>
                  )}
                  {tipoAtivo === "rastreabilidade" && (
                    <Text>Observação: {item.observacao || "-"}</Text>
                  )}
                  {tipoAtivo === "estoque" && (
                    <Text>Quantidade: {item.quantidade || "-"}</Text>
                  )}
                  <Text style={styles.metaText}>
                    Marcado por:{" "}
                    {item.responsavel || "Usuário não identificado"}
                  </Text>
                  <Text style={styles.metaText}>
                    Data: {item.dataLancamento || "-"}
                  </Text>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => removerRegistro(item)}
                  >
                    <Text style={styles.deleteButtonText}>Excluir</Text>
                  </Pressable>
                </View>
              ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f7fb",
    padding: 16,
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 620,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#dce3f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    color: "#55627a",
    marginBottom: 16,
    lineHeight: 20,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    backgroundColor: "#eef2ff",
  },
  optionButtonActive: {
    backgroundColor: "#1d4ed8",
    borderColor: "#1d4ed8",
  },
  optionText: {
    color: "#3b4a68",
    fontWeight: "600",
  },
  optionTextActive: {
    color: "#fff",
  },
  formCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    backgroundColor: "#fafafa",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  formDescription: {
    color: "#64748b",
    marginBottom: 8,
  },
  userInfo: {
    color: "#1d4ed8",
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  listSection: {
    marginTop: 4,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  emptyText: {
    color: "#64748b",
  },
  itemCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fcfdff",
  },
  itemTitle: {
    fontWeight: "700",
    marginBottom: 4,
  },
  metaText: {
    color: "#64748b",
    marginTop: 2,
  },
  deleteButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#dc2626",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});

export default Planilhas;
