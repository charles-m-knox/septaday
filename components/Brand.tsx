import React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import Colors from '../constants/Colors';
import { Text, View } from './Themed';
// import { Ionicons } from '@expo/vector-icons';
// import { Entypo } from '@expo/vector-icons';
import { Task } from '../models/Task';
import * as SQLite from 'expo-sqlite';
import { initializeDB, resetDB } from '../sqlite/sqlite';
import useColorScheme from '../hooks/useColorScheme';
import * as WebBrowser from 'expo-web-browser';

const BrandView = (): JSX.Element => {
  const colorScheme = useColorScheme();

  function handleHelpPress() {
    WebBrowser.openBrowserAsync('https://charlesmknox.com');
  }

  return (
    <View style={styles.container}>
      <View style={styles.brandLogoContainer}>
        <TouchableOpacity onPress={handleHelpPress}>
          <Image style={styles.brandLogo} source={require('../assets/images/TechLife23.png')} />
        </TouchableOpacity>
      </View>
      <View>
        <Text
          style={[styles.aboutText]}>
          This app was developed by Charles M. Knox. If it helps you find a better balance in life, then the mission has been accomplished. Good luck out there!
        </Text>
      </View>
      <View>
        <TouchableOpacity onPress={handleHelpPress} style={styles.aboutText}>
          <Text lightColor={Colors.light.tint}>
            You can tap here or on the logo above to visit my website, https://charlesmknox.com.
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text
          style={[styles.aboutText]}>
          If this project has changed your life in any way, reach out and say thanks, using the links on the landing page. I want to hear from you!
        </Text>
      </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: "66%",
  },
  brandLogo: {
    width: 96,
    height: 96,
  },
  brandLogoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 25,
  },
  aboutText: {
    textAlign: 'left',
    marginBottom: 15,
  },
  actionContainer: {
    marginTop: 15,
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpText: {
    textAlign: 'left',
  },
});

export default BrandView;
