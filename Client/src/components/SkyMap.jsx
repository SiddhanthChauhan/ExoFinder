import { useEffect, useRef } from 'react';

function SkyMap({ ra, dec, starName }) {
    const mapContainer = useRef(null); //Where map will come alive
    const aladinInstance = useRef(null); // Checker for existence of map so it avoids re-rendering

    useEffect(() => {
        if (window.A && !aladinInstance.current) {
            aladinInstance.current = window.A.aladin(mapContainer.current, {
                survey: "P/DSS2/color", // The literal Digitzed Sky Survey photograph catalog
                fov: 0.5, // Field of View (Zoom level). 0.5 degrees is a great deep-space zoom.
                target: `${ra} ${dec}`, // The exact math coordinates we got from NASA
                showReticle: true, // The sniper crosshair
                showZoomControl: true,
                showFullscreenControl: true
            });
        }
    }, [ra, dec]);

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Live Observatory View: {starName}
            </h3>
            {/* The actual box where the universe will render */}
            <div className="w-full h-96 rounded-lg overflow-hidden border-4 border-gray-800 shadow-2xl">
                <div ref={mapContainer} className="w-full h-full bg-black" />
            </div>
        </div>
    );
}

export default SkyMap