import { Config } from "tailwindcss";

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    colors: {
      100: '#F2EEEB',
      200: '#AEB5BF',
      300: '#9298A6',
      400: '#5C6673',
      500: '#565952',
      600: '#060A0D',
    },
  },
  plugins: [],
}
export default config