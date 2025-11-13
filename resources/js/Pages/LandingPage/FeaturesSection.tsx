import { useEffect } from 'react';
import AOS from 'aos';
import { Zap, Headphones, Network, DollarSign } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Kecepatan Tinggi',
    description: 'Nikmati kecepatan internet super cepat hingga 1 Gbps untuk streaming dan gaming yang lancar.',
    gradient: 'from-purple-500 to-pink-500',
    animation: 'fade-right',
  },
  {
    icon: Headphones,
    title: 'Dukungan 24/7',
    description: 'Tim dukungan kami yang berdedikasi selalu siap membantu Anda, kapan saja, dimana saja.',
    gradient: 'from-violet-500 to-purple-500',
    animation: 'fade-up',
  },
  {
    icon: Network,
    title: 'Jaringan Fiber Optik',
    description: 'Infrastruktur masa depan dengan teknologi 100% fiber optik untuk konektivitas yang andal.',
    gradient: 'from-pink-500 to-purple-500',
    animation: 'fade-up',
  },
  {
    icon: DollarSign,
    title: 'Paket Terjangkau',
    description: 'Pilihan harga yang fleksibel sesuai dengan budget Anda tanpa mengorbankan kualitas.',
    gradient: 'from-purple-500 to-indigo-500',
    animation: 'fade-left',
  },
];

export function FeaturesSection() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      offset: 100,
    });
  }, []);

  return (
    <section id="services" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16" data-aos="fade-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4">
            Mengapa Memilih <span className="bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">Lintas Data Prima</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Kami memberikan layanan internet luar biasa dengan teknologi terdepan dan pendekatan yang mengutamakan pelanggan.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                data-aos={feature.animation}
                data-aos-delay={index * 100}
                className="group relative"
              >
                {/* Card */}
                <div className="h-full bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>

                  {/* Hover Effect Border */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center" data-aos="fade-up" data-aos-delay="400">
          <p className="text-gray-600 mb-4">
            Siap merasakan perbedaannya?
          </p>
          <a
            href="#pricing"
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all shadow-lg shadow-purple-200 hover:shadow-xl"
          >
            Lihat Paket Kami
          </a>
        </div>
      </div>
    </section>
  );
}
