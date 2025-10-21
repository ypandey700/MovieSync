import React from 'react'
import banner from '../assets/hero-banner.jpg'
const Hero = () => {
  return (
    <div className='relative '>
        <img className='w-full ' src={banner} alt="banner" />
        <div className='flex text-white absolute bottom-10 left-10 space-x-8'>
            <button className='cursor-pointer px-4 py-2 bg-[#9D4EDD] brightness-100  text-[#ffffff] px-5 py-2 rounded font-[500] hover:scale-105 transition-transform duration-200'> <i className="ri-play-large-line"></i> Watch</button>
            <button className='cursor-pointer px-4 py-2 bg-[#475569] brightness-100  text-[#ffffff] px-5 py-2 rounded font-[500] hover:scale-105 transition-transform duration-200'> <i className="ri-information-line"></i> More Info</button>
        </div>
    </div>
  )
}

export default Hero