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
        if(stars.length < 3) return; //as we need 3 stars

        //randomizing (shuffling) the stars
        const shuffled = [...stars].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3); // Pick the first 3

        setRadarSectors(selected); //feed the current guess
        setRadarStatus(scanning); // status update
        setSelectedSector(null);//previous sector ko clear 
    }

    useEffect(() => {
        if(viewMode == 'radar'){
            generateSectors(); //run the function to get sectores
            setScanCount(0);
        }
    },[viewMode,stars]);

    //function to check the user guesses
    const handleSectorClick = (star) => {
        if(radarStatus!='scanning') return;

        setSelectedSector(star);
        setScanCount(prev => prev+1);//increase the count of tries

        const starPlanets = planets.filter(p => p.star_id == star_id);
        const isHabitable = starPlanets.some(p => p.is_habitable === 1 || p.is_habitable === true);

        if(isHabitable){
            setRadarStatus('habitable'); // WINssss
        }
        else{
            setRadarStatus('hostile'); // LOSE CONDITION
            // Waiting 2 seconds so they can see it failed, then reroll 3 new cards!
            setTimeout(() => {
                generateSectors();
            }, 2000);
        }
    }


    return (
        <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
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

            {stars
                .map(star => {
                    // THE LOGIC: Find planets that belong to THIS star
                    const starPlanets = planets.filter(planet => planet.star_id === star.id);

                    return (
                        <div key={star.id} style={{ border: '1px solid #ddd', margin: '20px 0', padding: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                            <Link to={`/system/${star.id}`}>

                                <h2 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>{star.name}</h2>

                                <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#555' }}>
                                    <p><strong>Type:</strong> {star.spectral_type}</p>
                                    <p><strong>Temp:</strong> {star.temperature_k ? `${star.temperature_k} K` : 'Unknown'}</p>
                                    <p><strong>Distance:</strong> {star.distance_ly ? `${star.distance_ly} LY` : 'Unknown'}</p>
                                    {/* THE TELESCOPE FEATURE */}
                                    <p><strong>Visibility:</strong> {star.v_mag !== null && star.v_mag < 6 ? "👀 Naked Eye" : "🔭 Telescope"}</p>
                                </div>

                                <div style={{ marginTop: '15px', paddingLeft: '20px', borderLeft: '3px solid #3498db' }}>
                                    <h4 style={{ margin: '0 0 10px 0' }}>Orbiting Planets ({starPlanets.length}):</h4>
                                    {starPlanets.length === 0 ? <p style={{ fontSize: '14px', color: '#7f8c8d' }}>No planets found in our database...</p> : (
                                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                            {starPlanets.map(planet => (
                                                <li key={planet.id} style={{ marginBottom: '5px' }}>
                                                    <strong>{planet.name}</strong>
                                                    {/* THE GOLDILOCKS FEATURE */}
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

            {/* --- PAGINATION CONTROLS --- */}
            <div className="flex justify-center items-center gap-6 my-8">
                <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>

                <span className="text-xl font-bold text-gray-700">
                    Page {page}
                </span>

                <button
                    onClick={() => setPage(page + 1)}
                    disabled={stars.length < 50}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    )

}

export default Explore