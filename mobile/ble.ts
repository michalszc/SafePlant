import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { BleManager, type Characteristic, type Device, type Service } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

export const manager = new BleManager();

const decode = (str: string): string => Buffer.from(str, 'base64').toString('binary');
const encode = (str: string): string => Buffer.from(str, 'binary').toString('base64');

export const requestBluetoothPermission = async (): Promise<any> => {
    if (Platform.OS === 'android' && PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION) {
        const apiLevel = parseInt(Platform.Version.toString(), 10);

        if (apiLevel < 31) {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN && PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT) {
            const result = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            ]);

            return (
                result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
            );
        }
    }

    Alert.alert('Permission have not been granted');

    return false;
};

const scanOptions = {
    legacyScan: false, // Set legacy to false to enable Bluetooth 5 Advertising Extension
    allowDuplicates: false
};

export async function scanForDevices(): Promise<Set<Device>> {
    const devices = new Set<Device>();
    let devicesIDs = new Set<string>();

    return await new Promise((resolve, reject) => {
        manager.startDeviceScan(null, scanOptions, (error, device) => {
            if (error != null) {
                // Handle error
                console.error('Error during scanning:', error);
                reject(error);

                return;
            }
            // Check if device exists and add it to the set
            if (device != null) {
                console.log('Device found:', device.id);
                if (device.id != null && !devicesIDs.has(device.id)) {
                    devices.add(device);
                    devicesIDs.add(device.id);
                }
            }
        });

        // Stop scanning after 5 seconds
        setTimeout(() => {
            manager.stopDeviceScan();
            devicesIDs = new Set<string>(); // Clear devicesIDs before resolving
            resolve(devices);
            console.log('Devices found:', Array.from(devices).map(device => device.id));
        }, 5000);
    });
}

export function readCharacteristic(device: Device): void {
    device.discoverAllServicesAndCharacteristics()
        .then(async (deviceWithServices: Device) => {
            return await deviceWithServices.services();
        })
        .then(async (services: Service[]) => {
            console.log(services.length);
            const serviceUUID = services[2].uuid;
            console.log('Service UUID: ', serviceUUID);

            return await device.characteristicsForService(serviceUUID);
        })
        .then(async (characteristics: Characteristic[]) => {
            return await device.readCharacteristicForService(characteristics[0].serviceUUID, characteristics[0].uuid);
        })
        .then((characteristic: Characteristic) => {
            console.log('Characteristic: ', characteristic);
            if (characteristic.value != null) {
                const value = decode(characteristic.value);
                console.log('Value: w %: ', value);
            }
        })
        .catch((error: Error) => {
            // Handle errors that occurred during connection or discovery
            console.error('Connection error:', error);
        });
}
function matchService(services: Service[], uuidPattern: string): string | null {
    for (let i = 0; i < services.length; i++) {
        console.log(services[i].uuid);
        if (services[i].uuid.includes(uuidPattern)) {
            return services[i].uuid;
        }
    }

    return null;
}

export function writeCharacteristic(device: Device, uuidPattern: string, value: string): void {
    device.discoverAllServicesAndCharacteristics()
        .then(async (deviceWithServices: Device) => {
            return await deviceWithServices.services();
        })
        .then(async (services: Service[]) => {
            console.log(services.length);
            const serviceUUID = matchService(services, uuidPattern);
            if (serviceUUID == null) {
                throw new Error('Service not found');
            }
            console.log('Service UUID: ', serviceUUID);

            return await device.characteristicsForService(serviceUUID);
        })
        .then(async (characteristics: Characteristic[]) => {
            await device.writeCharacteristicWithoutResponseForService(characteristics[0].serviceUUID, characteristics[0].uuid, encode(value));
            console.log('Done');

            return true;
        })
        .catch((error: Error) => {
            console.error('Connection error:', error);
        });
}
