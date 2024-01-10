import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, ScrollView } from 'react-native'
import { colors } from './color'
import {writeCharacteristic} from "../ble"
import { Device } from 'react-native-ble-plx'
import { useQuery } from '@apollo/client'
import { GET_USER } from '../gql/user'
import { useFocusEffect } from '@react-navigation/native'

function SendWifiForm({ navigation, route }: { navigation: any, route:any }): React.JSX.Element {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { loading, error, data, refetch } = useQuery(GET_USER)

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword)
  }
  useFocusEffect(
    React.useCallback(() => {
      refetch()
    }, [])
  );
  
  const device:Device = route.params.device
  const handleSubmit = async () => {
    device
    .connect({requestMTU: 64})
    .then(async  (connectedDevice: Device) => {
      console.log(data.user.id)
      writeCharacteristic(connectedDevice, "fe", name)
      writeCharacteristic(connectedDevice, "ce", password)
      writeCharacteristic(connectedDevice, "de", data.user.id)
    })
    .catch((error: any) => {
      console.log(error)
  })
  }

  return (
    <KeyboardAvoidingView style={styles.container}>
        <View style={styles.header}>
        <Text style={styles.name}>SafePlant</Text>
        </View>
      <ScrollView contentContainerStyle={styles.body}>
      <View>
        <Text style={styles.headerFont}>Send Wifi Credentials to the device</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Wifi name"
        onChangeText={(text) => {
          setName(text)
        }}
        value={name}
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
      </ScrollView>
      <View style={styles.bottom}>
      <TouchableOpacity style={styles.submitButton} onPress={ async () => {
        console.log(device.name)
        await handleSubmit();
        navigation.navigate("AddPlantForm");
      }}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
      display: 'flex',
      flex: 1,
    },
    headerFont: {
      fontSize: 24,
      marginBottom: 20,
    },
    header: {
      alignItems: 'center',
      backgroundColor: colors.orange,
      display: 'flex',
      flexDirection: 'row',
      height: 100,
      justifyContent: 'center',
      width: '100%'
    },
    body: {
      display: 'flex',
      flexGrow: 0,
      marginTop: 20,
      alignItems: 'center',
    },
    bottom: {
      alignItems: 'center',
      display: 'flex',
      width: '100%',
      height: 100,
      backgroundColor: colors.orange,
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
    },
    submitButton: {
      backgroundColor: colors.orange,
      borderColor: colors.white,
      borderWidth: 2,
      borderRadius: 20,
      padding: 10,
      margin: 20,
      zIndex: 3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitButtonText: {
      display: 'flex',
      color: colors.white,
      textAlign: 'center',
      fontSize: 26,
    },
    name: {
        fontSize: 45
      },
  })

export default SendWifiForm;
