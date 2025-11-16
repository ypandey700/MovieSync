import React, { useEffect, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import './Cardlist.css'
import banner2 from '../assets/img-banner.jpg'
import  {Link} from "react-router"
const TMDB_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN //use api key



const Cardlist = ({title,category}) => {
  // Removed console.log for cleaner output

const [data, setData] = useState([]);


  const prevRef = useRef(null)
  const nextRef = useRef(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  // handle Swiper state
  const handleSlideChange = (swiper) => {
    setAtStart(swiper.isBeginning)
    setAtEnd(swiper.isEnd)
  }

  const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
     Authorization: `Bearer ${TMDB_TOKEN}`,
  }
};
useEffect(()=>{
  fetch( `https://api.themoviedb.org/3/movie/${category}?language=en-US&page=1`, options)
  .then(res => res.json())
  .then(res => setData(res.results))
  .catch(err => console.error(err));
},[])

  // Determine button color based on category
  const buttonClass = category === 'top_rated' ? 'nav-rail-cyan' : 'nav-rail-orange';


  return (
    <div className="text-white mt-8">
      <h2 className="text-3xl font-medium mb-6">{title}</h2>

      <div className="relative overflow-visible">
        {/* external navigation */}
        <button
          ref={prevRef}
          className={`nav-rail ${buttonClass} prev ${atStart ? 'hidden' : ''}`}
          aria-label="Previous"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          ref={nextRef}
          className={`nav-rail ${buttonClass} next ${atEnd ? 'hidden' : ''}`}
          aria-label="Next"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Swiper */}
        <Swiper
          modules={[Navigation]}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current
            swiper.params.navigation.nextEl = nextRef.current
          }}
          onSlideChange={handleSlideChange}
          spaceBetween={16}
          slidesPerView={5}
          grabCursor
          className="px-10"
          breakpoints={{
            320: { slidesPerView: 2 },
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 5 },
          }}
        >
          {data.map((item) => {
            const year = item.release_date ? item.release_date.split('-')[0] : 'N/A';
            const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
            
            return (
              <SwiperSlide key={item.id}>
                <div className="cursor-pointer group">
                  <Link to={`/movie/${item.id}`}>
                    <div className="relative overflow-hidden rounded-lg border-2 border-slate-700 group-hover:border-orange-500 transition-all duration-300 aspect-[2/3]">
                      <img
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        src={`https://image.tmdb.org/t/p/w500/${item.poster_path}`}
                        alt={item.title}
                      />
                      
                      {/* Hover Overlay with Details */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        
                        {/* Rating Badge */}
                        <div className="absolute top-3 right-3 bg-yellow-500 text-black font-bold text-xs px-2 py-1 rounded-md flex items-center gap-1">
                          <i className="ri-star-fill"></i>
                          {rating}
                        </div>
                        
                        {/* Movie Info */}
                        <div className="space-y-2">
                          <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight">
                            {item.original_title}
                          </h3>
                          
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <span className="flex items-center gap-1">
                              <i className="ri-calendar-line"></i>
                              {year}
                            </span>
                            <span className="text-orange-500">•</span>
                            <span className="flex items-center gap-1">
                              <i className="ri-fire-fill text-orange-500"></i>
                              {item.popularity?.toFixed(0)}
                            </span>
                          </div>
                          
                          <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">
                            {item.overview || "No description available."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>
    </div>
  )
}

export default Cardlist