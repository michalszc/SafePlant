import React, { useState } from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from './color'
import { removeAllKeys } from '../credentials'

function MainPage ({ navigation }: { navigation: any }): React.JSX.Element {
  const [showSidebar, setShowSidebar] = useState(false)

  const toggleSidebar = (): void => {
    setShowSidebar(!showSidebar)
  }
  const logOut = async (): Promise<void> => {
    await removeAllKeys()
    navigation.navigate('Home')
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons style={styles.hamburger} name="reorder-three" size={50} color="black" onPress={toggleSidebar}/>
        <Text style={styles.name}>SafePlant</Text>
        <View style={styles.emptyHeader}></View>
      </View>
      <ScrollView style={styles.body}>
        <TouchableOpacity style={styles.plant}>
          <Text style={styles.textSize}>Roslina</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.plant}>
          <Text style={styles.textSize}>Roslina</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.plant}>
          <Text style={styles.textSize}>Roslina</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.plant}>
          <Text style={styles.textSize}>Roslina</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.plant}>
          <Text style={styles.textSize}>Roslina</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.plant}>
          <Text style={styles.textSize}>Roslina</Text>
        </TouchableOpacity>
      </ScrollView>
      {showSidebar && <View style={styles.overlay} />}
      {showSidebar && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <View style={styles.headerTop}>
               <Ionicons style={styles.hamburger} name="reorder-three" size={50} color="black" onPress={toggleSidebar}/>
            </View>
            <View style={styles.headerBot}></View>
          </View>
          <View style={styles.avatar}></View>
          <View style={styles.sidebarBody}>
            <Text style ={styles.logOut} >NICKNAME</Text>
            <TouchableOpacity>
              <Text style={styles.logOut}>About app</Text>
              </TouchableOpacity>
            <TouchableOpacity onPress={logOut} /* eslint-disable-line @typescript-eslint/no-misused-promises */>
            <Text style={styles.logOut}>Sign Out</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sidebarBottom}>
          </View>
        </View>
      )}
      <View style={styles.bottom}>
        <View style={styles.emptyBox}></View>
        <View style={styles.content}>
          <View style={styles.whiteCircle}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                navigation.navigate('AddPlantForm')
              }}
            >
              <Ionicons style={styles.add} size={70} name="add" color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    flex: 0.10,
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
  }
})

export default MainPage
