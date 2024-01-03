import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native'
import { useMutation } from '@apollo/client'
import { colors } from './color'
import { ADD_FLOWER } from '../gql/addFlower'


function AddPlantForm ({ navigation }: { navigation: any }): React.JSX.Element {
  const [name, setName] = useState('')
  const [frequencyHumidity, setFrequencyHumidity] = useState(300)
  const [maxHumidity, setMaxHumidity] = useState(100)
  const [minHumidity, setMinHumidity] = useState(0)
  const [frequencyTemperature, setFrequencyTemperature] = useState(300)
  const [maxTemperature, setMaxTemperature] = useState(40)
  const [minTemperature, setMinTemperature] = useState(0)

  const [addFlower, { data }] = useMutation(ADD_FLOWER)

  const handleSubmit = async () => {
    let result = await addFlower({
      variables: {
        input: {
          name: name,
          humidity: {
            frequency: frequencyHumidity,
            validRange: {
              max: maxHumidity,
              min: minHumidity
            }
          },
          temperature: {
            frequency: frequencyTemperature,
            validRange: {
              max: maxTemperature,
              min: minTemperature
            }
          }
        }
      }
    })
    console.log(result)
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>

      </View>
      <View style={styles.body}>
      <Text>Plant Name: </Text>
      <TextInput
        style={styles.input}
        placeholder="Plant Name"
        onChangeText={(text) => {
          setName(text)
        }}
        value={name}
      />
      <Text>Frequency of Humidity : </Text>
      <TextInput
        style={styles.input}
        placeholder="Frequency of Humidity"
        onChangeText={(text) => {
          if (text === '') {
            setFrequencyHumidity(0);
          } else {
            setFrequencyHumidity(parseInt(text));
          }
        }}
          value={frequencyHumidity.toString()}
        />
      <Text>Max Humidity : </Text>
      <TextInput
        style={styles.input}
        placeholder="Max Humidity"
        onChangeText={(text) => {
          if (text === '') {
            setMaxHumidity(0);
          }else{
          setMaxHumidity(parseInt(text))
          }
        }}
        value={maxHumidity.toString()}
      />
      <Text>Min Humidity : </Text>
      <TextInput
        style={styles.input}
        placeholder="Min Humidity"
        onChangeText={(text) => {
          if (text === '') {
            setMinHumidity(0);
          }else{
          setMinHumidity(parseInt(text))
          }
        }}
        value={minHumidity.toString()}
      />
      <Text>Frequency of Temperature : </Text>
      <TextInput
        style={styles.input}
        placeholder="Frequency of  Temperature"
        onChangeText={(text) => {
          if (text === '') {
            setFrequencyTemperature(0);
          }else{
            setFrequencyTemperature(parseInt(text))
          }
        }}
        value={frequencyTemperature.toString()}
      />
      <Text>Max Temperature : </Text>
      <TextInput
        style={styles.input}
        placeholder="Max Temperature"
        onChangeText={(text) => {
          if (text === '') {
            setMaxTemperature(0);
          }else{
          setMaxTemperature(parseInt(text))
          }
        }}
        value={maxTemperature.toString()}
      />
      <Text>Min Temperature : </Text>
      <TextInput
        style={styles.input}
        placeholder="Min Temperature"
        onChangeText={(text) => {
          if (text === '') {
            setMinTemperature(0);
          }else{
          setMinTemperature(parseInt(text))
          }
        }}
        value={minTemperature.toString()}
      />
      <TouchableOpacity
        style={styles.submitButton}
        onPress={async () => {
          await handleSubmit();
          navigation.navigate('MainPage');
        }}
      >
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
      </View>
      <View style={styles.bottom}></View>
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
  },
  headerFont: {
    fontSize: 24,
    marginBottom: 20
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    display: 'flex',
    flexDirection: 'row',
    flex: 0.10,
    justifyContent: 'space-between',
    width: '100%'
  },
  body: {
    alignItems: 'center',
    display: 'flex',
    flex: 0.8,
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
  },
  bottom: {
    alignItems: 'center',
    display: 'flex',
    flex: 0.1,
    width: '100%',
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
    padding: 10,
    margin: 15,
    height: 40,
  },
  submitButtonText: {
    color: colors.white,
    textAlign: 'center'
  }
})

export default AddPlantForm
