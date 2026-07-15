import React from "react";
import Login from "./pages/Login";
import { StorageServiceApi } from "./api/ContextServiceApi";
import { StorageGlobal } from "./context/GlobalContext";

export default function App() {
  return (
    <>
      <StorageServiceApi>
        <StorageGlobal>
          <Login />
        </StorageGlobal>
      </StorageServiceApi>
    </>
  );
}
