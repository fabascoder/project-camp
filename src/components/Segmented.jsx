import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, radius } from "../theme/theme";

export function Segmented({ options, value, onChange, disabledKeys = [] }) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const active = option.key === value;
        const disabled = disabledKeys.includes(option.key);
        return (
          <Pressable
            key={option.key}
            disabled={disabled}
            style={[
              styles.button,
              active && styles.buttonActive,
              disabled && styles.buttonDisabled,
            ]}
            onPress={() => onChange(option.key)}
          >
            <Text
              style={[
                styles.text,
                active && styles.textActive,
                disabled && styles.textDisabled,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  button: {
    flexGrow: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primaryLightBorder,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
  },
  buttonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  text: {
    color: colors.primaryDark,
    fontWeight: "600",
  },
  textActive: {
    color: colors.white,
  },
  textDisabled: {
    color: "#94a3b8",
  },
});

export default Segmented;
