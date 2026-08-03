export const TIPOS_PLANILHA = [
  {
    key: "geladeira",
    title: "Geladeira",
    description: "Controle de temperatura de geladeiras e freezers.",
  },
  {
    key: "rastreabilidade",
    title: "Rastreabilidade",
    description: "Cadastro de alimentos com lote e validade.",
  },
  {
    key: "estoque",
    title: "Estoque",
    description: "Contagem de estoque por peso ou volume.",
  },
];

export function getPlanilhasVazias() {
  return { geladeira: [], rastreabilidade: [], estoque: [] };
}

export function getPlanilhasStorageKey(escola) {
  const codigo = escola?.codAcesso ?? "sem-escola";
  return `@planilhas_data_${codigo}`;
}

export const TIPOS_EQUIPAMENTO = [
  { key: "geladeira", label: "Geladeira" },
  { key: "freezer", label: "Freezer" },
];

export const TURNOS = [
  { key: "manha", label: "Manhã" },
  { key: "tarde", label: "Tarde" },
];

export const UNIDADES_MEDIDA = [
  { key: "kg", label: "Peso (kg)" },
  { key: "L", label: "Volume (L)" },
];

export const FAIXAS_TEMPERATURA = {
  geladeira: { min: 0, max: 10 },
  freezer: { min: -20, max: -10 },
};

export function getEquipamentoLabel(tipoEquipamento) {
  return (
    TIPOS_EQUIPAMENTO.find((item) => item.key === tipoEquipamento)?.label ||
    "Geladeira"
  );
}

export function getTurnoLabel(turno) {
  return TURNOS.find((item) => item.key === turno)?.label || "-";
}

export function formatTemperatura(temperatura) {
  const valor = Number(temperatura);
  if (Number.isNaN(valor)) return "-";
  return `${valor > 0 ? "+" : ""}${valor}°C`;
}

export function getStatusTemperatura(tipoEquipamento, temperatura) {
  const faixa = FAIXAS_TEMPERATURA[tipoEquipamento] || FAIXAS_TEMPERATURA.geladeira;
  const valor = Number(temperatura);

  if (Number.isNaN(valor)) {
    return { status: "invalido", faixa, mensagem: "Temperatura inválida." };
  }

  if (valor < faixa.min) {
    return {
      status: "abaixo",
      faixa,
      mensagem: `Está muito abaixo do ideal (${faixa.min}°C a ${faixa.max}°C).`,
    };
  }

  if (valor > faixa.max) {
    return {
      status: "acima",
      faixa,
      mensagem: `Está muito acima do ideal (${faixa.min}°C a ${faixa.max}°C).`,
    };
  }

  return { status: "ok", faixa, mensagem: "Dentro da faixa ideal." };
}

export function formatQuantidadeEstoque(total, unidadeMedida) {
  const valor = Number(total);
  if (Number.isNaN(valor)) return "-";
  const arredondado = Math.round(valor * 100) / 100;
  return `${arredondado} ${unidadeMedida || "kg"}`;
}
