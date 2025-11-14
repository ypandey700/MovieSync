// src/pages/Homepage.jsx
import React from 'react';
import Hero from '../components/Hero';
import Cardlist from '../components/Cardlist';
import Footer from '../components/Footer';
import PreviouslyWatchedSection from '../components/PreviouslyWatchedSection';

const Homepage = () => {
  return (
    <div className='bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen relative overflow-hidden'>
      
      {/* Decorative background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-60 left-20 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content */}
      <div className='relative z-10'>
        
        {/* Hero Section */}
        <div className='py-8 px-12'>
          <Hero/>
        </div>

       

        {/* Popular Section */}
        <div className='mt-16 px-12'>
          <div className='flex items-center gap-4 mb-6'>
            <div className='w-1.5 h-10 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full shadow-lg shadow-orange-500/50'></div>
            <h2 className='text-3xl font-black text-white'>
              Popular <span className='text-orange-500'>Right Now</span>
            </h2>
            <div className='flex-1 h-px bg-gradient-to-r from-orange-500/40 to-transparent ml-4'></div>
          </div>
          <Cardlist category="popular"/>
        </div>

        {/* Top Rated Section */}
        <div className='mt-16 px-12'>
          <div className='flex items-center gap-4 mb-6'>
            <div className='w-1.5 h-10 bg-gradient-to-b from-cyan-400 to-cyan-500 rounded-full shadow-lg shadow-cyan-400/50'></div>
            <h2 className='text-3xl font-black text-white'>
              Top <span className='text-cyan-400'>Rated</span>
            </h2>
            <div className='flex-1 h-px bg-gradient-to-r from-cyan-400/40 to-transparent ml-4'></div>
          </div>
          <Cardlist category="top_rated"/>
        </div>

        {/* Now Playing Section */}
        <div className='mt-16 px-12 py-12 mb-12'>
          <div className='flex items-center gap-4 mb-6'>
            <div className='w-1.5 h-10 bg-gradient-to-b from-orange-500 via-orange-400 to-cyan-400 rounded-full shadow-lg shadow-orange-500/50'></div>
            <h2 className='text-3xl font-black text-white'>
              Now <span className='bg-gradient-to-r from-orange-500 to-cyan-400 bg-clip-text text-transparent'>Playing</span>
            </h2>
            <div className='flex-1 h-px bg-gradient-to-r from-orange-400/40 via-cyan-400/40 to-transparent ml-4'></div>
            <span className='px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full text-red-400 text-xs font-bold uppercase tracking-wider animate-pulse'>
              Live
            </span>
          </div>
          <Cardlist category="now_playing" />
        </div>
         {/* Previously Watched Section */}
        <div className='mt-16 px-12'>
          <div className='flex items-center gap-4 mb-6'>
            <div className='w-1.5 h-10 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full shadow-lg shadow-purple-500/50'></div>
            <h2 className='text-3xl font-black text-white'>
              Continue <span className='text-purple-500'>Watching</span>
            </h2>
            <div className='flex-1 h-px bg-gradient-to-r from-purple-500/40 to-transparent ml-4'></div>
            <span className='px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded-full text-purple-400 text-xs font-bold uppercase tracking-wider'>
              Resume
            </span>
          </div>
          <PreviouslyWatchedSection />
        </div>

        <Footer/>
      </div>
    </div>
  );
};

export default Homepage;