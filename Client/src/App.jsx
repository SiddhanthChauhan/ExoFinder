import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import SystemDetail from './pages/SystemDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/system/:id" element={<SystemDetail />} />
      </Routes>
    </Router>
  );
}

export default App;