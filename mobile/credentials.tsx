import AsyncStorage from '@react-native-async-storage/async-storage'
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
