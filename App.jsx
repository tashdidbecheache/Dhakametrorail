import React, { useEffect, useRef, useState } from 'react';
import { Train, Shield, Zap, CreditCard, Video, ShieldCheck, Map as MapIcon, Clock, ArrowRight, ChevronRight, Activity, Calendar } from 'lucide-react';

// Generative Fractal Noise SVG for the glass texture
const NOISE_TEXTURE = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.12'/%3E%3C/svg%3E`;

// Reusable Glass Panel Component (bg-black/30 makes it 10% darker for high-contrast premium feel)
const GlassPanel = ({ children, className = "", style = {}, onMouseMove }) => (
  <div 
    onMouseMove={onMouseMove}
    className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all duration-500 hover:bg-white/5 group/panel ${className}`}
    style={{ ...style }}
  >
    {/* Animated Traveling Perimeter Border Glow */}
    <div 
      className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover/panel:opacity-100 transition-opacity duration-500 z-20 overflow-hidden"
      style={{ 
         padding: '2px', // The thickness of the glowing border
         WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
         WebkitMaskComposite: 'xor',
         maskComposite: 'exclude'
      }}
    >
       <div 
         className="absolute top-1/2 left-1/2 w-[2000px] h-[2000px] max-w-none max-h-none -translate-x-1/2 -translate-y-1/2 animate-spin"
         style={{ 
           background: 'conic-gradient(from 0deg, transparent 75%, #00ff88 100%)',
           animationDuration: '3s'
         }}
       />
    </div>

    <div 
      className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay"
      style={{ backgroundImage: `url("${NOISE_TEXTURE}")` }}
    />
    <div className="relative z-10 h-full">{children}</div>
  </div>
);

export default function App() {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const [gsapLoaded, setGsapLoaded] = useState(false);

  useEffect(() => {
    const loadScript = (src) => new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      document.head.appendChild(script);
    });

    Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'),
    ]).then(() => {
      return loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js');
    }).then(() => {
      window.gsap.registerPlugin(window.ScrollTrigger);
      setGsapLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!gsapLoaded) return;
    const { gsap, ScrollTrigger } = window;

    const cursor = cursorRef.current;
    const moveCursor = (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: 'power3.out'
      });
    };
    window.addEventListener('mousemove', moveCursor);

    gsap.to('.mesh-blob-1', {
      x: '30vw', y: '20vh', scale: 1.2, duration: 12, repeat: -1, yoyo: true, ease: 'sine.inOut'
    });
    gsap.to('.mesh-blob-2', {
      x: '-20vw', y: '40vh', scale: 1.5, duration: 15, repeat: -1, yoyo: true, ease: 'sine.inOut'
    });
    gsap.to('.mesh-blob-3', {
      x: '10vw', y: '-30vh', scale: 1.1, duration: 10, repeat: -1, yoyo: true, ease: 'sine.inOut'
    });

    const sections = gsap.utils.toArray('.gsap-section');
    sections.forEach((section) => {
      gsap.fromTo(section, 
        { opacity: 0, y: 80 },
        {
          opacity: 1, y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
          }
        }
      );
    });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [gsapLoaded]);

  const stations = [
    { name: 'Uttara North', tag: 'Terminal' },
    { name: 'Uttara Centre', tag: '' },
    { name: 'Uttara South', tag: '' },
    { name: 'Pallabi', tag: '' },
    { name: 'Mirpur-11', tag: '' },
    { name: 'Mirpur-10', tag: 'Live / Interchange' },
    { name: 'Kazipara', tag: '' },
    { name: 'Shewrapara', tag: '' },
    { name: 'Agargaon', tag: '' },
    { name: 'Bijoy Sarani', tag: '' },
    { name: 'Farmgate', tag: '' },
    { name: 'Kawran Bazar', tag: '' },
    { name: 'Shahbagh', tag: '' },
    { name: 'Dhaka University', tag: '' },
    { name: 'Bangladesh Secretariat', tag: '' },
    { name: 'Motijheel', tag: 'Terminal' }
  ];

  const [activeTrainIndex, setActiveTrainIndex] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [panOffset, setPanOffset] = useState(0);
  const trackContainerRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTrainIndex((prev) => {
        if (direction === 'forward') {
          if (prev === stations.length - 1) {
            setDirection('backward');
            return prev - 1;
          }
          return prev + 1;
        } else {
          if (prev === 0) {
            setDirection('forward');
            return prev + 1;
          }
          return prev - 1;
        }
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [stations.length, direction]);

  useEffect(() => {
    if (!trackContainerRef.current) return;
    
    const updatePan = () => {
      const containerWidth = trackContainerRef.current.offsetWidth;
      const totalTrackWidth = stations.length * 250; 
      const maxPan = Math.max(0, totalTrackWidth - containerWidth);
      let idealPan = (activeTrainIndex * 250 + 125) - (containerWidth / 2);
      idealPan = Math.max(0, idealPan);
      idealPan = Math.min(maxPan, idealPan);
      setPanOffset(idealPan);
    };

    updatePan();
    window.addEventListener('resize', updatePan);
    return () => window.removeEventListener('resize', updatePan);
  }, [activeTrainIndex, stations.length]);

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  const cardGlowStyle = {
    background: 'radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(0, 255, 136, 0.06), transparent 40%)'
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#050808] text-gray-200 selection:bg-[#00ff88] selection:text-black overflow-x-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        .font-serif { font-family: 'Poppins', sans-serif !important; font-weight: 700; }
      `}</style>

      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[#00ff88]/50 pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 mix-blend-screen transition-transform duration-300 backdrop-blur-sm"
        style={{ boxShadow: '0 0 20px rgba(0,255,136,0.2)' }}
      />

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <video 
          autoPlay loop muted playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity"
        >
          <source src="https://res.cloudinary.com/drmjj5ucf/video/upload/v1778953107/From_KlickPin_CF_21_Chic_side_hustle_ideas_that_bring_together_comfort_beauty_and_useful_ideas_you_will_actually_try_for_people_who_want_stylish_ideas_on-a-budget_-_Pin-627759635595483244_kcf3ne.mp4" type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-gradient-to-b from-[#050808]/60 via-transparent to-[#050808] z-10" />
        
        <div className="mesh-blob-1 absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#004d2b] mix-blend-screen filter blur-[120px] opacity-40 z-0" />
        <div className="mesh-blob-2 absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#a8b5b2] mix-blend-overlay filter blur-[150px] opacity-20 z-0" />
        <div className="mesh-blob-3 absolute top-[40%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-[#00ff88] mix-blend-screen filter blur-[180px] opacity-10 z-0" />
      </div>

      <main className="relative z-10">
        
        <div className="px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto">
          <nav className="flex items-center justify-between py-8">
            <div className="flex items-center gap-4">
              <img src="https://res.cloudinary.com/drmjj5ucf/image/upload/v1778954619/unnamed_maibvi.png" alt="Dhaka Metro Logo" className="h-12 w-auto object-contain" />
            </div>
            <div className="hidden md:flex gap-8 text-sm uppercase tracking-widest font-medium text-gray-400">
              <a href="#lines" className="hover:text-white transition-colors">Lines</a>
              <a href="#schedule" className="hover:text-white transition-colors">Schedule</a>
              <a href="#fares" className="hover:text-white transition-colors">Fares</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
            </div>
          </nav>
        </div>

        <section className="min-h-[85vh] flex flex-col justify-center items-center text-center pt-10 pb-20 gsap-section px-6 md:px-12 lg:px-24 max-w-[1200px] mx-auto relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-gray-300 font-medium">Operational since 2022 · MRT Line 6</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif uppercase tracking-tighter leading-[0.9] mb-8">
            <span className="block text-white">Dhaka's</span>
            <span className="block bg-gradient-to-r from-white via-gray-200 to-[#00ff88] bg-clip-text text-transparent drop-shadow-2xl">Green</span>
            <span className="block text-white">Revolution</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-light max-w-3xl drop-shadow-lg">
            Bangladesh's first mass rapid transit system — connecting Uttara to Motijheel in under <strong className="text-white font-medium">40 minutes</strong>, serving an estimated <strong className="text-white font-medium">350,000 daily riders</strong> across Greater Dhaka.
          </p>

          <div className="flex flex-wrap justify-center gap-6 pt-10">
            <button className="px-8 py-4 bg-white text-black font-semibold uppercase tracking-wider text-sm rounded-none hover:bg-[#00ff88] hover:scale-105 transition-all duration-300 flex items-center gap-2">
              Plan Your Journey <ArrowRight size={18} />
            </button>
            <button className="px-8 py-4 border border-white/20 text-white font-semibold uppercase tracking-wider text-sm rounded-none hover:bg-white/10 backdrop-blur-md transition-all duration-300">
              View All Lines
            </button>
          </div>
        </section>

        <section className="py-20 gsap-section px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto overflow-hidden">
          <div className="text-center mb-12">
            <h4 className="text-[#00ff88] text-sm uppercase tracking-widest mb-3 flex items-center justify-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_10px_#00ff88]" />
              Live Route Tracking
            </h4>
            <h2 className="text-5xl md:text-6xl font-serif uppercase tracking-tighter text-white">MRT Line 6</h2>
          </div>

          <GlassPanel className="p-6 md:p-8 w-full" onMouseMove={handleCardMouseMove} style={cardGlowStyle}>
             <div 
               className="relative w-full h-[160px]"
               ref={trackContainerRef}
             >
                <div 
                  className="absolute top-0 bottom-0 left-0 flex items-start transition-transform duration-[1500ms] ease-in-out"
                  style={{ transform: `translateX(-${panOffset}px)` }}
                >
                   <div 
                     className="absolute top-[35px] left-[125px] h-[3px] bg-white/10" 
                     style={{ width: `${(stations.length - 1) * 250}px` }}
                   />
                   
                   <div 
                     className="absolute top-[35px] left-[125px] h-[3px] bg-[#00ff88] transition-all duration-[2000ms] ease-linear shadow-[0_0_15px_#00ff88]" 
                     style={{ width: `${activeTrainIndex * 250}px` }} 
                   />
                   
                   <div 
                     className="absolute top-[17px] w-[36px] h-[36px] bg-black/90 border-2 border-[#00ff88] rounded-full shadow-[0_0_20px_6px_rgba(0,255,136,0.7)] transition-all duration-[2000ms] ease-linear z-40 flex items-center justify-center p-1" 
                     style={{ left: `calc(125px + ${activeTrainIndex * 250}px - 18px)` }} 
                   >
                     <img 
                       src="https://res.cloudinary.com/drmjj5ucf/image/upload/v1778954619/unnamed_maibvi.png" 
                       alt="Dhaka Metro Logo" 
                       className="w-full h-full object-contain"
                     />
                   </div>

                   {stations.map((station, i) => (
                     <div key={i} className="flex flex-col items-center justify-start h-full w-[250px] relative z-20 flex-shrink-0 pt-[35px]">
                       
                       <div 
                         className={`absolute top-[32.5px] left-1/2 -translate-x-1/2 w-[8px] h-[8px] rounded-full z-10 transition-colors duration-[1500ms] ${i <= activeTrainIndex ? 'bg-[#00ff88]' : 'bg-gray-700'}`} 
                       />
                       
                       <div className="flex flex-col items-center text-center mt-6 px-4">
                         <p className={`font-medium whitespace-nowrap transition-all duration-[1500ms] ${i === activeTrainIndex ? 'text-xl md:text-2xl text-white scale-105 drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]' : i < activeTrainIndex ? 'text-base md:text-lg text-gray-400' : 'text-base md:text-lg text-gray-600'}`}>
                           {station.name}
                         </p>
                         
                         {station.tag && (
                           <span className={`mt-2 text-[9px] lg:text-xs px-2 py-1 rounded uppercase tracking-wider transition-all duration-[1500ms] ${i === activeTrainIndex ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/40 shadow-[0_0_15px_rgba(0,255,136,0.2)]' : i < activeTrainIndex ? 'bg-white/5 text-gray-500 border border-white/10' : 'bg-transparent text-gray-800 border border-transparent'}`}>
                             {station.tag}
                           </span>
                         )}
                       </div>
                     </div>
                   ))}
                </div>
             </div>
          </GlassPanel>
        </section>

        <section id="lines" className="py-24 gsap-section bg-black">
          <div className="px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(130px,1fr)] gap-4 md:gap-6">
              
              <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 flex flex-col justify-center h-full p-6 lg:p-10 rounded-2xl bg-black/40 border border-white/5">
                <h4 className="text-[#00ff88] text-xs lg:text-sm uppercase tracking-widest mb-4">Network Expansion</h4>
                <h2 className="text-5xl lg:text-7xl font-serif uppercase tracking-tighter text-white leading-[0.9]">
                  Six Lines.<br/><span className="text-white">One City Transformed.</span>
                </h2>
                <p className="max-w-md text-gray-400 mt-6 text-sm lg:text-base leading-relaxed">
                  A comprehensive 128.7 km network spanning Greater Dhaka — from Hemayetpur in the west to Purbachal in the east, the airport to Narayanganj in the south.
                </p>
              </div>

              <GlassPanel className="p-2 md:col-span-3 lg:col-span-2 lg:row-span-2 overflow-hidden min-h-[300px] lg:min-h-0">
                <img 
                  src="https://res.cloudinary.com/drmjj5ucf/image/upload/v1778954912/Dhaka-Metro-Map-2025_qswnfx.jpg" 
                  alt="Dhaka Metro Map 2025" 
                  className="w-full h-full object-cover rounded-xl opacity-80 mix-blend-screen group-hover/panel:scale-105 transition-all duration-700 grayscale group-hover/panel:grayscale-0 group-hover/panel:mix-blend-normal group-hover/panel:opacity-100"
                />
                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(5,8,8,1)] group-hover/panel:shadow-none pointer-events-none rounded-xl transition-shadow duration-500" />
              </GlassPanel>

              {[
                { line: "MRT Line 6", route: "Uttara North - Motijheel", status: "Operational", detail: "20.1 km · 16 Stations", span: "md:col-span-2 lg:col-span-2" },
                { line: "MRT Line 1", route: "Airport - Kamalapur + Purbachal", status: "Under Construction", detail: "31.2 km · 21 Stations", span: "md:col-span-1 lg:col-span-1" },
                { line: "MRT Line 5 North", route: "Hemayetpur - Vatara", status: "Under Construction", detail: "20.0 km · 14 Stations", span: "md:col-span-1 lg:col-span-1" },
                { line: "MRT Line 5 South", route: "Gabtoli - Dasherkandi", status: "Under Construction", detail: "17.3 km · 15 Stations", span: "md:col-span-1 lg:col-span-1" },
                { line: "MRT Line 2", route: "Gabtoli - Narayanganj", status: "Planned", detail: "35.0 km · 22 Stations", span: "md:col-span-1 lg:col-span-1" },
                { line: "MRT Line 4", route: "Kamalapur - Madanpur", status: "Planned", detail: "16.0 km · 8 Stations", span: "md:col-span-2 lg:col-span-2" }
              ].map((item, i) => (
                <GlassPanel 
                  key={i} 
                  className={`p-6 lg:p-8 flex flex-col justify-center cursor-pointer h-full ${item.span}`} 
                  onMouseMove={handleCardMouseMove} 
                  style={cardGlowStyle}
                >
                  <div className="w-full h-full flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <h4 className="text-lg lg:text-xl font-medium text-white group-hover/panel:text-[#00ff88] transition-colors duration-300">{item.line}</h4>
                        <span className={`text-[10px] lg:text-xs px-2 py-1 rounded-sm uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${item.status === 'Operational' ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30 group-hover/panel:bg-[#00ff88] group-hover/panel:text-black' : 'bg-gray-800 text-gray-400 group-hover/panel:bg-white/10 group-hover/panel:text-white'}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-sm lg:text-base text-gray-400 group-hover/panel:text-gray-200 transition-colors duration-300 mb-6">{item.route}</p>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-white/10 group-hover/panel:border-[#00ff88]/30 pt-4 transition-colors duration-300">
                      <p className="text-[11px] lg:text-xs text-gray-500 group-hover/panel:text-gray-300 transition-colors duration-300">{item.detail}</p>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover/panel:text-[#00ff88] group-hover/panel:translate-x-2 transition-all duration-300" />
                    </div>
                  </div>
                </GlassPanel>
              ))}
            </div>
          </div>
        </section>

        <section id="schedule" className="relative py-24 gsap-section border-y border-white/10">
          <div 
            className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay opacity-40"
            style={{ backgroundImage: `url("${NOISE_TEXTURE}")` }}
          />
          
          <div className="relative z-10 px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20">
            
            <div>
              <div className="mb-8">
                <h4 className="text-[#00ff88] text-sm uppercase tracking-widest mb-2">Service Hours</h4>
                <h2 className="text-4xl font-serif uppercase tracking-tighter text-white">When does it run?</h2>
                <p className="text-sm text-gray-400 mt-2">Peak hours (every 6 min) & Off-peak (every 10 min).</p>
              </div>
              
              <GlassPanel className="p-0 overflow-hidden">
                <div className="divide-y divide-white/10">
                  {[
                    { days: "Sunday - Thursday", time: "7:10 AM - 9:40 PM", note: "Peak every 6 min" },
                    { days: "Friday", time: "3:00 PM - 9:40 PM", note: "Every 6 min (Post-Jumu'ah)" },
                    { days: "Saturday", time: "7:10 AM - 9:40 PM", note: "Full service every 6 min" }
                  ].map((row, i) => (
                    <div key={i} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <Calendar className="text-gray-500" size={20} />
                        <span className="font-medium text-white">{row.days}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-[#00ff88] font-mono text-lg">{row.time}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">{row.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>

            <div id="fares">
              <div className="mb-8">
                <h4 className="text-[#00ff88] text-sm uppercase tracking-widest mb-2">Fares & Ticketing</h4>
                <h2 className="text-4xl font-serif uppercase tracking-tighter text-white">Simple Pricing.</h2>
                <p className="text-sm text-gray-400 mt-2">Fare set at ৳ 5 per kilometer.</p>
              </div>

              <div className="space-y-6">
                <GlassPanel className="p-6 border-[#00ff88]/30 bg-gradient-to-r from-[#004d2b]/30 to-black/30">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#00ff88] text-black p-3 rounded-full">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-lg">10% Off with Smart Card</h4>
                      <p className="text-sm text-gray-300">Available on all journeys using MRT Pass or Rapid Pass.</p>
                    </div>
                  </div>
                </GlassPanel>

                <GlassPanel className="p-6">
                  <ul className="space-y-4">
                    <li className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-gray-400">Standard fare per kilometer</span>
                      <span className="text-xl font-serif text-white">৳ 5</span>
                    </li>
                    <li className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-gray-400">Minimum fare</span>
                      <span className="text-xl font-serif text-white">৳ 20</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-400">Uttara North to Motijheel</span>
                      <span className="text-xl font-serif text-[#00ff88]">৳ 100</span>
                    </li>
                  </ul>
                </GlassPanel>
              </div>
            </div>

          </div>
        </section>

      </main>

      <footer id="about" className="relative z-10 bg-black/40 backdrop-blur-2xl py-12 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1600px] mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-3xl font-serif text-white flex items-center gap-3">
              <img src="https://res.cloudinary.com/drmjj5ucf/image/upload/v1778954619/unnamed_maibvi.png" alt="Logo" className="h-8 grayscale opacity-70" />
              ঢাকা Metro Rail
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Bangladesh's first mass rapid transit system serving Dhaka. Developed with JICA, aiming to significantly reduce traffic congestion across the city since its inauguration in December 2022.
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4 uppercase tracking-wider text-sm">Operator Details</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>Dhaka Mass Transit Company Limited (DMTCL)</li>
              <li className="leading-relaxed">Probashi Kallyan Bhaban (Level-14)<br/>71-72 Old Elephant Road, Eskaton Garden<br/>Ramna, Dhaka-1000</li>
              <li><a href="http://www.dmtcl.gov.bd" className="text-[#00ff88] hover:underline">www.dmtcl.gov.bd</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#lines" className="hover:text-white transition-colors">Network Map</a></li>
              <li><a href="#schedule" className="hover:text-white transition-colors">Timetable</a></li>
              <li><a href="#fares" className="hover:text-white transition-colors">Fares & Ticketing</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">History & Background</a></li>
            </ul>
          </div>
          
        </div>
        
        <div className="max-w-[1600px] mx-auto mt-12 pt-8 border-t border-white/10 text-center text-xs text-gray-600 uppercase tracking-widest">
          © {new Date().getFullYear()} Dhaka Mass Transit Company Limited. All rights reserved.
        </div>
      </footer>
      
    </div>
  );
}
