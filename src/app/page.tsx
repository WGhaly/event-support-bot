"use client";

import Link from 'next/link'
import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function HomePage() {
  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-6">
          <img 
            src="/icons/luuj-logo.png" 
            alt="Luuj Logo" 
            className="h-32 md:h-48 w-auto"
          />
        </div>
        
        {/* Main Heading */}
        <div className="text-3xl md:text-6xl font-bold dark:text-white text-center text-blue-950">
          Your Super Employee
        </div>
        
        {/* Subheading */}
        <div className="font-light text-lg md:text-2xl dark:text-blue-100 text-blue-900/80 py-4 text-center max-w-3xl">
          Automate your event management work with AI-powered assistance. From badge creation to attendee management, we handle it all.
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-3 justify-center mb-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="px-4 py-2 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-full border border-neutral-200 dark:border-neutral-800"
          >
            <span className="text-sm font-medium dark:text-neutral-200 text-neutral-700">🎫 Badge Creation</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="px-4 py-2 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-full border border-neutral-200 dark:border-neutral-800"
          >
            <span className="text-sm font-medium dark:text-neutral-200 text-neutral-700">👥 Attendee Management</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="px-4 py-2 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-full border border-neutral-200 dark:border-neutral-800"
          >
            <span className="text-sm font-medium dark:text-neutral-200 text-neutral-700">📅 Schedule Planning</span>
          </motion.div>
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 mt-6"
        >
          <Link
            href="/auth/signup"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full w-fit text-white px-8 py-3 font-semibold hover:scale-105 transition-all shadow-lg shadow-blue-500/30"
          >
            Get Started Free
          </Link>
          <Link
            href="/auth/login"
            className="bg-white/90 dark:bg-blue-950/50 backdrop-blur-sm rounded-full w-fit text-blue-700 dark:text-blue-200 px-8 py-3 font-semibold hover:scale-105 transition-all border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600"
          >
            Sign In
          </Link>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center text-sm text-neutral-600 dark:text-neutral-400"
        >
          <p>✓ Works 24/7 without breaks  •  ✓ Never calls in sick  •  ✓ Scales with your events</p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl w-full"
        >
          <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-800/50 hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 text-lg">Always Available</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Your tireless employee works around the clock, handling event tasks while you focus on what matters</p>
          </div>
          
          <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-800/50 hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 text-lg">Lightning Fast</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Complete hours of manual work in minutes. From badge creation to attendee tracking, instantly</p>
          </div>
          
          <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-800/50 hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 text-lg">Grows With You</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Handle 10 attendees or 10,000 with the same ease. Your super employee scales effortlessly</p>
          </div>
        </motion.div>
      </motion.div>
    </AuroraBackground>
  )
}
