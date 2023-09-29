import React, { useState, useEffect } from 'react';

function App() {
  const [buttons, setButtons] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [appearanceInterval, setAppearanceInterval] = useState(1000);
  const [lost, setLost] = useState(false);
  const [userName, setUserName] = useState('blanket name');
  const [submitting, setSubmitting] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    const appearanceTimer = setInterval(() => {
      if (buttons.length < 100) {
        const marginX = 10;
        const marginY = 30; 
        const randomX = Math.random() * (window.innerWidth - marginX * 2) + marginX;
        const randomY = Math.random() * (window.innerHeight - marginY * 2) + marginY;
        const button = {
          x: randomX,
          y: randomY,
          key: Date.now(),
          clicked: false,
          creationTime: Date.now(),
        };

        setButtons((prevButtons) => [...prevButtons, button]);
      }
    }, appearanceInterval);

    return () => {
      clearInterval(appearanceTimer);
    };
  }, [buttons, appearanceInterval]);

  useEffect(() => {
    // Adjust the appearance interval based on clickCount
    if (clickCount > 0 && clickCount % 5 === 0) {
      setAppearanceInterval((prevInterval) => Math.max(prevInterval - 100, 200));
    }
  }, [clickCount]);

  const handleButtonClick = (clickedKey) => {
    setButtons((prevButtons) =>
      prevButtons.filter((button) => button.key !== clickedKey)
    );
    setClickCount((prevCount) => prevCount + 1);
  };

  const restartFunc = () => {
    setButtons([]); // Remove all buttons
    setClickCount(0); // Reset click counter
    setAppearanceInterval(1000); // Reset appearance interval
    setLost(false);
    setGameStarted(true);
  };

  const reloadGame = () => {
    window.location.reload();
  }
  // Calculate the button color based on the time remaining
  const getColorForButton = (button) => {
    const timeElapsed = Date.now() - button.creationTime;
    const timeRemaining = 10000 - timeElapsed;

    const red = Math.min(255, Math.floor((timeRemaining / 10000) * 255));
    const green = Math.min(255, 255 - red);
    return `rgb(${green}, ${red}, 0)`;
  };

  useEffect(() => {
    // Check if any button has been on the screen for more than 10 seconds
    if (buttons.some((button) => Date.now() - button.creationTime > 10000)) {
      setLost(true);
    }
  }, [buttons]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const userData = {
      name: userName,
      clicks: clickCount,
    };
    console.log(userData);

    //POST req to mongoDB
    try {
      const response = await fetch('/api/saveUserData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        console.log('User data saved to MongoDB');
      } else {
        console.error('Failed to save user data');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  useEffect(() => {
    // Fetch leaderboard data from Mongo DB
    const fetchLeaderboardData = async () => {
      try {
        const response = await fetch('/api/getLeaderboard');
        if (response.ok) {
          const data = await response.json();
          setLeaderboardData(data);
        } else {
          console.error('Failed to fetch leaderboard data');
        }
      } catch (error) {
        console.error('Network error:', error);
      }
    };
    fetchLeaderboardData();
  }, []);

  return (
    <div>
      {!gameStarted ? (
        <div>
        <button onClick={restartFunc}>Start Game</button>
        <h2>Leaderboard</h2>
        <ol>
        {leaderboardData.map((entry, index) => (
          <li key={index}>
            {entry.name} - {entry.clicks} clicks
          </li>
        ))}
        </ol>
        </div>
      ) : lost ? (
        <div>
          <h2>You Lost!</h2>
          <p>Your click count: {clickCount}</p>
          <form onSubmit={handleFormSubmit}>
            <label>
              Enter your name:
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </label>
            <button type="submit" disabled={submitting}>
              Submit
            </button>
          </form>
          <button onClick={reloadGame}>Restart</button>
        </div>
      ) : (
        <div>
          <div className="click-count">Buttons Clicked: {clickCount}</div>
          {buttons.map((button) => (
            <button
              key={button.key}
              style={{
                position: 'absolute',
                top: button.y,
                left: button.x,
                display: button.clicked ? 'none' : 'block',
                backgroundColor: getColorForButton(button),
              }}
              onClick={() => handleButtonClick(button.key)}
            >
              Click Me
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
