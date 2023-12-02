import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity,} from 'react-native';

export default function HomePage({navigation}: {navigation: any}) {
  return (
    <View style={styles.container}>
        <View style={styles.top}>
          <View style={styles.logo}></View>
            <Text style={styles.name}>SafePlant</Text>
            </View>
        <View style={styles.bot}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Register")} >
              <Text style={styles.button_text}>
                  Sign up
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")} >
              <Text style={styles.button_text}>
                  Sign in
              </Text>
            </TouchableOpacity>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  top: {
    display: 'flex',
    height: 500,
    width: "100%",
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    height: 350,
    margin: 40,
    marginTop: 90,
    width: "85%",
    backgroundColor: 'orange',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 60,
  },
  text: {
    fontSize: 50,

  },
  bot: {
    display: 'flex',
    flexDirection: 'row',
    height: 400,
    width: '100%',
    alignItems: "center",
    justifyContent: 'space-around',

  },

  button: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
    borderRadius: 25,
    flex: 1,
    margin: 20,
    backgroundColor: "orange",
  },
  button_text: {
    fontSize: 32,
  }
  
});
