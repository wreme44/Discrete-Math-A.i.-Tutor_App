import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Games = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Add class to body
    document.body.classList.add('myAccountBody');

    return () => {
      // Remove class when leaving the page
      document.body.classList.remove('myAccountBody');
    };
  }, []);

  return (
    <div className="games-container xxxsm:pt-[80px] xxsm:pt-[80px] xsm:pt-[80px] sm:pt-[80px] md:pt-[90px] lg:pt-[100px] xl:pt-[100px]">
      <style>
        {`
          /* Background Styling */
        //   @keyframes gradientShift {
        //     0% { background-position: 0% 50%; }
        //     50% { background-position: 100% 50%; }
        //     100% { background-position: 0% 50%; }
        //   }

          .games-container {
            // background: radial-gradient(circle, #121212, #1c1c1c, #262626, #2a2a2a);
            // background-size: 150% 150%;
            // animation: gradientShift 10s ease infinite;
            color: white;
            text-align: center;
            // height: 100vh;
            // padding-top: 150px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: "Arial", sans-serif;
            // overflow: hidden;
          }

          .games-title {
            // font-size: 3.5rem;
            font-weight: bold;
            // margin-bottom: 1.5rem;
            color: #ffffff;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.6);
          }

          .game-button {
            display: flex;
            align-items: center;
            justify-content: center;
            // width: 250px;
            // padding: 15px;
            // margin: 10px;
            // font-size: 1.2rem;
            font-weight: bold;
            color: #ffffff;
            background-color: rgba(0, 0, 0, 0.7);
            border-radius: 10px;
            border: 2px solid transparent;
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.6);
            box-shadow: 0px 0px 15px rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .game-button:hover {
            transform: scale(1.1);
            border-color: rgba(0, 255, 255, 0.8);
            background-color: rgba(0, 0, 0, 0.9);
            box-shadow: 0px 0px 30px rgba(0, 255, 255, 0.8);
          }

          .game-icon {
            // margin-right: 10px;
            // font-size: 1.5rem;
          }

          /* Adding Ambient Effects */
          .ambient-glow {
            position: absolute;
            width: 200px;
            height: 200px;
            background: rgba(0, 255, 255, 0.2);
            filter: blur(100px);
            border-radius: 50%;
            animation: pulse 6s infinite ease-in-out alternate;
          }

          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.5; }
            100% { transform: scale(1.5); opacity: 1; }
          }

          .ambient-glow1 { top: 10%; left: 10%; }
          .ambient-glow2 { bottom: 15%; right: 15%; }
          .ambient-glow3 { top: 50%; left: 70%; }
        `}
      </style>

      <h1 className="games-title xxxsm:mb-[5px] xxsm:mb-[8px] xsm:mb-[10px] sm:mb-[12px] md:mb-[18px] lg:mb-[20px] xl:mb-[20px]
                        xxxsm:text-[20px] xxsm:text-[25px] xsm:text-[35px] sm:text-[40px] md:text-[50px] lg:text-[60px] xl:text-[60px]">Game Hub</h1>
      <button
        className="game-button xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[15px] sm:text-[15px] md:text-[18px] lg:text-[20px] xl:text-[20px]
                xxxsm:w-[125px] xxsm:w-[150px] xsm:w-[175px] sm:w-[200px] md:w-[250px] lg:w-[250px] xl:w-[250px]
                xxxsm:p-[5px] xxsm:p-[8px] xsm:p-[10px] sm:p-[12px] md:p-[15px] lg:p-[15px] xl:p-[15px]
                xxxsm:m-[5px] xxsm:m-[5px] xsm:m-[8px] sm:m-[8px] md:m-[10px] lg:m-[10px] xl:m-[10px]"
        onClick={() => navigate("/flashcard-challenges")}
      >
        <span className="game-icon xxxsm:text-[12px] xxsm:text-[15px] xsm:text-[18px] sm:text-[20px] md:text-[25px] lg:text-[30px] xl:text-[30px]
                xxxsm:mr-[1px] xxsm:mr-[2px] xsm:mr-[3px] sm:mr-[5px] md:mr-[5px] lg:mr-[10px] xl:mr-[10px]">
          🃏
        </span> Flashcard Challenges
      </button>
      <button
        className="game-button xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[15px] sm:text-[15px] md:text-[18px] lg:text-[20px] xl:text-[20px]
                xxxsm:w-[125px] xxsm:w-[150px] xsm:w-[175px] sm:w-[200px] md:w-[250px] lg:w-[250px] xl:w-[250px]
                xxxsm:p-[5px] xxsm:p-[8px] xsm:p-[10px] sm:p-[12px] md:p-[15px] lg:p-[15px] xl:p-[15px]
                xxxsm:m-[5px] xxsm:m-[5px] xsm:m-[8px] sm:m-[8px] md:m-[10px] lg:m-[10px] xl:m-[10px]"
        onClick={() => navigate("/memory-match")}
      >
        <span className="game-icon xxxsm:text-[12px] xxsm:text-[15px] xsm:text-[18px] sm:text-[20px] md:text-[25px] lg:text-[30px] xl:text-[30px]
                xxxsm:mr-[10px] xxsm:mr-[15px] xsm:mr-[15px] sm:mr-[25px] md:mr-[35px] lg:mr-[25px] xl:mr-[25px]">
          🧠
        </span> Memory Match
      </button>
      <button
        className="game-button xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[15px] sm:text-[15px] md:text-[18px] lg:text-[20px] xl:text-[20px]
                xxxsm:w-[125px] xxsm:w-[150px] xsm:w-[175px] sm:w-[200px] md:w-[250px] lg:w-[250px] xl:w-[250px]
                xxxsm:p-[5px] xxsm:p-[8px] xsm:p-[10px] sm:p-[12px] md:p-[15px] lg:p-[15px] xl:p-[15px]
                xxxsm:m-[5px] xxsm:m-[5px] xsm:m-[8px] sm:m-[8px] md:m-[10px] lg:m-[10px] xl:m-[10px]"
        onClick={() => navigate("/drag-and-drop-puzzle")}
      >
        <span className="game-icon xxxsm:text-[12px] xxsm:text-[15px] xsm:text-[18px] sm:text-[20px] md:text-[25px] lg:text-[30px] xl:text-[30px]
                xxxsm:mr-[1px] xxsm:mr-[1px] xsm:mr-[1px] sm:mr-[2px] md:mr-[7px] lg:mr-[10px] xl:mr-[10px]">
          🖱️
        </span> Drag and Drop Puzzle
      </button>
      <button
        className="game-button xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[15px] sm:text-[15px] md:text-[18px] lg:text-[20px] xl:text-[20px]
                xxxsm:w-[125px] xxsm:w-[150px] xsm:w-[175px] sm:w-[200px] md:w-[250px] lg:w-[250px] xl:w-[250px]
                xxxsm:p-[5px] xxsm:p-[8px] xsm:p-[10px] sm:p-[12px] md:p-[15px] lg:p-[15px] xl:p-[15px]
                xxxsm:m-[5px] xxsm:m-[5px] xsm:m-[8px] sm:m-[8px] md:m-[10px] lg:m-[10px] xl:m-[10px]"
        onClick={() => navigate("/math-hangman")}
      >
        <span className="game-icon xxxsm:text-[12px] xxsm:text-[15px] xsm:text-[18px] sm:text-[20px] md:text-[25px] lg:text-[30px] xl:text-[30px]
                xxxsm:mr-[1px] xxsm:mr-[1px] xsm:mr-[1px] sm:mr-[2px] md:mr-[7px] lg:mr-[10px] xl:mr-[10px]">
          ✏️
        </span> Math Hangman
      </button>
      {/* Ambient Glow Effects */}
      <div className="ambient-glow ambient-glow1"></div>
      <div className="ambient-glow ambient-glow2"></div>
      <div className="ambient-glow ambient-glow3"></div>
    </div>
  );
};

export default Games;
