/**
 * Color constants for Ieum Chat Application
 * Using Kakao theme colors
 */

export const Colors = {
  kakaoYellow: '#fae100',
  kakaoSkyblue: '#bfcdde',
  kakaoYellowDark: '#fee500',
  kakaoGray: '#ededed',
} as const;

// Optional: Type for color keys
export type ColorKey = keyof typeof Colors;
