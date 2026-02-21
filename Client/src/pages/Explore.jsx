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

    useEffect(() => {
        // 1. Fetch Stars
        axios.get(`http://localhost:3001/stars?search=${searchTerm}&page=${page}`)
            .then(res => setStars(res.data))
            .catch(err => console.error(err));

        // 2. Fetch Planets
        axios.get('http://localhost:3001/planets')
            .then(res => setPlanets(res.data))
            .catch(err => console.error(err));
    }, [searchTerm, page])

    //Function to generate 3 random stars from the DB
    const generateSectors = () => {
        if (stars.length < 3) return; //as we need 3 stars

        // PROPER SHUFFLE: Fisher-Yates Algorithm
        // This guarantees a mathematically perfect random shuffle every single time
        const shuffled = [...stars];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const selected = shuffled.slice(0, 3);

        setRadarSectors(selected); //feed the current guess
        setRadarStatus('scanning'); // status update
        setSelectedSector(null);//previous sector ko clear 

        //logging those already scanned
        setScannedStarIds(selected.map(s => s.id));
    }

    useEffect(() => {
        if (viewMode == 'radar') {
            generateSectors(); //run the function to get sectores
            setScanCount(0);
        }
    }, [viewMode, stars]);

    //function to check the user guesses
    const handleSectorClick = (star) => {

        if (radarStatus === 'habitable') return;

        // Prevent clicking the exact card that is already currently open and red
        if (selectedSector && selectedSector.id === star.id) return;

        const starPlanets = planets.filter(p => p.star_id == star.id);
        const isHabitable = starPlanets.some(p => p.is_habitable === 1 || p.is_habitable === true);

        setScanCount(prev => prev + 1);//increase the count of tries

        // This resets the old card to the "eye" view with fresh data behind it
        if (selectedSector) {
            // Create an array of only the stars we haven't scanned yet
            const unseenStars = stars.filter(s => !scannedStarIds.includes(s.id));

            // Safety net: If you somehow click 3,000 times, reset the pool so it doesn't crash
            const poolToUse = unseenStars.length > 0 ? unseenStars : stars;
            let replacementStar = poolToUse[Math.floor((Math.random() * poolToUse.length))];

            while (radarSectors.some(s => s.id === replacementStar.id || replacementStar.id === star.id)) {
                replacementStar = poolToUse[Math.floor((Math.random() * poolToUse.length))];
            }

            setRadarSectors(prevSectors => prevSectors.map(sector =>
                sector.id === selectedSector.id ? replacementStar : sector
                //if previous sector is same as current -> change otherwise keep it same
            ))
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
        <div style={{ padding: '20px' }}>
            <h1 className="text-4xl font-bold text-blue-600">ExoFinder 🪐</h1>
            <h2>Systems Discovered: {stars.length}</h2>
            <input
                type="text"
                placeholder="Search for a star system (e.g., Kepler)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '10px', width: '100%', maxWidth: '400px', marginBottom: '20px', fontSize: '16px' }}
            />

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

                {/* 🟢 DATABASE MODE: Shows the list and pagination */}
                {viewMode === 'database' && (
                    <div className="animate-fade-in">
                        {stars.map(star => {
                            const starPlanets = planets.filter(planet => planet.star_id === star.id);
                            return (
                                <div key={star.id} style={{ border: '1px solid #ddd', margin: '20px 0', padding: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                                    <Link to={`/system/${star.id}`}>
                                        <h2 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>{star.name}</h2>
                                        <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#555' }}>
                                            <p><strong>Type:</strong> {star.spectral_type}</p>
                                            <p><strong>Temp:</strong> {star.temperature_k ? `${star.temperature_k} K` : 'Unknown'}</p>
                                            <p><strong>Distance:</strong> {star.distance_ly ? `${star.distance_ly} LY` : 'Unknown'}</p>
                                            <p><strong>Visibility:</strong> {star.v_mag !== null && star.v_mag < 6 ? "👀 Naked Eye" : "🔭 Telescope"}</p>
                                        </div>
                                        <div style={{ marginTop: '15px', paddingLeft: '20px', borderLeft: '3px solid #3498db' }}>
                                            <h4 style={{ margin: '0 0 10px 0' }}>Orbiting Planets ({starPlanets.length}):</h4>
                                            {starPlanets.length === 0 ? <p style={{ fontSize: '14px', color: '#7f8c8d' }}>No planets found...</p> : (
                                                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                    {starPlanets.map(planet => (
                                                        <li key={planet.id} style={{ marginBottom: '5px', color: '#000' }}>
                                                            <strong>{planet.name}</strong>
                                                            <span style={{ marginLeft: '10px', fontSize: '14px' }}>
                                                                {planet.is_habitable ? "🌱 Potentially Habitable" : "🪨 Extreme Climate"}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </Link>
                                </div>
                            )
                        })}

                        {/* Pagination Controls (Only visible in Database mode) */}
                        <div className="flex justify-center items-center gap-6 my-8">
                            <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-6 py-2 bg-blue-600 text-white font-bold rounded shadow-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors">Previous</button>
                            <span className="text-xl font-bold text-gray-700">Page {page}</span>
                            <button onClick={() => setPage(page + 1)} disabled={stars.length < 50} className="px-6 py-2 bg-blue-600 text-white font-bold rounded shadow-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors">Next</button>
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