import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

import { useOnboarding } from "@/context/OnboardingContext";

export default function Index() {
  const { isReady, isOnboardingComplete } = useOnboarding();

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A0E17", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#00D4AA" size="large" />
      </View>
    );
  }

  if (!isOnboardingComplete) {
    return <Redirect href="/onboarding/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}
