/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        toss: {
          blue: "#3182F6", // 메인 파란색 (버튼, 강조)
          lightBlue: "#E8F3FF", // 연한 파란색 (버튼 배경)
          grey: "#F2F4F6", // 배경 회색
          dark: "#333D4B", // 진한 글씨 (제목)
          light: "#8B95A1", // 연한 글씨 (설명)
          red: "#FF3B30", // 경고, 품절
          white: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
