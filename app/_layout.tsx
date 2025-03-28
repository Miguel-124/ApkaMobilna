import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        gestureEnabled: true,           // ← to aktywuje swipe
        headerShown: true,              // ← jeśli chcesz widoczny header
      }}
    />
  );
}