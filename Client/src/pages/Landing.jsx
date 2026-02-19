import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-6xl font-bold text-blue-500 mb-4">ExoFinder</h1>
      <p className="text-xl mb-8">Discover 6,000+ confirmed alien worlds.</p>
      
      <Link to="/explore">
        <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xl transition-all">
          Enter the Database
        </button>
      </Link>
    </div>
  );
}

export default Landing;