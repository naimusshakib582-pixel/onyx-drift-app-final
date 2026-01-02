/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // আপনার অ্যাপের থিম কালার
        'zenith-dark': '#050508',
        'zenith-card': 'rgba(255, 255, 255, 0.05)', // কাঁচের মতো ব্যাকগ্রাউন্ড
        'zenith-border': 'rgba(255, 255, 255, 0.1)', // গ্লাস বর্ডার
        'cyan-neon': '#00BFFF', // নিওন সায়ান
        'purple-neon': '#8A2BE2', // নিওন পার্পল
      },
      fontFamily: {
        // কাস্টম ফন্ট (যদি ব্যবহার করেন, যেমন 'Inter' বা 'Lexend')
        // 'sans': ['Inter', 'sans-serif'], 
        // 'display': ['Lexend', 'sans-serif'],
      },
      boxShadow: {
        // কাস্টম শ্যাডো/গ্লো ইফেক্ট
        'glass-light': '0 4px 6px rgba(255, 255, 255, 0.1), 0 1px 3px rgba(255, 255, 255, 0.08)',
        'neon-blue': '0 0 25px rgba(0, 191, 255, 0.6)',
        'neon-purple': '0 0 25px rgba(138, 43, 226, 0.6)',
        'orb-glow': '0 0 50px rgba(0, 191, 255, 0.8), 0 0 30px rgba(138, 43, 226, 0.8)',
      },
      backdropBlur: {
        xs: '2px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px', // ডিফল্ট Tailwind এর চেয়ে বেশি ব্লার
      },
    },
  },
  plugins: [],
}