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
        {/* Main Heading */}
        <div className="text-4xl md:text-7xl font-bold dark:text-white text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400">
          ID Card Automation Platform
        </div>
        
        {/* Subheading */}
        <div className="font-light text-lg md:text-3xl dark:text-neutral-200 text-neutral-700 py-4 text-center max-w-3xl">
          Generate professional ID cards in bulk. Upload your design, add data, and create badges for your entire team in minutes.
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-3 justify-center mb-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="px-4 py-2 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-full border border-neutral-200 dark:border-neutral-800"
          >
            <span className="text-sm font-medium dark:text-neutral-200 text-neutral-700">🎨 Design Templates</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="px-4 py-2 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-full border border-neutral-200 dark:border-neutral-800"
          >
            <span className="text-sm font-medium dark:text-neutral-200 text-neutral-700">📊 Import Data</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="px-4 py-2 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-full border border-neutral-200 dark:border-neutral-800"
          >
            <span className="text-sm font-medium dark:text-neutral-200 text-neutral-700">⚡ Generate & Export</span>
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
            className="bg-black dark:bg-white rounded-full w-fit text-white dark:text-black px-8 py-3 font-semibold hover:scale-105 transition-transform shadow-lg"
          >
            Get Started Free
          </Link>
          <Link
            href="/auth/login"
            className="bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-full w-fit text-black dark:text-white px-8 py-3 font-semibold hover:scale-105 transition-transform border border-neutral-300 dark:border-neutral-700"
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
          <p>✓ No credit card required  •  ✓ Free for up to 100 badges  •  ✓ Cancel anytime</p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl w-full"
        >
          <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-800/50 hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 text-lg">Design Templates</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Upload your badge design and place fields visually with our intuitive editor</p>
          </div>
          
          <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-800/50 hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 text-lg">Import Data</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Upload CSV or Excel files with attendee information in seconds</p>
          </div>
          
          <div className="bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-800/50 hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 text-lg">Generate & Export</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Create hundreds of badges in bulk and download as ZIP instantly</p>
          </div>
        </motion.div>
      </motion.div>
    </AuroraBackground>
  )
}
