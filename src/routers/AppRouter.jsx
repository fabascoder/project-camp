import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Horarios from "../pages/Horarios";
import Planilhas from "../pages/Planilhas";
import Dashboard from "../pages/Dashboard";
import HomeNutricionista from "../pages/HomeNutricionista";
import EscolaNutricionista from "../pages/EscolaNutricionista";

const Stack = createNativeStackNavigator();

export default function AppRoutes() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Horarios" component={Horarios} />
        <Stack.Screen name="Planilhas" component={Planilhas} />
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{ title: "Dashboard" }}
        />
        <Stack.Screen
          name="HomeNutricionista"
          component={HomeNutricionista}
          options={{ title: "Escolas" }}
        />
        <Stack.Screen
          name="EscolaNutricionista"
          component={EscolaNutricionista}
          options={{ title: "Escola" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}