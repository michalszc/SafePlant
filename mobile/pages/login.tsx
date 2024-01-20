import { useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native'
import { setCredentials } from '../credentials'
import { LOGIN } from '../gql/login'
import { colors } from './color'

const LoginPage = ({ navigation }: { navigation: any }): React.JSX.Element => {
  const [loginEmail2, setloginEmail2] = useState('')
  const [loginPassword2, setloginPassword2] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [login] = useMutation(LOGIN)

  const handleLogin = async (): Promise<void> => {
    const result = await login({
      variables: { loginEmail2, loginPassword2 }
    })
    try {
      if (result.data.login.data != null) {
        const keys = result.data.login.data
        await setCredentials(keys)
        navigation.navigate('MainPage')
      }
    } catch {}
  }

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword)
  }

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.header}>Login</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={(text) => {
          setloginEmail2(text)
        }}
        value={loginEmail2}
        keyboardType="email-address"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          onChangeText={(text) => {
            setloginPassword2(text)
          }}
          value={loginPassword2}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity style={styles.showHideButton} onPress={togglePasswordVisibility}>
          <Text>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin} /* eslint-disable-line @typescript-eslint/no-misused-promises */
      >
        <Text>Login</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: 25,
    display: 'flex',
    height: 50,
    justifyContent: 'center',
    margin: 20,
    width: '80%'
  },
  container: {
    alignItems: 'center',
    display: 'flex',
    flex: 1,
    margin: 30,
    marginTop: 140
  },
  header: {
    fontSize: 24,
    marginBottom: 20
  },
  input: {
    backgroundColor: colors.lightgray,
    borderColor: colors.gray,
    borderRadius: 10,
    display: 'flex',
    height: 50,
    marginBottom: 30,
    padding: 10,
    width: '80%'
  },
  passwordContainer: {
    alignItems: 'center',
    backgroundColor: colors.lightgray,
    borderRadius: 10,
    flexDirection: 'row',
    marginBottom: 30,
    width: '80%'
  },
  passwordInput: {
    flex: 1,
    height: 50,
    padding: 10
  },
  showHideButton: {
    backgroundColor: colors.lightgray,
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
    marginLeft: 10,
    padding: 10
  }
})

export default LoginPage
