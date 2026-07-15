import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import escola from './api/escola.json'

export default function App() {
  const [api, setApi] = React.useState([])

   React.useEffect(() => {
    setApi(escola)
  }, []);

  console.log(Array.isArray(api))
  const escolaFinded = api.find(esc => esc.codAcesso === 1233)
  console.log()

  return (
    <View style={styles.container}>
      {escolaFinded && <Text>{escolaFinded.nome}</Text>}
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
