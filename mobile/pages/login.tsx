import { useMutation } from '@apollo/client';
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LOGIN } from '../gql/login';

const LoginPage = ({ navigation }: {navigation:any}) => {
  const [loginEmail2, setloginEmail2] = useState('');
  const [loginPassword2, setloginPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signUp, {data, loading, error}] = useMutation(LOGIN);

  const handleLogin = async () => {
      const result = await signUp({
        variables: {loginEmail2, loginPassword2}
      });
    if(result.data.login.data != null){
      console.log(`${result.data.login.data.refreshToken}`)
      navigation.navigate('MainPage');
    }
    else{
      createCredentialAlert()
    }

  };
  const createCredentialAlert = () =>
  Alert.alert('Wrong credentials!', 'Email or password is incorrect', [
    {text: 'Try again', onPress: () => {console.log("zle dane")}},
  ]);

   const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  

return (
  <View style={styles.container}>
    <View>
      <Text style={styles.header}>Login</Text>
    </View>
    
    <TextInput
      style={styles.input}
      placeholder="Email"
      onChangeText={(text) => setloginEmail2(text)}
      value={loginEmail2}
      keyboardType="email-address"
    />
    <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          onChangeText={(text) => setloginPassword2(text)}
          value={loginPassword2}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity style={styles.showHideButton} onPress={togglePasswordVisibility}>
          <Text>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
    <TouchableOpacity  style={styles.button} onPress={handleLogin}>
      <Text>
          Login
      </Text>
    </TouchableOpacity>
  </View>
);
};

const styles = StyleSheet.create({
container: {
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  margin: 30,
  marginTop: 140,
},
header: {
  fontSize: 24,
  marginBottom: 20,
},
input: {
  display: 'flex',
  width: '80%',
  height: 50,
  borderColor: 'gray',
  borderRadius: 10,
  marginBottom: 30,
  padding: 10,
  backgroundColor: 'lightgray',
  
},
button: {
  display: 'flex',
  width: '80%',
  height: 50,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 25,
  margin: 20,
  backgroundColor: "orange",
},
passwordContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  width: '80%',
  marginBottom: 30,
  backgroundColor: "lightgray",
  borderRadius: 10
},
passwordInput: {
  flex: 1,
  height: 50,
  padding: 10,

},
showHideButton: {
  marginLeft: 10,
  padding: 10,
  backgroundColor: 'lightgray',
  borderTopRightRadius: 10,
  borderBottomRightRadius: 10,
  
},
});

export default LoginPage;