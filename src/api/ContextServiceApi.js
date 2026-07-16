import React from "react";
import escola from "./escola.json";

export const ContextServiceApi = React.createContext();

export const StorageServiceApi = ({ children }) => {
  return (
    <ContextServiceApi.Provider value={escola}>
      {children}
    </ContextServiceApi.Provider>
  );
};