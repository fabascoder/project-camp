import React from "react";
import { ContextServiceApi } from "../api/ContextServiceApi";

export const GlobalContext = React.createContext();

export const StorageGlobal = ({ children }) => {
  const API = React.useContext(ContextServiceApi);

  const [codeAcess, setCodeAcess] = React.useState("");
  const [matricula, setMatricula] = React.useState("");
  const [data, setData] = React.useState({
    perfil: null,
    escola: null,
    funcionario: null,
    nutricionista: null,
    alimentosGlobais: [],
  });

  function handleLogin(codigo, matricula) {
    if (!String(codigo || "").trim() || !String(matricula || "").trim()) {
      return {
        ok: false,
        message: "Preencha o código da escola e a matrícula.",
      };
    }

    const escola = API.escolas.find((esc) => esc.codAcesso === Number(codigo));

    if (!escola) {
      return {
        ok: false,
        message: "Código da escola não encontrado. Verifique o código e tente novamente.",
      };
    }

    const funcionario = escola.funcionarios.find(
      (func) => func.matricula === Number(matricula),
    );

    if (!funcionario) {
      return {
        ok: false,
        message: `Matrícula não encontrada em ${escola.nome}. Verifique o número e tente novamente.`,
      };
    }

    setData({
      perfil: "cozinheira",
      escola,
      funcionario,
      nutricionista: null,
      alimentosGlobais: API.alimentosGlobais,
    });
    return { ok: true, message: "" };
  }

  function handleLoginNutricionista(codigo, senha) {
    if (!String(codigo || "").trim() || !String(senha || "").trim()) {
      return {
        ok: false,
        message: "Preencha o código de acesso e a senha.",
      };
    }

    const nutricionista = (API.nutricionistas || []).find(
      (item) => item.codAcesso === Number(codigo),
    );

    if (!nutricionista) {
      return {
        ok: false,
        message: "Código de acesso não encontrado. Verifique e tente novamente.",
      };
    }

    if (String(nutricionista.senha) !== String(senha)) {
      return {
        ok: false,
        message: "Senha incorreta. Verifique e tente novamente.",
      };
    }

    setData({
      perfil: "nutricionista",
      escola: null,
      funcionario: null,
      nutricionista,
      alimentosGlobais: API.alimentosGlobais,
    });
    return { ok: true, message: "" };
  }

  function logout() {
    setCodeAcess("");
    setMatricula("");
    setData({
      perfil: null,
      escola: null,
      funcionario: null,
      nutricionista: null,
      alimentosGlobais: [],
    });
  }

  return (
    <GlobalContext.Provider
      value={{
        handleLogin,
        handleLoginNutricionista,
        logout,
        data,
        setData,
        codeAcess,
        setCodeAcess,
        matricula,
        setMatricula,
        escolas: API.escolas,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
