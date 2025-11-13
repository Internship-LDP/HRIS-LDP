import { useEffect, useRef } from 'react';
import AOS from 'aos';
import { gsap } from 'gsap';
import { Check, Star } from 'lucide-react';
import { Button } from '@/Components/ui/button';

const plans = [
  {
    name: 'Dasar',
    price: '299',
    speed: '100 Mbps',
    features: [
      'Kecepatan download hingga 100 Mbps',
      'Data tidak terbatas',
      'Instalasi gratis',
      'Dukungan via email',
      'Termasuk 1 pengguna',
    ],
    popular: false,
  },
  {
    name: 'Standar',
    price: '499',
    speed: '500 Mbps',
    features: [
      'Kecepatan download hingga 500 Mbps',
      'Data tidak terbatas',
      'Instalasi & router gratis',
      'Dukungan prioritas 24/7',
      'Hingga 5 pengguna',
      'Paket keamanan gratis',
    ],
    popular: true,
  },
  {
    name: 'Premium',
    price: '799',
    speed: '1000 Mbps',
    features: [
      'Kecepatan download hingga 1 Gbps',
      'Data tidak terbatas',
      'Instalasi & router premium gratis',
      'Dukungan VIP 24/7',
      'Pengguna tidak terbatas',
      'Paket keamanan & kontrol orang tua gratis',
      'Alamat IP statis',
    ],
    popular: false,
  },
];

export function PricingSection() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      offset: 100,
    });

    // Add hover animation for cards
    cardsRef.current.forEach((card, index) => {
      if (card) {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            scale: index === 1 ? 1.03 : 1.05,
            duration: 0.3,
            ease: 'power2.out',
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
        });
      }
    });
  }, []);

  return (
    <section id="pricing" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16" data-aos="fade-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4">
            Harga yang Sederhana & <span className="bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">Transparan</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Pilih paket yang sempurna untuk kebutuhan Anda. Semua paket termasuk data tidak terbatas dan tanpa kontrak.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              ref={(el) => (cardsRef.current[index] = el)}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className={`relative ${
                plan.popular ? 'md:-mt-4' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-1 rounded-full text-sm flex items-center gap-1 shadow-lg z-10">
                  <Star className="w-4 h-4 fill-current" />
                  Paling Populer
                </div>
              )}

              {/* Card */}
              <div
                className={`h-full bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border-2 ${
                  plan.popular
                    ? 'border-purple-500 shadow-purple-200'
                    : 'border-gray-200'
                }`}
              >
                {/* Plan Name */}
                <h3 className="text-2xl text-gray-900 mb-2">
                  {plan.name}
                </h3>
                
                {/* Speed */}
                <div className="text-purple-600 mb-6">{plan.speed}</div>

                {/* Price */}
                <div className="mb-8">
                  <span className="text-4xl md:text-5xl text-gray-900">Rp{plan.price}</span>
                  <span className="text-gray-600">rb/bulan</span>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-purple-600" />
                      </div>
                      <span className="text-gray-600 text-sm md:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg shadow-purple-200'
                      : 'bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  Mulai Sekarang
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12" data-aos="fade-up" data-aos-delay="400">
          <p className="text-gray-600">
            Semua paket dilengkapi dengan jaminan uang kembali 30 hari. Tanpa pertanyaan.
          </p>
        </div>
      </div>
    </section>
  );
}
