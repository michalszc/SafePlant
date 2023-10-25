import { Text,View } from "react-native";

// export default function SignUp() {

// }

export default function InputText() {
    return (
      <View style={styles.root}>
        <Bg/>
        <Text style={styles.$name}>
          NAME
        </Text>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    root: {
      width: 343,
      height: 50,
      flexShrink: 0,
    },
    $name: {
      color: theme.colors.gray.$03,
      fontFamily: 'Inter',
      fontSize: 16,
      fontStyle: 'normal',
      fontWeight: '500',
      lineHeight: 'normal',
    },
  });