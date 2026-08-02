import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
} from "react-native";
import { Colors, Radius, Spacing } from "../theme";

export function Button({
  title,
  onPress,
  variant = "primary",
  loading,
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "danger";
  loading?: boolean;
  disabled?: boolean;
}) {
  const bg =
    variant === "primary"
      ? Colors.accent
      : variant === "danger"
      ? Colors.danger
      : Colors.surfaceAlt;
  const off = disabled || loading;
  return (
    <Pressable
      style={[styles.btn, { backgroundColor: bg }, off && styles.btnOff]}
      onPress={onPress}
      disabled={off}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={styles.btnText}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Field({
  label,
  ...props
}: TextInputProps & { label: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={Colors.textDim}
        style={styles.field}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 13,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  btnOff: { opacity: 0.55 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  fieldWrap: { marginBottom: Spacing.md },
  fieldLabel: {
    color: Colors.textDim,
    fontSize: 13,
    marginBottom: Spacing.xs,
    fontWeight: "600",
  },
  field: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    color: Colors.text,
    fontSize: 15,
  },
});
