import { PermissionsAndroid, Platform, Alert } from 'react-native'
import { BleManager, type Characteristic, type Device, type Service } from 'react-native-ble-plx'
import { Buffer } from 'buffer'

export const manager = new BleManager()

const decode = (str: string): string => Buffer.from(str, 'base64').toString('binary')
const encode = (str: string): string => Buffer.from(str, 'binary').toString('base64')

export const requestBluetoothPermission = async () => {
  if (Platform.OS === 'ios') {
    return true
  }
  if (Platform.OS === 'android' && PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION) {
    const apiLevel = parseInt(Platform.Version.toString(), 10)

    if (apiLevel < 31) {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
      return granted === PermissionsAndroid.RESULTS.GRANTED
    }
    if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN && PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT) {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ])
      return (
        result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
      )
    }
  }

  Alert.alert('Permission have not been granted')

  return false
}

const scanOptions = {
  legacyScan: false, // Set legacy to false to enable Bluetooth 5 Advertising Extension
  allowDuplicates: false
}

export function scanAndConnect () {
  manager.startDeviceScan(null, scanOptions, (error, device) => {
    if (error) {
      // Handle error (scanning will be stopped automatically)
      return
    }

    if (device != null && (device.id === 'FC:B4:67:50:C6:6E')) {
      console.log('gut')
      connectToDevice(device)
      manager.stopDeviceScan()
    } else {
      console.log(device?.id)
    }
  })
}

export function scanForDevices(): Promise<Set<Device>> {
  const devices = new Set<Device>();
  let devicesIDs = new Set<string>(); 

  return new Promise((resolve, reject) => {
    manager.startDeviceScan(null, scanOptions, (error, device) => {
      if (error) {
        // Handle error
        console.error('Error during scanning:', error);
        reject(error);
        return;
      }
      // Check if device exists and add it to the set
      if (device) {
        console.log('Device found:', device.id);
        if(device.id && !devicesIDs.has(device.id)){
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

function readCharacteristic (device: Device) {
  device.discoverAllServicesAndCharacteristics()
    .then(async (deviceWithServices: Device) => {
      return await deviceWithServices.services()
    })
    .then(async (services: Service[]) => {
      console.log(services.length)
      console.log('Services:', services)
      const serviceUUID = services[2].uuid
      return await device.characteristicsForService(serviceUUID)
    })
    .then(async (characteristics: Characteristic[]) => {
      return await device.readCharacteristicForService(characteristics[0].serviceUUID, characteristics[0].uuid)
    })
    .then((characteristic: Characteristic) => {
      console.log('Characteristic: ', characteristic)
      if (characteristic.value) {
        const value = decode(characteristic.value)
        console.log('Value: w %: ', value)
      }
    })
    .catch((error: Error) => {
      // Handle errors that occurred during connection or discovery
      console.error('Connection error:', error)
    })
}

function writeCharacteristic (device: Device) {
  device.discoverAllServicesAndCharacteristics()
    .then(async (deviceWithServices: Device) => {
      return await deviceWithServices.services()
    })
    .then(async (services: Service[]) => {
      console.log(services.length)
      console.log('Services:', services)
      const serviceUUID = services[2].uuid
      return await device.characteristicsForService(serviceUUID)
    })
    .then((characteristics: Characteristic[]) => {
      const value = encode('Tempy chuj Zieciak')
      device.writeCharacteristicWithoutResponseForService(characteristics[0].serviceUUID, characteristics[0].uuid, value)
      console.log('Done')
    })
    .catch((error: Error) => {
      console.error('Connection error:', error)
    })
}

function connectToDevice (device: Device) {
  device
    .connect()
    .then( (connectedDevice) => {
      writeCharacteristic(connectedDevice);
    })
    
}
