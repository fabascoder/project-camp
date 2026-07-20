import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Horarios from "../pages/Horarios";
import Planilhas from "../pages/Planilhas";

const Stack = createNativeStackNavigator();

export default function AppRoutes() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Horarios" component={Horarios} />
        <Stack.Screen name="Planilhas" component={Planilhas} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}