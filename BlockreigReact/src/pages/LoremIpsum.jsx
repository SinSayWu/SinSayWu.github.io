import React from "react";

export default function LoremIpsum() {
  return (
    <div className="container">
      <header>
        <h1>Lorem Ipsum</h1>
        <p>Sample text to test your CSS styles including buttons, cards, and images.</p>
        <a href="#" className="btn">
          Primary Button
        </a>
        <button className="btn">Button Element</button>
      </header>

      <section>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p>
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>

        <div className="card">
          <img src="https://picsum.photos/600/300" alt="Random landscape" />
          <h3>Card Title</h3>
          <p>This is a simple card component with an image, title, and description. Use this to test card layouts.</p>
          <a href="#" className="btn">
            Read More
          </a>
        </div>

        <div className="card">
          <img src="https://picsum.photos/600/300?grayscale" alt="Grayscale image" />
          <h3>Another Card</h3>
          <p>Cards can stack vertically and include images and buttons for interaction.</p>
          <button className="btn">Learn More</button>
        </div>
      </section>

      <footer>&copy; 2025 Test Site</footer>
    </div>
  );
}
