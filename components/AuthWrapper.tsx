import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useSegments } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    console.log('AuthWrapper - Current state:', {
      user: user ? `User: ${user.email}` : 'No user',
      isLoading,
      segments,
      currentRoute: segments.join('/')
    });

    if (isLoading) {
      console.log('AuthWrapper - Still loading, skipping navigation');
      return;
    }

    const inAuthGroup = segments[0] === '(tabs)';
    console.log('AuthWrapper - Navigation check:', {
      inAuthGroup,
      hasUser: !!user,
      shouldRedirectToLogin: !user && inAuthGroup,
      shouldRedirectToHome: user && !inAuthGroup
    });

    if (!user && inAuthGroup) {
      // Redirect to login if user is not authenticated and trying to access protected routes
      console.log('AuthWrapper - Redirecting to login');
      router.replace('/login');
    } else if (user && !inAuthGroup) {
      // Redirect to home if user is authenticated and on auth pages
      console.log('AuthWrapper - Redirecting to home');
      router.replace('/(tabs)');
    } else {
      console.log('AuthWrapper - No redirect needed');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    console.log('AuthWrapper - Showing loading screen');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  console.log('AuthWrapper - Rendering children');
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
}); 