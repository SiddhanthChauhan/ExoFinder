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

    useEffect(() => {
        axios.get(`http://localhost:3001/stars/${id}`)
            .then(res => setSystemData(res.data))
            .catch(err => console.error(err));
    }, [id]);

    //temporary loading screen
    if (!systemData) return <div className="text-center mt-20 text-2xl font-bold">Loading the universe...</div>;

    const { star, planets } = systemData;
    console.log("Here is the star data from the backend:", star);
    console.log("Planets Array:", planets);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <Link to="/explore">
                <button className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded font-bold transition-colors">
                    ← Back to Database
                </button>
            </Link>
            <div className="bg-white border-2 border-gray-200 p-8 rounded-lg shadow-lg">
                <h1 className="text-5xl font-extrabold text-gray-800 mb-4">{star.name}</h1>

                <div className="grid grid-cols-2 gap-4 text-lg text-gray-600 mb-8 border-b-2 pb-6">
                    <p><strong>Spectral Type:</strong> {star.spectral_type}</p>
                    <p><strong>Distance:</strong> {star.distance_ly ? `${star.distance_ly} Light Years` : 'Unknown'}</p>
                    <p><strong>Temperature:</strong> {star.temperature_k ? `${star.temperature_k} K` : 'Unknown'}</p>
                    <p><strong>Visibility:</strong> {star.v_mag !== null && star.v_mag < 6 ? "👀 Naked Eye" : "🔭 Telescope"}</p>
                </div>

                <h3 className="text-3xl font-bold text-gray-800 mb-4">Orbiting Planets ({planets.length})</h3>

                {planets.length === 0 ? (
                    <p className="text-gray-500 italic">No planets recorded in this system.</p>
                ) : (
                    <div className="space-y-4">
                        {planets.map(planet => (

                            <div key={planet.id} className="p-4 bg-gray-50 border border-gray-200 rounded-md shadow-sm">
                                <h4 className="text-xl font-bold text-blue-600 mb-2">{planet.name}</h4>
                                <div className="flex gap-6 text-sm">
                                    <p><strong>Mass:</strong> {planet.mass_jup ? `${planet.mass_jup} Jupiters` : 'Unknown'}</p>
                                    <p><strong>Radius:</strong> {planet.radius_jup ? `${planet.radius_jup} Jupiters` : 'Unknown'}</p>
                                    <p><strong>Orbital Period:</strong> {planet.orbital_period_days ? `${planet.orbital_period_days} days` : 'Unknown'}</p>
                                    <p>
                                        {planet.is_habitable ?
                                            <span className="text-green-600 font-bold">🌱 Potentially Habitable</span> :
                                            <span className="text-red-500 font-bold">🪨 Extreme Climate</span>
                                        }
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* --- TELESCOPE MODULE --- */}
            {star.ra && star.dec_deg ? (
                <SkyMap ra={star.ra} dec={star.dec_deg} starName={star.name} />
            ) : (
                <p className="mt-8 text-red-500 italic">Observatory coordinates unavailable for this system.</p>
            )}

            {/* To help the astronomers , a guide */}
            <div className="mt-8 bg-gray-900 p-8 rounded-lg shadow-xl border border-gray-700">
                <h3 className="text-3xl font-bold text-blue-400 mb-2">🔭 Local Stargazer's Guide</h3>
                <p className="text-gray-300 mb-6 text-lg">
                    Step outside and locate this system in your night sky.
                </p>

                <div className="flex flex-col md:flex-row gap-6 items-stretch">
                    {/* Level 1: The Constellation */}
                    <div className="flex-1 bg-gray-800 p-6 rounded-lg border border-gray-600 flex flex-col justify-center">
                        <p className="text-sm text-gray-400 uppercase tracking-wider font-bold mb-1">General Direction</p>
                        <p className="text-2xl font-extrabold text-yellow-400">
                            {getConstellation(star.ra, star.dec_deg, star.name)}
                        </p>
                    </div>

                    {/* Level 3: The Exact Coordinate Handoff */}
                    <a
                        href={`https://in-the-sky.org/skymap.php?ra=${star.ra / 15}&dec=${star.dec_deg}&zoom=120`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex flex-col justify-center items-center px-6 py-6 bg-blue-700 hover:bg-blue-600 text-white text-xl font-bold rounded-lg transition-colors shadow-lg"
                    >
                        <span>🧭 View Local Star Map</span>
                        <span className="text-sm font-normal text-blue-200 mt-1">Uses precise observatory coordinates</span>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default SystemDetail