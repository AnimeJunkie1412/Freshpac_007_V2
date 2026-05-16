import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        freshpac: {
          orange: "#F89A39",
          charcoal: "#2D2727",
          grey: "#6E6D6D",
          cream: "#F2E6CF",
          panel: "#E8E4DE",
          ink: "#211D1D"
        }
      },
      boxShadow: {
        soft: "0 18px 45px rgba(45, 39, 39, 0.08)",
        panel: "0 8px 25px rgba(45, 39, 39, 0.06)"
      },
      borderRadius: {
        card: "1.15rem"
      }
    }
  },
  plugins: []
};

export default config;
