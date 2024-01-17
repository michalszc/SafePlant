import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, BackHandler, FlatList, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from './color'
import { removeAllKeys } from '../credentials'
import { type Device } from 'react-native-ble-plx'
import { requestBluetoothPermission, scanForDevices } from '../ble'
import { useMutation, useQuery } from '@apollo/client'
import { GET_FLOWERS } from '../gql/getFlowers'
import { useFocusEffect } from '@react-navigation/native'
import { GET_USER } from '../gql/user'
import { REMOVE_FLOWER } from '../gql/removeFlower'

function MainPage ({ navigation }: { navigation: any }): React.JSX.Element {
  const [showSidebar, setShowSidebar] = useState(false)
  const [isModalVisible, setModalVisible] = useState(false)
  const [devices, setDevices] = useState<Device[]>([])
  const { loading, error, data, refetch } = useQuery(GET_FLOWERS)
  const user = useQuery(GET_USER)
  const [removeFlower] = useMutation(REMOVE_FLOWER)

  useFocusEffect(
    React.useCallback(() => {
      refetch()
        .catch((error: any) => {
          console.log(error)
        }
        )
      setDevices([])
    }, [])
  )

  if (loading) console.log('Loading...') /* eslint-disable-line @typescript-eslint/strict-boolean-expressions */
  else if (error) console.log(`Error! ${error.message}`)/* eslint-disable-line @typescript-eslint/strict-boolean-expressions */
  else if (data) console.log('Pobralo')/* eslint-disable-line @typescript-eslint/strict-boolean-expressions */

  const searchForDevices = async (): Promise<void> => {
    await requestBluetoothPermission()
    const scannedDevices = await scanForDevices()
    setDevices(Array.from(scannedDevices))
  }

  useEffect(() => {
    if (isModalVisible) {
      const interval = setInterval(async () => { /* eslint-disable-line @typescript-eslint/no-misused-promises */
        await searchForDevices()
      }, 6000)

      return () => { clearInterval(interval) }
    }
  }, [isModalVisible])

  useEffect(() => {
    const backAction = (): boolean => {
      navigation.navigate('MainPage')
      return true
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)

    return () => { backHandler.remove() }
  }, [])
  const toggleSidebar = (): void => {
    setShowSidebar(!showSidebar)
  }
  const logOut = async (): Promise<void> => {
    await removeAllKeys()
    navigation.navigate('Home')
  }
  const removePlant = async (id: string): Promise<void> => {
    try {
      const result = await removeFlower({
        variables: {
          removeFlowerId: id
        }
      })
      console.log(result)
      await refetch()
    } catch (e: any) {
      alert(e.message)
      console.log(e)
    }
  }
  const flowers = data?.flowers.edges

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons style={styles.hamburger} name="reorder-three" size={50} color="black" onPress={toggleSidebar} />
        <Text style={styles.name}>SafePlant</Text>
        <View style={styles.emptyHeader}></View>
      </View>
      <ScrollView style={styles.body}>
        {data && /* eslint-disable-line @typescript-eslint/strict-boolean-expressions */
          flowers.map((item: any) => (
            <TouchableOpacity key={item.node.id} style={styles.plant}>
              <Text style={styles.textSize}>
                {item.node.name.length < 9 ? item.node.name : `${item.node.name.substring(0, 8)}...`}
              </Text>
              <TouchableOpacity
                style={styles.removePlantButton}
                onPress={async () => { /* eslint-disable-line  @typescript-eslint/no-misused-promises */
                  await removePlant(item.node.id)
                }}
              >
                <Image source={require('../assets/delete.png')} style={styles.buttonIcon} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editPlantButton}
                onPress={() => navigation.navigate('EditPlantForm', { id: item.node.id })}
              >
                <Image source={require('../assets/edit.png')} style={styles.buttonIcon} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
      </ScrollView>
      {showSidebar && <View style={styles.overlay} />}
      {showSidebar && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <View style={styles.headerTop}>
              <Ionicons style={styles.hamburger} name="reorder-three" size={50} color="black" onPress={toggleSidebar} />
            </View>
            <View style={styles.headerBot}></View>
          </View>
          <Image source={require('../assets/avatar.png')} style={styles.avatar} />
          <View style={styles.sidebarBody}>
            <Text style={styles.logOut}>{user.data.user.name}</Text>
            <TouchableOpacity>
              <Text style={styles.logOut}>About app</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={logOut} /* eslint-disable-line @typescript-eslint/no-misused-promises */>
              <Text style={styles.logOut}>Sign Out</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sidebarBottom}></View>
        </View>
      )}
      <View style={styles.bottom}>
        <View style={styles.emptyBox}></View>
        <View style={styles.content}>
          <View style={styles.whiteCircle}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={async () => { /* eslint-disable-line @typescript-eslint/no-misused-promises */
                setModalVisible(true)
                setDevices([])
                await searchForDevices()
              }}
            >
              <Ionicons style={styles.add} size={70} name="add" color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {isModalVisible && <View style={styles.overlay} />}
      {isModalVisible && (
        <View style={styles.bleDevices}>
          <View style={styles.bleHeader}>
            <Text style={styles.title}>Select your device</Text>
            <Ionicons
              style={styles.exitIcon}
              name="close"
              size={24}
              color="black"
              onPress={() => {
                setModalVisible(false)
                setDevices([])
              }}
            />
          </View>
          <View style={styles.bleBody}>
            {devices.length === 0 && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingFont}>Loading...</Text>
              </View>
            )}
            {devices.length > 0 && (
              <FlatList
                data={devices}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.item}
                    onPress={() => {
                      navigation.navigate('WifiForm', { device: item })
                      setDevices([])
                      // navigation.navigate('AddPlantForm') // commented for future testing
                      setModalVisible(false)
                    }}
                  >
                    <Text style={styles.subtitle}>{item.name ? item.name : 'UnKnown' /* eslint-disable-line @typescript-eslint/strict-boolean-expressions */}</Text>
                    <Text style={styles.subtitle}>{item.id}</Text>
                  </TouchableOpacity>
                )}
              ></FlatList>
            )}
          </View>
          <View style={styles.bleBottom}>
            <TouchableOpacity
              onPress={async () => { /* eslint-disable-line @typescript-eslint/no-misused-promises */
                await searchForDevices()
              }}
              style={styles.searchDevice}
            >
              <Text style={styles.title}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  add: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center'
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: 45,
    display: 'flex',
    height: 70,
    justifyContent: 'center',
    width: 70
  },
  avatar: {
    backgroundColor: colors.white,
    borderRadius: 90,
    height: 180,
    left: 70,
    position: 'absolute',
    top: 40,
    width: 180,
    zIndex: 3
  },
  bleBody: {
    backgroundColor: colors.white,
    display: 'flex',
    flex: 0.7,
    width: '100%'
  },
  bleBottom: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    display: 'flex',
    flexDirection: 'row',
    flex: 0.1,
    justifyContent: 'center',
    width: '100%'
  },
  bleDevices: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 30,
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    height: 600,
    justifyContent: 'space-between',
    margin: 40,
    position: 'absolute',
    top: 100,
    width: 350,
    zIndex: 999
  },

  bleHeader: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    display: 'flex',
    flexDirection: 'row',
    flex: 0.1,
    justifyContent: 'center',
    width: '100%'
  },

  body: {
    display: 'flex',
    flex: 0.65,
    width: '100%'
  },
  bottom: {
    alignItems: 'center',
    display: 'flex',
    flex: 0.2,
    width: '100%'
  },
  buttonIcon: {
    height: 40,
    width: 40
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.white,
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  content: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    display: 'flex',
    flex: 0.68,
    width: '100%'
  },
  editPlantButton: {
    alignItems: 'flex-end',
    display: 'flex',
    justifyContent: 'center',
    marginRight: 20,
    marginTop: 20,
    position: 'absolute',
    right: 60
  },
  emptyBox: {
    backgroundColor: colors.white,
    flex: 0.32
  },
  emptyHeader: {
    height: 50,
    marginRight: 20,
    width: 50
  },
  exitIcon: {
    color: colors.white,
    marginBottom: 10,
    marginTop: 10,
    position: 'absolute',
    right: 20
  },
  hamburger: {
    alignItems: 'flex-start',
    color: colors.white,
    display: 'flex',
    marginLeft: 20
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    display: 'flex',
    flexDirection: 'row',
    flex: 0.15,
    justifyContent: 'space-between',
    width: '100%'
  },
  headerBot: {
    backgroundColor: colors.white,
    flex: 0.5
  },
  headerTop: {
    backgroundColor: colors.orange,
    display: 'flex',
    flex: 0.5,
    justifyContent: 'center'
  },
  item: {
    backgroundColor: colors.orange,
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  loadingFont: {
    color: colors.black,
    fontSize: 24
  },
  logOut: {
    alignContent: 'center',
    color: colors.black,
    display: 'flex',
    fontSize: 40,
    fontWeight: 'bold',
    justifyContent: 'center',
    marginLeft: 20,
    margin: 15
  },
  name: {
    fontSize: 45
  },
  overlay: {
    backgroundColor: colors.blur,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 998
  },
  plant: {
    alignItems: 'flex-start',
    backgroundColor: colors.orange,
    borderRadius: 20,
    display: 'flex',
    height: 90,
    justifyContent: 'center',
    marginLeft: 40,
    marginRight: 40,
    margin: 30
  },
  removePlantButton: {
    alignItems: 'flex-end',
    display: 'flex',
    justifyContent: 'center',
    marginRight: 20,
    marginTop: 20,
    position: 'absolute',
    right: 5
  },
  searchDevice: {
    alignContent: 'center',
    backgroundColor: colors.orange,
    borderColor: colors.white,
    borderRadius: 15,
    borderWidth: 2,
    display: 'flex',
    flexDirection: 'row',
    height: 45,
    justifyContent: 'center',
    marginBottom: 5,
    marginHorizontal: 20,
    width: 150
  },
  sidebar: {
    backgroundColor: colors.white,
    bottom: 0,
    display: 'flex',
    flex: 1,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 300,
    zIndex: 999
  },
  sidebarBody: {
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    display: 'flex',
    flex: 0.64
  },
  sidebarBottom: {
    alignContent: 'center',
    backgroundColor: colors.orange,
    display: 'flex',
    flex: 0.1,
    justifyContent: 'center'
  },
  sidebarHeader: {
    display: 'flex',
    flex: 0.26,
    width: '100%'
  },
  subtitle: {
    color: colors.white,
    fontSize: 18
  },
  textSize: {
    fontSize: 35,
    marginLeft: 30
  },
  title: {
    color: colors.white,
    fontSize: 24
  },
  whiteCircle: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 40,
    bottom: 40,
    display: 'flex',
    height: 80,
    justifyContent: 'center',
    width: 80
  }
})

export default MainPage
