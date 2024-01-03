import React, { useEffect, useMemo, useState } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { requestBluetoothPermission, scanAndConnect } from '../ble'

const BlePage = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heartRateTitleWrapper}>
          <Text style={styles.heartRateTitleText}>
            Please Connect to a Heart Rate Monitor
          </Text>
      </View>
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={async () => {
          const result = await requestBluetoothPermission()
          console.log(result)
          scanAndConnect()
        }}
      >
        <Text style={styles.ctaButtonText}>TEKSTTTTTTTTTTTTTTT
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f2f2f2',
    flex: 1
  },
  ctaButton: {
    alignItems: 'center',
    backgroundColor: '#FF6060',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    marginBottom: 5,
    marginHorizontal: 20
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  heartRateText: {
    fontSize: 25,
    marginTop: 15
  },
  heartRateTitleText: {
    color: 'black',
    fontSize: 30,
    fontWeight: 'bold',
    marginHorizontal: 20,
    textAlign: 'center'
  },
  heartRateTitleWrapper: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  }
})

export default BlePage
