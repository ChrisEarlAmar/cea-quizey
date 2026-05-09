import { Routes, Route } from 'react-router-dom';
import Home from './components/pages/Home';
import Create from './components/pages/Create';
import Play from './components/pages/Play';
import About from './components/pages/About';

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create" element={<Create />} />
      <Route path="/create/:id" element={<Create />} />
      {/* <Route path="/play" element={<Play />} /> */}
      <Route path="/play/:id" element={<Play />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}

export default Router;