import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useMutation, useQuery } from '@apollo/client';
import { colors } from './color';
import { GET_FLOWER } from '../gql/getOneFlower';
import type Flower from '../types/flowerInterface';
import { UPDATE_FLOWER } from '../gql/updateFlower';
import { useFocusEffect } from '@react-navigation/native';

function EditPlantForm({ navigation, route }: { navigation: any, route: any }): React.JSX.Element {
    const id = route.params.id;
    console.log(id);
    const { loading, error, data, refetch } = useQuery(GET_FLOWER, {
        variables: { flowerId: id }
    });
    const [name, setName] = useState('');
    const [frequencyHumidity, setFrequencyHumidity] = useState('');
    const [maxHumidity, setMaxHumidity] = useState('');
    const [minHumidity, setMinHumidity] = useState('');
    const [frequencyTemperature, setFrequencyTemperature] = useState('');
    const [maxTemperature, setMaxTemperature] = useState('');
    const [minTemperature, setMinTemperature] = useState('');
    const [updateFlower] = useMutation(UPDATE_FLOWER);
    useFocusEffect(
        React.useCallback(() => {
            refetch().catch((error: Error) => {
                console.log(error);
            });
        }, [])
    );
    const flower = data?.flower;
    useEffect(() => {
        if (flower != null) {
            console.log('Query: ', data.flower);
            // console.log("Flower: ",flower)
            setName(flower.name);
            setFrequencyHumidity(flower.humidity.frequency.toString());
            setMaxHumidity(flower.humidity.validRange.max.toString());
            setMinHumidity(flower.humidity.validRange.min.toString());
            setFrequencyTemperature(flower.temperature.frequency.toString());
            setMaxTemperature(flower.temperature.validRange.max.toString());
            setMinTemperature(flower.temperature.validRange.min.toString());
            console.log('Done');
        }
    }, [flower]);
    if (loading) return <Text>Loading...</Text>; /* eslint-disable-line @typescript-eslint/strict-boolean-expressions */
    if (error) return <Text>Error...</Text>; /* eslint-disable-line @typescript-eslint/strict-boolean-expressions */

    const getNewFlower = (): Flower | null => {
        const newFrequencyHumidity = parseInt(frequencyHumidity);
        const newMaxHumidity = parseInt(maxHumidity);
        const newMinHumidity = parseInt(minHumidity);
        const newFrequencyTemperature = parseInt(frequencyTemperature);
        const newMaxTemperature = parseInt(maxTemperature);
        const newMinTemperature = parseInt(minTemperature);
        if (
            isNaN(newFrequencyHumidity) ||
      isNaN(newMaxHumidity) ||
      isNaN(newMinHumidity) ||
      isNaN(newFrequencyTemperature) ||
      isNaN(newMaxTemperature) ||
      isNaN(newMinTemperature)
        ) {
            alert('Please enter valid numbers');

            return null;
        } else {
            if (newMinHumidity > newMaxHumidity) {
                alert('Min humidity cannot be greater than max humidity');

                return null;
            }
            if (newMinTemperature > newMaxTemperature) {
                alert('Min temperature cannot be greater than max temperature');

                return null;
            }
            if (newMaxHumidity > 100) {
                alert('Max humidity cannot be greater than 100');

                return null;
            }
            if (newMinHumidity < 0) {
                alert('Min humidity cannot be less than 0');

                return null;
            }
            const newFlower: Flower = {
                name,
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
            };

            return newFlower;
        }
    };

    const handleSubmit = async (): Promise<void> => {
        const newFlower = getNewFlower();
        if (newFlower == null) return;
        const result = await updateFlower({
            variables: {
                updateFlowerId: id,
                input: newFlower
            }
        });
        navigation.navigate('MainPage');
        console.log(result);
    };

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
                        setName(text);
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
                        setMaxHumidity(text);
                    }}
                    value={maxHumidity}
                />
                <Text>Min Humidity : </Text>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => {
                        setMinHumidity(text);
                    }}
                    value={minHumidity}
                />
                <Text>Frequency of Temperature : </Text>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => {
                        setFrequencyTemperature(text);
                    }}
                    value={frequencyTemperature}
                />
                <Text>Max Temperature : </Text>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => {
                        setMaxTemperature(text);
                    }}
                    value={maxTemperature}
                />
                <Text>Min Temperature : </Text>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => {
                        setMinTemperature(text);
                    }}
                    value={minTemperature}
                />
            </ScrollView>
            <View style={styles.bottom}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={async () => {
                        /* eslint-disable-line @typescript-eslint/no-misused-promises */
                        await handleSubmit();
                    }}
                >
                    <Text style={styles.submitButtonText}>Update Flower</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    body: {
        alignItems: 'center',
        display: 'flex',
        flexGrow: 0,
        marginTop: 20
    },
    bottom: {
        alignItems: 'center',
        backgroundColor: colors.orange,
        display: 'flex',
        height: 100,
        width: '100%'
    },
    container: {
        display: 'flex',
        flex: 1
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
    name: {
        fontSize: 45
    },

    submitButton: {
        alignItems: 'center',
        backgroundColor: colors.orange,
        borderColor: colors.white,
        borderRadius: 20,
        borderWidth: 2,
        display: 'flex',
        justifyContent: 'center',
        margin: 20,
        padding: 10,
        zIndex: 3
    },
    submitButtonText: {
        color: colors.white,
        display: 'flex',
        fontSize: 26,
        textAlign: 'center'
    }
});

export default EditPlantForm;
