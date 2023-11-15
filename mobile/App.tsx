import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from './pages/home';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomePage}  options={{ headerShown: false }}/>
        <Stack.Screen name="Login" component={LoginPage}  options={{ headerShown: false }}/>
        <Stack.Screen name="Register" component={RegisterPage}  options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>

  );
}

