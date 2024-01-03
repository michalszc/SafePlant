import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { requestBluetoothPermission, scanForDevices } from '../ble'
import { Device } from 'react-native-ble-plx'

const BluetoothDevices: React.FC = () => {
    const [devices, setDevices] = useState<Device[]>([]) // Provide an initial value for the devices state variable
    const [loading, setLoading] = useState(true) // Add a loading state variable

    useEffect(() => {
        const fetchDevices = async () => {
            requestBluetoothPermission()
            const scannedDevices = await scanForDevices()
            setDevices(Array.from(scannedDevices)) // Convert the Set to an Array before setting it as the state value
            setLoading(false) // Set loading to false after devices are fetched
        }
        fetchDevices()

    }, [])

    return (
        <View style={styles.container}>
            {loading ? ( // Render the loading animation if loading is true
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (
                <FlatList
                    data={devices}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.item}>
                            <Text style={styles.title}>{item.name}</Text>
                            <Text style={styles.subtitle}>{item.id}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
       
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    item: {
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    title: {
        fontSize: 32,
    },
    subtitle: {
        fontSize: 24,
    },
})

export default BluetoothDevices