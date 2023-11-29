import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

const setCredentials = async (keys: any) => {
    try {
      await SecureStore.setItemAsync('keys', JSON.stringify(keys))
    } catch (e) {
      console.log(e)
    }
  }

const getCredentials = async () => {
  try {
    let credentials = await SecureStore.getItemAsync('keys')

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

  function isTokenExpired (token: string) {
    var jwt_decode = require('jwt-decode');
    let decoded = jwt_decode(token)
  
    if ( decoded && decoded.exp && decoded.exp < Date.now() / 1000 ) {
      return true
    } else {
      return false
    }
  }

  async function getVerifiedKeys (keys: any) {
    console.log('Loading keys from storage')
  
    if (keys) {
      console.log('checking access')
  
      if (!isTokenExpired(keys.access)) {
        console.log('returning access')
  
        return keys
      } else {
        console.log('access expired')
  
        console.log('checking refresh expiry')
  
        if (!isTokenExpired(keys.refresh)) {
          console.log('fetching access using refresh')
  
          //TODO: write code to get refreshed tokens from server and store with AsyncStorage.
  
          return null
        } else {
          console.log('refresh expired, please login')
  
          return null
        }
      }
    } else {
      console.log('access not available please login')
  
      return null
    }
  }
  