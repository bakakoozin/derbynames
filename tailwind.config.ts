import { Config } from "tailwindcss";

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    colors: {
      100: '#D8F3DC',
      200: '#B7E4C7',
      300: '#95D5B2',
      400: '#74C69D',
      500: '#52B788',
      600: '#40916C',
      700: '#2D6A4F',
      800: '#1B4332',
      900: '#081C15',
    },
  },
  plugins: [],
}
export default config