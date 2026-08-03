import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { GlobalContext } from "../context/GlobalContext";
import { colors, commonStyles, radius } from "../theme/theme";
import {
  TIPOS_PLANILHA,
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
  formatTemperaturaAlimento,
} from "../utils/temperaturaAlimentos";

const TIPO_COR = {
  geladeira: colors.primary,
  rastreabilidade: "#9333ea",
  estoque: colors.warning,
};

export const Dashboard = () => {
  const { data } = React.useContext(GlobalContext);
  const [planilhas, setPlanilhas] = React.useState(getPlanilhasVazias());
  const [registrosTemperatura, setRegistrosTemperatura] = React.useState(
    getRegistrosVazios(),
  );
  const [carregando, setCarregando] = React.useState(true);

  const storageKey = getPlanilhasStorageKey(data.escola);
  const temperaturaStorageKey = getTemperaturaStorageKey(data.escola);

  useFocusEffect(
    React.useCallback(() => {
      let ativo = true;

      async function carregar() {
        try {
          const [salvo, salvoTemperaturas] = await Promise.all([
            AsyncStorage.getItem(storageKey),
            AsyncStorage.getItem(temperaturaStorageKey),
          ]);
          if (ativo) {
            setPlanilhas(salvo ? JSON.parse(salvo) : getPlanilhasVazias());
            setRegistrosTemperatura(
              salvoTemperaturas ? JSON.parse(salvoTemperaturas) : getRegistrosVazios(),
            );
          }
        } catch (error) {
          console.log("Erro ao carregar dashboard", error);
        } finally {
          if (ativo) setCarregando(false);
        }
      }

      carregar();

      return () => {
        ativo = false;
      };
    }, [storageKey, temperaturaStorageKey]),
  );

  const todosRegistros = React.useMemo(() => {
    return TIPOS_PLANILHA.flatMap((tipo) =>
      (planilhas[tipo.key] || []).map((item) => ({
        ...item,
        tipo: tipo.key,
        tipoTitle: tipo.title,
      })),
    );
  }, [planilhas]);

  const totalRegistros = todosRegistros.length;

  const hojeISO = new Date().toDateString();
  const registrosHoje = todosRegistros.filter((item) => {
    if (!item.dataLancamentoISO) return false;
    return new Date(item.dataLancamentoISO).toDateString() === hojeISO;
  }).length;

  const porResponsavel = React.useMemo(() => {
    const mapa = new Map();
    todosRegistros.forEach((item) => {
      const nome = item.responsavel || "Não identificado";
      mapa.set(nome, (mapa.get(nome) || 0) + 1);
    });
    return [...mapa.entries()]
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total);
  }, [todosRegistros]);

  const alertasTemperatura = React.useMemo(() => {
    return (planilhas.geladeira || [])
      .map((item) => ({
        ...item,
        status: getStatusTemperatura(item.tipoEquipamento, item.temperatura),
      }))
      .filter((item) => item.status.status !== "ok");
  }, [planilhas]);

  const estoqueTotais = React.useMemo(() => {
    return (planilhas.estoque || []).reduce(
      (acc, item) => {
        const total = Number(item.total) || 0;
        if (item.unidadeMedida === "L") acc.litros += total;
        else acc.kg += total;
        return acc;
      },
      { kg: 0, litros: 0 },
    );
  }, [planilhas]);

  const recentes = React.useMemo(() => {
    return [...todosRegistros]
      .sort((a, b) =>
        (b.dataLancamentoISO || "").localeCompare(a.dataLancamentoISO || ""),
      )
      .slice(0, 8);
  }, [todosRegistros]);

  const hojeDate = new Date();

  const temperaturasPorHorario = React.useMemo(() => {
    return (data.escola?.horarios || []).map((horario) => {
      const alimentos = registrosTemperatura.filter(
        (item) =>
          item.horarioId === horario.id &&
          item.dataLancamentoISO &&
          new Date(item.dataLancamentoISO).toDateString() === hojeDate.toDateString(),
      );
      const temperaturas = alimentos
        .map((item) => Number(item.temperatura))
        .filter((valor) => !Number.isNaN(valor));

      const media = temperaturas.length
        ? temperaturas.reduce((soma, valor) => soma + valor, 0) / temperaturas.length
        : null;

      return {
        id: horario.id,
        nome: horario.nome,
        alimentos,
        media,
        minima: temperaturas.length ? Math.min(...temperaturas) : null,
        maxima: temperaturas.length ? Math.max(...temperaturas) : null,
      };
    });
  }, [data.escola, registrosTemperatura]);

  function resumoAtividade(item) {
    if (item.tipo === "geladeira") {
      return {
        titulo: `${item.nomeEquipamento} · ${getEquipamentoLabel(item.tipoEquipamento)}`,
        detalhe: `${formatTemperatura(item.temperatura)} · ${getTurnoLabel(item.turno)}`,
      };
    }
    if (item.tipo === "rastreabilidade") {
      return {
        titulo: item.nome,
        detalhe: `Lote ${item.lote || "-"} · Validade ${item.validade || "-"}`,
      };
    }
    return {
      titulo: item.nome,
      detalhe: `${item.quantidade} un × ${formatQuantidadeEstoque(item.valorUnidade, item.unidadeMedida)} = ${formatQuantidadeEstoque(item.total, item.unidadeMedida)}`,
    };
  }

  if (carregando) {
    return (
      <View style={commonStyles.screenCentered}>
        <Text style={commonStyles.subtitle}>Carregando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={commonStyles.screen}>
      <View style={[commonStyles.card, styles.wideCard]}>
        <Text style={commonStyles.title}>Dashboard da Cozinha</Text>
        <Text style={commonStyles.subtitle}>
          Dados compartilhados com toda a equipe de{" "}
          {data.escola?.nome || "sua escola"}.
        </Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.primaryLight, borderColor: colors.primaryLightBorder }]}>
            <Text style={[styles.statValue, { color: colors.primaryDark }]}>{totalRegistros}</Text>
            <Text style={styles.statLabel}>Registros no total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.successLight, borderColor: colors.successBorder }]}>
            <Text style={[styles.statValue, { color: colors.success }]}>{registrosHoje}</Text>
            <Text style={styles.statLabel}>Registros hoje</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.warningLight, borderColor: colors.warningBorder }]}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{porResponsavel.length}</Text>
            <Text style={styles.statLabel}>Colaboradoras ativas</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Registros por tipo</Text>
        <View style={styles.section}>
          {TIPOS_PLANILHA.map((tipo) => {
            const total = (planilhas[tipo.key] || []).length;
            const largura = totalRegistros === 0 ? 0 : (total / totalRegistros) * 100;
            return (
              <View key={tipo.key} style={styles.barRow}>
                <View style={styles.barHeader}>
                  <Text style={styles.barLabel}>{tipo.title}</Text>
                  <Text style={styles.barValue}>{total}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.max(largura, total > 0 ? 4 : 0)}%`,
                        backgroundColor: TIPO_COR[tipo.key],
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Registros por responsável</Text>
        <View style={styles.section}>
          {porResponsavel.length === 0 ? (
            <Text style={styles.emptyText}>Ainda não há registros da equipe.</Text>
          ) : (
            porResponsavel.map((item) => (
              <View key={item.nome} style={styles.responsavelRow}>
                <Text style={styles.responsavelNome}>{item.nome}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.total}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>Alertas de temperatura (geladeira e freezer)</Text>
        <View style={styles.section}>
          {alertasTemperatura.length === 0 ? (
            <View style={styles.alertOk}>
              <Text style={styles.alertOkText}>
                Tudo certo! Nenhuma geladeira ou freezer fora da faixa ideal.
              </Text>
            </View>
          ) : (
            alertasTemperatura.map((item, index) => (
              <View key={`${item.nomeEquipamento}-${index}`} style={styles.alertCard}>
                <Text style={styles.alertTitle}>
                  {item.nomeEquipamento} · {getEquipamentoLabel(item.tipoEquipamento)}
                </Text>
                <Text style={styles.alertText}>
                  {formatTemperatura(item.temperatura)} · {getTurnoLabel(item.turno)} · marcado
                  por {item.responsavel || "Não identificado"}
                </Text>
                <Text style={styles.alertMensagem}>{item.status.mensagem}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>Estoque</Text>
        <View style={styles.section}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardFlex, { backgroundColor: colors.primaryLight, borderColor: colors.primaryLightBorder }]}>
              <Text style={[styles.statValue, { color: colors.primaryDark }]}>
                {Math.round(estoqueTotais.kg * 100) / 100}
              </Text>
              <Text style={styles.statLabel}>Total em kg</Text>
            </View>
            <View style={[styles.statCard, styles.statCardFlex, { backgroundColor: colors.primaryLight, borderColor: colors.primaryLightBorder }]}>
              <Text style={[styles.statValue, { color: colors.primaryDark }]}>
                {Math.round(estoqueTotais.litros * 100) / 100}
              </Text>
              <Text style={styles.statLabel}>Total em litros</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Temperaturas dos alimentos por horário (hoje)</Text>
        <View style={styles.section}>
          {temperaturasPorHorario.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum horário cadastrado.</Text>
          ) : (
            temperaturasPorHorario.map((horario) => (
              <View key={horario.id} style={styles.horarioCard}>
                <Text style={styles.horarioTitulo}>{horario.nome}</Text>
                {horario.alimentos.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhum alimento registrado hoje.</Text>
                ) : (
                  <>
                    {horario.media !== null && (
                      <Text style={styles.horarioStats}>
                        Média: {Math.round(horario.media * 10) / 10}°C · Mínima:{" "}
                        {horario.minima}°C · Máxima: {horario.maxima}°C
                      </Text>
                    )}
                    {horario.alimentos.map((alimento) => (
                      <Text key={alimento.id} style={styles.horarioAlimento}>
                        {alimento.alimentoNome}: {formatTemperaturaAlimento(alimento.temperatura)}
                      </Text>
                    ))}
                  </>
                )}
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>Atividade recente</Text>
        <View style={styles.section}>
          {recentes.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum registro ainda.</Text>
          ) : (
            recentes.map((item, index) => {
              const resumo = resumoAtividade(item);
              return (
                <View
                  key={`${item.tipo}-${resumo.titulo}-${item.dataLancamentoISO || index}`}
                  style={styles.activityCard}
                >
                  <View style={styles.activityHeader}>
                    <View
                      style={[
                        styles.tipoTag,
                        { backgroundColor: TIPO_COR[item.tipo] },
                      ]}
                    >
                      <Text style={styles.tipoTagText}>{item.tipoTitle}</Text>
                    </View>
                    <Text style={styles.activityData}>{item.dataLancamento || "-"}</Text>
                  </View>
                  <Text style={styles.activityNome}>{resumo.titulo}</Text>
                  <Text style={styles.activityDetalhe}>{resumo.detalhe}</Text>
                  <Text style={styles.activityResponsavel}>
                    Por {item.responsavel || "Não identificado"}
                  </Text>
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
  wideCard: {
    maxWidth: 720,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 140,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 14,
    alignItems: "center",
  },
  statCardFlex: {
    flexBasis: "45%",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  statLabel: {
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 10,
  },
  section: {
    marginBottom: 22,
  },
  barRow: {
    marginBottom: 12,
  },
  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  barLabel: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  barValue: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  barTrack: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  barFill: {
    height: 10,
    borderRadius: radius.pill,
  },
  emptyText: {
    color: colors.textSecondary,
  },
  responsavelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fafafa",
  },
  responsavelNome: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: "center",
  },
  badgeText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 12,
  },
  alertOk: {
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: colors.successBorder,
    borderRadius: radius.md,
    padding: 12,
  },
  alertOkText: {
    color: colors.success,
    fontWeight: "600",
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
  horarioCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fafafa",
  },
  horarioTitulo: {
    color: colors.textPrimary,
    fontWeight: "700",
    marginBottom: 4,
  },
  horarioStats: {
    color: colors.textSecondary,
    fontWeight: "600",
    marginBottom: 6,
  },
  horarioAlimento: {
    color: colors.textPrimary,
  },
  activityCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fcfdff",
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  tipoTag: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tipoTagText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  activityData: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  activityNome: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  activityDetalhe: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  activityResponsavel: {
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default Dashboard;
