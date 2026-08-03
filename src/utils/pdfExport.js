import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { formatQuantidadeEstoque } from "./planilhas";
import { formatTemperaturaAlimento } from "./temperaturaAlimentos";

function formatarDataChave(iso) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function chaveParaData(chave) {
  const [dia, mes, ano] = chave.split("/").map(Number);
  return new Date(ano, mes - 1, dia);
}

function agruparPorDia(registros) {
  const mapa = new Map();
  registros.forEach((item) => {
    if (!item.dataLancamentoISO) return;
    const chave = formatarDataChave(item.dataLancamentoISO);
    if (!mapa.has(chave)) mapa.set(chave, []);
    mapa.get(chave).push(item);
  });
  return [...mapa.entries()].sort(
    (a, b) => chaveParaData(a[0]) - chaveParaData(b[0]),
  );
}

function ordenarPorHorario(itens) {
  return [...itens].sort((a, b) =>
    (a.dataLancamentoISO || "").localeCompare(b.dataLancamentoISO || ""),
  );
}

export function montarSecoesTemperatura(registros) {
  return agruparPorDia(registros).map(([dia, itens]) => ({
    titulo: `Dia ${dia}`,
    colunas: ["Dia", "Alimento", "Horário", "Temperatura", "Responsável"],
    linhas: ordenarPorHorario(itens).map((item) => [
      dia,
      item.alimentoNome || "-",
      item.horarioNome || "-",
      formatTemperaturaAlimento(item.temperatura),
      item.responsavel || "-",
    ]),
  }));
}

export function montarSecoesEquipamentos(registros) {
  return agruparPorDia(registros).map(([dia, itens]) => {
    const porEquipamento = new Map();

    ordenarPorHorario(itens).forEach((item) => {
      const chave = item.nomeEquipamento || "Equipamento";
      if (!porEquipamento.has(chave)) {
        porEquipamento.set(chave, { manha: null, tarde: null, responsaveis: new Set() });
      }
      const registro = porEquipamento.get(chave);
      if (item.turno === "manha") registro.manha = item;
      else if (item.turno === "tarde") registro.tarde = item;
      if (item.responsavel) registro.responsaveis.add(item.responsavel);
    });

    return {
      titulo: `Dia ${dia}`,
      colunas: ["Dia", "Equipamento", "Temp. Manhã", "Temp. Tarde", "Responsável"],
      linhas: [...porEquipamento.entries()].map(([nomeEquipamento, info]) => [
        dia,
        nomeEquipamento,
        info.manha ? `${info.manha.temperatura}°C` : "-",
        info.tarde ? `${info.tarde.temperatura}°C` : "-",
        [...info.responsaveis].join(" / ") || "-",
      ]),
    };
  });
}

export function montarSecoesRastreabilidade(registros) {
  return agruparPorDia(registros).map(([dia, itens]) => ({
    titulo: `Dia ${dia}`,
    colunas: ["Dia", "Alimento", "Horário", "Marca", "Lote", "Validade", "Responsável"],
    linhas: ordenarPorHorario(itens).map((item) => [
      dia,
      item.nome || "-",
      item.horarioNome || "-",
      item.marca || "-",
      item.lote || "-",
      item.validade || "-",
      item.responsavel || "-",
    ]),
  }));
}

export function montarSecoesEstoque(registros) {
  return agruparPorDia(registros).map(([dia, itens]) => ({
    titulo: `Dia ${dia}`,
    colunas: ["Dia", "Alimento", "Peso/Litros", "Responsável"],
    linhas: ordenarPorHorario(itens).map((item) => [
      dia,
      item.nome || "-",
      formatQuantidadeEstoque(item.total, item.unidadeMedida),
      item.responsavel || "-",
    ]),
  }));
}

function escapeHtml(valor) {
  return String(valor ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function construirHtml(escolaNome, subtitulo, secoes) {
  const corpo = secoes.length
    ? secoes
        .map(
          (secao, index) => `
            <div style="${index > 0 ? "page-break-before: always;" : ""}">
              <h2>${escapeHtml(secao.titulo)}</h2>
              <table>
                <thead>
                  <tr>${secao.colunas.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr>
                </thead>
                <tbody>
                  ${secao.linhas
                    .map(
                      (linha) =>
                        `<tr>${linha.map((valor) => `<td>${escapeHtml(valor)}</td>`).join("")}</tr>`,
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          `,
        )
        .join("")
    : `<p class="vazio">Nenhum registro encontrado.</p>`;

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Helvetica, Arial, sans-serif; padding: 24px; color: #1e293b; }
          h1 { font-size: 20px; margin-bottom: 2px; }
          h2 { font-size: 14px; margin-top: 24px; margin-bottom: 8px; color: #1d4ed8; }
          .subtitulo { color: #64748b; margin-bottom: 12px; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
          th, td { border: 1px solid #94a3b8; padding: 6px 8px; font-size: 11px; text-align: left; }
          th { background-color: #eef2ff; color: #1d4ed8; }
          .vazio { color: #64748b; font-style: italic; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(escolaNome)}</h1>
        <p class="subtitulo">${escapeHtml(subtitulo)}</p>
        ${corpo}
      </body>
    </html>
  `;
}

async function baixarPdfWeb(escolaNome, subtitulo, secoes, nomeArquivo) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ unit: "pt" });

  if (secoes.length === 0) {
    doc.setFontSize(16);
    doc.text(escolaNome, 40, 40);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(subtitulo, 40, 58);
    doc.text("Nenhum registro encontrado.", 40, 90);
  } else {
    secoes.forEach((secao, index) => {
      if (index > 0) doc.addPage();

      doc.setFontSize(16);
      doc.setTextColor(30);
      doc.text(escolaNome, 40, 40);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(subtitulo, 40, 58);

      doc.setFontSize(12);
      doc.setTextColor(29, 78, 216);
      doc.text(secao.titulo, 40, 80);

      autoTable(doc, {
        startY: 90,
        head: [secao.colunas],
        body: secao.linhas,
        styles: { fontSize: 9, cellPadding: 5 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        margin: { left: 40, right: 40 },
      });
    });
  }

  doc.save(nomeArquivo);
}

async function baixarPdfNativo(escolaNome, subtitulo, secoes, nomeArquivo) {
  const html = construirHtml(escolaNome, subtitulo, secoes);
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      UTI: "com.adobe.pdf",
      mimeType: "application/pdf",
      dialogTitle: nomeArquivo,
    });
  }
}

export async function baixarPdf({ escolaNome, subtitulo, secoes, nomeArquivo }) {
  if (Platform.OS === "web") {
    await baixarPdfWeb(escolaNome, subtitulo, secoes, nomeArquivo);
  } else {
    await baixarPdfNativo(escolaNome, subtitulo, secoes, nomeArquivo);
  }
}
