import AsyncStorage from '@react-native-async-storage/async-storage'
import { type Device } from 'react-native-ble-plx'
interface keys {
  accessToken: string
  refreshToken: string
}

export const setCredentials = async (keys: keys): Promise<void> => {
  try {
    await AsyncStorage.setItem('keys', JSON.stringify(keys))
  } catch (e) {
    console.log(e)
  }
}

export const setDevice = async (device: Device): Promise<void> => {
  try {
    await AsyncStorage.setItem('device', JSON.stringify(device))
  } catch (e) {
    console.log(e)
  }
}
export const getDevice = async (): Promise<Device | null> => {
  try {
    const device = await AsyncStorage.getItem('device')

    if (device != null) {
      return JSON.parse(device)
    } else {
      return null
    }
  } catch (e) {
    console.log(e)
  }
  return null
}
export const removeDevice = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('device')
  } catch (e) {
    console.log(e)
  }
}
export const getCredentials = async (): Promise<keys | null> => {
  try {
    const credentials = await AsyncStorage.getItem('keys')

    if (credentials != null) {
      return JSON.parse(credentials)
    } else {
      return null
    }
  } catch (e) {
    console.log(e)
  }
  return null
}

export const removeAllKeys = async (): Promise<void> => {
  try {
    await AsyncStorage.clear()
  } catch (e) {
    console.log(e)
  }
}
