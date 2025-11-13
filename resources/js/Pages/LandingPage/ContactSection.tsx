import { useEffect } from 'react';
import AOS from 'aos';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

const logo = '/img/LogoLDP.png';

export function ContactSection() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      offset: 100,
    });
  }, []);

  return (
    <footer id="contact" className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center" data-aos="fade-up">
            <div>
              <h3 className="text-2xl md:text-3xl mb-2">Tetap Terhubung</h3>
              <p className="text-purple-200">
                Berlangganan newsletter kami untuk pembaruan terbaru dan penawaran eksklusif.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Masukkan email Anda"
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-200 focus:border-purple-400"
              />
              <Button className="bg-purple-600 hover:bg-purple-700 text-white whitespace-nowrap">
                Berlangganan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Company Info */}
          <div data-aos="fade-up" data-aos-delay="0">
            <div className="flex items-center gap-2 mb-6">
              <img src={logo} alt="Lintas Data Prima" className="w-10 h-10" />
              <span className="text-xl">Lintas Data Prima</span>
            </div>
            <p className="text-purple-200 mb-6">
              Memberikan internet cepat dan andal kepada jutaan pelanggan di seluruh Indonesia.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Facebook, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Linkedin, href: '#' },
              ].map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-white/10 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div data-aos="fade-up" data-aos-delay="100">
            <h4 className="mb-6">Tautan Cepat</h4>
            <ul className="space-y-3">
              {['Tentang Kami', 'Layanan', 'Harga', 'Karir', 'Blog', 'FAQ'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-purple-200 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div data-aos="fade-up" data-aos-delay="200">
            <h4 className="mb-6">Layanan</h4>
            <ul className="space-y-3">
              {['Internet Residensial', 'Solusi Bisnis', 'Fiber Optik', 'TV & Streaming', 'Layanan Telepon', 'Dukungan Teknis'].map((service) => (
                <li key={service}>
                  <a href="#" className="text-purple-200 hover:text-white transition-colors">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div data-aos="fade-up" data-aos-delay="300">
            <h4 className="mb-6">Hubungi Kami</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <span className="text-purple-200 text-sm">
                  Jl. Sudirman No. 123<br />
                  Jakarta 12190, Indonesia
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="text-purple-200 text-sm">021-555-0123</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="text-purple-200 text-sm">info@lintasdataprima.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-purple-200 text-sm">
            <p>&copy; 2025 Lintas Data Prima. Hak cipta dilindungi.</p>
            <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
              <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-white transition-colors">Syarat Layanan</a>
              <a href="#" className="hover:text-white transition-colors">Kebijakan Cookie</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
