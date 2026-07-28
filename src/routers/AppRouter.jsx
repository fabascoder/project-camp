import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Horarios from "../pages/Horarios";
import Planilhas from "../pages/Planilhas";
import Refeicoes from "../pages/Refeicoes";

const Stack = createNativeStackNavigator();

export default function AppRoutes() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#2563eb",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 18,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ title: "Início" }}
        />
        <Stack.Screen
          name="Horarios"
          component={Horarios}
          options={{ title: "Horários" }}
        />
        <Stack.Screen
          name="Planilhas"
          component={Planilhas}
          options={{ title: "Planilhas" }}
        />
        <Stack.Screen
          name="Refeicoes"
          component={Refeicoes}
          options={{ title: "Refeições" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
