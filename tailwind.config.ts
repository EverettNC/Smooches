import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        panel: {
          DEFAULT: "hsl(var(--panel))",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        brass: {
          DEFAULT: "hsl(var(--brass))",
          hi: "hsl(var(--brass-highlight))",
          mid: "hsl(var(--brass-mid))",
          lo: "hsl(var(--brass-deep))",
        },
        teal: {
          DEFAULT: "hsl(var(--teal))",
        },
        panel: {
          DEFAULT: "hsl(var(--panel))",
          raised: "hsl(var(--panel-raised))",
        },
        ink: {
          primary: "hsl(var(--ink-primary))",
          secondary: "hsl(var(--ink-secondary))",
          tertiary: "hsl(var(--ink-tertiary))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "live-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)", boxShadow: "0 0 8px rgba(45, 225, 220, 0.8)" },
          "50%": { opacity: "0.6", transform: "scale(0.9)", boxShadow: "0 0 4px rgba(45, 225, 220, 0.4)" },
        },
        "teal-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(45, 225, 220, 0.3)" },
          "50%": { boxShadow: "0 0 24px rgba(45, 225, 220, 0.5), 0 0 48px rgba(45, 225, 220, 0.2)" },
        },
        "brass-pulse": {
          "0%, 100%": { boxShadow: "0 0 12px rgba(201, 162, 75, 0.3)" },
          "50%": { boxShadow: "0 0 32px rgba(201, 162, 75, 0.5), 0 0 64px rgba(201, 162, 75, 0.2)" },
        },
        "copper-pulse": {
          "0%, 100%": { boxShadow: "0 0 12px var(--copper-glow)" },
          "50%": { boxShadow: "0 0 32px var(--copper-glow), 0 0 64px rgba(200, 121, 65, 0.2)" },
        },
        "brass-shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "live-ring-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.4" },
          "50%": { transform: "scale(1.3)", opacity: "0.15" },
        },
        "float-up": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(-400px) scale(1.5)", opacity: "0" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "live-pulse": "live-pulse 1.5s ease-in-out infinite",
        "teal-pulse": "teal-pulse 2s ease-in-out infinite",
        "brass-pulse": "brass-pulse 3s ease-in-out infinite",
        "copper-pulse": "copper-pulse 2.5s ease-in-out infinite",
        "brass-shimmer": "brass-shimmer 3s ease-in-out infinite",
        "live-ring-pulse": "live-ring-pulse 2s ease-in-out infinite",
        "float-up": "float-up 2s ease-out forwards",
        "spin-slow": "spin 3s linear infinite",
        "pulse-slow": "pulse 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
