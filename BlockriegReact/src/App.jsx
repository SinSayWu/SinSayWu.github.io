import { Routes, Route, Link } from 'react-router-dom';
import Home from "./pages/Home";
import Guide from "./pages/Guide";
import Blockrieg from './pages/Blockrieg';
import logo from './assets/images/Blockrieg.png';

function Profile() {
  let username = localStorage.getItem("username");
  if (username != null) {
    return (
      <div className="profile">
        <div className="dropdown">
          <button className="dropbtn"><span className="arrow">▼</span></button>
          <div className="dropdown-content">
            <a href="#">Skill Tree</a>
            <a href="#">Leaderboard</a>
            <a onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}>
                Log Out
            </a>
          </div>
        </div>
        <div className="profile-name">{username}</div>
      </div>
    )
  } else {
    return (
      <div class="profile">
        <a href='/pebble/pebble.html' className='btn'>Log In</a>
      </div>
    )
  }
}

function App() {
  return (
    <>
      <nav>
        <div className="logo">
          <img src={logo} />
        </div>
        <Link to='/' className='navBtn'>Home</Link>
        <Link to='/play' className='navBtn'>Play Game!</Link>
        <Link to='/Guide' className='navBtn'>Guide</Link>
        <a href='/pebble/pebble.html' className='navBtn'>Pebble</a>

        <Profile />
      </nav>

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/Home' element={<Home />} />
        <Route path='/Guide' element={<Guide />} />
        <Route path='/play' element={<Blockrieg />} />
      </Routes>
    </>
  )
}

export default App
