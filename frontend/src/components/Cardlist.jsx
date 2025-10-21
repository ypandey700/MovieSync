import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
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
  return (
    <div className="text-white mt-8">
      <h2 className="text-3xl font-[500] mb-8 ">All Content (Explore)</h2>

      <div className="relative">
        <Swiper
          modules={[Navigation]}
          navigation={true}
          spaceBetween={20}
          slidesPerView={4}
          grabCursor={true}
          className="px-10"
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
          }}
        >
          {data.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="min-w-[250px] cursor-pointer">
                <img
                  className="h-72 w-full object-cover rounded-lg"
                  src={banner2}
                  alt={item.title}
                />
                <p className="pt-3 text-sm text-gray-300">{item.description}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <style jsx>{`
          .swiper-button-prev,
          .swiper-button-next {
            background: rgba(62, 236, 172, 0.15);
            color: #3eecac;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            transition: all 0.3s ease-in-out;
            opacity: 0.9;
          }

          .swiper-button-prev:hover,
          .swiper-button-next:hover {
            background: #3eecac;
            color: #0b0b14;
            box-shadow: 0 0 12px #3eecac;
            transform: scale(1.1);
            opacity: 1;
          }

          .swiper-button-prev::after,
          .swiper-button-next::after {
            font-size: 18px;
            font-weight: bold;
          }
        `}</style>
      </div>
    </div>
  )
}

export default Cardlist