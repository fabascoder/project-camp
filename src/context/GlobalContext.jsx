import React from "react";
import { ContextServiceApi } from "../api/ContextServiceApi";
import DataManager from "../services/DataManager";

export const GlobalContext = React.createContext();

export const StorageGlobal = ({ children }) => {
  const API = React.useContext(ContextServiceApi);

  const [codeAcess, setCodeAcess] = React.useState("");
  const [matricula, setMatricula] = React.useState("");
  const [allData, setAllData] = React.useState(null);
  const [data, setData] = React.useState({
    escola: null,
    funcionario: null,
    alimentosGlobais: [],
  });

  // Carrega os dados ao iniciar a aplicação
  React.useEffect(() => {
    const carregarDados = async () => {
      const dadosCarregados = await DataManager.loadData();
      setAllData(dadosCarregados);
    };
    carregarDados();
  }, []);

  async function handleLogin(codigo, matricula) {
    // Recarrega os dados mais recentes do storage
    const dadosAtualizados = await DataManager.loadData();
    setAllData(dadosAtualizados);

    const escola = dadosAtualizados.escolas.find(
      (esc) => esc.codAcesso === Number(codigo)
    );

    if (!escola) return;

    const funcionario = escola.funcionarios.find(
      (func) => func.matricula === Number(matricula)
    );

    if (!funcionario) return;

    console.log(escola.nome);
    console.log(funcionario.nome);

    setData({
      escola,
      funcionario,
      alimentosGlobais: dadosAtualizados.alimentosGlobais,
    });
    return true;
  }

  // Função para adicionar alimento que persiste os dados
  async function adicionarAlimento(escolaId, horarioId, alimentoId, temperatura, cadastradoPor) {
    if (!allData) return false;

    const dadosAtualizados = await DataManager.adicionarAlimentoAHorario(
      escolaId,
      horarioId,
      alimentoId,
      temperatura,
      cadastradoPor,
      allData
    );

    if (dadosAtualizados) {
      setAllData(dadosAtualizados);
      // Atualiza também o estado local com a nova escola
      const escolaAtualizada = dadosAtualizados.escolas.find(
        (esc) => esc.id === escolaId
      );
      setData((prev) => ({
        ...prev,
        escola: escolaAtualizada,
      }));
      return true;
    }
    return false;
  }

  // Função para remover alimento que persiste os dados
  async function removerAlimento(escolaId, horarioId, alimentoIndex) {
    if (!allData) return false;

    const dadosAtualizados = await DataManager.removerAlimentoDeHorario(
      escolaId,
      horarioId,
      alimentoIndex,
      allData
    );

    if (dadosAtualizados) {
      setAllData(dadosAtualizados);
      // Atualiza também o estado local com a nova escola
      const escolaAtualizada = dadosAtualizados.escolas.find(
        (esc) => esc.id === escolaId
      );
      setData((prev) => ({
        ...prev,
        escola: escolaAtualizada,
      }));
      return true;
    }
    return false;
  }

  return (
    <GlobalContext.Provider
      value={{
        handleLogin,
        data,
        setData,
        codeAcess,
        setCodeAcess,
        matricula,
        setMatricula,
        allData,
        setAllData,
        adicionarAlimento,
        removerAlimento,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
