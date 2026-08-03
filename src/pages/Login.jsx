import React from "react";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View, TextInput } from "react-native";
import { GlobalContext } from "../context/GlobalContext";
import { useNavigation } from "@react-navigation/native";
import { colors, commonStyles, radius } from "../theme/theme";
import { Segmented } from "../components/Segmented";

const PERFIS = [
  { key: "cozinheira", label: "Cozinheira" },
  { key: "nutricionista", label: "Nutricionista" },
];

export default function Login() {
  const {
    handleLogin,
    handleLoginNutricionista,
    codeAcess,
    setCodeAcess,
    matricula,
    setMatricula,
  } = React.useContext(GlobalContext);

  const [perfil, setPerfil] = React.useState("cozinheira");
  const [codigoNutri, setCodigoNutri] = React.useState("");
  const [senhaNutri, setSenhaNutri] = React.useState("");
  const [erro, setErro] = React.useState("");

  const navigation = useNavigation();

  function entrar() {
    if (perfil === "cozinheira") {
      const resultado = handleLogin(codeAcess, matricula);
      if (resultado?.ok) {
        setErro("");
        navigation.navigate("Home");
      } else {
        setErro(resultado?.message || "Não foi possível entrar. Verifique os dados.");
      }
      return;
    }

    const resultado = handleLoginNutricionista(codigoNutri, senhaNutri);
    if (resultado?.ok) {
      setErro("");
      navigation.navigate("HomeNutricionista");
    } else {
      setErro(resultado?.message || "Não foi possível entrar. Verifique os dados.");
    }
  }

  return (
    <View style={commonStyles.screenCentered}>
      <View style={commonStyles.card}>
        <Text style={commonStyles.title}>Bem-vindo(a)</Text>
        <Text style={commonStyles.subtitle}>
          Selecione seu perfil e informe seus dados de acesso.
        </Text>

        <Segmented
          options={PERFIS}
          value={perfil}
          onChange={(value) => {
            setPerfil(value);
            setErro("");
          }}
        />

        {erro ? (
          <View style={commonStyles.errorBanner}>
            <Text style={commonStyles.errorBannerText}>{erro}</Text>
          </View>
        ) : null}

        {perfil === "cozinheira" ? (
          <>
            <TextInput
              style={commonStyles.input}
              value={matricula}
              onChangeText={(text) => {
                setMatricula(text);
                if (erro) setErro("");
              }}
              placeholder="Matrícula"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
            <TextInput
              style={commonStyles.input}
              value={codeAcess}
              onChangeText={(text) => {
                setCodeAcess(text);
                if (erro) setErro("");
              }}
              placeholder="Código da escola"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </>
        ) : (
          <>
            <TextInput
              style={commonStyles.input}
              value={codigoNutri}
              onChangeText={(text) => {
                setCodigoNutri(text);
                if (erro) setErro("");
              }}
              placeholder="Código de acesso"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
            <TextInput
              style={commonStyles.input}
              value={senhaNutri}
              onChangeText={(text) => {
                setSenhaNutri(text);
                if (erro) setErro("");
              }}
              placeholder="Senha"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />
          </>
        )}

        <Pressable style={styles.button} onPress={entrar}>
          <Text style={commonStyles.buttonText}>Entrar</Text>
        </Pressable>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    ...commonStyles.button,
    borderRadius: radius.sm,
  },
});
