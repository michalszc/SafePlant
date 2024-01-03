import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, BackHandler, FlatList } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from './color'
import { removeAllKeys } from '../credentials'
import { Device } from 'react-native-ble-plx'
import { requestBluetoothPermission, scanForDevices } from '../ble'
import { useQuery } from '@apollo/client';
import { GET_FLOWERS } from '../gql/getFlowers';

function MainPage ({ navigation }: { navigation: any }): React.JSX.Element {
  const [showSidebar, setShowSidebar] = useState(false)
  const [isModalVisible, setModalVisible] = useState(false)
  const [devices, setDevices] = useState<Device[]>([])
  const { loading, error, data, refetch} = useQuery(GET_FLOWERS);

  useEffect(() => {
    refetch()
  });

  if (loading) console.log('Loading...');
  else if (error) console.log(`Error! ${error.message}`);
  else if(data) console.log("Pobralo")

  const searchForDevices = async (): Promise<void> => {
    requestBluetoothPermission()
    const scannedDevices = await scanForDevices()
    setDevices(Array.from(scannedDevices))
  }

  useEffect(() => {
    const backAction = () => {
      navigation.navigate('MainPage')
      return true; 
    };
  
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
  
    return () => backHandler.remove(); // Don't forget to remove the event listener when the component unmounts
  }, []);
  const toggleSidebar = (): void => {
    setShowSidebar(!showSidebar)
  }
  const logOut = async (): Promise<void> => {
    await removeAllKeys()
    navigation.navigate('Home')
  }
  let flowers = data?.flowers.edges
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons style={styles.hamburger} name="reorder-three" size={50} color="black" onPress={toggleSidebar} />
        <Text style={styles.name}>SafePlant</Text>
        <View style={styles.emptyHeader}></View>
      </View>
      <ScrollView style={styles.body}>
        {
          data && flowers.map((item:any) => (
            <TouchableOpacity key={item.node.id} style={styles.plant}>
              <Text style={styles.textSize}>{item.node.name}</Text>
            </TouchableOpacity>
          ))
        }
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
          <View style={styles.avatar}></View>
          <View style={styles.sidebarBody}>
            <Text style={styles.logOut}>NICKNAME</Text>
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
              onPress={() => {
                // navigation.navigate('BluetoothDevices')
                setModalVisible(true)
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
            <Ionicons style={styles.exitIcon} name="close" size={24} color="black" onPress={() => setModalVisible(false)} />
          </View>
          <View style={styles.bleBody}>
            <FlatList
              data={devices}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.item} onPress={() =>{navigation.navigate("AddPlantForm"); setModalVisible(false)}}>
                  <Text style={styles.subtitle}>{item.name ? item.name : "UnKnown"}</Text>
                  <Text style={styles.subtitle}>{item.id}</Text>
                </TouchableOpacity>
              )}></FlatList>
          </View>
          <View style={styles.bleBottom}>
            <TouchableOpacity onPress={() => {searchForDevices()}} style={styles.searchDevice}>
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
    backgroundColor: colors.gray,
    borderRadius: 60,
    height: 120,
    left: 90,
    position: 'absolute',
    top: 40,
    width: 120,
    zIndex: 3
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

  emptyBox: {
    backgroundColor: colors.white,
    flex: 0.32
  },
  emptyHeader: {
    height: 50,
    marginRight: 20,
    width: 50
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
  logOut: {
    alignContent: 'center',
    color: colors.black,
    display: 'flex',
    fontSize: 35,
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
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: 20,
    display: 'flex',
    height: 90,
    justifyContent: 'center',
    marginLeft: 40,
    marginRight: 40,
    margin: 30
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
    flex: 0.68
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
    flex: 0.22,
    width: '100%'
  },
  textSize: {
    fontSize: 35
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
  },
  bleDevices: {
    borderRadius: 30,  
    margin: 40,
    alignItems: 'center',
    backgroundColor: colors.white,
    display: 'flex',
    position: 'absolute',
    top: 100,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 600,
    width: 350,
    zIndex: 999,
  },
  bleHeader: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    display: 'flex',
    flexDirection: 'row',
    flex: 0.1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    justifyContent: 'center',
    width: '100%'
  },
  bleBody: {
    display: 'flex',
    backgroundColor: colors.white,
    flex: 0.65,
    width: '100%'
  },
  bleBottom: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    display: 'flex',
    flexDirection: 'row',
    flex: 0.1,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center',
    width: '100%'
  },
  devicesContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
},  
item: {
    backgroundColor: colors.orange,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 20,
},
title: {
    fontSize: 24,
    color: colors.white,
},
subtitle: {
    fontSize: 18,
    color: colors.white,
},
searchDevice: {
    alignContent: 'center',
    display: 'flex',
    flexDirection: 'row', 
    backgroundColor: colors.orange,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.white,
    height: 45,
    width: 150,
    justifyContent: 'center',
    marginBottom: 5,
    marginHorizontal: 20
},
exitIcon: {
    alignItems: 'center',
    color: colors.white,
    display: 'flex',
    marginRight: 20
},
})

export default MainPage
