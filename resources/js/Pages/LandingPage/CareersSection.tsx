import { useEffect } from 'react';
import AOS from 'aos';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

const jobs = [
  {
    title: 'Network Engineer',
    location: 'Jakarta',
    type: 'Full-time',
    department: 'Engineering',
  },
  {
    title: 'Customer Support Specialist',
    location: 'Remote',
    type: 'Full-time',
    department: 'Dukungan',
  },
  {
    title: 'Sales Executive',
    location: 'Surabaya',
    type: 'Full-time',
    department: 'Penjualan',
  },
  {
    title: 'Product Manager',
    location: 'Bandung',
    type: 'Full-time',
    department: 'Produk',
  },
  {
    title: 'Teknisi Fiber Optik',
    location: 'Berbagai Lokasi',
    type: 'Full-time',
    department: 'Operasional',
  },
  {
    title: 'Marketing Manager',
    location: 'Jakarta',
    type: 'Full-time',
    department: 'Marketing',
  },
];

export function CareersSection() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      offset: 100,
    });
  }, []);

  return (
    <section id="careers" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16">
          <div data-aos="fade-right">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4">
              Bergabung dengan <span className="bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">Tim Kami</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-6">
              Jelajahi lowongan pekerjaan saat ini dan kembangkan karir Anda bersama kami.
            </p>
            <p className="text-gray-600">
              Kami membangun masa depan konektivitas. Bergabunglah dengan tim profesional yang bersemangat untuk membawa internet berkecepatan tinggi ke semua orang.
            </p>
          </div>

          <div data-aos="fade-left" className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1748346918817-0b1b6b2f9bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB0ZWFtfGVufDF8fHx8MTc2Mjg2NTQ2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Tim Kami"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-transparent" />
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 50}
              className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-purple-300 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Department Badge */}
              <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm mb-4">
                {job.department}
              </div>

              {/* Job Title */}
              <h3 className="text-xl text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                {job.title}
              </h3>

              {/* Job Details */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{job.type}</span>
                </div>
              </div>

              {/* Apply Button */}
              <Button
                variant="ghost"
                className="w-full group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors"
              >
                Lamar Sekarang
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center" data-aos="fade-up">
          <p className="text-gray-600 mb-4">
            Tidak menemukan posisi yang tepat? Kirimkan CV Anda kepada kami!
          </p>
          <Button
            variant="outline"
            className="border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            Kirim CV
          </Button>
        </div>
      </div>
    </section>
  );
}
