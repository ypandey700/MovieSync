import React from 'react'
import Hero from '../components/Hero'
import Cardlist from '../components/Cardlist'
import Footer from '../components/Footer'
const Homepage = () => {
  return (
    <div className='bg-[#1A1A2E] py-8 px-12'>
        <Hero/>
        <Cardlist   title='Popular' category="popular"/>
        <Cardlist  title="Top Rated" category="top_rated"/>
        <Cardlist   title="Now Playing" category="now_playing" />
        <Footer/>
    </div>
  )
}

export default Homepage