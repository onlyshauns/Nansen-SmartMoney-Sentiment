// Shared design system for consistent styling across components

export const cardStyles = {
  // Modern glassmorphism card
  base: "rounded-2xl p-7 bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] hover:border-white/[0.12] transition-all duration-300 ease-out",

  // Widget card specifically
  widget: "rounded-2xl p-7 bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] hover:border-white/[0.12] hover:scale-[1.01] transition-all duration-300 ease-out h-full flex flex-col",

  // Hero card
  hero: "rounded-3xl p-16 bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.1] backdrop-blur-xl shadow-[0_25px_80px_-15px_rgba(0,0,0,0.6)]",
};

export const textStyles = {
  // Headers
  h1: "text-3xl font-bold text-white tracking-tight",
  h2: "text-2xl font-bold text-white tracking-tight",
  h3: "text-xl font-semibold text-white tracking-tight",

  // Body text
  body: "text-sm text-gray-400",
  bodyBold: "text-sm text-white font-medium",

  // Labels
  label: "text-xs text-gray-500 uppercase tracking-wider font-semibold",

  // Subtle text
  subtle: "text-xs text-gray-600",
};

export const colorStyles = {
  // Sentiment colors
  bullish: "text-[#00ffa7]",
  bearish: "text-[#ff4444]",
  neutral: "text-gray-400",

  // Background gradients
  bullishBg: "bg-gradient-to-r from-[#00ffa7]/10 to-transparent",
  bearishBg: "bg-gradient-to-r from-[#ff4444]/10 to-transparent",
};

export const animationStyles = {
  // Hover effects
  scaleHover: "hover:scale-[1.02] transition-transform duration-200 ease-out",
  fadeIn: "animate-fadeIn",

  // Smooth transitions
  smooth: "transition-all duration-300 ease-out",
  fast: "transition-all duration-150 ease-out",
};
