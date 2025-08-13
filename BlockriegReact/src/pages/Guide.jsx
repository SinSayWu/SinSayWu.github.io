import { Link } from 'react-router-dom';
import blockGuide from '../assets/images/blockGuide.png';
import moverGuide from '../assets/images/moverGuide.png';
import spawnerGuide from '../assets/images/spawnerGuide.png';
import rotaterGuide from '../assets/images/rotaterGuide.png';

function Guide() {
  return (
    <div className="container guideContainer">
      <header>
        <h1>Blitzkrieg Guide</h1>
        <p>
          Think you can do it?
        </p>
        <Link to='/play' className='btn'>Play Game!</Link>
      </header>
      <div className='card guideCard'>
        <h1>Your Mission: DESTROY OPPONENTS BLOCKS</h1>
        <div className='text guideText'>
          <img src={blockGuide}/>
        </div>
      </div>
      <div className='card guideCard moverGuideCard'>
        <img src={moverGuide} id='guideImage'/>
        <div className='text guideText'>
          <h1>Movers move the blocks in front of them by 1.</h1>
          <p>
            They can push stacks of blocks as well.
          </p>
        </div>
      </div>
      <div className='card guideCard'>
        <img src={spawnerGuide} id='guideImage'/>
        <div className='text guideText'>
          <h1>Spawners spawn a copy of the block behind it.</h1>
          <p>
            Any block can be spawned, except for the teleport block.
          </p>
        </div>
      </div>
      <div className='card guideCard'>
        <img src={rotaterGuide} id='guideImage'/>
        <div className='text guideText'>
          <h1>Rotaters rotate the block in front of it.............</h1>
          <p>
            Pretty self explanatory.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Guide;
