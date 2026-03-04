import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, ChevronDown, Search } from "lucide-react";

type HomeHeroProps = {
  onBrowseJobs: () => void;
};

export default function HomeHero({ onBrowseJobs }: HomeHeroProps) {
  return (
    <section className="px-4 py-6 sm:py-10">
      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative grid lg:grid-cols-2 rounded-2xl overflow-hidden border border-primary-200 bg-white"
        >
          <div className="relative bg-[#0a4abf] px-5 sm:px-10 py-10 sm:py-14">
            <h1 className="text-white text-[2rem] sm:text-5xl lg:text-6xl font-bold leading-[1.1] max-w-xl">
              Find the right job
              <br />
              Work without borders
            </h1>

            <div className="mt-6 sm:mt-8 bg-white rounded-2xl sm:rounded-full p-2 w-full max-w-2xl flex flex-col sm:flex-row items-stretch gap-1">
              <div className="flex items-center gap-3 px-4 py-2.5 flex-1 text-primary-600 border-b sm:border-b-0 sm:border-r border-primary-200">
                <Search className="w-5 h-5 text-primary-500" />
                <input
                  type="text"
                  placeholder="Search by job title, skill, or keyword"
                  className="w-full bg-transparent text-sm sm:text-base text-primary-900 placeholder:text-primary-400 outline-none"
                />
              </div>

              <button
                type="button"
                className="flex items-center justify-between px-4 py-2.5 w-full sm:w-auto sm:min-w-[180px] text-primary-900"
              >
                <span className="text-sm sm:text-base">
                  Category (optional)
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onBrowseJobs}
                className="h-11 sm:h-auto sm:w-20 rounded-full bg-[#abff31] text-[#0a4abf] flex items-center justify-center shadow-sm hover:brightness-95 transition"
                aria-label="Search jobs"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <span className="hidden sm:inline-flex absolute top-5 right-6 text-2xl text-[#d999ff]">
              ✦
            </span>
            <span className="hidden sm:inline-flex absolute top-10 right-16 text-base text-[#d999ff]">
              ✦
            </span>
          </div>

          <div className="relative bg-[#abff31] min-h-[240px] sm:min-h-[360px] flex items-center justify-center">
            <motion.div
              aria-hidden
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            >
              <div className="relative w-52 h-52 sm:w-72 sm:h-72 rounded-full border border-white/40">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-white">
                  <Image
                    src="/image1.png"
                    alt="Decorative profile"
                    fill
                    quality={100}
                    sizes="(max-width: 640px) 56px, 64px"
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-white">
                  <Image
                    src="/image2.png"
                    alt="Decorative profile"
                    fill
                    quality={100}
                    sizes="(max-width: 640px) 56px, 64px"
                    className="object-cover"
                  />
                </div>
                <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-white">
                  <Image
                    src="/image.png"
                    alt="Decorative profile"
                    fill
                    quality={100}
                    sizes="(max-width: 640px) 56px, 64px"
                    className="object-cover"
                  />
                </div>
                <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-white">
                  <Image
                    src="/image3.png"
                    alt="Decorative profile"
                    fill
                    quality={100}
                    sizes="(max-width: 640px) 56px, 64px"
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>

            <div className="relative w-36 h-36 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-white/80 shadow-[0_24px_55px_rgba(10,74,191,0.28)]">
              <Image
                src="/heroman.png"
                alt="Lenno hero person"
                fill
                priority
                quality={100}
                sizes="(max-width: 640px) 144px, 224px"
                className="object-cover object-top"
              />
            </div>

            <div className="hidden sm:flex absolute -left-8 top-7 w-24 h-24 rounded-full bg-[#b3ff4d] border-4 border-[#87d422] text-[#0a4abf] text-[10px] font-bold items-center justify-center text-center leading-tight p-2">
              SCROLL DOWN
            </div>
          </div>
        </motion.div>

        <span className="hidden md:inline-flex absolute -top-3 left-8 rotate-[-12deg] px-4 py-1.5 rounded-full bg-[#ffb4e6] text-[#5c0e47] text-xs font-medium shadow-lg z-20">
          Designer
        </span>
        <span className="hidden md:inline-flex absolute -bottom-3 left-16 rotate-[10deg] px-4 py-1.5 rounded-full bg-[#abff31] text-[#0a4abf] text-xs font-medium shadow-lg z-20">
          Project Management
        </span>
        <span className="hidden md:inline-flex absolute top-10 right-20 rotate-[8deg] px-4 py-1.5 rounded-full bg-[#e2f6fa] text-[#003a8c] text-xs font-medium shadow-lg z-20">
          Graphic Design
        </span>
        <span className="hidden md:inline-flex absolute bottom-4 right-100 rotate-[-16deg] px-4 py-1.5 rounded-full bg-[#f3f4f6] text-primary-700 text-xs font-medium shadow-lg z-20">
          Developers
        </span>
        <span className="hidden md:inline-flex absolute bottom-10 right-6 rotate-[-9deg] px-4 py-1.5 rounded-full bg-[#ffe28a] text-[#5e4400] text-xs font-medium shadow-lg z-20">
          Writer
        </span>
      </div>
    </section>
  );
}
