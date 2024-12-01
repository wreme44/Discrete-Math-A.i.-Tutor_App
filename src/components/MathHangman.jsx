import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const discreteMathTerms = [
    { term: "Set", hint: "A collection of distinct objects or elements." },
    { term: "Graph", hint: "A set of vertices connected by edges." },
    { term: "Function", hint: "A relation where every input has a unique output." },
    { term: "Relation", hint: "A subset of the Cartesian product of sets." },
    { term: "Proposition", hint: "A declarative statement that is either true or false." },
    { term: "Logical Connective", hint: "Symbols used to connect propositions, e.g., ∧, ∨, ¬." },
    { term: "Predicate", hint: "A statement that depends on one or more variables." },
    { term: "Bijective Function", hint: "A function that is both injective (one-to-one) and surjective (onto)." },
    { term: "Pigeonhole Principle", hint: "If n items are put into m containers and n > m, at least one container holds more than one item." },
    { term: "Combinatorics", hint: "The study of counting, arrangement, and combination of elements." },
    { term: "Cardinality", hint: "The number of elements in a set." },
    { term: "Power Set", hint: "The set of all subsets of a given set." },
    { term: "Cartesian Product", hint: "The set of all ordered pairs formed by two sets." },
    { term: "Subset", hint: "A set where every element is also in another set." },
    { term: "Surjective Function", hint: "A function where every element in the codomain is mapped by an element in the domain." },
    { term: "Injective Function", hint: "A function where every element in the codomain is mapped by at most one element in the domain." },
    { term: "Truth Table", hint: "A table showing all possible truth values for a logical expression." },
    { term: "Tautology", hint: "A proposition that is always true." },
    { term: "Contradiction", hint: "A proposition that is always false." },
    { term: "Logical Equivalence", hint: "Two propositions that always have the same truth value." },
    { term: "Implication", hint: "A logical operation where 'if p then q' is true unless p is true and q is false." },
    { term: "Contrapositive", hint: "The statement 'if not q then not p,' logically equivalent to 'if p then q'." },
    { term: "Bipartite Graph", hint: "A graph whose vertices can be divided into two disjoint sets, with edges only between sets." },
    { term: "Cycle", hint: "A path in a graph that starts and ends at the same vertex." },
    { term: "Tree", hint: "A connected, acyclic graph." },
    { term: "Hamiltonian Path", hint: "A path in a graph that visits every vertex exactly once." },
    { term: "Eulerian Circuit", hint: "A circuit that traverses every edge of a graph exactly once." },
    { term: "Planar Graph", hint: "A graph that can be drawn in the plane without edges crossing." },
    { term: "Degree of a Vertex", hint: "The number of edges incident to a vertex." },
    { term: "Adjacency Matrix", hint: "A square matrix used to represent a graph, indicating connections between vertices." },
    { term: "Isomorphism", hint: "A mapping between two structures preserving their properties." },
    { term: "Recurrence Relation", hint: "An equation defining a sequence based on previous terms." },
    { term: "Generating Function", hint: "A formal power series representing a sequence." },
    { term: "Big-O Notation", hint: "A mathematical notation describing an algorithm's upper bound of complexity." },
    { term: "Permutation", hint: "An ordered arrangement of elements." },
    { term: "Combination", hint: "A selection of elements without regard to order." },
    { term: "Binomial Coefficient", hint: "The number of ways to choose k elements from n elements, denoted as C(n, k)." },
    { term: "Boolean Algebra", hint: "A branch of algebra dealing with true and false values." },
    { term: "Finite Automaton", hint: "A machine with a finite number of states used to model computations." },
    { term: "Regular Expression", hint: "A sequence of characters defining a search pattern." },
    { term: "Context-Free Grammar", hint: "A set of production rules for generating strings in a language." },
    { term: "Knapsack Problem", hint: "An optimization problem involving selection of items with given weights and values." },
    { term: "Travelling Salesman Problem", hint: "Finding the shortest route visiting all cities and returning to the starting point." },
    { term: "Cryptography", hint: "The study of secure communication techniques." },
    { term: "Modulo Operation", hint: "An operation finding the remainder when one integer is divided by another." },
    { term: "Discrete Probability", hint: "The probability of events in a discrete sample space." },
    { term: "Expected Value", hint: "The weighted average of all possible outcomes." },
    { term: "Variance", hint: "A measure of the spread of a probability distribution." },
    { term: "Induction", hint: "A proof technique using a base case and an inductive step." },
    { term: "Contradiction Proof", hint: "A proof method where an assumption leads to a contradiction, proving the assumption false." },
];


const MAX_ATTEMPTS = 6;

const MathHangman = () => {
    const [selectedWord, setSelectedWord] = useState(null);
    const [hint, setHint] = useState("");
    const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
    const [guessedLetters, setGuessedLetters] = useState([]);
    const [gameStatus, setGameStatus] = useState("playing");
    const [lifelineUsed, setLifelineUsed] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);
    const navigate = useNavigate();

    const navToGamePage = () => {
        navigate('/games');
    };


    const startNewGame = () => {
        const randomTerm =
            discreteMathTerms[Math.floor(Math.random() * discreteMathTerms.length)];
        setSelectedWord(randomTerm.term.toUpperCase());
        setHint(randomTerm.hint);
        setAttemptsLeft(MAX_ATTEMPTS);
        setGuessedLetters([]);
        setGameStatus("playing");
        setLifelineUsed(false);
        setShowInstructions(false);
    };

    const handleGuess = (letter) => {
        if (!selectedWord || gameStatus !== "playing") return;

        if (!guessedLetters.includes(letter)) {
            setGuessedLetters((prev) => [...prev, letter]);

            if (!selectedWord.includes(letter)) {
                setAttemptsLeft((prev) => prev - 1);

                if (attemptsLeft - 1 === 0) {
                    setGameStatus("lost");
                }
            } else if (
                selectedWord
                    .split("")
                    .every((char) => guessedLetters.includes(char) || char === letter || char === " ")
            ) {
                setGameStatus("won");
            }
        }
    };

    const useLifeline = () => {
        if (!selectedWord || lifelineUsed || gameStatus !== "playing") return;

        const unguessedLetters = selectedWord
            .split("")
            .filter((char) => !guessedLetters.includes(char) && char !== " ");

        if (unguessedLetters.length > 0) {
            const randomLetter =
                unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
            setGuessedLetters((prev) => [...prev, randomLetter]);
            setLifelineUsed(true);

            if (
                selectedWord
                    .split("")
                    .every((char) => guessedLetters.includes(char) || char === randomLetter || char === " ")
            ) {
                setGameStatus("won");
            }
        }
    };

    // Function to toggle `lifelineUsed` and update state
    // const toggleLifelineMessage = () => {
    //     setLifelineUsed((prev) => !prev); // Toggle the boolean state
    // };

    // // Combined click handler for the button
    // const handleLifelineClick = () => {
    //     useLifeline();
    //     toggleLifelineMessage();
    // };

    // // Render logic for the button text
    // const lifelineText = lifelineUsed
    //     ? Math.random() < 0.5
    //         ? "The D-Mentor Spared You Once"
    //         : "No lifelines left—only the D-Mentor remains"
    //     : "Use Lifeline";

    const renderWord = () => {
        if (!selectedWord) return null;

        return selectedWord.split("").map((char, index) =>
            char === " " ? (
                <span key={index} className="space"></span>
            ) : guessedLetters.includes(char) ? (
                <span key={index} className="letter">{char}</span>
            ) : (
                <span key={index} className="underscore">_</span>
            )
        );
    };

    // const renderHangman = () => {
    //     const parts = [
    //         <circle key="head" cx="50" cy="30" r="10" stroke="#ce0000" fill="none" />,
    //         <line key="body" x1="50" y1="40" x2="50" y2="70" stroke="#ce0000" />,
    //         <line key="left-arm" x1="50" y1="50" x2="40" y2="60" stroke="#ce0000" />,
    //         <line key="right-arm" x1="50" y1="50" x2="60" y2="60" stroke="#ce0000" />,
    //         <line key="left-leg" x1="50" y1="70" x2="40" y2="80" stroke="#ce0000" />,
    //         <line key="right-leg" x1="50" y1="70" x2="60" y2="80" stroke="#ce0000" />,
    //     ];

    //     return parts.slice(0, MAX_ATTEMPTS - attemptsLeft);
    // }; 

    // const renderHangman = () => {
    //     const parts = [
    //         <path
    //             key="hood"
    //             d="M35,35 Q50,5 65,35 Q50,25 35,35 Z"
    //             stroke="#ce0000"
    //             fill="none"
    //         />,
    //         <line key="body" x1="50" y1="40" x2="50" y2="70" stroke="#ce0000" />,
    //         <line key="left-arm" x1="50" y1="50" x2="40" y2="60" stroke="#ce0000" />,
    //         <line key="right-arm" x1="50" y1="50" x2="60" y2="60" stroke="#ce0000" />,
    //         <line key="left-leg" x1="50" y1="70" x2="40" y2="80" stroke="#ce0000" />,
    //         <line key="right-leg" x1="50" y1="70" x2="60" y2="80" stroke="#ce0000" />,
    //     ];

    //     return parts.slice(0, MAX_ATTEMPTS - attemptsLeft);
    // }; 

    const renderHangman = () => {
        const parts = [
            // Hooded or spectral head
            <path
                key="hood"
                d="M35,35 Q50,5 65,35 Q50,25 35,35 Z"
                stroke="#ff0000"
                strokeWidth="2"
                fill="none"
            />,
            // Cloaked body
            <path
                key="cloak"
                d="M50,30 Q40,40 50,70 Q60,40 50,30 Z"
                stroke="#ff0000"
                strokeWidth="2"
                fill="none"
            />,
            // Left "wing" or spectral arm
            <path
                key="left-wing"
                d="M50,40 Q30,50 40,60"
                stroke="#ff0000"
                strokeWidth="2"
                fill="none"
            />,
            // Right "wing" or spectral arm
            <path
                key="right-wing"
                d="M50,40 Q70,50 60,60"
                stroke="#ff0000"
                strokeWidth="2"
                fill="none"
            />,
            // Left spectral "leg"
            <path
                key="left-leg"
                d="M50,70 Q45,80 40,90"
                stroke="#ff0000"
                strokeWidth="2"
                fill="none"
            />,
            // Right spectral "leg"
            <path
                key="right-leg"
                d="M50,70 Q55,80 60,90"
                stroke="#ff0000"
                strokeWidth="2"
                fill="none"
            />,
        ];

        return parts.slice(0, MAX_ATTEMPTS - attemptsLeft);
    };

    // const renderHangman = () => {
    //     const parts = [
    //         // Enlarged hood with shadow
    //         <path 
    //             key="hood" 
    //             d="M35,35 Q50,5 65,35 Q50,25 35,35 Z" 
    //             stroke="white" 
    //             strokeWidth="2" 
    //             fill="none" 
    //             filter="url(#shadow)" 
    //         />,
    //         // Cloaked body with shadow
    //         <path 
    //             key="cloak" 
    //             d="M50,30 Q35,50 50,80 Q65,50 50,30 Z" 
    //             stroke="white" 
    //             strokeWidth="2" 
    //             fill="none" 
    //             filter="url(#shadow)" 
    //         />,
    //         // Left "wing" or spectral arm
    //         <path 
    //             key="left-wing" 
    //             d="M50,45 Q30,55 35,65" 
    //             stroke="white" 
    //             strokeWidth="2" 
    //             fill="none" 
    //             filter="url(#shadow)" 
    //         />,
    //         // Right "wing" or spectral arm
    //         <path 
    //             key="right-wing" 
    //             d="M50,45 Q70,55 65,65" 
    //             stroke="white" 
    //             strokeWidth="2" 
    //             fill="none" 
    //             filter="url(#shadow)" 
    //         />,
    //         // Left spectral "leg"
    //         <path 
    //             key="left-leg" 
    //             d="M50,80 Q45,90 40,100" 
    //             stroke="white" 
    //             strokeWidth="2" 
    //             fill="none" 
    //             filter="url(#shadow)" 
    //         />,
    //         // Right spectral "leg"
    //         <path 
    //             key="right-leg" 
    //             d="M50,80 Q55,90 60,100" 
    //             stroke="white" 
    //             strokeWidth="2" 
    //             fill="none" 
    //             filter="url(#shadow)" 
    //         />,
    //     ];

    //     return [
    //         // Shadow filter definition
    //         <defs key="shadow-filter">
    //             <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    //                 <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="black" floodOpacity="0.5" />
    //             </filter>
    //         </defs>,
    //         // Return hangman parts
    //         ...parts.slice(0, MAX_ATTEMPTS - attemptsLeft),
    //     ];
    // };


    useEffect(() => {
        // Add class to body
        document.body.classList.add('hangmanBody');

        return () => {
            // Remove class when leaving the page
            document.body.classList.remove('hangmanBody');
        };
    }, []);

    return (
        <div className="hangman-container
            xxxsm:px-[10px] xxsm:px-[12px] xsm:px-[15px] sm:px-[18px] md:px-[20px] lg:px-[20px] xl:px-[20px]
            xxxsm:pt-[60px] xxsm:pt-[60px] xsm:pt-[60px] sm:pt-[60px] md:pt-[60px] lg:pt-[60px] xl:pt-[60px]">
            {showInstructions && (
                <div className="instructions-modal-hangman">
                    <div className="instructions-content-hangman text-[rgb(209,26,26)] font">
                        <h2 className="hangman-modal-title">Welcome to Math Hangman</h2>
                        <p>Guess the discrete math term letter by letter.</p>
                        <p>You have {MAX_ATTEMPTS} chances!</p>
                        <p><strong>Hints:</strong> Use the provided hint to assist you in guessing.</p>
                        <p><strong>Lifeline:</strong> Reveal a random letter to help you, but you can only use it once!</p>
                        <button className="restart-button-hangman py-[10px] px-[15px] mt-[10px]
                            bg-gradient-to-r from-[rgb(255,0,0)] to-[rgba(255,17,0,0.72)] hover:from-[rgba(255,17,0,0.72)]  
                        hover:to-[rgb(255,0,0)] text-[rgb(0,0,0)] text-lg font-semibold rounded
                            transform transition duration-75 ease-in-out hover:scale-105 active:scale-95"
                            onClick={startNewGame}>
                            Start Game
                        </button>
                    </div>
                    <Link className="game-link px-2 mt-5 bg-gradient-to-r from-[rgb(60,217,128)] to-[rgb(44,224,221)] hover:from-[rgba(60,217,128,0.92)]  
                        hover:to-[rgba(44,224,221,0.9)] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)] rounded
                        transform transition duration-75 ease-in-out hover:scale-105 active:scale-95"
                        to="/games">Game Hub
                    </Link>
                </div>
            )}
            {selectedWord && (
                <>
                    <h1 className="hangman-game-title xxxsm:text-[16px] xxsm:text-[20px] xsm:text-[25px] sm:text-[30px] md:text-[39px] lg:text-[45px] xl:text-[45px]">
                        The Hanged MathMan</h1>
                    <div className="hangman-drawing flex items-center justify-center
                        xxxsm:h-[50px] xxsm:h-[60px] xsm:h-[90px] sm:h-[100px] md:h-[125px] lg:h-[150px] xl:h-[150px]
                        xxxsm:w-[100px] xxsm:w-[100px] xsm:w-[125px] sm:w-[150px] md:w-[175px] lg:w-[200px] xl:w-[200px]">
                        <svg className="scale-svg origin-center
                        xxxsm:h-[100px] xxsm:h-[100px] xsm:h-[100px] sm:h-[100px] md:h-[100px] lg:h-[100px] xl:h-[100px]
                        xxxsm:w-[100px] xxsm:w-[100px] xsm:w-[100px] sm:w-[100px] md:w-[100px] lg:w-[100px] xl:w-[100px]
                        xxxsm:scale-[50%] xxsm:scale-[60%] xsm:scale-[100%] sm:scale-[110%] md:scale-[130%] lg:scale-[150%] xl:scale-[150%]">
                            {renderHangman()}
                        </svg>
                    </div>
                    <div className="word-container mt-[8px]
                    xxxsm:text-[16px] xxsm:text-[18px] xsm:text-[20px] sm:text-[25px] md:text-[30px] lg:text-[32px] xl:text-[32px]">
                        {renderWord()}
                    </div>
                    <div className="hint
                    xxxsm:text-[11px] xxsm:text-[12px] xsm:text-[14px] sm:text-[16px] md:text-[17px] lg:text-[18px] xl:text-[18px]">
                        Hint: {hint}
                    </div>
                    <button
                        className="lifeline transform transition duration-75 ease-in-out hover:scale-105 active:scale-95
                        xxxsm:text-[10px] xxsm:text-[11px] xsm:text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[15px]
                        xxxsm:px-[10px] xxsm:px-[10px] xsm:px-[12px] sm:px-[14px] md:px-[15px] lg:px-[15px] xl:px-[15px]
                        xxxsm:py-[5px] xxsm:py-[7px] xsm:py-[7px] sm:py-[8px] md:py-[8px] lg:py-[8px] xl:py-[8px]"
                        onClick={useLifeline}
                        disabled={lifelineUsed || gameStatus !== "playing"}
                    >
                        {lifelineUsed ? "The D-Mentor spared you once" : "Use Lifeline"}
                    </button>
                    <div className="keyboard">
                        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                            <button
                                key={letter}
                                className={`key ${guessedLetters.includes(letter) ? "disabled" : ""}
                                transform transition duration-75 ease-in-out hover:scale-[1.3] active:scale-95
                                xxxsm:text-[12px] xxsm:text-[12px] xsm:text-[12px] sm:text-[15px] md:text-[20px] lg:text-[20px] xl:text-[20px]
                                xxxsm:px-[4px] xxsm:px-[6px] xsm:px-[12px] sm:px-[14px] md:px-[15px] lg:px-[15px] xl:px-[15px]
                                xxxsm:py-[0px] xxsm:py-[2px] xsm:py-[7px] sm:py-[8px] md:py-[8px] lg:py-[8px] xl:py-[8px]`}
                                onClick={() => handleGuess(letter)}
                                disabled={guessedLetters.includes(letter) || gameStatus !== "playing"}
                            >
                                {letter}
                            </button>
                        ))}
                    </div>
                    {gameStatus === "lost" && (
                        <div className="game-status
                        xxxsm:text-[9px] xxsm:text-[10px] xsm:text-[11px] sm:text-[12px] md:text-[14px] lg:text-[14px] xl:text-[14px]">
                            The shadows may win today, but light always returns. <br />
                            The D-Mentor whispers: Will you rise again? <br />
                            <strong>The correct word was: {selectedWord}</strong>
                        </div>
                    )}
                    {gameStatus === "won" && (
                        <div className="game-status
                        xxxsm:text-[9px] xxsm:text-[10px] xsm:text-[11px] sm:text-[12px] md:text-[14px] lg:text-[14px] xl:text-[14px]">
                            VICTORY EARNED, lesson learned — the D-Mentor is Pleased <br />
                            and nods in approval — You’ve Done Well.

                        </div>
                    )}
                    {(gameStatus === "won" || gameStatus === "lost") && (
                        <div className="space-x-2">
                            <button className="game-link-hangman-button px-2 bg-gradient-to-r from-[rgb(255,0,0)] to-[rgba(255,17,0,0.72)] hover:from-[rgba(255,17,0,0.72)]  
                            hover:to-[rgb(255,0,0)] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)] rounded
                            transform transition duration-75 ease-in-out hover:scale-105 active:scale-95
                            xxxsm:text-[12px] xxsm:text-[12px] xsm:text-[12px] sm:text-[15px] md:text-[20px] lg:text-[20px] xl:text-[20px]"
                                onClick={startNewGame}>
                                Play Again
                            </button>
                            <button className="game-link-hangman-button px-2 bg-gradient-to-r from-[rgb(255,0,0)] to-[rgba(255,17,0,0.72)] hover:from-[rgba(255,17,0,0.72)]  
                            hover:to-[rgb(255,0,0)] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)] rounded
                            transform transition duration-75 ease-in-out hover:scale-105 active:scale-95
                            xxxsm:text-[12px] xxsm:text-[12px] xsm:text-[12px] sm:text-[15px] md:text-[20px] lg:text-[20px] xl:text-[20px]"
                                onClick={navToGamePage}>Game Hub
                            </button>
                        </div>


                    )}
                    {gameStatus === "playing" && (
                        <div className="space-x-2 mt-1">
                            <button className="game-link-hangman-button px-2 bg-gradient-to-r from-[rgb(255,0,0)] to-[rgba(255,17,0,0.72)] hover:from-[rgba(255,17,0,0.72)]  
                        hover:to-[rgb(255,0,0)] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)] rounded
                        transform transition duration-75 ease-in-out hover:scale-105 active:scale-95
                        xxxsm:text-[12px] xxsm:text-[12px] xsm:text-[12px] sm:text-[15px] md:text-[20px] lg:text-[20px] xl:text-[20px]"
                                onClick={startNewGame}>
                                New Game
                            </button>
                            <button className="game-link-hangman-button px-2 bg-gradient-to-r from-[rgb(255,0,0)] to-[rgba(255,17,0,0.72)] hover:from-[rgba(255,17,0,0.72)]  
                        hover:to-[rgb(255,0,0)] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)] rounded
                        transform transition duration-75 ease-in-out hover:scale-105 active:scale-95
                        xxxsm:text-[12px] xxsm:text-[12px] xsm:text-[12px] sm:text-[15px] md:text-[20px] lg:text-[20px] xl:text-[20px]"
                                onClick={navToGamePage}>Game Hub
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MathHangman;
