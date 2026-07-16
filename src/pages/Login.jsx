import React from "react";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View, TextInput } from "react-native";
import { ContextServiceApi } from "../api/ContextServiceApi";
import { GlobalContext } from "../context/GlobalContext";
import { useNavigation } from "@react-navigation/native";

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


      const navigation = useNavigation()

  function entrar() {
    const sucesso = handleLogin(codeAcess, matricula); 

    if(sucesso) {
        navigation.navigate("Home")
    }
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 32 }}>Login</Text>
      {/* {data.escola && data.funcionario && (
        <Text>
          Escola: {data.escola.nome} | Funcionario: {data.funcionario.nome}
        </Text>
      )} */}

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

      <Pressable onPress={entrar}>
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
