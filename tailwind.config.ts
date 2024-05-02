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
      //300: 'rgba(146, 152, 166, 0,8)',
      //200: 'rgba(174, 181, 191, 0.8)',
    },
backgroundImage: {
  'b1': "url(./home_back.png)",
}

  },
  plugins: [],
}
export default config