// Updated Navbar integrating GooeyNav // FIXED: tuned pill glow + blur radius + blend-mode to avoid color bleeding component
// This file merges your existing Navbar logic with the GooeyNav visual style
// Replace your current Navbar.tsx with this file or adjust as needed

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Menu, X } from 'lucide-react';
import { Link } from '@inertiajs/react';
import GooeyNav from '@/Components/GooeyNav'; // make sure path is correct
import { Button } from '@/Components/ui/button';

const logo = '/img/LogoLDP.png';

type NavbarProps = {
  canLogin?: boolean;
  canRegister?: boolean;
};

export function Navbar({ canLogin = true, canRegister = true }: NavbarProps) {
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { label: 'Beranda', href: '#home' },
    { label: 'Layanan', href: '#services' },
    { label: 'Harga', href: '#pricing' },
    { label: 'Karir', href: '#careers' },
    { label: 'Kontak', href: '#contact' }
  ];

  useEffect(() => {
    if (logoRef.current) {
      gsap.from(logoRef.current, {
        opacity: 0,
        x: -30,
        duration: 0.8,
        ease: 'power3.out',
      });
    }
  }, []);

  useEffect(() => {
    if (sidebarRef.current) {
      if (isSidebarOpen) {
        gsap.to(sidebarRef.current, { x: 0, duration: 0.4, ease: 'power3.out' });
      } else {
        gsap.to(sidebarRef.current, { x: '100%', duration: 0.4, ease: 'power3.in' });
      }
    }
  }, [isSidebarOpen]);

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-purple-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div ref={logoRef} className="flex items-center gap-2">
              <img src={logo} alt="Lintas Data Prima" className="w-10 h-10 md:w-12 md:h-12" />
              <span className="text-purple-900 hidden sm:inline text-lg font-semibold">Lintas Data Prima</span>
            </div>

            {/* Desktop GooeyNav */}
            <div className="hidden lg:block">
              <GooeyNav
                items={menuItems}
                className="text-base"
                textColor="#6b7280"
                activeTextColor="#ffffff"
                pillColor="#7c3aed"
                bubbleColor="#a78bfa"
                filterColor="#8b5cf6"
                textShadowColor="rgba(0,0,0,0.15)"
                colorPalette={["#a78bfa", "#c4b5fd", "#DDD6FE", "#EDE9FE"]}
              />
            </div>

            {/* Desktop Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {canLogin && (
                <Link
                  href={route('login')}
                  className="rounded-full border border-purple-600 px-5 py-2 text-sm font-semibold text-purple-700 transition-colors hover:bg-purple-50 hover:text-purple-800"
                >
                  Masuk
                </Link>
              )}
              {canRegister && (
                <Link
                  href={route('register')}
                  className="rounded-full bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-lg hover:-translate-y-0.5"
                >
                  Daftar
                </Link>
              )}
            </div>

            {/* Mobile Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-700 hover:text-purple-600"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 bottom-0 w-72 bg-white shadow-2xl z-50 lg:hidden transform translate-x-full"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Lintas Data Prima" className="w-8 h-8" />
              <span className="text-purple-900 font-semibold">Lintas Data Prima</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-gray-700 hover:text-purple-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6">
            <nav className="space-y-2 px-4">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="p-6 border-t border-purple-100 space-y-3">
            {canLogin && (
              <Button
                asChild
                variant="ghost"
                className="w-full text-purple-600 hover:bg-purple-50"
              >
                <Link href={route('login')}>Masuk</Link>
              </Button>
            )}
            {canRegister && (
              <Button
                asChild
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg hover:from-purple-700"
              >
                <Link href={route('register')}>Daftar</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
