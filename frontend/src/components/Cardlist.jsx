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
  console.log(title)

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



  return (
    <div className="text-white mt-8">
      <h2 className="text-3xl font-medium mb-6">{title}</h2>

      <div className="relative overflow-visible">
        {/* external navigation */}
        <button
          ref={prevRef}
          className={`nav-rail prev ${atStart ? 'hidden' : ''}`}
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
          className={`nav-rail next ${atEnd ? 'hidden' : ''}`}
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
          spaceBetween={20}
          slidesPerView={4}
          grabCursor
          className="px-10"
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
          }}
        >
          {data.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="cursor-pointer">
                 <Link to={`/movie/${item.id}`}>
                <img
                  className="h-88 w-full  object-top object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                  src={`https://image.tmdb.org/t/p/w500/${item.poster_path}`}
                  alt={item.title}
                />
                <p className="pt-3 text-center font-semibold text-[18px] text-gray-300">
                  {item.original_title}
                </p>
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}

export default Cardlist