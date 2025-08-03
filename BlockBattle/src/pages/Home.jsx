import { Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div className='container'>
        <header>
            <h1>Blitzkrieg Blocks</h1>
            <p>
                Blitzkrieg through your opponent's defenses with self-automated blocks!
            </p>
            <Link to='/Blockrieg' className='btn'>Play Game!</Link>
        </header>
        <section className='mainSection'>
             <div className='card firstCard'>
                <img src='./src/assets/images/sampleGame.png' />
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
                     <img src='./src/assets/images/strategy.png' id='secondImage'/>
                 </div>
             </div>
             <div className='card'>
                <text className='secondSection'>
                    <h1>
                       Check out our Guide!
                    </h1>
                    <p>
                        We created a guide as to how to play, showing all the functions of all the blocks.
                    </p>
                    <img src='./src/assets/images/moversGuide.png' id='moverGuide'/>
                    <Link to='/Guide' className='btn guideButton'>How to Play</Link>
                </text>
            </div>
        </section>
    </div>
  );
}

export default Home;
