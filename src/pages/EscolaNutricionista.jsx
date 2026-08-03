import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { GlobalContext } from "../context/GlobalContext";
import { colors, commonStyles, radius } from "../theme/theme";
import { Segmented } from "../components/Segmented";
import {
  getPlanilhasVazias,
  getPlanilhasStorageKey,
  getEquipamentoLabel,
  getTurnoLabel,
  formatTemperatura,
  formatQuantidadeEstoque,
  getStatusTemperatura,
} from "../utils/planilhas";
import {
  getTemperaturaStorageKey,
  getRegistrosVazios,
  isMesmoDia,
  formatTemperaturaAlimento,
} from "../utils/temperaturaAlimentos";
import {
  baixarPdf,
  montarSecoesTemperatura,
  montarSecoesEquipamentos,
  montarSecoesRastreabilidade,
  montarSecoesEstoque,
} from "../utils/pdfExport";

const ABAS = [
  { key: "temperatura", label: "Temperatura" },
  { key: "equipamentos", label: "Equipamentos" },
  { key: "rastreabilidade", label: "Rastreabilidade" },
  { key: "estoque", label: "Estoque" },
];

const ABA_PDF = {
  temperatura: {
    subtitulo: "Temperatura de Alimentos por Horário",
    arquivo: "temperatura-alimentos",
    montarSecoes: montarSecoesTemperatura,
    getRegistros: (planilhas, registrosTemperatura) => registrosTemperatura,
  },
  equipamentos: {
    subtitulo: "Temperatura de Equipamentos (Geladeira e Freezer)",
    arquivo: "equipamentos",
    montarSecoes: montarSecoesEquipamentos,
    getRegistros: (planilhas) => planilhas.geladeira || [],
  },
  rastreabilidade: {
    subtitulo: "Rastreabilidade de Alimentos",
    arquivo: "rastreabilidade",
    montarSecoes: montarSecoesRastreabilidade,
    getRegistros: (planilhas) => planilhas.rastreabilidade || [],
  },
  estoque: {
    subtitulo: "Controle de Estoque",
    arquivo: "estoque",
    montarSecoes: montarSecoesEstoque,
    getRegistros: (planilhas) => planilhas.estoque || [],
  },
};

function addDias(data, quantidade) {
  const nova = new Date(data);
  nova.setDate(nova.getDate() + quantidade);
  return nova;
}

function formatarData(data) {
  return data.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const STAT_VARIANTES = {
  primary: { bg: colors.primaryLight, border: colors.primaryLightBorder, text: colors.primaryDark },
  success: { bg: colors.successLight, border: colors.successBorder, text: colors.success },
  danger: { bg: colors.dangerLight, border: colors.dangerBorder, text: colors.danger },
  warning: { bg: colors.warningLight, border: colors.warningBorder, text: colors.warning },
};

function StatCard({ value, label, variant = "primary" }) {
  const cores = STAT_VARIANTES[variant] || STAT_VARIANTES.primary;
  return (
    <View
      style={[styles.statCard, { backgroundColor: cores.bg, borderColor: cores.border }]}
    >
      <Text style={[styles.statValue, { color: cores.text }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export const EscolaNutricionista = () => {
  const route = useRoute();
  const { data, escolas } = React.useContext(GlobalContext);
  const { escolaId } = route.params;

  const escola = (escolas || []).find((item) => item.id === Number(escolaId));

  const [abaAtiva, setAbaAtiva] = React.useState("temperatura");
  const [dataSelecionada, setDataSelecionada] = React.useState(new Date());
  const [planilhas, setPlanilhas] = React.useState(getPlanilhasVazias());
  const [registrosTemperatura, setRegistrosTemperatura] = React.useState(
    getRegistrosVazios(),
  );
  const [carregando, setCarregando] = React.useState(true);
  const [gerandoPdf, setGerandoPdf] = React.useState(false);
  const [erroPdf, setErroPdf] = React.useState("");

  const alimentosGlobais = data.alimentosGlobais || [];

  useFocusEffect(
    React.useCallback(() => {
      let ativo = true;

      async function carregar() {
        try {
          const [salvoPlanilhas, salvoTemperaturas] = await Promise.all([
            AsyncStorage.getItem(getPlanilhasStorageKey(escola)),
            AsyncStorage.getItem(getTemperaturaStorageKey(escola)),
          ]);
          if (ativo) {
            setPlanilhas(salvoPlanilhas ? JSON.parse(salvoPlanilhas) : getPlanilhasVazias());
            setRegistrosTemperatura(
              salvoTemperaturas ? JSON.parse(salvoTemperaturas) : getRegistrosVazios(),
            );
          }
        } catch (error) {
          console.log("Erro ao carregar dados da escola", error);
        } finally {
          if (ativo) setCarregando(false);
        }
      }

      carregar();

      return () => {
        ativo = false;
      };
    }, [escola?.codAcesso]),
  );

  const temperaturasDoDia = registrosTemperatura.filter((item) =>
    isMesmoDia(item.dataLancamentoISO, dataSelecionada),
  );

  const geladeiraDoDia = (planilhas.geladeira || []).filter((item) =>
    isMesmoDia(item.dataLancamentoISO, dataSelecionada),
  );

  const rastreabilidadeDoDia = (planilhas.rastreabilidade || []).filter((item) =>
    isMesmoDia(item.dataLancamentoISO, dataSelecionada),
  );

  const estoqueDoDia = (planilhas.estoque || []).filter((item) =>
    isMesmoDia(item.dataLancamentoISO, dataSelecionada),
  );

  const estoqueTotaisDoDia = estoqueDoDia.reduce(
    (acc, item) => {
      const total = Number(item.total) || 0;
      if (item.unidadeMedida === "L") acc.litros += total;
      else acc.kg += total;
      return acc;
    },
    { kg: 0, litros: 0 },
  );

  const registrosDoDiaPorAba = {
    temperatura: temperaturasDoDia,
    equipamentos: geladeiraDoDia,
    rastreabilidade: rastreabilidadeDoDia,
    estoque: estoqueDoDia,
  };
  const temDadosNoDia = (registrosDoDiaPorAba[abaAtiva] || []).length > 0;

  async function handleBaixarPdf() {
    const config = ABA_PDF[abaAtiva];
    if (!config || gerandoPdf || !temDadosNoDia) return;

    setErroPdf("");
    setGerandoPdf(true);
    try {
      const registros = config.getRegistros(planilhas, registrosTemperatura);
      const secoes = config.montarSecoes(registros);
      await baixarPdf({
        escolaNome: escola.nome,
        subtitulo: config.subtitulo,
        secoes,
        nomeArquivo: `${config.arquivo}-${escola.codAcesso}.pdf`,
      });
    } catch (error) {
      console.log("Erro ao gerar PDF", error);
      setErroPdf("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setGerandoPdf(false);
    }
  }

  if (!escola) {
    return (
      <View style={commonStyles.screenCentered}>
        <Text style={commonStyles.subtitle}>Escola não encontrada.</Text>
      </View>
    );
  }

  const horariosComRegistro = new Set(temperaturasDoDia.map((item) => item.horarioId));
  const totalHorarios = (escola.horarios || []).length;
  const horariosCompletos = (escola.horarios || []).filter((horario) =>
    horariosComRegistro.has(horario.id),
  ).length;
  const horariosPendentes = totalHorarios - horariosCompletos;

  const equipamentosComAlerta = geladeiraDoDia.filter(
    (item) => getStatusTemperatura(item.tipoEquipamento, item.temperatura).status !== "ok",
  ).length;
  const equipamentosOk = geladeiraDoDia.length - equipamentosComAlerta;

  const alimentosRastreabilidadeUnicos = new Set(
    rastreabilidadeDoDia.map((item) => item.nome),
  ).size;

  return (
    <ScrollView contentContainerStyle={commonStyles.screen}>
      <View style={[commonStyles.card, styles.wideCard]}>
        <Text style={commonStyles.title}>{escola.nome}</Text>
        <Text style={commonStyles.subtitle}>
          Dashboards conectados aos registros da equipe desta escola.
        </Text>

        <Segmented options={ABAS} value={abaAtiva} onChange={setAbaAtiva} />

        <Pressable
          style={[
            styles.pdfButton,
            (gerandoPdf || !temDadosNoDia) && styles.pdfButtonDisabled,
          ]}
          onPress={handleBaixarPdf}
          disabled={gerandoPdf || !temDadosNoDia}
        >
          <Text style={styles.pdfButtonText}>
            {gerandoPdf
              ? "Gerando PDF..."
              : temDadosNoDia
                ? "📄 Baixar PDF desta aba"
                : "Nenhum registro neste dia para exportar"}
          </Text>
        </Pressable>

        {erroPdf ? (
          <View style={commonStyles.errorBanner}>
            <Text style={commonStyles.errorBannerText}>{erroPdf}</Text>
          </View>
        ) : null}

        <View style={styles.dateBar}>
          <Pressable
            style={styles.dateButton}
            onPress={() => setDataSelecionada((prev) => addDias(prev, -1))}
          >
            <Text style={styles.dateButtonText}>◀</Text>
          </Pressable>
          <View style={styles.dateLabelWrapper}>
            <Text style={styles.dateLabel}>{formatarData(dataSelecionada)}</Text>
            <Pressable onPress={() => setDataSelecionada(new Date())}>
              <Text style={styles.dateToday}>Ir para hoje</Text>
            </Pressable>
          </View>
          <Pressable
            style={styles.dateButton}
            onPress={() => setDataSelecionada((prev) => addDias(prev, 1))}
          >
            <Text style={styles.dateButtonText}>▶</Text>
          </Pressable>
        </View>

        {carregando ? (
          <Text style={commonStyles.subtitle}>Carregando...</Text>
        ) : (
          <>
            {abaAtiva === "temperatura" && (
              <View style={styles.section}>
                <View style={styles.statsRow}>
                  <StatCard
                    value={temperaturasDoDia.length}
                    label="Registros no dia"
                    variant="primary"
                  />
                  <StatCard
                    value={horariosCompletos}
                    label="Horários completos"
                    variant="success"
                  />
                  <StatCard
                    value={horariosPendentes}
                    label="Horários pendentes"
                    variant={horariosPendentes > 0 ? "danger" : "success"}
                  />
                </View>
                {(escola.horarios || []).map((horario) => {
                  const registros = temperaturasDoDia
                    .filter((item) => item.horarioId === horario.id)
                    .sort((a, b) =>
                      (a.dataLancamentoISO || "").localeCompare(b.dataLancamentoISO || ""),
                    );

                  return (
                    <View key={horario.id} style={styles.horarioCard}>
                      <Text style={styles.horarioTitulo}>
                        {horario.nome} ({horario.inicio} - {horario.fim})
                      </Text>
                      {registros.length === 0 ? (
                        <View style={styles.alertCard}>
                          <Text style={styles.alertText}>
                            ⚠ Nenhum registro de temperatura neste dia.
                          </Text>
                        </View>
                      ) : (
                        registros.map((item) => (
                          <View key={item.id} style={styles.itemRow}>
                            <Text style={styles.itemNome}>{item.alimentoNome}</Text>
                            <Text style={styles.itemDetalhe}>
                              {formatTemperaturaAlimento(item.temperatura)} ·{" "}
                              {item.responsavel} · {item.dataLancamento}
                            </Text>
                          </View>
                        ))
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {abaAtiva === "equipamentos" && (
              <View style={styles.section}>
                <View style={styles.statsRow}>
                  <StatCard
                    value={geladeiraDoDia.length}
                    label="Registros no dia"
                    variant="primary"
                  />
                  <StatCard value={equipamentosOk} label="Dentro da faixa" variant="success" />
                  <StatCard
                    value={equipamentosComAlerta}
                    label="Fora da faixa"
                    variant={equipamentosComAlerta > 0 ? "danger" : "success"}
                  />
                </View>
                {geladeiraDoDia.length === 0 ? (
                  <Text style={styles.emptyText}>
                    Nenhum registro de geladeira/freezer neste dia.
                  </Text>
                ) : (
                  geladeiraDoDia.map((item, index) => {
                    const status = getStatusTemperatura(
                      item.tipoEquipamento,
                      item.temperatura,
                    );
                    return (
                      <View
                        key={`${item.nomeEquipamento}-${index}`}
                        style={
                          status.status === "ok" ? styles.okCard : styles.alertCard
                        }
                      >
                        <Text
                          style={
                            status.status === "ok" ? styles.okTitle : styles.alertTitle
                          }
                        >
                          {status.status === "ok" ? "✓ " : ""}
                          {item.nomeEquipamento} · {getEquipamentoLabel(item.tipoEquipamento)}
                        </Text>
                        <Text
                          style={
                            status.status === "ok" ? styles.okText : styles.alertText
                          }
                        >
                          {formatTemperatura(item.temperatura)} · {getTurnoLabel(item.turno)}{" "}
                          · {item.responsavel}
                        </Text>
                        {status.status !== "ok" && (
                          <Text style={styles.alertMensagem}>{status.mensagem}</Text>
                        )}
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {abaAtiva === "rastreabilidade" && (
              <View style={styles.section}>
                <View style={styles.statsRow}>
                  <StatCard
                    value={rastreabilidadeDoDia.length}
                    label="Registros no dia"
                    variant="primary"
                  />
                  <StatCard
                    value={alimentosRastreabilidadeUnicos}
                    label="Alimentos diferentes"
                    variant="warning"
                  />
                </View>
                {rastreabilidadeDoDia.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhum registro neste dia.</Text>
                ) : (
                  rastreabilidadeDoDia.map((item, index) => (
                    <View key={`${item.nome}-${index}`} style={styles.card}>
                      <Text style={styles.itemNome}>{item.nome}</Text>
                      <Text style={styles.itemDetalhe}>Marca: {item.marca || "-"}</Text>
                      <Text style={styles.itemDetalhe}>
                        Horário: {item.horarioNome || "-"}
                      </Text>
                      <Text style={styles.itemDetalhe}>Lote: {item.lote || "-"}</Text>
                      <Text style={styles.itemDetalhe}>
                        Validade: {item.validade || "-"}
                      </Text>
                      <Text style={styles.itemDetalheMuted}>
                        {item.responsavel} · {item.dataLancamento}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {abaAtiva === "estoque" && (
              <View style={styles.section}>
                <View style={styles.statsRow}>
                  <StatCard
                    value={estoqueDoDia.length}
                    label="Itens registrados"
                    variant="primary"
                  />
                  <StatCard
                    value={Math.round(estoqueTotaisDoDia.kg * 100) / 100}
                    label="Total em kg (dia)"
                    variant="warning"
                  />
                  <StatCard
                    value={Math.round(estoqueTotaisDoDia.litros * 100) / 100}
                    label="Total em litros (dia)"
                    variant="warning"
                  />
                </View>
                {estoqueDoDia.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhum registro neste dia.</Text>
                ) : (
                  estoqueDoDia.map((item, index) => (
                    <View key={`${item.nome}-${index}`} style={styles.card}>
                      <Text style={styles.itemNome}>{item.nome}</Text>
                      <Text style={styles.itemDetalhe}>
                        {item.quantidade} un ×{" "}
                        {formatQuantidadeEstoque(item.valorUnidade, item.unidadeMedida)}/un
                      </Text>
                      <Text style={styles.itemDetalhe}>
                        Total: {formatQuantidadeEstoque(item.total, item.unidadeMedida)}
                      </Text>
                      <Text style={styles.itemDetalheMuted}>
                        {item.responsavel} · {item.dataLancamento}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wideCard: {
    maxWidth: 720,
  },
  pdfButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  pdfButtonDisabled: {
    backgroundColor: "#93b4f0",
  },
  pdfButtonText: {
    color: colors.white,
    fontWeight: "700",
  },
  dateBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#fafafa",
  },
  dateButton: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryLightBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  dateButtonText: {
    color: colors.primaryDark,
    fontWeight: "700",
  },
  dateLabelWrapper: {
    alignItems: "center",
  },
  dateLabel: {
    color: colors.textPrimary,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  dateToday: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textSecondary,
  },
  horarioCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fafafa",
  },
  horarioTitulo: {
    color: colors.textPrimary,
    fontWeight: "700",
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fcfdff",
  },
  itemRow: {
    marginBottom: 6,
  },
  itemNome: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  itemDetalhe: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemDetalheMuted: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  okCard: {
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: colors.successBorder,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 8,
  },
  okTitle: {
    color: colors.success,
    fontWeight: "700",
  },
  okText: {
    color: colors.success,
    marginTop: 2,
  },
  alertCard: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 8,
  },
  alertTitle: {
    color: colors.danger,
    fontWeight: "700",
  },
  alertText: {
    color: colors.danger,
    marginTop: 2,
  },
  alertMensagem: {
    color: colors.danger,
    fontWeight: "700",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 130,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 14,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  statLabel: {
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default EscolaNutricionista;
