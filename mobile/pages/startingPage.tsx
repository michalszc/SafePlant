import { useMutation } from '@apollo/client'
import React, { useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import { getCredentials, setCredentials } from '../credentials'
import { REFRESH } from '../gql/refresh'
import { colors } from './color'

export default function StartingPage ({ navigation }: { navigation: any }): React.JSX.Element {
  const [refresh] = useMutation(REFRESH)
  enum LoginStatus {
    LoggedIn,
    LoggedOut,
    Unknown
  }
  const [loginDone, setLoginDone] = React.useState(LoginStatus.Unknown)
  useEffect(() => {
    const checkToken = async (): Promise<void> => {
      const credentials = await getCredentials()
      if (credentials != null) {
          const token = credentials.refreshToken
          console.log(credentials.accessToken)
          const result = await refresh({
            variables: { token }
          })
          await setCredentials(result.data.refresh.data)
          console.log('zalogowalo')
          setLoginDone(LoginStatus.LoggedIn)
      }else{
        setLoginDone(LoginStatus.LoggedOut)
      }
    }
    checkToken()
  }, [])

  if (loginDone === LoginStatus.LoggedIn) {
    setTimeout(() => {
      navigation.navigate('MainPage')
    }, 1000)
  } else if(loginDone === LoginStatus.LoggedOut) {
    setTimeout(() => {
      navigation.navigate('Home')
    }, 1000)
  }
  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <View style={styles.logo}>
          <Image style={{ tintColor: colors.white }} source={require('../assets/plant.png')}/>
        </View>
        <Text style={styles.name}>SafePlant</Text>
        <Text style={styles.welcome}>Welcome</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bot: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    height: 400,
    justifyContent: 'space-around',
    width: '100%'
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: 25,
    display: 'flex',
    flex: 1,
    height: 80,
    justifyContent: 'center',
    margin: 20
  },
  button_text: {
    fontSize: 32
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.white,
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  }, 
  main: {
    alignItems: 'center',
    backgroundColor: colors.white,
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  logo: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: 25,
    display: 'flex',
    height: 350,
    justifyContent: 'center',
    margin: 40,
    marginTop: 90,
    width: '85%'
  },
  name: {
    fontSize: 60,
    marginBottom: 100,
  },
  top: {
    alignItems: 'center',
    display: 'flex',
    height: 500,
    justifyContent: 'center',
    width: '100%'
  },
  welcome: {
    fontSize: 80,
    fontWeight: 'bold',
  }
})
