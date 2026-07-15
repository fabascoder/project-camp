import React from "react";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View, TextInput } from "react-native";
import escola from "./api/escola.json";

export default function App() {
  const [codeAcess, setCodeAcess] = React.useState("");
  const [matricula, setMatricula] = React.useState("");
  const [data, setData] = React.useState({
    escola: null,
    funcionario: null,
  });
  const [api, setApi] = React.useState([]);

  React.useEffect(() => {
    setApi(escola);
  }, []);

  function handleClick(codigo, matricula) {
    const escola = api.find((esc) => esc.codAcesso === Number(codigo));

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
    <View style={styles.container}>
      <h1>Login</h1>
        {data.escola && data.funcionario && (
          <Text>Escola: {data.escola.nome} | Funcionario: {data.funcionario.nome}</Text>
        ) }
      
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

      <Pressable onPress={() => handleClick(codeAcess, matricula)}>
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
