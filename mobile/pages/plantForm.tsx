import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useMutation } from '@apollo/client'
import { colors } from './color'
import { ADD_FLOWER } from '../gql/addFlower'
import { getDevice, removeDevice } from '../credentials'
import Flower  from "./flowerInterface"


function AddPlantForm ({ navigation }: { navigation: any }): React.JSX.Element {
  const [name, setName] = useState('')
    const [frequencyHumidity, setFrequencyHumidity] = useState("")
    const [maxHumidity, setMaxHumidity] = useState("")
    const [minHumidity, setMinHumidity] = useState("")
    const [frequencyTemperature, setFrequencyTemperature] = useState("")
    const [maxTemperature, setMaxTemperature] = useState("")
    const [minTemperature, setMinTemperature] = useState("")

  const [addFlower, { data }] = useMutation(ADD_FLOWER)

  const getNewFlower = () => {
    const newFrequencyHumidity = parseInt(frequencyHumidity)
    const newMaxHumidity = parseInt(maxHumidity)
    const newMinHumidity = parseInt(minHumidity)
    const newFrequencyTemperature = parseInt(frequencyTemperature)
    const newMaxTemperature = parseInt(maxTemperature)
    const newMinTemperature = parseInt(minTemperature)
    if(isNaN(newFrequencyHumidity) || isNaN(newMaxHumidity) || isNaN(newMinHumidity) || isNaN(newFrequencyTemperature) || isNaN(newMaxTemperature) || isNaN(newMinTemperature)) {   
        alert("Please enter valid numbers")
        return null;
    } else {
        const newFlower:Flower = {
            name: name,
            humidity: {
                frequency: newFrequencyHumidity,
                validRange: {
                max: newMaxHumidity,
                min: newMinHumidity
                }
            },
            temperature: {
                frequency: newFrequencyTemperature,
                validRange: {
                max: newMaxTemperature,
                min: newMinTemperature
                }
        }
    }
    return newFlower
  }
}

  const handleSubmit = async () => {
    const flower = getNewFlower()
    if(flower === null) return;
    let result = await addFlower({
      variables: {
        input: flower
      }
    })
    console.log(result)
    navigation.navigate('MainPage');
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>SafePlant</Text>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
      <Text>Plant Name: </Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => {
          setName(text)
        }}
        value={name}
      />
      <Text>Frequency of Humidity : </Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => {
        setFrequencyHumidity(text);
        }}
          value={frequencyHumidity}
        />
      <Text>Max Humidity : </Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => {
          setMaxHumidity(text)
        }}
        value={maxHumidity}
      />
      <Text>Min Humidity : </Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => {
          setMinHumidity(text)
        }}
        value={minHumidity}
      />
      <Text>Frequency of Temperature : </Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => {
        setFrequencyTemperature(text)
        }}
        value={frequencyTemperature}
      />
      <Text>Max Temperature : </Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => {
          setMaxTemperature(text)
        }}
        value={maxTemperature}
      />
      <Text>Min Temperature : </Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => {
          setMinTemperature(text)
        }}
        value={minTemperature}
      />
      </ScrollView>
      <View style={styles.bottom}>
      <TouchableOpacity
        style={styles.submitButton}
        onPress={async () => {
          await handleSubmit();
        }}
      >
        <Text style={styles.submitButtonText}>Add Flower</Text>
      </TouchableOpacity>
      </View>
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


export default AddPlantForm
