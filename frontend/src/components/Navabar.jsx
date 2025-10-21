import React from 'react'

const Navabar = () => {
  return (
    <nav className='p-5 text-[15px] font-medium text-nowrap bg-black text-gray-200 h-20 flex justify-between items-center'>
       <h1 class="text-4xl font-[600] cursor-pointer tracking-tight text-white select-none ">
        <span className="text-red-500">Movie</span>
        <span className="text-white brightness-125">Sync</span>
        </h1>
        <ul className='flex space-x-6'>
            <li className='cursor-pointer hover:text-[#e50914] '>Home</li>
            <li className='cursor-pointer hover:text-[#e50914] '>Suggestion</li>
            <li className='cursor-pointer hover:text-[#e50914] '>Connect</li>
            <li className='cursor-pointer hover:text-[#e50914] '>Watch Party</li>
            <li className='cursor-pointer hover:text-[#e50914] '>Momentz</li>
        </ul>
        <div className='flex items-center space-x-4' >
            <div className='relative flex items-center '>
                <input type="text" className='bg-[#333333] outline-none px-4 py-2 rounded-full' placeholder='Search' />
                <i className='absolute right-3 text-[15px]  ri-search-ai-2-line'></i>
            </div>
            <button className='bg-[#e50914] px-5 py-2 rounded cursor-pointer'>Get AI Movie Picks</button>
            <button className='border border-[#333333] cursor-pointer px-4 py-2 hover:bg-[#e50914]'>Sign In</button>
           
        </div>

    </nav>
  )
}

export default Navabar