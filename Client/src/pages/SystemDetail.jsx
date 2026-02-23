import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import SkyMap from '../components/SkyMap';

// Lightweight Heuristic for Constellation Mapping
function getConstellation(ra, dec, name) {
    if (!name) return "Unknown Region";

    // Mission-specific fields
    if (name.includes("Kepler")) return "Cygnus / Lyra (Kepler Field)";
    if (name.includes("TRAPPIST")) return "Aquarius";
    if (name.includes("K2-")) return "Ecliptic Plane (Zodiac Region)";

    // Abbreviation matching
    if (name.includes("Her")) return "Hercules";
    if (name.includes("Com")) return "Coma Berenices";
    if (name.includes("Cyg")) return "Cygnus (The Swan)";
    if (name.includes("Lyr")) return "Lyra (The Harp)";
    if (name.includes("UMa")) return "Ursa Major (The Great Bear)";

    // Rough coordinate fallbacks
    if (ra > 60 && ra < 90) return "Orion Region";
    if (ra > 250 && ra < 290) return "Sagittarius Region";

    return "Deep Sky (Check Stellarium)";
}

function SystemDetail() {
    const { id } = useParams();
    const [systemData, setSystemData] = useState(null);

    //for the gemini call
    const [aiLore, setAiLore] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        axios.get(`http://localhost:3001/stars/${id}`)
            .then(res => setSystemData(res.data))
            .catch(err => console.error(err));
    }, [id]);

    // Trigger AI Lore Generation once systemData loads
    useEffect(() => {
        if (systemData && systemData.star) {
            setIsGenerating(true);

            axios.post('http://localhost:3001/api/lore', {
                starName: systemData.star.name,
                spectralType: systemData.star.spectral_type,
                distance: systemData.star.distance_ly,
                planetsCount: systemData.planets.length
            })
                .then(res => {
                    setAiLore(res.data.lore);
                    setIsGenerating(false);
                })
                .catch(err => {
                    console.error("Comm link severed:", err);
                    setAiLore("WARNING: Subspace telemetry link severed. Tactical analysis offline.");
                    setIsGenerating(false);
                });
        }
    }, [systemData]);

    //temporary loading screen
    if (!systemData) return <div className="text-center mt-20 text-2xl font-bold">Loading the universe...</div>;

    const { star, planets } = systemData;
    console.log("Here is the star data from the backend:", star);
    console.log("Planets Array:", planets);

    return (
        <div className="min-h-screen bg-[#050510] text-gray-200 relative overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-900/20 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-10 pt-12">

                <Link
                    to="/explore"
                    className="inline-flex items-center gap-3 text-indigo-400 hover:text-indigo-200 transition-all duration-300 group mb-12"
                >
                    <span className="text-2xl transform transition-transform duration-300 group-hover:-translate-x-2 text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]">
                        &laquo;
                    </span>
                    <span className="uppercase tracking-[0.3em] text-xs font-bold border-b border-transparent group-hover:border-indigo-400/50 pb-1">
                        Abort Scan
                    </span>
                </Link>


                <div className="mb-12 border-l-4 border-indigo-500 pl-8 py-2">
                    <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        {star.name}
                    </h1>
                    <div className="flex flex-wrap gap-6 items-center">
                        <span className="px-4 py-1 bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase">
                            SECTOR: {getConstellation(star.ra, star.dec_deg, star.name)}
                        </span>
                        <span className="text-gray-500 tracking-widest text-[10px] font-bold uppercase flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                            Deep Scan Active
                        </span>
                    </div>
                </div>

                {/* --- SYSTEM LORE & ASTROPHYSICS --- */}
                {/* THE ANALYSIS CARD */}
                <div className="bg-indigo-950/20 backdrop-blur-md border border-indigo-500/30 p-8 rounded-2xl mb-12 shadow-[0_0_20px_rgba(0,0,0,0.3)] relative group">
                    {/* Decorative corner bracket */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-400 rounded-tl-lg"></div>

                    <h3 className="text-xs font-bold text-indigo-400 tracking-[0.3em] uppercase mb-4 flex items-center gap-3">
                        Computer Analysis
                        {isGenerating && <span className="flex gap-1"><span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span><span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span></span>}
                    </h3>

                    <div className="min-h-[80px]">
                        {isGenerating ? (
                            <p className="text-indigo-300/70 text-lg leading-relaxed font-mono uppercase animate-pulse">
                                &gt; Establishing subspace link...<br />
                                &gt; Compiling telemetry...<br />
                                &gt; Awaiting AI tactical response...
                            </p>
                        ) : (
                            <p className="text-indigo-100 text-xl leading-relaxed font-light tracking-wide">
                                {aiLore || star.lore}
                            </p>
                        )}
                    </div>
                </div>

                {/* --- SYSTEM TELEMETRY GRID --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {[
                        { label: "Spectral Class", value: star.spectral_type, icon: "✨" },
                        { label: "Distance", value: star.distance_ly ? `${star.distance_ly} LY` : "Unknown" },
                        { label: "Temperature", value: star.temperature_k ? `${star.temperature_k} K` : "Unknown" },
                        { label: "Visibility", value: star.v_mag !== null && star.v_mag < 6 ? "Naked Eye" : "Telescope" }
                    ].map((item, i) => (
                        <div key={i} className="bg-indigo-950/40 border border-indigo-500/20 p-4 rounded-xl backdrop-blur-sm group hover:border-indigo-400/50 transition-all">
                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">{item.label}</p>
                            <p className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* --- PLANETARY SCANNER --- */}
                <h3 className="text-2xl font-bold text-white mb-6 tracking-tight flex items-center gap-3">
                    <span className="text-indigo-500">Orbiting Bodies</span>
                    <span className="text-sm bg-indigo-500/20 px-3 py-1 rounded-full text-indigo-300 font-mono">
                        COUNT: {planets.length}
                    </span>
                </h3>

                {planets.length === 0 ? (
                    <p className="text-indigo-400/50 italic mb-12">No planetary bodies detected in this sector.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                        {planets.map(planet => (
                            <div key={planet.id} className="p-5 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl hover:bg-indigo-900/30 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{planet.name}</h4>
                                    {planet.is_habitable ?
                                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-md font-bold uppercase animate-pulse">Habitable</span> :
                                        <span className="text-[10px] bg-red-900/20 text-red-400 px-2 py-1 rounded-md font-bold uppercase">Hostile</span>
                                    }
                                </div>
                                <div className="grid grid-cols-2 gap-y-3 text-xs">
                                    <p className="text-gray-500">Mass: <span className="text-gray-300">{planet.mass_jup ? `${planet.mass_jup} MJ` : 'N/A'}</span></p>
                                    <p className="text-gray-500">Radius: <span className="text-gray-300">{planet.radius_jup ? `${planet.radius_jup} RJ` : 'N/A'}</span></p>
                                    <p className="text-gray-500 col-span-2">Orbital Period: <span className="text-gray-300">{planet.orbital_period_days ? `${planet.orbital_period_days} Days` : 'Unknown'}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- TELESCOPE MODULE --- */}
                <div className="mb-12 rounded-3xl overflow-hidden border border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.2)]">
                    {star.ra && star.dec_deg ? (
                        <SkyMap ra={star.ra} dec={star.dec_deg} starName={star.name} />
                    ) : (
                        <div className="p-10 text-center bg-indigo-950/20">
                            <p className="text-red-400 italic uppercase tracking-widest text-xs font-bold">Observatory coordinates unavailable for this system.</p>
                        </div>
                    )}
                </div>

                {/* --- LOCAL STARGAZER'S GUIDE --- */}
                <div className="mt-8 bg-indigo-950/20 backdrop-blur-md p-8 rounded-3xl border border-indigo-500/30 shadow-[0_0_20px_rgba(0,0,0,0.5)] relative group">
                    <h3 className="text-2xl font-bold text-indigo-300 mb-2 tracking-tight uppercase">🔭 Local Stargazer's Guide</h3>
                    <p className="text-indigo-200/70 mb-8 text-sm uppercase tracking-widest">
                        Engage manual observatory tracking.
                    </p>

                    <div className="flex flex-col md:flex-row gap-6 items-stretch">
                        {/* Constellation Panel */}
                        <div className="flex-1 bg-indigo-900/10 p-6 rounded-2xl border border-indigo-500/20 flex flex-col justify-center">
                            <p className="text-[10px] text-indigo-400 uppercase tracking-[0.2em] font-bold mb-2">Target Constellation</p>
                            <p className="text-2xl font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                                {getConstellation(star.ra, star.dec_deg, star.name)}
                            </p>
                        </div>

                        {/* External Coordinate Link */}
                        <a
                            href={`https://in-the-sky.org/skymap.php?ra=${star.ra / 15}&dec=${star.dec_deg}&zoom=120`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex flex-col justify-center items-center px-6 py-6 bg-indigo-600/20 hover:bg-indigo-500/30 border border-indigo-500/50 text-white rounded-2xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)] hover:shadow-[0_0_25px_rgba(79,70,229,0.4)] group-hover:border-indigo-400"
                        >
                            <span className="text-xl font-bold uppercase tracking-widest mb-1">Observation Coordinates</span>
                            <span className="text-xs font-normal text-indigo-300">Open external star map</span>
                        </a>
                    </div>
                </div>

            </div> {/* <--- THIS CLOSES THE MAIN relative z-10 WINDOW */}
        </div>
    );
}

export default SystemDetail;