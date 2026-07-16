import React from "react";
import  AppRoutes from "./routers/AppRouter";
import { StorageServiceApi } from "./api/ContextServiceApi";
import { StorageGlobal } from "./context/GlobalContext";
import { View, StyleSheet} from "react-native";
import { StatusBar } from "expo-status-bar";


export default function App() {
  return (
    <>
      <StorageServiceApi>
        <StorageGlobal>
            <AppRoutes />
          
        </StorageGlobal>
      </StorageServiceApi>
    </>
  );
}
