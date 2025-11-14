import { useEffect } from 'react';
import AOS from 'aos';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

import { Button } from '@/Components/ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

type CareerJob = {
  division: string;
  title?: string | null;
  location?: string | null;
  type?: string | null;
  description?: string | null;
  isHiring: boolean;
  availableSlots?: number | null;
};

interface CareersSectionProps {
  jobs: CareerJob[];
}

export function CareersSection({ jobs }: CareersSectionProps) {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      offset: 100,
    });
  }, []);

  const hasJobs = jobs.length > 0;

  return (
    <section id="careers" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16">
          <div data-aos="fade-right">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4">
              Bergabung dengan{' '}
              <span className="bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                Tim Kami
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-6">
              Jelajahi lowongan pekerjaan saat ini dan kembangkan karir Anda bersama kami.
            </p>
            <p className="text-gray-600">
              Kami membangun masa depan konektivitas. Bergabunglah dengan tim profesional yang bersemangat
              untuk membawa internet berkecepatan tinggi ke semua orang.
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
        {hasJobs ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => {
              const canApply = job.isHiring;
              const title = canApply
                ? job.title ?? `Lowongan ${job.division}`
                : `Belum ada lowongan di ${job.division}`;
              const location = job.location ?? job.division;
              const type = job.type ?? 'Full-time';
              const slots =
                typeof job.availableSlots === 'number' && job.availableSlots > 0
                  ? `${job.availableSlots} posisi tersedia`
                  : null;

              return (
                <div
                  key={`${job.division}-${index}`}
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                  className={`relative group bg-white border border-gray-200 rounded-xl p-6 transition-all duration-300 ${
                    canApply
                      ? 'hover:shadow-xl hover:border-purple-300 hover:-translate-y-1 cursor-pointer'
                      : 'opacity-95'
                  }`}
                >
                  {canApply && (
                    <Link
                      href={route('login')}
                      aria-label={`Lamar posisi ${title}`}
                      className="absolute inset-0 z-10"
                    />
                  )}
                  <div className="relative z-0 space-y-4">
                    {/* Division Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      <span>{job.division}</span>
                      {slots && <span className="text-xs text-purple-500">{slots}</span>}
                    </div>

                    {/* Job Title */}
                    <div>
                      <h3 className="text-xl text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                        {title}
                      </h3>
                      {job.description && job.isHiring && (
                        <p className="text-sm text-gray-500 line-clamp-3">{job.description}</p>
                      )}
                    </div>

                    {/* Job Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{type}</span>
                      </div>
                    </div>

                    <div
                      className={`flex items-center justify-between text-sm font-medium ${
                        canApply ? 'text-purple-600' : 'text-gray-400'
                      }`}
                    >
                      <span>{canApply ? 'Klik untuk melamar' : 'Belum membuka lowongan'}</span>
                      {canApply && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50 p-8 text-center">
            <p className="text-purple-700 font-medium">Belum ada data lowongan ditampilkan saat ini.</p>
            <p className="text-sm text-purple-500 mt-2">
              Pantau halaman ini secara berkala untuk mengetahui pembukaan rekrutmen terbaru.
            </p>
          </div>
        )}

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
