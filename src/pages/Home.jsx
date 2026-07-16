import React from "react";
import { View, StyleSheet, Text } from "react-native-web";
import { GlobalContext } from "../context/GlobalContext";

export const Home = () => {
  const dataContext = React.useContext(GlobalContext);

  return (
    <View style={styles.container}>
      {dataContext.data.escola && dataContext.data.funcionario && (
        <Text>
          Escola: {dataContext.data.escola.nome} | Funcionario:{" "}
          {dataContext.data.funcionario.nome}
        </Text>
      )}
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
