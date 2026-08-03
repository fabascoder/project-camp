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
import { useFocusEffect } from "@react-navigation/native";
import { GlobalContext } from "../context/GlobalContext";
import {
  TIPOS_PLANILHA as tipos,
  TIPOS_EQUIPAMENTO,
  TURNOS,
  UNIDADES_MEDIDA,
  getPlanilhasVazias,
  getPlanilhasStorageKey,
  getEquipamentoLabel,
  getTurnoLabel,
  formatTemperatura,
  formatQuantidadeEstoque,
  getStatusTemperatura,
} from "../utils/planilhas";

function Segmented({ options, value, onChange, disabledKeys = [] }) {
  return (
    <View style={styles.segmentedRow}>
      {options.map((option) => {
        const active = option.key === value;
        const disabled = disabledKeys.includes(option.key);
        return (
          <Pressable
            key={option.key}
            disabled={disabled}
            style={[
              styles.segmentedButton,
              active && styles.segmentedButtonActive,
              disabled && styles.segmentedButtonDisabled,
            ]}
            onPress={() => onChange(option.key)}
          >
            <Text
              style={[
                styles.segmentedText,
                active && styles.segmentedTextActive,
                disabled && styles.segmentedTextDisabled,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const SINAIS = [
  { key: "+", label: "Positivo (+)" },
  { key: "-", label: "Negativo (-)" },
];

const VALIDADE_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;

export const Planilhas = () => {
  const { data, setData } = React.useContext(GlobalContext);
  const [tipoAtivo, setTipoAtivo] = React.useState("geladeira");
  const [carregado, setCarregado] = React.useState(false);
  const [erro, setErro] = React.useState("");

  const [tipoEquipamento, setTipoEquipamento] = React.useState("geladeira");
  const [nomeEquipamento, setNomeEquipamento] = React.useState("");
  const [turno, setTurno] = React.useState("manha");
  const [sinalTemperatura, setSinalTemperatura] = React.useState("+");
  const [temperaturaValor, setTemperaturaValor] = React.useState("");

  const [nomeAlimento, setNomeAlimento] = React.useState("");
  const [marca, setMarca] = React.useState("");
  const [horarioId, setHorarioId] = React.useState("");
  const [showHorarioPicker, setShowHorarioPicker] = React.useState(false);
  const [lote, setLote] = React.useState("");
  const [validade, setValidade] = React.useState("");

  const [nomeEstoque, setNomeEstoque] = React.useState("");
  const [quantidadeUnidades, setQuantidadeUnidades] = React.useState("");
  const [valorUnidade, setValorUnidade] = React.useState("");
  const [unidadeMedida, setUnidadeMedida] = React.useState("kg");

  const storageKey = getPlanilhasStorageKey(data.escola);
  const planilhas = data.planilhas || getPlanilhasVazias();
  const responsavelNome = data?.funcionario?.nome || "Usuário não identificado";
  const horariosEscola = data.escola?.horarios || [];
  const horarioSelecionado = horariosEscola.find(
    (item) => String(item.id) === horarioId,
  );

  const sinalDesabilitado =
    tipoEquipamento === "geladeira"
      ? ["-"]
      : tipoEquipamento === "freezer"
        ? ["+"]
        : [];

  React.useEffect(() => {
    if (tipoEquipamento === "geladeira" && sinalTemperatura === "-") {
      setSinalTemperatura("+");
    } else if (tipoEquipamento === "freezer" && sinalTemperatura === "+") {
      setSinalTemperatura("-");
    }
  }, [tipoEquipamento, sinalTemperatura]);

  useFocusEffect(
    React.useCallback(() => {
      let ativo = true;

      async function carregarPlanilhas() {
        try {
          const salvo = await AsyncStorage.getItem(storageKey);
          if (ativo) {
            const dadosSalvos = salvo ? JSON.parse(salvo) : getPlanilhasVazias();
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
    }, [storageKey, setData]),
  );

  React.useEffect(() => {
    if (!carregado) return;

    async function salvarPlanilhas() {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(planilhas));
      } catch (error) {
        console.log("Erro ao salvar planilhas", error);
      }
    }

    salvarPlanilhas();
  }, [carregado, planilhas, storageKey]);

  function salvarRegistro(novoRegistro) {
    setData((prev) => ({
      ...prev,
      planilhas: {
        ...(prev.planilhas || {}),
        [tipoAtivo]: [...(prev.planilhas?.[tipoAtivo] || []), novoRegistro],
      },
    }));
  }

  function baseRegistro() {
    const dataLancamento = new Date();
    return {
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
  }

  function adicionarGeladeira() {
    if (!nomeEquipamento.trim()) {
      setErro("Informe o nome do equipamento.");
      return;
    }

    if (!temperaturaValor.trim()) {
      setErro("Informe a temperatura do equipamento.");
      return;
    }

    const magnitude = Math.abs(Number(temperaturaValor.replace(",", ".")));
    if (Number.isNaN(magnitude)) {
      setErro("Temperatura inválida. Digite apenas números (ex: 5).");
      return;
    }

    const temperatura = sinalTemperatura === "-" ? -magnitude : magnitude;

    salvarRegistro({
      ...baseRegistro(),
      tipoEquipamento,
      nomeEquipamento: nomeEquipamento.trim(),
      turno,
      temperatura,
    });

    setErro("");
    setNomeEquipamento("");
    setTemperaturaValor("");
  }

  function adicionarRastreabilidade() {
    if (!nomeAlimento.trim()) {
      setErro("Informe o nome do alimento.");
      return;
    }

    if (!marca.trim()) {
      setErro("Informe a marca do alimento.");
      return;
    }

    if (horariosEscola.length > 0 && !horarioSelecionado) {
      setErro("Selecione o horário.");
      return;
    }

    if (!lote.trim()) {
      setErro("Informe o lote.");
      return;
    }

    if (!validade.trim()) {
      setErro("Informe a validade.");
      return;
    }

    if (!VALIDADE_REGEX.test(validade.trim())) {
      setErro("Validade inválida. Use o formato DD/MM/AAAA.");
      return;
    }

    salvarRegistro({
      ...baseRegistro(),
      nome: nomeAlimento.trim(),
      marca: marca.trim(),
      horarioId: horarioSelecionado?.id ?? null,
      horarioNome: horarioSelecionado?.nome || "Não informado",
      lote: lote.trim(),
      validade: validade.trim(),
    });

    setErro("");
    setNomeAlimento("");
    setMarca("");
    setHorarioId("");
    setLote("");
    setValidade("");
  }

  function adicionarEstoque() {
    if (!nomeEstoque.trim()) {
      setErro("Informe o nome do alimento.");
      return;
    }

    if (!quantidadeUnidades.trim()) {
      setErro("Informe a quantidade de unidades.");
      return;
    }

    const quantidade = Number(quantidadeUnidades.replace(",", "."));
    if (Number.isNaN(quantidade) || quantidade <= 0) {
      setErro("Quantidade inválida. Digite um número maior que zero.");
      return;
    }

    if (!valorUnidade.trim()) {
      setErro(
        unidadeMedida === "kg"
          ? "Informe o peso de 1 unidade."
          : "Informe o volume de 1 unidade.",
      );
      return;
    }

    const valor = Number(valorUnidade.replace(",", "."));
    if (Number.isNaN(valor) || valor <= 0) {
      setErro("Peso/volume inválido. Digite um número maior que zero.");
      return;
    }

    salvarRegistro({
      ...baseRegistro(),
      nome: nomeEstoque.trim(),
      quantidade,
      valorUnidade: valor,
      unidadeMedida,
      total: quantidade * valor,
    });

    setErro("");
    setNomeEstoque("");
    setQuantidadeUnidades("");
    setValorUnidade("");
  }

  function adicionarRegistro() {
    if (tipoAtivo === "geladeira") return adicionarGeladeira();
    if (tipoAtivo === "rastreabilidade") return adicionarRastreabilidade();
    return adicionarEstoque();
  }

  function trocarTipoAtivo(novoTipo) {
    setTipoAtivo(novoTipo);
    setErro("");
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

  const totalEstoquePreview =
    quantidadeUnidades && valorUnidade
      ? Number(quantidadeUnidades) * Number(valorUnidade)
      : null;

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
                onPress={() => trocarTipoAtivo(tipo.key)}
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

          {tipoAtivo === "geladeira" && (
            <>
              <Text style={styles.fieldLabel}>Tipo de equipamento</Text>
              <Segmented
                options={TIPOS_EQUIPAMENTO}
                value={tipoEquipamento}
                onChange={setTipoEquipamento}
              />

              <TextInput
                style={styles.input}
                placeholder="Nome do equipamento (ex: Geladeira 1)"
                value={nomeEquipamento}
                onChangeText={setNomeEquipamento}
              />

              <Text style={styles.fieldLabel}>Horário</Text>
              <Segmented options={TURNOS} value={turno} onChange={setTurno} />

              <Text style={styles.fieldLabel}>Temperatura</Text>
              <View style={styles.temperaturaRow}>
                <View style={styles.sinalWrapper}>
                  <Segmented
                    options={SINAIS}
                    value={sinalTemperatura}
                    onChange={setSinalTemperatura}
                    disabledKeys={sinalDesabilitado}
                  />
                </View>
                <TextInput
                  style={[styles.input, styles.temperaturaInput]}
                  placeholder="Ex: 5"
                  keyboardType="numeric"
                  value={temperaturaValor}
                  onChangeText={setTemperaturaValor}
                />
              </View>
            </>
          )}

          {tipoAtivo === "rastreabilidade" && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Nome do alimento"
                value={nomeAlimento}
                onChangeText={setNomeAlimento}
              />
              <TextInput
                style={styles.input}
                placeholder="Marca"
                value={marca}
                onChangeText={setMarca}
              />

              <Text style={styles.fieldLabel}>Horário</Text>
              <Pressable
                style={styles.select}
                onPress={() => setShowHorarioPicker((prev) => !prev)}
              >
                <Text
                  style={
                    horarioSelecionado ? styles.selectText : styles.selectPlaceholder
                  }
                >
                  {horarioSelecionado
                    ? `${horarioSelecionado.nome} (${horarioSelecionado.inicio} - ${horarioSelecionado.fim})`
                    : "Selecione o horário desta escola"}
                </Text>
              </Pressable>

              {showHorarioPicker && (
                <View style={styles.dropdown}>
                  {horariosEscola.length === 0 ? (
                    <Text style={styles.dropdownEmpty}>
                      Nenhum horário cadastrado para esta escola.
                    </Text>
                  ) : (
                    horariosEscola.map((horario) => {
                      const selected = String(horario.id) === horarioId;
                      return (
                        <Pressable
                          key={horario.id}
                          style={[
                            styles.dropdownOption,
                            selected && styles.dropdownOptionSelected,
                          ]}
                          onPress={() => {
                            setHorarioId(String(horario.id));
                            setShowHorarioPicker(false);
                          }}
                        >
                          <Text>
                            {horario.nome} ({horario.inicio} - {horario.fim})
                          </Text>
                        </Pressable>
                      );
                    })
                  )}
                </View>
              )}

              <TextInput
                style={styles.input}
                placeholder="Lote"
                value={lote}
                onChangeText={setLote}
              />
              <TextInput
                style={styles.input}
                placeholder="Validade (DD/MM/AAAA)"
                value={validade}
                onChangeText={setValidade}
              />
            </>
          )}

          {tipoAtivo === "estoque" && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Nome do alimento"
                value={nomeEstoque}
                onChangeText={setNomeEstoque}
              />
              <TextInput
                style={styles.input}
                placeholder="Quantidade (unidades)"
                keyboardType="numeric"
                value={quantidadeUnidades}
                onChangeText={setQuantidadeUnidades}
              />

              <Text style={styles.fieldLabel}>Unidade de medida</Text>
              <Segmented
                options={UNIDADES_MEDIDA}
                value={unidadeMedida}
                onChange={setUnidadeMedida}
              />

              <TextInput
                style={styles.input}
                placeholder={
                  unidadeMedida === "kg"
                    ? "Peso de 1 unidade (kg)"
                    : "Volume de 1 unidade (L)"
                }
                keyboardType="numeric"
                value={valorUnidade}
                onChangeText={setValorUnidade}
              />

              {totalEstoquePreview !== null && !Number.isNaN(totalEstoquePreview) && (
                <Text style={styles.previewText}>
                  Total: {formatQuantidadeEstoque(totalEstoquePreview, unidadeMedida)}
                </Text>
              )}
            </>
          )}

          {erro ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{erro}</Text>
            </View>
          ) : null}

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
              .map((item, index) => {
                const status =
                  tipoAtivo === "geladeira"
                    ? getStatusTemperatura(item.tipoEquipamento, item.temperatura)
                    : null;

                return (
                  <View
                    key={`${item.nome || item.nomeEquipamento}-${item.dataLancamentoISO || index}`}
                    style={styles.itemCard}
                  >
                    {tipoAtivo === "geladeira" && (
                      <>
                        <Text style={styles.itemTitle}>
                          {item.nomeEquipamento} ·{" "}
                          {getEquipamentoLabel(item.tipoEquipamento)}
                        </Text>
                        <Text>Horário: {getTurnoLabel(item.turno)}</Text>
                        <Text>Temperatura: {formatTemperatura(item.temperatura)}</Text>
                        {status && status.status !== "ok" && (
                          <Text style={styles.statusAlerta}>⚠ {status.mensagem}</Text>
                        )}
                        {status && status.status === "ok" && (
                          <Text style={styles.statusOk}>✓ Dentro da faixa ideal</Text>
                        )}
                      </>
                    )}
                    {tipoAtivo === "rastreabilidade" && (
                      <>
                        <Text style={styles.itemTitle}>{item.nome}</Text>
                        <Text>Marca: {item.marca || "-"}</Text>
                        <Text>Horário: {item.horarioNome || "-"}</Text>
                        <Text>Lote: {item.lote || "-"}</Text>
                        <Text>Validade: {item.validade || "-"}</Text>
                      </>
                    )}
                    {tipoAtivo === "estoque" && (
                      <>
                        <Text style={styles.itemTitle}>{item.nome}</Text>
                        <Text>
                          {item.quantidade} un ×{" "}
                          {formatQuantidadeEstoque(item.valorUnidade, item.unidadeMedida)}
                          /un
                        </Text>
                        <Text style={styles.estoqueTotal}>
                          Total: {formatQuantidadeEstoque(item.total, item.unidadeMedida)}
                        </Text>
                      </>
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
                );
              })
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
  fieldLabel: {
    color: "#3b4a68",
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 2,
  },
  segmentedRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  segmentedButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    backgroundColor: "#eef2ff",
  },
  segmentedButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  segmentedButtonDisabled: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  segmentedText: {
    color: "#3b4a68",
    fontWeight: "600",
  },
  segmentedTextActive: {
    color: "#fff",
  },
  segmentedTextDisabled: {
    color: "#94a3b8",
  },
  temperaturaRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  sinalWrapper: {
    flexShrink: 0,
  },
  temperaturaInput: {
    flex: 1,
  },
  previewText: {
    color: "#1d4ed8",
    fontWeight: "700",
    marginBottom: 10,
  },
  errorBanner: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  errorBannerText: {
    color: "#dc2626",
    fontWeight: "600",
  },
  select: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  selectText: {
    color: "#111827",
  },
  selectPlaceholder: {
    color: "#64748b",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  dropdownOption: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  dropdownOptionSelected: {
    backgroundColor: "#eef2ff",
  },
  dropdownEmpty: {
    padding: 12,
    color: "#64748b",
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
  statusAlerta: {
    color: "#dc2626",
    fontWeight: "700",
    marginTop: 4,
  },
  statusOk: {
    color: "#16a34a",
    fontWeight: "700",
    marginTop: 4,
  },
  estoqueTotal: {
    color: "#1d4ed8",
    fontWeight: "700",
    marginTop: 2,
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
