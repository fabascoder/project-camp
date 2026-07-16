import React, { Children } from "react";
import escola from "./escola.json";
export const ContextServiceApi = React.createContext();

export const StorageServiceApi = ({ children }) => {
  console.log(escola);
  return (
    <ContextServiceApi.Provider value={{ escola }}>
      {children}
    </ContextServiceApi.Provider>
  );
};
