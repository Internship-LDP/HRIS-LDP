import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Button } from '@/Components/ui/button';
import { ArrowRight, MapPin, Wifi, Zap, Globe } from 'lucide-react';

export function HeroSection() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const illustrationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from(headingRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
    })
      .from(
        subtextRef.current,
        {
          opacity: 0,
          y: 30,
          duration: 0.8,
        },
        '-=0.5'
      )
      .from(
        buttonsRef.current?.children || [],
        {
          opacity: 0,
          y: 20,
          stagger: 0.2,
          duration: 0.6,
        },
        '-=0.4'
      )
      .from(
        statsRef.current?.children || [],
        {
          opacity: 0,
          y: 20,
          stagger: 0.15,
          duration: 0.6,
        },
        '-=0.3'
      )
      .from(
        illustrationRef.current,
        {
          opacity: 0,
          scale: 0.8,
          duration: 1,
        },
        '-=1'
      );
  }, []);

  return (
    <section id="home" className="relative pt-24 md:pt-32 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex items-center">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-50 -z-10" />
      
      {/* Animated Background Elements */}
      <div className="absolute top-20 right-10 w-48 h-48 md:w-72 md:h-72 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-64 h-64 md:w-96 md:h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 md:space-y-8 text-center lg:text-left">
            <h1
              ref={headingRef}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-gray-900"
            >
              Internet Cepat & Terpercaya untuk{' '}
              <span className="bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                Semua Orang
              </span>
            </h1>

            <p
              ref={subtextRef}
              className="text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0"
            >
              Menghubungkan Anda ke dunia dengan kecepatan kilat.
            </p>

            <div ref={buttonsRef} className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-xl shadow-purple-200 group w-full sm:w-auto"
              >
                Mulai Sekarang
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50 group w-full sm:w-auto"
              >
                <MapPin className="mr-2 w-5 h-5" />
                Cek Jangkauan
              </Button>
            </div>

            {/* Stats */}
            <div ref={statsRef} className="grid grid-cols-3 gap-4 md:gap-6 pt-8">
              <div className="space-y-1">
                <div className="text-2xl md:text-3xl text-purple-600">1J+</div>
                <div className="text-xs md:text-sm text-gray-600">Pengguna Aktif</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl md:text-3xl text-purple-600">99.9%</div>
                <div className="text-xs md:text-sm text-gray-600">Uptime</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl md:text-3xl text-purple-600">24/7</div>
                <div className="text-xs md:text-sm text-gray-600">Dukungan</div>
              </div>
            </div>
          </div>

          {/* Right Content - Illustration */}
          <div ref={illustrationRef} className="relative">
            <div className="relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-8 md:p-12 shadow-2xl">
              {/* Network Illustration */}
              <div className="relative">
                {/* Center Node */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-2xl z-10">
                  <Wifi className="w-10 h-10 md:w-12 md:h-12 text-purple-600" />
                </div>

                {/* Orbiting Nodes */}
                <div className="relative w-full aspect-square">
                  {[0, 60, 120, 180, 240, 300].map((angle, index) => {
                    const radius = 100;
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;
                    
                    return (
                      <div
                        key={index}
                        className="absolute top-1/2 left-1/2 w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg animate-pulse"
                        style={{
                          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                          animationDelay: `${index * 0.2}s`,
                        }}
                      >
                        {index % 3 === 0 ? (
                          <Zap className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        ) : index % 3 === 1 ? (
                          <Globe className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        ) : (
                          <Wifi className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.3)', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  {[0, 60, 120, 180, 240, 300].map((angle, index) => {
                    const radius = 100;
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;
                    
                    return (
                      <line
                        key={index}
                        x1="50%"
                        y1="50%"
                        x2={`calc(50% + ${x}px)`}
                        y2={`calc(50% + ${y}px)`}
                        stroke="url(#lineGradient)"
                        strokeWidth="2"
                        className="animate-pulse"
                        style={{ animationDelay: `${index * 0.2}s` }}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-4 md:-bottom-6 -left-4 md:-left-6 bg-white/90 backdrop-blur-lg rounded-xl p-4 md:p-6 shadow-xl border border-purple-100">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-600 to-purple-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg md:text-xl">⚡</span>
                </div>
                <div>
                  <div className="text-xl md:text-2xl text-purple-600">1000 Mbps</div>
                  <div className="text-xs md:text-sm text-gray-600">Max Speed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



