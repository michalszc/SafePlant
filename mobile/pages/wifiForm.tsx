import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, ScrollView } from 'react-native';
import { colors } from './color';
import { writeCharacteristic } from '../ble';
import { type Device } from 'react-native-ble-plx';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../gql/user';
import { useFocusEffect } from '@react-navigation/native';

function SendWifiForm({ navigation, route }: { navigation: any, route: any }): React.JSX.Element {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { data, refetch } = useQuery(GET_USER);

    const togglePasswordVisibility = (): void => {
        setShowPassword(!showPassword);
    };

    useFocusEffect(
        useCallback(() => {
            refetch().catch((error: Error) => {
                console.log(error);
            });
        }, [])
    );

    const device: Device = route.params.device;
    const handleSubmit = async (): Promise<void> => {
        device
            .connect({ requestMTU: 64 })
            .then(async (connectedDevice: Device) => {
                console.log(data.user.id);
                writeCharacteristic(connectedDevice, 'fe', name);
                writeCharacteristic(connectedDevice, 'ce', password);
                writeCharacteristic(connectedDevice, 'de', data.user.id);
            })
            .catch((error: Error) => {
                console.log(error);
            });
    };

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
                        setName(text);
                    }}
                    value={name}
                />
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Password"
                        onChangeText={(text) => {
                            setPassword(text);
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
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={async () => {
                        /* eslint-disable-line @typescript-eslint/no-misused-promises */
                        console.log(device.name);
                        await handleSubmit();
                        navigation.navigate('AddPlantForm');
                    }}
                >
                    <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
    headerFont: {
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
    name: {
        fontSize: 45
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

export default SendWifiForm;
