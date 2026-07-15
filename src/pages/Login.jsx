import React from "react";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View, TextInput } from "react-native";
import { ContextServiceApi } from "../api/ContextServiceApi";
import { GlobalContext } from "../context/GlobalContext";

export default function Login() {
 const  {
        handleLogin,
        escola,
        funcionario,
        codeAcess,
        setCodeAcess,
        matricula,
        setMatricula,
        data,
      } = React.useContext(GlobalContext)

  return (
    <View style={styles.container}>
      <h1>Login</h1>
      {data.escola && data.funcionario && (
        <Text>
          Escola: {data.escola.nome} | Funcionario: {data.funcionario.nome}
        </Text>
      )}

      <TextInput
        value={matricula}
        onChangeText={setMatricula}
        placeholder="Matricula"
      />
      <TextInput
        value={codeAcess}
        onChangeText={setCodeAcess}
        placeholder="Codigo Escola"
      />

      <Pressable onPress={() => handleLogin(codeAcess, matricula)}>
        <Text>Enviar</Text>
      </Pressable>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
