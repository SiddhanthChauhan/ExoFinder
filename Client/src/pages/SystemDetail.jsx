import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

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
        </div>
    );
}

export default SystemDetail