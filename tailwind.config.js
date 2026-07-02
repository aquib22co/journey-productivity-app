/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "rgba(255, 255, 255, 0.08)", // fallback/var border
        input: "rgba(255, 255, 255, 0.05)",
        ring: "rgba(0, 132, 255, 0.6)",
        background: "rgba(9, 13, 22, 0.92)",
        foreground: "#f8fafc",
        primary: {
          DEFAULT: "#0084ff",
          foreground: "#f8fafc",
        },
        secondary: {
          DEFAULT: "rgba(18, 24, 38, 0.5)",
          foreground: "#94a3b8",
        },
        destructive: {
          DEFAULT: "#f43f5e",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "rgba(255, 255, 255, 0.05)",
          foreground: "#94a3b8",
        },
        accent: {
          DEFAULT: "#0084ff",
          foreground: "#f8fafc",
        },
        popover: {
          DEFAULT: "rgba(9, 13, 22, 0.98)",
          foreground: "#f8fafc",
        },
        card: {
          DEFAULT: "rgba(18, 24, 38, 0.5)",
          foreground: "#f8fafc",
        },
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "8px",
      },
    },
  },
  plugins: [],
}
