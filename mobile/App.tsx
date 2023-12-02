import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from './pages/home';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import MainPage from './pages/main_page';

const Stack = createNativeStackNavigator();
const apiUrl = "http://localhost:4000/api/v1"


const client = new ApolloClient({
  uri: apiUrl,
  cache: new InMemoryCache()
});

export default function App() {
  return (
    <ApolloProvider client={client}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomePage}  options={{ headerShown: false }}/>
        <Stack.Screen name="Login" component={LoginPage}  options={{ headerShown: false }}/>
        <Stack.Screen name="Register" component={RegisterPage}  options={{ headerShown: false }}/>
        <Stack.Screen name="MainPage" component={MainPage}  options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
    </ApolloProvider> 
  );
}

