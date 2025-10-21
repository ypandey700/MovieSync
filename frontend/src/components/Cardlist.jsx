import React, { useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import './Cardlist.css'
import banner2 from '../assets/img-banner.jpg'

const data = [
  { id: 1, title: 'Card 1', description: 'Description for Card 1' },
  { id: 2, title: 'Card 2', description: 'Description for Card 2' },
  { id: 3, title: 'Card 3', description: 'Description for Card 3' },
  { id: 4, title: 'Card 4', description: 'Description for Card 4' },
  { id: 5, title: 'Card 5', description: 'Description for Card 5' },
  { id: 6, title: 'Card 6', description: 'Description for Card 6' },
  { id: 7, title: 'Card 7', description: 'Description for Card 7' },
  { id: 8, title: 'Card 8', description: 'Description for Card 8' },
]

const Cardlist = () => {
  const prevRef = useRef(null)
  const nextRef = useRef(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  // handle Swiper state
  const handleSlideChange = (swiper) => {
    setAtStart(swiper.isBeginning)
    setAtEnd(swiper.isEnd)
  }

  return (
    <div className="text-white mt-8">
      <h2 className="text-3xl font-medium mb-6">All Content (Explore)</h2>

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
                <img
                  className="h-72 w-full object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                  src={banner2}
                  alt={item.title}
                />
                <p className="pt-3 text-center font-semibold text-[18px] text-gray-300">
                  {item.description}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}

export default Cardlist