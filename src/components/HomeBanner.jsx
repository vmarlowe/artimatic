import React, { useState } from 'react';
import '../HomeBanner.css';
import video1 from '../cave.mp4';
import video2 from '../space3.mp4';
import video3 from '../video3.mp4';

const HomeBanner = () => {
  const [backgroundIndex, setbackgroundIndex] = useState(0);
  const backgrounds = [video1, video2, video3];

  const handleStringTyped = (arrayPos, typedInstance) => {
    setTimeout(() => {
      setbackgroundIndex((backgroundIndex) => (backgroundIndex + 1) % backgrounds.length);
    }, typedInstance.backDelay);
  };

  return (
    <section id="home-banner" className="" data-wow-delay="0.2s">
      <video
        id="background-video"
        className="video-bg"
        key={backgroundIndex}
        loop
        muted
        autoPlay
        style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
      >
        <source src={backgrounds[backgroundIndex]} type="video/mp4" />
      </video>
      <div className="container">
        <div className="row">
          <div className="col-md-12 col-lg-12 banner-text" data-wow-delay="0.4s">
            <h2>Welcome to your</h2>
            <h3 className="cd-headline">
            mechanical cave drawer
            </h3>
            <div className="call-to-action">
              <p>What does it mean for a machine to draw?</p>
              <p>What if you could control it?</p>
            </div>
            <a href="/sketch">
              <button type="button" className="begin-button">
                Begin
              </button>
            </a>

            <p className="disclaimer">
            Disclaimer: The video clips used in this project are the property of their respective owners. The EVE Online clip is owned by CCP Games, and the DUNGEONS AND DRAGONS clip is owned by Wizards of the Coast LLC or its respective copyright holder. These clips have been used solely for educational and creative demonstration purposes, and no copyright infringement is intended. All rights belong to their respective owners.

            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeBanner;
