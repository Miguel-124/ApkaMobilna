//app/login.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useAuthStore, AuthState } from '../lib/storage/auth';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const setUser = useAuthStore((state: AuthState) => state.setUser);

  // 🔧 Ręcznie tworzony redirect URI przez Expo proxy
  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true,
  } as any);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: Constants.expoConfig?.extra?.expoClientId,
    iosClientId: Constants.expoConfig?.extra?.iosClientId,
    androidClientId: Constants.expoConfig?.extra?.androidClientId,
    webClientId: Constants.expoConfig?.extra?.webClientId,
    redirectUri, // ⬅️ to naprawia błąd 400
    extraParams: {
      prompt: 'select_account',
      access_type: 'offline',
      include_granted_scopes: 'true',
    },
  });

  useEffect(() => {
    const fetchUserInfo = async (token: string) => {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userInfo = await res.json();
      setUser({
        name: userInfo.name,
        email: userInfo.email,
        accessToken: token,
      });
      router.replace('/homeScreen');
    };

    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchUserInfo(authentication.accessToken);
      }
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo_SmartInwestor.jpeg')} style={styles.logo} />
      <Text style={styles.title}>SmartInwestor</Text>
      <Text style={styles.description}>
        Monitoruj swój portfel inwestycyjny w czasie rzeczywistym. 
        Zyskaj pełną kontrolę nad swoimi aktywami i decyzjami finansowymi.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => promptAsync()}
        disabled={!request}
      >
        <Text style={styles.buttonText}>Zaloguj przez Google</Text>
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
});