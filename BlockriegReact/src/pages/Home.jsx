import { Routes, Route, Link } from 'react-router-dom';
import sampleGame from '../assets/images/sampleGame.png';
import strategy from '../assets/images/strategy.png';
import moverGuide from '../assets/images/moverGuide.png';
import './Home';

function Home() {
  return (
    <div className='container'>
        <header>
            <h1>Blitzkrieg Blocks</h1>
            <p>
                Blitzkrieg through your opponent's defenses with self-automated blocks!
            </p>
            <Link to='/play' className='btn'>Play Game!</Link>
        </header>
        <section className='mainSection'>
             <div className='card firstHomeCard'>
                <img src={sampleGame}/>
                <div className='text'>
                        <div className='cardTextPart'>
                            <h3>
                                Automate War!
                            </h3>
                            <p>
                            Automate your attacks with a strategic positioning of blocks.
                            </p>
                        </div>
                        <div>
                            <h3>
                                Try different strategies!
                            </h3>
                        </div>
                        <img src={strategy} id='secondImage'/>
                 </div>
             </div>
             <div className='card secondHomeCard'>
                <text className='secondSection'>
                    <h1>
                       Check out our Guide!
                    </h1>
                    <p>
                        We created a guide as to how to play, showing all the functions of all the blocks.
                    </p>
                    <img src={moverGuide} id='moversGuide'/>
                    <Link to='/Guide' className='btn guideButton'>How to Play</Link>
                </text>
            </div>
        </section>
    </div>
  );
}

export default Home;
