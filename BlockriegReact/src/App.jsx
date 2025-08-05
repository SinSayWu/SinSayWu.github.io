import { Routes, Route, Link } from 'react-router-dom';
import Home from "./pages/Home";
import Guide from "./pages/Guide";
import LoremIpsum from './pages/LoremIpsum';
import Blockrieg from './pages/Blockrieg';

function App() {
  return (
    <>
      <nav>
        <div className="logo">
          <img src='./src/assets/images/Blockrieg.png' />
        </div>
        <Link to='/' className='navBtn'>Home</Link>
        <Link to='/Game' className='navBtn'>Play Game!</Link>
        <Link to='/Guide' className='navBtn'>Guide</Link>
        <Link to='/LoremIpsum' className='navBtn'>Lorem Ipsum</Link>
      </nav>

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/Home' element={<Home />} />
        <Route path='/Guide' element={<Guide />} />
        <Route path='/LoremIpsum' element={<LoremIpsum />} />
        <Route path='/Game' element={<Blockrieg />} />
      </Routes>
    </>
  )
}

export default App
