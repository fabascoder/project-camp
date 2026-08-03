export function getTemperaturaStorageKey(escola) {
  const codigo = escola?.codAcesso ?? "sem-escola";
  return `@temperatura_alimentos_${codigo}`;
}

export function getRegistrosVazios() {
  return [];
}

export function isMesmoDia(dataISO, dataReferencia) {
  if (!dataISO) return false;
  return new Date(dataISO).toDateString() === dataReferencia.toDateString();
}

export const TEMPERATURA_AMBIENTE = "TA";

export function isTemperaturaAmbiente(valor) {
  return String(valor ?? "").trim().toUpperCase() === TEMPERATURA_AMBIENTE;
}

export function validarTemperaturaAlimento(valorTexto) {
  const texto = String(valorTexto || "").trim();

  if (!texto) {
    return {
      valido: false,
      mensagem: "Informe a temperatura ou digite 'TA' para temperatura ambiente (frituras).",
    };
  }

  if (texto.toUpperCase() === TEMPERATURA_AMBIENTE) {
    return { valido: true, valor: TEMPERATURA_AMBIENTE };
  }

  const numero = Number(texto.replace(",", "."));
  if (Number.isNaN(numero)) {
    return {
      valido: false,
      mensagem:
        "Temperatura inválida. Digite um número (ex: 65) ou 'TA' para temperatura ambiente (frituras).",
    };
  }

  return { valido: true, valor: numero };
}

export function formatTemperaturaAlimento(valor) {
  if (isTemperaturaAmbiente(valor)) return TEMPERATURA_AMBIENTE;
  return `${valor}°C`;
}
