import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom';

function Explore() {
    const [stars, setStars] = useState([]);
    const [planets, setPlanets] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);

    //gamify section variables / states
    const [viewMode, setViewMode] = useState('database'); //to change the mode to 'database' or 'radar(game)'
    const [scanCount, setScanCount] = useState(0); // To get the number of tries currently
    const [radarSectors, setRadarSectors] = useState([]); // Contains the current guesses / stars
    const [radarStatus, setRadarStatus] = useState('scanning'); // 'scanning', 'hostile', 'habitable' ( present state )
    const [selectedSector, setSelectedSector] = useState(null); // The star user just clicked

    //to reduce the probability of stars found , lets map them
    const [scannedStarIds, setScannedStarIds] = useState([]); // THE MEMORY BANK
    //To avoid the pagination issue that looks at only the data on the page
    const [gamePool, setGamePool] = useState([]); // all stars for the game

    useEffect(() => {
        // 1. Fetch Stars
        axios.get(`https://exofinder-api-t7hb.onrender.com/stars?search=${searchTerm}&page=${page}`)
            .then(res => setStars(res.data))
            .catch(err => console.error(err));

        // 2. Fetch Planets
        axios.get('https://exofinder-api-t7hb.onrender.com/planets')
            .then(res => setPlanets(res.data))
            .catch(err => console.error(err));
    }, [searchTerm, page])

    //Function to generate 3 random stars from the DB
    // Wait for the Radar mode to be clicked
    useEffect(() => {
        if (viewMode === 'radar') {
            // 1. Download the massive tank of stars
            axios.get('https://exofinder-api-t7hb.onrender.com/stars?limit=all')
                .then(res => {
                    const fullUniverse = res.data;
                    setGamePool(fullUniverse);
                    setScanCount(0);
                    setScannedStarIds([]);

                    // 2. ONLY AFTER it downloads, shuffle and deal the first 3 cards
                    if (fullUniverse.length > 2) {
                        const shuffled = [...fullUniverse];
                        for (let i = shuffled.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                        }
                        const selected = shuffled.slice(0, 3);

                        setRadarSectors(selected);
                        setRadarStatus('scanning');
                        setSelectedSector(null);

                        // Log these first 3 in the memory bank
                        setScannedStarIds(selected.map(s => s.id));
                    }
                })
                .catch(err => console.error("Error loading the universe: ", err));
        }
    }, [viewMode]);



    //function to check the user guesses
    const handleSectorClick = (star) => {

        if (radarStatus === 'habitable') return;

        // Prevent clicking the exact card that is already currently open and red
        if (selectedSector && selectedSector.id === star.id) return;

        const starPlanets = planets.filter(p => p.star_id == star.id);
        const isHabitable = starPlanets.some(p => p.is_habitable === 1 || p.is_habitable === true);

        setScanCount(prev => prev + 1);//increase the count of tries

        // This resets the old card to the "eye" view with fresh data behind it
        if (selectedSector && gamePool.length > 0) {
            // Create an array of only the stars we haven't scanned yet
            const unseenStars = gamePool.filter(s => !scannedStarIds.includes(s.id));

            // Safety net: If you somehow click 3,000 times, reset the pool so it doesn't crash
            const poolToUse = unseenStars.length > 0 ? unseenStars : gamePool;
            let replacementStar = poolToUse[Math.floor((Math.random() * poolToUse.length))];

            while (radarSectors.some(s => s.id === replacementStar.id || replacementStar.id === star.id)) {
                replacementStar = poolToUse[Math.floor((Math.random() * poolToUse.length))];
            }

            setRadarSectors(prevSectors => prevSectors.map(sector =>
                sector.id === selectedSector.id ? replacementStar : sector
                //if previous sector is same as current -> change otherwise keep it same
            ))

            // Adding the new star to the memory bank so it never repeats
            setScannedStarIds(prev => [...prev, replacementStar.id]);
        }

        setSelectedSector(star);



        if (isHabitable) {
            setRadarStatus('habitable'); // WINssss
        }
        else {
            setRadarStatus('hostile'); // LOSE CONDITION

        }
    }

    //to get some messages while clicking
    const getRadarMessage = () => {
        if (radarStatus === 'habitable') return "Mission Accomplished. Humanity has a new home.";
        if (scanCount >= 100) return "Statistically, you should have found one by now. The universe is mocking you. ";
        if (scanCount >= 75) return "Are we alone in the universe? At this rate, maybe...";
        if (scanCount >= 50) return "NASA's Kepler stared at 150,000 stars for 4 years. You can do a few more clicks. ";
        if (scanCount >= 30) return "You're feeling the Fermi Paradox now, aren't you? Haha!";
        if (scanCount >= 15) return "Space is big. Really, really big. Nothing but dead rocks and gas so far.";
        if (scanCount >= 5) return "Scanners detecting extreme radiation and hostile environments. Keep looking.";
        return "Select a sector to begin the deep space search.";
    };


    return (
        <div className="min-h-screen p-6 md:p-10 max-w-7xl mx-auto">
            {/* Background Decorations */}
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-900/20 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
            <div className="flex flex-col items-center text-center mb-12 mt-4">


                <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 tracking-widest drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] mb-3">ExoFinder🔭</h1>
                <h2 className="text-indigo-400 uppercase tracking-[0.3em] text-sm md:text-base font-semibold mb-10">
                    Systems Fetched: <span className="text-white">{stars.length}</span>
                </h2>
                {/* The Glowing Terminal Search Bar */}
                <div className="w-full max-w-2xl relative group">
                    <input
                        type="text"
                        placeholder="INITIATE SYSTEM SEARCH (E.G., KEPLER)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-indigo-950/20 backdrop-blur-md border border-indigo-500/30 text-indigo-200 placeholder-indigo-500/50 px-8 py-4 rounded-full focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all duration-300 text-center tracking-widest shadow-[0_0_20px_rgba(79,70,229,0.1)] focus:shadow-[0_0_30px_rgba(79,70,229,0.4)] uppercase text-sm md:text-base"
                    />
                    {/* Sci-Fi Blinking Cursor Accent */}
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-5 bg-indigo-400/60 animate-pulse rounded-sm pointer-events-none group-focus-within:bg-indigo-300"></div>
                </div>
            </div>

            {/* --- A toggler for changing view mode--- */}
            <div className="flex justify-center mb-8">
                <div className="bg-gray-900 border border-gray-700 p-1 rounded-full inline-flex">
                    <button
                        onClick={() => setViewMode('database')}
                        className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${viewMode === 'database' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'text-gray-400 hover:text-white'}`}
                    >
                        Database
                    </button>
                    <button
                        onClick={() => setViewMode('radar')}
                        className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${viewMode === 'radar' ? 'bg-red-900/80 text-red-200 border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'text-gray-400 hover:text-white'}`}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V5z" clipRule="evenodd"></path></svg>
                        {/* A style for the button */}
                        Deep Space Radar
                    </button>
                </div>
            </div>

            {/* --- DYNAMIC VIEW PORTAL --- */}
            <div className="min-h-[700px] w-full mt-8">

                {/* DATABASE MODE: Shows the list and pagination */}
                {viewMode === 'database' && (
                    <div className="animate-fade-in">
                        {/* THE GRID CONTAINER */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {stars.map(star => {
                                const starPlanets = planets.filter(planet => planet.star_id === star.id);
                                return (
                                    // THE GLASSMORPHISM CARD
                                    <div
                                        key={star.id}
                                        className="relative group bg-indigo-950/20 backdrop-blur-md border border-indigo-500/30 p-6 rounded-2xl hover:-translate-y-2 hover:border-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all duration-300"
                                    >
                                        <Link to={`/system/${star.id}`}>

                                            {/* Star Name & Type */}
                                            <div className="flex justify-between items-start mb-4">
                                                <h2 className="text-2xl font-bold text-white tracking-wider group-hover:text-indigo-300 transition-colors">
                                                    {star.name}
                                                </h2>
                                                <span className="px-3 py-1 bg-indigo-900/50 text-indigo-300 text-xs rounded-full border border-indigo-500/30">
                                                    Type {star.spectral_type || '?'}
                                                </span>
                                            </div>

                                            {/* System Data */}
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
                                                <p className="flex items-center gap-1">
                                                    <span className="text-indigo-500">Temp:</span> {star.temperature_k ? `${star.temperature_k} K` : 'Unknown'}
                                                </p>
                                                <p className="flex items-center gap-1">
                                                    <span className="text-indigo-500">Dist:</span> {star.distance_ly ? `${star.distance_ly} LY` : 'Unknown'}
                                                </p>
                                            </div>

                                            {/* The Planets Radar (Visual Data) */}
                                            <div className="pt-4 border-t border-indigo-500/20">
                                                <h4 className="text-xs text-indigo-400 uppercase tracking-widest mb-3">Orbiting Bodies ({starPlanets.length})</h4>

                                                {starPlanets.length === 0 ? (
                                                    <p className="text-sm text-gray-600 italic">No planetary data available.</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {starPlanets.map(planet => (
                                                            <div key={planet.id} className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-300">{planet.name}</span>
                                                                {/* Glowing Status Dot */}
                                                                <span className="flex items-center gap-2 text-xs">
                                                                    {planet.is_habitable ? (
                                                                        <span className="text-green-400 flex items-center gap-1 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]">
                                                                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                                                            Habitable
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-red-900 flex items-center gap-1">
                                                                            <div className="w-2 h-2 rounded-full bg-red-900"></div>
                                                                            Hostile
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex justify-center items-center gap-6 my-12">
                            <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-6 py-2 bg-indigo-900/50 border border-indigo-500/50 text-indigo-300 uppercase tracking-widest rounded-full hover:bg-indigo-600/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Previous Data</button>
                            <span className="text-lg font-bold text-gray-400 tracking-widest">PAGE {page}</span>
                            <button onClick={() => setPage(page + 1)} disabled={stars.length < 50} className="px-6 py-2 bg-indigo-900/50 border border-indigo-500/50 text-indigo-300 uppercase tracking-widest rounded-full hover:bg-indigo-600/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Next Data</button>
                        </div>
                    </div>
                )}

                {/* //Radar game mode */}
                {viewMode === 'radar' && (
                    <div className="animate-fade-in flex flex-col items-center">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-indigo-400 tracking-widest uppercase mb-2">Deep Space Radar</h2>
                            <p className="text-gray-400 text-lg mb-4">
                                Scans initiated: <span className="text-white font-bold text-2xl">{scanCount}</span>
                            </p>

                            {/* THE DYNAMIC MESSAGE HUD */}
                            <div className="h-8 transition-all duration-300">
                                <p className={`text-md italic font-semibold tracking-wide ${radarStatus === 'habitable' ? 'text-green-400' : 'text-indigo-300'}`}>
                                    {getRadarMessage()}
                                </p>
                            </div>
                        </div>

                        {/* The 3 Sectors Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                            {radarSectors.map((sector, index) => (
                                <div
                                    key={sector.id}
                                    onClick={() => handleSectorClick(sector)}
                                    className={`relative cursor-pointer border-2 rounded-xl p-8 h-64 flex flex-col items-center justify-center transition-all duration-300 transform hover:-translate-y-2
                                        ${selectedSector?.id === sector.id && radarStatus === 'hostile' ? 'bg-red-900/50 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]' : ''}
                                        ${selectedSector?.id === sector.id && radarStatus === 'habitable' ? 'bg-green-900/50 border-green-400 shadow-[0_0_50px_rgba(74,222,128,0.8)]' : ''}
                                        ${selectedSector?.id !== sector.id ? 'bg-indigo-950/30 border-indigo-500/30 hover:bg-indigo-900/50 hover:border-indigo-400' : ''}
                                    `}
                                >
                                    <h3 className="text-xl font-bold text-gray-300 uppercase tracking-widest mb-4">
                                        Sector 0{index + 1}
                                    </h3>

                                    {/* Show the star name ONLY after they click it */}
                                    {selectedSector?.id === sector.id ? (
                                        <div className="text-center animate-fade-in">
                                            <p className="text-2xl font-bold text-white mb-2">{sector.name}</p>
                                            <p className={`text-lg font-bold ${radarStatus === 'habitable' ? 'text-green-400' : 'text-red-400'}`}>
                                                {radarStatus === 'habitable' ? 'HABITABLE WORLD DETECTED' : 'HOSTILE ENVIRONMENT'}
                                            </p>
                                        </div>
                                    ) : (
                                        <svg className="w-12 h-12 text-indigo-500/50 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Win Screen Button */}
                        {radarStatus === 'habitable' && selectedSector && (
                            <div className="mt-12 animate-fade-in">
                                <Link to={`/system/${selectedSector.id}`}>
                                    <button className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(74,222,128,0.5)] transition-all">
                                        Inspect New Home World
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )

}

export default Explore