import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Landing Page
 * File: src/pages/Landing.jsx
 *
 * The public-facing homepage. Goal: convert visitors into signups.
 *
 * SECTIONS:
 * 1. Hero — main value proposition
 * 2. How it works — 3 steps
 * 3. Features — what makes us unique
 * 4. Stats — social proof
 * 5. CTA — call to action
 */
export default function Landing() {
  const { isAuthenticated } = useAuth();

  const features = [
    { icon: '🎯', title: 'Expert Coaches', desc: 'Diamond through Challenger level coaches, verified by our team.' },
    { icon: '📅', title: 'Easy Booking', desc: 'Pick a time, choose a duration, and get coaching within 24 hours.' },
    { icon: '🎥', title: 'Session Recordings', desc: 'Every session is recorded so you can review the lessons later.' },
    { icon: '📊', title: 'Progress Tracking', desc: 'Track your improvement with post-session notes and performance analytics.' },
    { icon: '💬', title: 'Direct Messaging', desc: 'Message your coach between sessions with questions and updates.' },
    { icon: '⚔️', title: 'Riot API Integration', desc: 'Import your match history for coaches to analyze your actual games.' },
  ];

  const stats = [
    { value: '500+', label: 'Students Coached' },
    { value: '50+', label: 'Verified Coaches' },
    { value: '4.8★', label: 'Average Rating' },
    { value: '2,000+', label: 'Sessions Completed' },
  ];

  const steps = [
    { step: '01', title: 'Browse Coaches', desc: 'Filter by rank, role, price, and region to find your perfect coach.' },
    { step: '02', title: 'Book a Session', desc: 'Pick a time that works for you and describe your goals.' },
    { step: '03', title: 'Climb the Ladder', desc: 'Apply what you learned and watch your rank skyrocket.' },
  ];

  return (
    <div className="overflow-hidden">

      {/* ========== HERO SECTION ========== */}
      <section className="relative py-20 lg:py-32 px-4">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Social proof badge */}
          <div className="inline-flex items-center gap-2 bg-dark-700 border border-dark-600 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-400">500+ players coached this month</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Stop Blaming Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
              Teammates
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Book 1-on-1 sessions with verified Diamond–Challenger coaches.
            Learn exactly what's holding you back and climb in weeks, not months.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={isAuthenticated ? '/coaches' : '/register'}
              className="btn-primary text-lg px-8 py-4 rounded-xl"
            >
              {isAuthenticated ? 'Browse Coaches' : 'Get Started Free'}
            </Link>
            <Link
              to="/coaches"
              className="btn-secondary text-lg px-8 py-4 rounded-xl"
            >
              Browse Coaches →
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">✅ No subscription required</span>
            <span className="flex items-center gap-1.5">✅ Pay per session</span>
            <span className="flex items-center gap-1.5">✅ Money-back guarantee</span>
          </div>
        </div>
      </section>

      {/* ========== STATS SECTION ========== */}
      <section className="bg-dark-900 border-y border-dark-700 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-primary-400">{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">How It Works</h2>
          <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
            From zero to coaching session in under 5 minutes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.step} className="relative text-center">
                <div className="w-16 h-16 bg-primary-500/20 border border-primary-500/30 rounded-2xl
                                flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-400 font-bold text-xl">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="py-20 px-4 bg-dark-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Everything You Need to Climb</h2>
          <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
            A complete platform built specifically for LoL players who want to improve.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="card hover:border-dark-500 transition-colors">
                <span className="text-4xl block mb-4">{feature.icon}</span>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Stop Hardstucking?
          </h2>
          <p className="text-gray-400 mb-8">
            Join thousands of players who have climbed with EloCoach. First session satisfaction guaranteed.
          </p>
          <Link
            to={isAuthenticated ? '/coaches' : '/register'}
            className="btn-primary text-lg px-10 py-4 rounded-xl inline-block"
          >
            {isAuthenticated ? 'Find a Coach' : 'Create Free Account'}
          </Link>
        </div>
      </section>
    </div>
  );
}
