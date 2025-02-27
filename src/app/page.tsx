"use client"

import Link from "next/link"
import { ArrowRight, Home, Heart, Filter, X, CheckCircle, Scan } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-800">
        {/* Animated Background Shapes */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute top-40 right-40 w-64 h-64 bg-gradient-to-r from-indigo-500/30 to-sky-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.4, 1],
              x: [0, -30, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </motion.div>

        {/* Updated Hero Content */}
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Find Your Perfect Home
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
                One Swipe at a Time
              </span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              SwipeRent makes apartment hunting fun and easy. Swipe right on your dream home and left on the rest.
            </p>
            <Link 
              href="/swipe"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Swipe Feature Demo Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Swipe Your Way Home
            </h2>
            <p className="text-xl text-gray-300">
              Finding your next apartment has never been more intuitive
            </p>
          </motion.div>

          {/* Interactive Swipe Demo */}
          <div className="relative max-w-sm mx-auto">
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: [0, 20, 0] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-gray-800 shadow-2xl"
            >
              <Image
                src="/demo-apartment.jpg"
                alt="Demo Apartment"
                fill
                className="object-cover"
                priority
              />
              {/* Swipe Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/50 to-transparent"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white font-semibold">Modern Downtown Apartment</h3>
                <p className="text-gray-200">$2,200/month • 2 bed • 2 bath</p>
              </div>
            </motion.div>

            {/* Swipe Actions */}
            <div className="flex justify-center gap-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="p-4 rounded-full bg-red-500/20 border border-red-500/50"
              >
                <X className="w-6 h-6 text-red-500" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="p-4 rounded-full bg-cyan-500/20 border border-cyan-500/50"
              >
                <Heart className="w-6 h-6 text-cyan-500" />
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* One-Click Apply Section */}
      <section className="py-20 bg-gradient-to-br from-cyan-900 to-blue-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                One-Click Apply™
              </h2>
              <p className="text-xl text-gray-300">
                Skip the paperwork hassle. Apply to multiple apartments instantly with your verified profile.
              </p>
            </motion.div>

            {/* Application Process Steps */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm"
              >
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scan className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Verify Once</h3>
                <p className="text-gray-300">Upload and verify your documents just once</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm"
              >
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Find Your Match</h3>
                <p className="text-gray-300">Swipe and save your favorite apartments</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm"
              >
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Apply Instantly</h3>
                <p className="text-gray-300">Submit applications with a single click</p>
              </motion.div>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Link 
                href="/auth"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white 
                         bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full
                         hover:from-cyan-600 hover:to-blue-600 transition-all transform 
                         hover:scale-105 shadow-lg shadow-cyan-500/25"
              >
                Create Your Profile
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Existing Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Why Choose SwipeRent?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<Home className="w-8 h-8 text-cyan-400" />}
              title="Easy Browsing"
              description="Swipe through available apartments with our intuitive interface. No more endless scrolling through listings."
            />
            <FeatureCard 
              icon={<Heart className="w-8 h-8 text-blue-400" />}
              title="Save Favorites"
              description="Keep track of apartments you love. Save them for later and contact landlords when you're ready."
            />
            <FeatureCard 
              icon={<Filter className="w-8 h-8 text-indigo-400" />}
              title="Smart Filters"
              description="Find exactly what you're looking for with our advanced filtering system. Set your preferences and we'll do the rest."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-900 to-blue-900">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Ready to Find Your New Home?
          </h2>
          <Link 
            href="/swipe"
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105"
          >
            Start Swiping Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <motion.div 
      className="text-center p-8 rounded-2xl bg-gray-800/50 backdrop-blur-lg border border-gray-700"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <div className="inline-block p-4 rounded-full bg-gray-700/50 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </motion.div>
  )
}

