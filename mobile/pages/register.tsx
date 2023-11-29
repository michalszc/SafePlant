import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useMutation } from '@apollo/client';
import { SIGN_UP_MUTATION } from '../gql/signup';

const RegisterPage = ({ navigation }: {navigation:any}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signUp, {data, loading, error}] = useMutation(SIGN_UP_MUTATION);

  const handleRegistration = async () => {
    const result = await signUp({
      variables: {email, password, name}
    })
    console.log("udalo sie:" + email + password + name)
    navigation.navigate('MainPage');

  };
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
      onChangeText={(text) => setEmail(text)}
      value={email}
      keyboardType="email-address"
    />
    <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity style={styles.showHideButton} onPress={togglePasswordVisibility}>
          <Text>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
      <TextInput
      style={styles.input}
      placeholder="name"
      onChangeText={(text) => setName(text)}
      value={name}
    />
    <TouchableOpacity  style={styles.button} onPress={handleRegistration}>
      <Text>
          Sign up
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

export default RegisterPage;