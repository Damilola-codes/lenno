"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/heroman.png",
    alt: "Auth visual one",
    quote:
      "\"Lenno helped me get my first remote client in less than a week. The process felt simple and I could focus on my work, not chasing leads.\"",
    author: "Davis - Product Designer",
  },
  {
    src: "/image1.png",
    alt: "Auth visual two",
    quote:
      "\"I posted a role and got quality proposals fast. Every profile showed exactly what I needed to make a confident hiring decision.\"",
    author: "Jordan - Startup Founder",
  },
  {
    src: "/image3.png",
    alt: "Auth visual three",
    quote:
      "\"Payments and milestones are very clear on Lenno. I always know what stage a project is in and when I should expect payout.\"",
    author: "Alexa - Marketing Consultant",
  },
];

export default function AuthVisualCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full rounded-2xl overflow-hidden border border-gray-300 min-h-[280px] sm:min-h-[360px]">
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            quality={100}
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-[#0a4abf]/70 via-black/25 to-transparent" />
      <div className="absolute top-3 left-3 h-8 w-8 rounded-md bg-green-400 flex items-center justify-center sm:top-4 sm:left-4 sm:h-9 sm:w-9">
        <Image
          src="/quote.png"
          alt="Quote icon"
          width={16}
          height={16}
          quality={100}
          className="object-contain sm:h-[18px] sm:w-[18px]"
        />
      </div>

      <div className="absolute bottom-6 left-4 right-4 text-white sm:bottom-7 sm:left-6 sm:right-6">
        <p className="text-base font-semibold leading-snug sm:text-lg sm:leading-snug lg:text-2xl lg:leading-tight">
          {slides[activeIndex].quote}
        </p>
        <p className="mt-2 text-xs font-medium sm:mt-3 sm:text-sm lg:mt-4 lg:text-lg">
          {slides[activeIndex].author}
        </p>
      </div>

      <div className="absolute bottom-2 left-3 right-3 flex gap-1.5 sm:left-4 sm:right-4 sm:gap-2">
        {slides.map((slide, index) => (
          <span
            key={slide.src}
            className={`h-1 flex-1 rounded-full transition-colors ${
              index === activeIndex ? "bg-[#abff31]" : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
