import { StyleSheet } from "react-native";

export const colors = {
  background: "#f5f7fb",
  card: "#ffffff",
  cardBorder: "#dce3f0",
  border: "#e5e7eb",
  inputBorder: "#d1d5db",

  primary: "#2563eb",
  primaryDark: "#1d4ed8",
  primaryLight: "#eef2ff",
  primaryLightBorder: "#c7d2fe",

  textPrimary: "#1e293b",
  textSecondary: "#64748b",
  textMuted: "#55627a",

  success: "#16a34a",
  successLight: "#dcfce7",
  successBorder: "#bbf7d0",

  warning: "#d97706",
  warningLight: "#fef3c7",
  warningBorder: "#fde68a",

  danger: "#dc2626",
  dangerLight: "#fee2e2",
  dangerBorder: "#fecaca",

  white: "#ffffff",
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const commonStyles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 16,
    alignItems: "center",
  },
  screenCentered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 620,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: 10,
    backgroundColor: colors.white,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radius.sm,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: "#93b4f0",
  },
  buttonText: {
    color: colors.white,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryLightBorder,
    paddingVertical: 12,
    borderRadius: radius.sm,
    alignItems: "center",
    marginTop: 4,
  },
  secondaryButtonText: {
    color: colors.primaryDark,
    fontWeight: "700",
  },
  errorBanner: {
    width: "100%",
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: 12,
  },
  errorBannerText: {
    color: colors.danger,
    fontWeight: "600",
  },
});
