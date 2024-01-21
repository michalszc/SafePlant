import React, { useCallback, useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native'
import { useMutation } from '@apollo/client'
import { SIGN_UP_MUTATION } from '../gql/signup'
import { setCredentials } from '../credentials'
import { colors } from './color'

const RegisterPage = ({ navigation }: { navigation: any }): React.JSX.Element => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [signUp] = useMutation(SIGN_UP_MUTATION)

  const handleRegistration = useCallback(async (): Promise<void> => {
    const result = await signUp({
      variables: { email, password, name }
    })
    try {
      if (result.data.signUp.data != null) {
        console.log(result)
        const keys = result.data.signUp.data
        await setCredentials(keys)
        navigation.navigate('MainPage')
      }
    } catch (error) {
      console.log('error:', error)
    }
  }, [email, password, name, signUp, navigation])
  const togglePasswordVisibility = (): void => {
    setShowPassword(p => !p)
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
          setEmail(text)
        }}
        value={email}
        keyboardType="email-address"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          onChangeText={(text) => {
            setPassword(text)
          }}
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
        onChangeText={(text) => {
          setName(text)
        }}
        value={name}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleRegistration} /* eslint-disable-line @typescript-eslint/no-misused-promises */
      >
        <Text>Sign up</Text>
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

export default RegisterPage
