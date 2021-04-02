import React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import Colors from '../constants/Colors';
import { Text, View } from './Themed';
import * as WebBrowser from 'expo-web-browser';
import { createTwoButtonAlert } from '../helpers/alerts';

const BrandView = (): JSX.Element => {
  const brandUrl = 'https://charlesmknox.com';
  const openURL = (link: string): void => {
    if (!link) return;
    const msg = `Would you like to open the web page ${link} in your browser?`;
    createTwoButtonAlert("Open in browser?", msg, "Open", "default", () => { WebBrowser.openBrowserAsync(link); });
  }

  return (
    <View style={styles.container}>
      <View style={styles.brandLogoContainer}>
        <TouchableOpacity onPress={() => { openURL(brandUrl); }}>
          <Image style={styles.brandLogo} source={require('../assets/images/TechLife23_centered-position-14x2_full-bg-shadow.png')} />
        </TouchableOpacity>
      </View>
      <View>
        <Text style={[styles.aboutText]}>
          This app was developed by Charles M. Knox. If it helps you find a better balance in life, then the mission has been accomplished. Good luck out there!
        </Text>
      </View>
      <View>
        <TouchableOpacity onPress={() => { openURL(brandUrl); }} style={styles.aboutText}>
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
    width: "66%"
  },
  brandLogo: {
    width: 96,
    height: 96,
    borderRadius: 10,
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
});

export default BrandView;
