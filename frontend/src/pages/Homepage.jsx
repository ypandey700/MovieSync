import React from 'react'
import Hero from '../components/Hero'
import Cardlist from '../components/Cardlist'
import Footer from '../components/Footer'
const Homepage = () => {
  return (
    <div className='bg-[#1A1A2E] py-8 px-12'>
        <Hero/>
        <Cardlist/>
        <Footer/>
    </div>
  )
}

export default Homepage