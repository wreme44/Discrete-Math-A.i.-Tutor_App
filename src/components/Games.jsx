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
        <div className="flex items-center justify-center flex-col
            xxxsm:pt-[80px] xxsm:pt-[80px] xsm:pt-[80px] sm:pt-[80px] md:pt-[90px] lg:pt-[100px] xl:pt-[100px]">
            <h1 className="games-title xxxsm:mb-[15px] xxsm:mb-[8px] xsm:mb-[10px] sm:mb-[12px] md:mb-[18px] lg:mb-[20px] xl:mb-[20px]
                        xxxsm:text-[20px] xxsm:text-[25px] xsm:text-[35px] sm:text-[40px] md:text-[50px] lg:text-[60px] xl:text-[60px]">
                Game Hub
            </h1>
            <div className="games-container flex overflow-y-hidden xxxsm:flex-col xsm:flex-row
            xxxsm:pl-[0px] xxsm:pl-[30px] xsm:pl-[30px] sm:pl-[30px] md:pl-[30px] lg:pl-[30px] xl:pl-[30px]
            xxxsm:pr-[0px] xxsm:pr-[30px] xsm:pr-[30px] sm:pr-[30px] md:pr-[30px] lg:pr-[30px] xl:pr-[30px]
            xxxsm:h-[450px] xxsm:h-[500px] xsm:h-[350px] sm:h-[350px] md:h-[350px] lg:h-[350px] xl:h-[350px]
            xxxsm:w-[350px] xxsm:w-[350px] xsm:w-[545px] sm:w-[690px] md:w-[830px] lg:w-[1000px] xl:w-[1140px]">

                <button
                    className="game-button-flashcard xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[15px] sm:text-[15px] md:text-[18px] lg:text-[20px] xl:text-[20px]
                    xxxsm:h-[100px] xxsm:h-[100px] xsm:h-[175px] sm:h-[200px] md:h-[250px] lg:h-[250px] xl:h-[250px]
                xxxsm:w-[150px] xxsm:w-[200px] xsm:w-[300px] sm:w-[300px] md:w-[350px] lg:w-[300px] xl:w-[250px]
                xxxsm:p-[5px] xxsm:p-[8px] xsm:p-[10px] sm:p-[12px] md:p-[15px] lg:p-[15px] xl:p-[15px]
                xxxsm:m-[5px] xxsm:m-[5px] xsm:m-[8px] sm:m-[8px] md:m-[10px] lg:m-[10px] xl:m-[10px]"
                    onClick={() => navigate("/flashcard-challenges")}
                >
                    Flashcard Challenges
                    {/* <span className="game-icon xxxsm:text-[12px] xxsm:text-[15px] xsm:text-[18px] sm:text-[20px] md:text-[25px] lg:text-[30px] xl:text-[30px]
                xxxsm:mr-[1px] xxsm:mr-[2px] xsm:mr-[3px] sm:mr-[5px] md:mr-[5px] lg:mr-[10px] xl:mr-[10px]">
                        🃏
                    </span>  */}
                </button>
                <button
                    className="game-button-memorymatch xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[15px] sm:text-[15px] md:text-[18px] lg:text-[20px] xl:text-[20px]
                    xxxsm:h-[100px] xxsm:h-[100px] xsm:h-[175px] sm:h-[200px] md:h-[250px] lg:h-[250px] xl:h-[250px]
                xxxsm:w-[150px] xxsm:w-[200px] xsm:w-[300px] sm:w-[300px] md:w-[350px] lg:w-[300px] xl:w-[250px]
                xxxsm:p-[5px] xxsm:p-[8px] xsm:p-[10px] sm:p-[12px] md:p-[15px] lg:p-[15px] xl:p-[15px]
                xxxsm:m-[5px] xxsm:m-[5px] xsm:m-[8px] sm:m-[8px] md:m-[10px] lg:m-[10px] xl:m-[10px]"
                    onClick={() => navigate("/memory-match")}
                >
                    Memory Match
                    {/* <span className="game-icon xxxsm:text-[12px] xxsm:text-[15px] xsm:text-[18px] sm:text-[20px] md:text-[25px] lg:text-[30px] xl:text-[30px]
                xxxsm:mr-[10px] xxsm:mr-[15px] xsm:mr-[15px] sm:mr-[25px] md:mr-[35px] lg:mr-[25px] xl:mr-[25px]">
                        🧠
                    </span> */}
                </button>
                <button
                    className="game-button-dragdrop xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[15px] sm:text-[15px] md:text-[18px] lg:text-[20px] xl:text-[20px]
                    xxxsm:h-[100px] xxsm:h-[100px] xsm:h-[175px] sm:h-[200px] md:h-[250px] lg:h-[250px] xl:h-[250px]
                xxxsm:w-[150px] xxsm:w-[200px] xsm:w-[300px] sm:w-[300px] md:w-[350px] lg:w-[300px] xl:w-[250px]
                xxxsm:p-[5px] xxsm:p-[8px] xsm:p-[10px] sm:p-[12px] md:p-[15px] lg:p-[15px] xl:p-[15px]
                xxxsm:m-[5px] xxsm:m-[5px] xsm:m-[8px] sm:m-[8px] md:m-[10px] lg:m-[10px] xl:m-[10px]"
                    onClick={() => navigate("/drag-and-drop-puzzle")}
                >
                    Drag and Drop Puzzle
                    {/* <span className="game-icon xxxsm:text-[12px] xxsm:text-[15px] xsm:text-[18px] sm:text-[20px] md:text-[25px] lg:text-[30px] xl:text-[30px]
                xxxsm:mr-[1px] xxsm:mr-[1px] xsm:mr-[1px] sm:mr-[2px] md:mr-[7px] lg:mr-[10px] xl:mr-[10px]">
                        🖱️
                    </span>  */}
                </button>
                <button
                    className="game-button-hangman xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[15px] sm:text-[15px] md:text-[18px] lg:text-[20px] xl:text-[20px]
                    xxxsm:h-[100px] xxsm:h-[100px] xsm:h-[175px] sm:h-[200px] md:h-[250px] lg:h-[250px] xl:h-[250px]
                xxxsm:w-[150px] xxsm:w-[200px] xsm:w-[300px] sm:w-[300px] md:w-[350px] lg:w-[300px] xl:w-[250px]
                xxxsm:p-[5px] xxsm:p-[8px] xsm:p-[10px] sm:p-[12px] md:p-[15px] lg:p-[15px] xl:p-[15px]
                xxxsm:m-[5px] xxsm:m-[5px] xsm:m-[8px] sm:m-[8px] md:m-[10px] lg:m-[10px] xl:m-[10px]"
                    onClick={() => navigate("/math-hangman")}
                >
                    Math Hangman
                    {/* <span className="game-icon xxxsm:text-[12px] xxsm:text-[15px] xsm:text-[18px] sm:text-[20px] md:text-[25px] lg:text-[30px] xl:text-[30px]
                xxxsm:mr-[1px] xxsm:mr-[1px] xsm:mr-[1px] sm:mr-[2px] md:mr-[7px] lg:mr-[10px] xl:mr-[10px]">
                        ✏️
                    </span> */}
                </button>
            </div>
            {/* Ambient Glow Effects */}
            <div className="ambient-glow ambient-glow1"></div>
                <div className="ambient-glow ambient-glow2"></div>
                <div className="ambient-glow ambient-glow3"></div>
        </div>
    );
};

export default Games;
