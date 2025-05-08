import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useAuthStore } from '../lib/storage/auth';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true,
  } as any);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: Constants.expoConfig?.extra?.expoClientId,
    iosClientId: Constants.expoConfig?.extra?.iosClientId,
    webClientId: Constants.expoConfig?.extra?.webClientId,
    redirectUri,
    extraParams: {
      prompt: 'select_account',
      access_type: 'offline',
      include_granted_scopes: 'true',
    },
  });

  useEffect(() => {
    if (response?.type === 'success') {
      console.log('Redirect URI:', redirectUri);
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${authentication.accessToken}` },
        })
          .then((res) => res.json())
          .then((userInfo) => {
            setUser({
              name: userInfo.name,
              email: userInfo.email,
              accessToken: authentication.accessToken,
            });
            router.replace('/homeScreen');
          });
      }
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo_SmartInwestor.jpeg')} style={styles.logo} />
      <Text style={styles.title}>SmartInwestor</Text>
      <Text style={styles.description}>
        Monitoruj swój portfel inwestycyjny w czasie rzeczywistym. Zyskaj pełną kontrolę nad swoimi aktywami.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => promptAsync()}
        disabled={!request}
      >
        <Text style={styles.buttonText}>Zaloguj przez Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => {
          setUser({
            name: 'Gość',
            email: 'guest@smartinwestor.app',
            accessToken: 'guest-token',
          });
          router.replace('/homeScreen');
        }}
      >
        <Text style={styles.skipButtonText}>Zaloguj jako gość</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00FFFF',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#00FFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    marginTop: 20,
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  skipButtonText: {
    color: '#ccc',
    fontSize: 14,
  },
});