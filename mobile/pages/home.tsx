import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { colors } from './color';

export default function HomePage({ navigation }: { navigation: any }): React.JSX.Element {
    return (
        <View style={styles.container}>
            <View style={styles.top}>
                <View style={styles.logo}>
                    <Image style={{ tintColor: colors.white }} source={require('../assets/plant.png')} />
                </View>
                <Text style={styles.name}>SafePlant</Text>
            </View>
            <View style={styles.bot}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.button_text}>Sign up</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.button_text}>Sign in</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
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
        justifyContent: 'space-evenly'
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
        fontSize: 60
    },
    top: {
        alignItems: 'center',
        display: 'flex',
        height: 500,
        justifyContent: 'center',
        width: '100%'
    }
});
