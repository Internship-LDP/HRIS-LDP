import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Menu, X } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';

type NavbarProps = {
  canLogin?: boolean;
  canRegister?: boolean;
};

const logo = '/img/LogoLDP.png';

export function Navbar({ canLogin = true, canRegister = true }: NavbarProps) {
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logoRef.current && menuRef.current && buttonsRef.current) {
      gsap.from(logoRef.current, {
        opacity: 0,
        x: -30,
        duration: 0.8,
        ease: 'power3.out',
      });
      
      gsap.from(menuRef.current.children, {
        opacity: 0,
        y: -20,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      });
      
      gsap.from(buttonsRef.current.children, {
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.3,
        ease: 'back.out(1.7)',
      });
    }
  }, []);

  useEffect(() => {
    if (sidebarRef.current) {
      if (isSidebarOpen) {
        gsap.to(sidebarRef.current, {
          x: 0,
          duration: 0.4,
          ease: 'power3.out',
        });
      } else {
        gsap.to(sidebarRef.current, {
          x: '100%',
          duration: 0.4,
          ease: 'power3.in',
        });
      }
    }
  }, [isSidebarOpen]);

  const handleMenuHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMenuLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

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
              <span className="text-purple-900 hidden sm:inline">Lintas Data Prima</span>
            </div>

            {/* Desktop Menu Items */}
            <div ref={menuRef} className="hidden lg:flex items-center gap-8">
              {[
                { label: 'Beranda', href: '#home' },
                { label: 'Layanan', href: '#services' },
                { label: 'Harga', href: '#pricing' },
                { label: 'Karir', href: '#careers' },
                { label: 'Kontak', href: '#contact' }
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-gray-700 hover:text-purple-600 transition-colors cursor-pointer"
                  onMouseEnter={handleMenuHover}
                  onMouseLeave={handleMenuLeave}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Desktop Buttons */}
            <div ref={buttonsRef} className="hidden lg:flex items-center gap-3">
              {canLogin && (
                <Link
                  href={route('login')}
                  className="rounded-full border border-purple-600 px-5 py-2 text-sm font-semibold text-purple-700 transition-colors hover:bg-purple-50 hover:text-purple-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-200"
                >
                  Masuk
                </Link>
              )}
              {canRegister && (
                <Link
                  href={route('register')}
                  className="rounded-full bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-purple-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-200"
                >
                  Daftar
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 bottom-0 w-72 bg-white shadow-2xl z-50 lg:hidden transform translate-x-full"
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Lintas Data Prima" className="w-8 h-8" />
              <span className="text-purple-900">Lintas Data Prima</span>
            </div>
            <button
              onClick={closeSidebar}
              className="p-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar Menu */}
          <div className="flex-1 overflow-y-auto py-6">
            <nav className="space-y-2 px-4">
              {[
                { label: 'Beranda', href: '#home' },
                { label: 'Layanan', href: '#services' },
                { label: 'Harga', href: '#pricing' },
                { label: 'Karir', href: '#careers' },
                { label: 'Kontak', href: '#contact' }
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={closeSidebar}
                  className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-purple-100 space-y-3">
            {canLogin && (
              <Button
                asChild
                variant="ghost"
                className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                <Link href={route('login')}>Masuk</Link>
              </Button>
            )}
            {canRegister && (
              <Button
                asChild
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg shadow-purple-200"
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
