import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { colors } from '@/lib/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
          headerBackTitle: 'Back',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ title: 'Create account' }} />
        <Stack.Screen name="dashboard" options={{ title: 'Dashboard', headerBackVisible: false }} />
        <Stack.Screen name="projects/index" options={{ title: 'Projects' }} />
        <Stack.Screen name="projects/[id]/index" options={{ title: 'Project' }} />
        <Stack.Screen name="task-form" options={{ title: 'Task' }} />
      </Stack>
    </AuthProvider>
  );
}
