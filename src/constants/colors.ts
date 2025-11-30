/**
 * Color constants for Ieum Chat Application
 * Using Kakao theme colors
 */

export const Colors = {
  kakaoYellow: "#fae100",
  kakaoSkyblue: "#bfcdde",
  kakaoYellowDark: "#fee500",
  kakaoGray: "#ededed",
  primary: "#0644C0",
  secondary: "#0644C01A",
  primaryDeactivated: "#A4AAB2",
  messageBubble: "#0000000F",
} as const;

// Optional: Type for color keys
export type ColorKey = keyof typeof Colors;
