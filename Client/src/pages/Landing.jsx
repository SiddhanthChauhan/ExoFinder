import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Landing() {
  // State to track mouse position
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate mouse position relative to the center of the screen
      // Values will range from roughly -1 to 1
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup the event listener when the component unmounts
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col items-center justify-center">

      {/* The Moving Starfield Background */}
      {/* We make it slightly larger than the screen (w-[110%] h-[110%]) so the edges don't show when it moves */}
      <div
        className="absolute inset-[-5%] w-[110%] h-[110%] bg-cover bg-center transition-transform duration-75 ease-out opacity-60"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2048&auto=format&fit=crop')",
          transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`
        }}
      ></div>

      {/* A dark gradient overlay to make the text pop */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black z-0"></div>

      {/* The Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <h1 className="text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 tracking-wider mb-6 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          ExoFinder
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 italic mb-12 tracking-widest leading-relaxed">
          "Somewhere, something incredible is waiting to be known." <br />
          <span className="text-sm text-gray-500 block mt-4 not-italic">— Carl Sagan</span>
        </p>

        {/* The Interactive "Scan" Button */}
        <Link to="/explore">
          <button className="relative group px-10 py-5 bg-indigo-900/30 border border-indigo-500/50 text-indigo-300 uppercase tracking-widest rounded-full hover:bg-indigo-600/40 hover:border-indigo-400 transition-all duration-300 overflow-hidden shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]">
            {/* Hover Radar Pulse Effect */}
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 group-hover:animate-ping bg-indigo-400"></span>
            <span className="relative flex items-center justify-center gap-4 text-lg">
              <svg className="w-6 h-6 animate-pulse text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V5z" clipRule="evenodd"></path></svg>
              Initiate Deep Space Scan
            </span>
          </button>
        </Link>

        <div className="mt-20 text-xs text-indigo-500/70 uppercase tracking-[0.3em]">
          Analyzing 3,000+ Celestial Bodies • Live NASA Data
        </div>
      </div>
    </div>
  );
}

export default Landing;