import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF8C00',
        'primary-hover': '#E67E00',
        secondary: '#1E3A5F',
        'secondary-hover': '#2A4F7A',
        accent: '#52C41A',
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', '"Noto Sans SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
  // Avoid conflicts with Ant Design
  corePlugins: {
    preflight: false,
  },
}

export default config
