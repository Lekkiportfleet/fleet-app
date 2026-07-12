import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Deep slate/navy base — a control-room, "everything logged" feel.
        ink: "#0F172A",
        slate: {
          950: "#0B1220",
          900: "#101827",
          800: "#1B2536",
          700: "#2C3A52",
          500: "#64748B",
          300: "#CBD5E1",
          100: "#F1F5F9",
        },
        // Amber = fuel/attention accent. Used sparingly for primary actions & status.
        amber: {
          600: "#C2760C",
          500: "#D98F1F",
          400: "#E8A83B",
        },
        ok: "#2E7D5B",
        warn: "#C2760C",
        danger: "#B3432E",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
      },
    },
  },
  plugins: [],
};
export default config;
