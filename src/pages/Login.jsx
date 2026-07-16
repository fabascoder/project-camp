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
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          value={matricula}
          onChangeText={setMatricula}
          placeholder="Matricula"
        />
        <TextInput
          style={styles.input}
          value={codeAcess}
          onChangeText={setCodeAcess}
          placeholder="Codigo Escola"
        />

        <Pressable style={styles.button} onPress={entrar}>
          <Text style={styles.buttonText}>Enviar</Text>
        </Pressable>
      </View>
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
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 500,
    padding: 20,
    borderWidth: 1,
    borderColor: "#000",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    padding: 12,
    marginBottom: 12,
  },
  button: {
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "700",
    color: "#000",
  },
});
