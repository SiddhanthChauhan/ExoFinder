import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [stars, setStars] = useState([]);
  const [planets, setPlanets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // 1. Fetch Stars
    axios.get(`http://localhost:3001/stars?search=${searchTerm}`)
      .then(res => setStars(res.data))
      .catch(err => console.error(err));

    // 2. Fetch Planets
    axios.get('http://localhost:3001/planets')
      .then(res => setPlanets(res.data))
      .catch(err => console.error(err));
  }, [searchTerm])

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <h1>ExoFinder 🪐</h1>
      <h2>Systems Discovered: {stars.length}</h2>
      <input
        type="text"
        placeholder="Search for a star system (e.g., Kepler)..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '10px', width: '100%', maxWidth: '400px', marginBottom: '20px', fontSize: '16px' }}
      />

      {stars
        .map(star => {
          // THE LOGIC: Find planets that belong to THIS star
          const starPlanets = planets.filter(planet => planet.star_id === star.id);

          return (
            // <div key={star.id} style={{ border: '1px solid #ddd', margin: '20px 0', padding: '20px', borderRadius: '8px' }}>
            //   <h2 style={{ color: '#2c3e50' }}>{star.name}</h2>
            //   <p><strong>Type:</strong> {star.spectral_type}</p>
            //   <p><strong>Temp:</strong> {star.temperature_k} K</p>

            //   {/* Render the Planets inside the Star Card */}
            //   <div style={{ marginTop: '15px', paddingLeft: '20px', borderLeft: '3px solid #3498db' }}>
            //     <h4>Orbiting Planets ({starPlanets.length}):</h4>
            //     {starPlanets.length === 0 ? <p>No planets found yet...</p> : (
            //       <ul>
            //         {starPlanets.map(planet => (
            //           <li key={planet.id}>
            //             <strong>{planet.name}</strong> - {planet.is_habitable ? "🌱 Habitable" : "💀 Uninhabitable"}
            //           </li>
            //         ))}
            //       </ul>
            //     )}
            //   </div>
            // </div>
            <div key={star.id} style={{ border: '1px solid #ddd', margin: '20px 0', padding: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
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
          </div>
          )
        })}
    </div>
  )

}

export default App