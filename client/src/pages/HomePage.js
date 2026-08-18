import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Reveal, revealContainer, revealItem } from '../components/Reveal';

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#FDE68A]">
      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        {/* Very subtle, slow-drifting background blur — barely noticeable, just adds depth */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 -right-10 w-96 h-96 bg-gray-900/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          className="relative text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <Logo className="h-14 w-14 sm:h-16 sm:w-16" />
            <span className="text-5xl sm:text-7xl font-extrabold text-gray-900 tracking-tight">
              Lend<span className="text-accent-500">Nest</span>
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
            Borrow and lend items with people near you
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Share the things you own with your community. Find neighbors with exactly what you need, just around the corner.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/browse"
                    className="block px-9 py-4 bg-accent-500 text-black rounded-xl font-bold text-lg hover:bg-accent-400 transition-colors duration-200 shadow-lg shadow-accent-500/20"
                  >
                    Browse Items
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/create-item"
                    className="block px-9 py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors duration-200"
                  >
                    List an Item
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/signup"
                    className="block px-9 py-4 bg-accent-500 text-black rounded-xl font-bold text-lg hover:bg-accent-400 transition-colors duration-200 shadow-lg shadow-accent-500/20"
                  >
                    Get Started
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/login"
                    className="block px-9 py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors duration-200"
                  >
                    Log In
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="bg-[#FDE68A] py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
              How It Works
            </h2>
          </Reveal>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={revealContainer}
          >
            {[
              { icon: '🌍', title: 'Find Nearby Lenders', text: 'Search for items you need and see them sorted by distance — the closest lenders appear first.' },
              { icon: '📌', title: 'List Your Items', text: "Have something you're not using? List it for others to borrow — set your own terms." },
              { icon: '⭐', title: 'Build Trust', text: 'Rate and review users after exchanges. Build a reputation in your community.' },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={revealItem}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="card p-10 text-center"
              >
                <div className="text-5xl mb-5">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-black text-white py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Reveal className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-extrabold">
              Join Our Community
            </h2>
          </Reveal>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={revealContainer}
          >
            {[
              { icon: '📚', text: 'Share books, tools, and more' },
              { icon: '🌍', text: 'Find items within your neighborhood' },
              { icon: '👥', text: 'Connect with your community' },
            ].map((stat) => (
              <motion.div key={stat.text} variants={revealItem}>
                <div className="text-5xl font-bold mb-3 text-accent-500">{stat.icon}</div>
                <p className="text-lg text-gray-200">{stat.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}