import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginPage from './pages/login';
import { AppRegistry } from 'react-native';
import RegisterPage from './pages/register';
import { ApolloClient, createHttpLink, InMemoryCache, ApolloProvider } from '@apollo/client';
import MainPage from './pages/mainPage';
import { getCredentials } from './credentials';
import React from 'react';
import AddPlantForm from './pages/plantForm';
import { setContext } from '@apollo/client/link/context';
import HomePage from './pages/home';
import { API_URL } from './config';
import SendWifiForm from './pages/wifiForm';
import EditPlantForm from './pages/EditPlantPage';
import StartingPage from './pages/startingPage';

const Stack = createNativeStackNavigator();
const httpLink = createHttpLink({
    uri: API_URL
});

export default function App(): React.JSX.Element {
    let client;
    try {
        const authLink = setContext(async (_, { headers }) => {
            const token = await getCredentials();
            if (token != null) {
                return {
                    headers: {
                        ...headers,
                        authorization: `Bearer ${token.accessToken}`
                    }
                };
            }
        });
        client = new ApolloClient({
            link: authLink.concat(httpLink),
            cache: new InMemoryCache()
        });
    } catch {
        client = new ApolloClient({
            uri: API_URL,
            cache: new InMemoryCache()
        });
    }

    return (
        <ApolloProvider client={client}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="StartingPage">
                    <Stack.Screen name="StartingPage" component={StartingPage} options={{ headerShown: false }} />
                    <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
                    <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }} />
                    <Stack.Screen name="Register" component={RegisterPage} options={{ headerShown: false }} />
                    <Stack.Screen name="MainPage" component={MainPage} options={{ headerShown: false }} />
                    <Stack.Screen name="SendWifiForm" component={SendWifiForm} options={{ headerShown: false }} />
                    <Stack.Screen name="AddPlantForm" component={AddPlantForm} options={{ headerShown: false }} />
                    <Stack.Screen name="EditPlantForm" component={EditPlantForm} options={{ headerShown: false }} />
                </Stack.Navigator>
            </NavigationContainer>
        </ApolloProvider>
    );
}
AppRegistry.registerComponent('Safeplant', () => App);
