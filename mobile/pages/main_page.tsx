import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity,} from 'react-native';
import MenuIcon from '@mui/icons-material/Menu';
import SvgIcon from '@mui/icons-material/Menu';

function MainPage({navigation}: {navigation: any}) {
  return (
    <View style={styles.container}>
       <View style={styles.header}>
          <Text style={styles.name}>SafePlant</Text>
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
  header: {
    display: 'flex',
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    height: 150,
    width: "100%",
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#F5A70D',

  },
  hamburger: {
    color: 'white',
  },

  name: {
    fontSize: 45,
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
    backgroundColor: '#F5A70D',
  },
  button_text: {
    fontSize: 32,
  }
  
});

export default MainPage;