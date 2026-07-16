import React from "react";
import { View, StyleSheet, Text, Pressable } from "react-native-web";
import { GlobalContext } from "../context/GlobalContext";

export const Home = () => {
  const dataContext = React.useContext(GlobalContext);
  console.log(dataContext.data.escola.horarios);

  function handleHorario({ target }) {
    console.log(target);
  }

  return (
    <View style={styles.container}>
      {dataContext.data.escola && dataContext.data.funcionario && (
        <View>
          <Text>Olá, {dataContext.data.funcionario.nome}</Text>
          <View>
            {dataContext.data.escola.horarios.map((escola) => {
              return (
                <View key={escola.id}>
                  <Pressable onPress={handleHorario}>
                    <Text>
                      {escola.nome} Inicio: {escola.inicio} fim: {escola.fim}
                    </Text>
                    <Text>Amostra: {escola.horarioAmostra}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      )}
      <View></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Home;
