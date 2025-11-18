import React, { useRef, useEffect, useState } from 'react';

interface GooeyNavItem {
  label: string;
  href: string;
}

export interface GooeyNavProps {
  items: GooeyNavItem[];
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: number[];
  initialActiveIndex?: number;
  className?: string;
  textColor?: string;
  activeTextColor?: string;
  pillColor?: string;
  filterColor?: string;
  bubbleColor?: string;
  textShadowColor?: string;
  colorPalette?: string[];
}

type CSSVars = React.CSSProperties & {
  [key: `--${string}`]: string | number | undefined;
};

const GooeyNav: React.FC<GooeyNavProps> = ({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0,
  className = '',
  // default untuk navbar background putih
  textColor = '#6b7280',           // gray-500
  activeTextColor = '#ffffff',     // putih
  pillColor = '#7c3aed',           // ungu
  filterColor = '#9d6dff',         // ungu glow
  bubbleColor = '#a78bfa',         // ungu soft
  textShadowColor = 'rgba(0,0,0,0.12)',
  colorPalette
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(initialActiveIndex);

  const cssVars: CSSVars = {
    '--gooey-text': textColor,
    '--gooey-text-active': activeTextColor,
    '--gooey-pill': pillColor,
    '--gooey-filter': filterColor,
    '--gooey-bubble': bubbleColor,
    '--gooey-text-shadow': textShadowColor
  };

  colorPalette?.slice(0, 4).forEach((value, index) => {
    cssVars[`--color-${index + 1}` as '--color-1'] = value;
  });

  const noise = (n = 1): number => n / 2 - Math.random() * n;

  const getXY = (
    distance: number,
    pointIndex: number,
    totalPoints: number
  ): [number, number] => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (
    i: number,
    t: number,
    d: [number, number],
    r: number
  ) => {
    let rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  };

  const makeParticles = (element: HTMLElement): void => {
    const d: [number, number] = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);

    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, d, r);
      element.classList.remove('active');

      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');

        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', `var(--color-${p.color}, white)`);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);

        point.classList.add('point');
        particle.appendChild(point);
        element.appendChild(particle);

        requestAnimationFrame(() => {
          element.classList.add('active');
        });

        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {}
        }, t);
      }, 30);
    }
  };

  const updateEffectPosition = (element: HTMLElement): void => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();
    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };

    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);

    textRef.current.innerText = element.innerText;
  };

  // supaya bisa dipanggil dari click dan keyboard
  const activateItem = (el: HTMLElement, index: number): void => {
    if (activeIndex === index) return;

    setActiveIndex(index);
    updateEffectPosition(el);

    if (filterRef.current) {
      const particles = filterRef.current.querySelectorAll('.particle');
      particles.forEach((p) => p.remove());
      makeParticles(filterRef.current);
    }

    if (textRef.current) {
      textRef.current.classList.remove('active');
      void textRef.current.offsetWidth;
      textRef.current.classList.add('active');
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number): void => {
    // gunakan LI sebagai anchor posisi efek, bukan <a>-nya
    const liEl = e.currentTarget.parentElement as HTMLElement;
    if (!liEl) return;
    activateItem(liEl, index);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, index: number): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const liEl = e.currentTarget.parentElement as HTMLElement;
      if (liEl) {
        activateItem(liEl, index);
      }
    }
  };

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;

    const activeLi = navRef.current.querySelectorAll('li')[activeIndex] as HTMLElement;
    if (activeLi) {
      updateEffectPosition(activeLi);
      textRef.current?.classList.add('active');
    }

    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll('li')[activeIndex] as HTMLElement;
      if (currentActiveLi) {
        updateEffectPosition(currentActiveLi);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex]);

  return (
    <>
      {/* Style internal: sudah disesuaikan agar tidak nge-bleed & teks tetap kelihatan */}
      <style>
        {`
          :root {
            --linear-ease: linear(0, 0.068, 0.19 2.7%, 0.804 8.1%, 1.037, 1.199 13.2%, 1.245, 1.27 15.8%, 1.274, 1.272 17.4%, 1.249 19.1%, 0.996 28%, 0.949, 0.928 33.3%, 0.926, 0.933 36.8%, 1.001 45.6%, 1.013, 1.019 50.8%, 1.018 54.4%, 1 63.1%, 0.995 68%, 1.001 85%, 1);
          }

          .effect {
            position: absolute;
            opacity: 1;
            pointer-events: none;
            display: grid;
            place-items: center;
            z-index: 1;
          }

          .effect.text {
            color: var(--gooey-text);
            transition: color 0.3s ease;
            z-index: 3;
          }

          .effect.text.active {
            color: var(--gooey-text-active);
          }

          .effect.filter {
            /* sebelumnya: blur(7px) contrast(100) blur(0); mix-blend-mode: lighten; */
            filter: blur(2px);
            mix-blend-mode: normal;
          }

          .effect.filter::before {
            content: "";
            position: absolute;
            /* sebelumnya: inset: -75px; bikin glow bocor kemana-mana */
            inset: -6px;
            z-index: -2;
            border-radius: 9999px;
            background: var(--gooey-filter);
            opacity: 0.3;
          }

          .effect.filter::after {
            content: "";
            position: absolute;
            inset: 0;
            transform: scale(0.85);
            opacity: 0;
            z-index: -1;
            border-radius: 9999px;
            background: var(--gooey-bubble);
            transition: opacity 0.25s ease, transform 0.25s ease;
          }

          .effect.active::after {
            transform: scale(1);
            opacity: 1;
          }

          .particle,
          .point {
            display: block;
            opacity: 0;
            width: 20px;
            height: 20px;
            border-radius: 9999px;
            transform-origin: center;
          }

          .particle {
            --time: 5s;
            position: absolute;
            top: calc(50% - 8px);
            left: calc(50% - 8px);
            animation: particle calc(var(--time)) ease 1 -350ms;
          }

          .point {
            background: var(--color);
            opacity: 1;
            animation: point calc(var(--time)) ease 1 -350ms;
          }

          @keyframes particle {
            0% {
              transform: rotate(0deg) translate(calc(var(--start-x)), calc(var(--start-y)));
              opacity: 1;
              animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
            }
            70% {
              transform: rotate(calc(var(--rotate) * 0.5)) translate(calc(var(--end-x) * 1.2), calc(var(--end-y) * 1.2));
              opacity: 1;
              animation-timing-function: ease;
            }
            85% {
              transform: rotate(calc(var(--rotate) * 0.66)) translate(calc(var(--end-x)), calc(var(--end-y)));
              opacity: 1;
            }
            100% {
              transform: rotate(calc(var(--rotate) * 1.2)) translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5));
              opacity: 1;
            }
          }

          @keyframes point {
            0% {
              transform: scale(0);
              opacity: 0;
              animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
            }
            25% {
              transform: scale(calc(var(--scale) * 0.25));
            }
            38% {
              opacity: 1;
            }
            65% {
              transform: scale(var(--scale));
              opacity: 1;
              animation-timing-function: ease;
            }
            85% {
              transform: scale(var(--scale));
              opacity: 1;
            }
            100% {
              transform: scale(0);
              opacity: 0;
            }
          }

          /* pastikan teks di atas pill */
          li,
          li a {
            position: relative;
            z-index: 2;
          }

          li.active {
            color: var(--gooey-text-active);
            text-shadow: none;
          }

          li.active::after {
            opacity: 1;
            transform: scale(1);
          }

          li::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 9999px;
            background: var(--gooey-pill);
            opacity: 0;
            transform: scale(0.8);
            transition: all 0.3s ease;
            z-index: -1;
          }
        `}
      </style>

      <div
        className={`relative ${className}`}
        ref={containerRef}
        style={cssVars}
      >
        <nav
          className="flex relative"
          style={{ transform: 'translate3d(0,0,0.01px)' }}
        >
          <ul
            ref={navRef}
            className="flex gap-8 list-none p-0 px-4 m-0 relative z-[3]"
            style={{
              color: 'var(--gooey-text)',
              textShadow: '0 1px 1px var(--gooey-text-shadow)'
            }}
          >
            {items.map((item, index) => (
              <li
                key={index}
                className={`rounded-full relative cursor-pointer transition-[background-color_color_box-shadow] duration-300 ease shadow-[0_0_0.5px_1.5px_transparent] ${
                  activeIndex === index ? 'active' : ''
                }`}
              >
                <a
                  href={item.href}
                  onClick={(e) => handleClick(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="outline-none py-[0.6em] px-[1em] inline-block"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <span className="effect filter" ref={filterRef} />
        <span className="effect text" ref={textRef} />
      </div>
    </>
  );
};

export default GooeyNav;
