import { Config } from "tailwindcss";

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
      },
    
    colors: {
      50: 'rgba(242, 238, 235, 0.5)',
      100: '#F2EEEB',
      200: '#AEB5BF',
      300: '#9298A6',
      400: '#5C6673',
      500: '#565952',
      600: '#060A0D',
      cancel:"#706e68",
      transparent:"rgba(0,0,0,0)",
      valid: '#468246',
      invalid: '#782b25',
      blur:'rgba(0, 0,0, 0.3)',
    }

  },
  plugins: [],
}
export default config