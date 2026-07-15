import React, { Children } from "react";
import { ContextServiceApi } from "../api/ContextServiceApi";

export const GlobalContext = React.createContext();

export const StorageGlobal = ({ children }) => {
  const API = React.useContext(ContextServiceApi);

  const [codeAcess, setCodeAcess] = React.useState("");
  const [matricula, setMatricula] = React.useState("");
  const [data, setData] = React.useState({
    escola: null,
    funcionario: null,
  });

  function handleLogin(codigo, matricula) {
    const escola = API.escola.find((esc) => esc.codAcesso === Number(codigo));

    if (!escola) return;

    const funcionario = escola.funcionarios.find(
      (func) => func.matricula === Number(matricula),
    );

    if (!funcionario) return;

    console.log(escola.nome);
    console.log(funcionario.nome);

    setData({
      escola,
      funcionario,
    });
  }

  return (
    <GlobalContext.Provider
      value={{
        handleLogin,
        data,
        codeAcess,
        setCodeAcess,
        matricula,
        setMatricula,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
