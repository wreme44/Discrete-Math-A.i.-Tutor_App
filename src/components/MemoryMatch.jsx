import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

const MemoryMatch = () => {
    const [showInstructions, setShowInstructions] = useState(true);
    const [difficulty, setDifficulty] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [time, setTime] = useState(0);
    const [stars, setStars] = useState(3);
    const [cards, setCards] = useState([]);
    const [matchedCards, setMatchedCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);

    const discreteMathTerms = [
        { term: "Set", definition: "A collection of distinct objects or elements." },
        { term: "Graph", definition: "A set of vertices connected by edges." },
        { term: "Function", definition: "A relation where every input has a unique output." },
        { term: "Relation", definition: "A subset of the Cartesian product of sets." },
        { term: "Proposition", definition: "A declarative statement that is either true or false." },
        { term: "Logical Connective", definition: "Symbols used to connect propositions, e.g., ∧, ∨, ¬." },
        { term: "Predicate", definition: "A statement that depends on one or more variables." },
        { term: "Bijective Function", definition: "A function that is both injective (one-to-one) and surjective (onto)." },
        { term: "Pigeonhole Principle", definition: "If n items are put into m containers and n > m, at least one container holds more than one item." },
        { term: "Combinatorics", definition: "The study of counting, arrangement, and combination of elements." },
        { term: "Cardinality", definition: "The number of elements in a set." },
        { term: "Power Set", definition: "The set of all subsets of a given set." },
        { term: "Cartesian Product", definition: "The set of all ordered pairs formed by two sets." },
        { term: "Subset", definition: "A set where every element is also in another set." },
        { term: "Surjective Function", definition: "A function where every element in the codomain is mapped by an element in the domain." },
        { term: "Injective Function", definition: "A function where every element in the codomain is mapped by at most one element in the domain." },
        { term: "Truth Table", definition: "A table showing all possible truth values for a logical expression." },
        { term: "Tautology", definition: "A proposition that is always true." },
        { term: "Contradiction", definition: "A proposition that is always false." },
        { term: "Logical Equivalence", definition: "Two propositions that always have the same truth value." },
        { term: "Implication", definition: "A logical operation where 'if p then q' is true unless p is true and q is false." },
        { term: "Contrapositive", definition: "The statement 'if not q then not p,' logically equivalent to 'if p then q'." },
        { term: "Bipartite Graph", definition: "A graph whose vertices can be divided into two disjoint sets, with edges only between sets." },
        { term: "Cycle", definition: "A path in a graph that starts and ends at the same vertex." },
        { term: "Tree", definition: "A connected, acyclic graph." },
        { term: "Hamiltonian Path", definition: "A path in a graph that visits every vertex exactly once." },
        { term: "Eulerian Circuit", definition: "A circuit that traverses every edge of a graph exactly once." },
        { term: "Planar Graph", definition: "A graph that can be drawn in the plane without edges crossing." },
        { term: "Degree of a Vertex", definition: "The number of edges incident to a vertex." },
        { term: "Adjacency Matrix", definition: "A square matrix used to represent a graph, indicating connections between vertices." },
        { term: "Isomorphism", definition: "A mapping between two structures preserving their properties." },
        { term: "Recurrence Relation", definition: "An equation defining a sequence based on previous terms." },
        { term: "Generating Function", definition: "A formal power series representing a sequence." },
        { term: "Big-O Notation", definition: "A mathematical notation describing an algorithm's upper bound of complexity." },
        { term: "Permutation", definition: "An ordered arrangement of elements." },
        { term: "Combination", definition: "A selection of elements without regard to order." },
        { term: "Binomial Coefficient", definition: "The number of ways to choose k elements from n elements, denoted as C(n, k)." },
        { term: "Boolean Algebra", definition: "A branch of algebra dealing with true and false values." },
        { term: "Finite Automaton", definition: "A machine with a finite number of states used to model computations." },
        { term: "Regular Expression", definition: "A sequence of characters defining a search pattern." },
        { term: "Context-Free Grammar", definition: "A set of production rules for generating strings in a language." },
        { term: "Knapsack Problem", definition: "An optimization problem involving selection of items with given weights and values." },
        { term: "Travelling Salesman Problem", definition: "Finding the shortest route visiting all cities and returning to the starting point." },
        { term: "Cryptography", definition: "The study of secure communication techniques." },
        { term: "Modulo Operation", definition: "An operation finding the remainder when one integer is divided by another." },
        { term: "Discrete Probability", definition: "The probability of events in a discrete sample space." },
        { term: "Expected Value", definition: "The weighted average of all possible outcomes." },
        { term: "Variance", definition: "A measure of the spread of a probability distribution." },
        { term: "Induction", definition: "A proof technique using a base case and an inductive step." },
        { term: "Contradiction Proof", definition: "A proof method where an assumption leads to a contradiction, proving the assumption false." },
    ];

    const difficultySettings = {
        Apprentice: { pairs: 4, thresholds: [25, 45] },
        Master: { pairs: 6, thresholds: [20, 40] },
        Legend: { pairs: 8, thresholds: [15, 35] },
    };

    const selectDifficulty = (level) => {
        setDifficulty(level);
        setShowInstructions(false);
        startNewGame(level);
    };

    const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

    const startNewGame = (level) => {
        const settings = difficultySettings[level];
        const selectedTerms = shuffleArray(discreteMathTerms).slice(0, settings.pairs);
        const termDefinitionPairs = selectedTerms.flatMap(({ term, definition }) => [
            { id: `${term}-term`, text: term, type: "term" },
            { id: `${term}-definition`, text: definition, type: "definition" },
        ]);

        const shuffledCards = shuffleArray(termDefinitionPairs);

        setCards(shuffledCards);
        setMatchedCards([]);
        setFlippedCards([]);
        setTime(0);
        setStars(3);
        setGameOver(false);
    };

    const handleCardClick = (index) => {
        if (flippedCards.length < 2 && !flippedCards.includes(index) && !matchedCards.includes(index)) {
            setFlippedCards((prev) => [...prev, index]);
        }
    };

    useEffect(() => {
        let timer;
        if (!showInstructions && !gameOver) {
            timer = setInterval(() => setTime((prevTime) => prevTime + 1), 1000);
        }
        return () => clearInterval(timer);
    }, [showInstructions, gameOver]);

    useEffect(() => {
        if (flippedCards.length === 2) {
            const [firstIndex, secondIndex] = flippedCards;
            const firstCard = cards[firstIndex];
            const secondCard = cards[secondIndex];

            if (
                firstCard.type === "term" &&
                secondCard.type === "definition" &&
                firstCard.text === discreteMathTerms.find((term) => term.definition === secondCard.text).term
            ) {
                setMatchedCards((prev) => [...prev, firstIndex, secondIndex]);
            } else if (
                secondCard.type === "term" &&
                firstCard.type === "definition" &&
                secondCard.text === discreteMathTerms.find((term) => term.definition === firstCard.text).term
            ) {
                setMatchedCards((prev) => [...prev, firstIndex, secondIndex]);
            }
            setTimeout(() => setFlippedCards([]), 1000);
        }
    }, [flippedCards, cards]);

    useEffect(() => {
        if (matchedCards.length === cards.length && cards.length > 0) {
            setGameOver(true);
            const thresholds = difficultySettings[difficulty].thresholds;
            if (time <= thresholds[0]) setStars(3);
            else if (time <= thresholds[1]) setStars(2);
            else setStars(1);
        }
    }, [matchedCards]);

    const handleQuit = () => {
        setShowInstructions(true);
        setDifficulty(null);
        setGameOver(false);
        setTime(0);
        setStars(3);
        setCards([]);
        setMatchedCards([]);
        setFlippedCards([]);
    };

    useEffect(() => {
        // Add class to body
        document.body.classList.add('memoryMatchBody');

        return () => {
            // Remove class when leaving the page
            document.body.classList.remove('memoryMatchBody');
        };
    }, []);

    const cardRefs = useRef([]);

    useEffect(() => {
        const resizeText = () => {
            cardRefs.current.forEach((card) => {
                if (card) {
                    const span = card.querySelector("span");
                    if (!span) return;
                    let fontSize = 16; // Starting font size
                    span.style.fontSize = `${fontSize}px`;

                    // Reduce font size until text fits
                    while (
                        span.scrollWidth > card.offsetWidth ||
                        span.scrollHeight > card.offsetHeight
                    ) {
                        fontSize -= 1; // Decrease font size
                        span.style.fontSize = `${fontSize}px`;
                        if (fontSize <= 5) break; // Minimum font size
                    }
                }
            });
        };

        resizeText();
        setTimeout(resizeText, 0); // Ensure it runs after DOM updates

        window.addEventListener("resize", resizeText); // Recalculate on window resize
        return () => window.removeEventListener("resize", resizeText); // Cleanup
    }, [cards, flippedCards]);


    // const resizeText = useCallback(() => {
    //     cardRefs.current.forEach((card) => {
    //         if (card) {
    //             const span = card.querySelector("span");
    //             if (!span) return;
    //             let fontSize = 16; // Starting font size
    //             span.style.fontSize = `${fontSize}px`;

    //             while (
    //                 span.scrollWidth > card.offsetWidth ||
    //                 span.scrollHeight > card.offsetHeight
    //             ) {
    //                 fontSize -= 1; // Decrease font size
    //                 span.style.fontSize = `${fontSize}px`;
    //                 if (fontSize <= 5) break; // Minimum font size
    //             }
    //         }
    //     });
    // }, []);

    // useEffect(() => {
    //     resizeText();
    //     window.addEventListener("resize", resizeText);

    //     return () => {
    //         window.removeEventListener("resize", resizeText);
    //     };
    // }, [cards, resizeText]);

    return (
        <div className="memory-match-container">
            {showInstructions ? (
                <div className="instructions-modal">
                    <div className="modal-content text-[rgb(35,116,215)]">
                        <h2 className="memory-modal-title">Mentor Memory</h2>
                        <span className="">Match each term with its definition as fast as possible!</span>
                        <ul className="my-6">
                            <li>⭐⭐⭐ {difficultySettings.Apprentice.thresholds[0]}s or less ⭐⭐⭐ </li>
                            <li>⭐⭐ {difficultySettings.Apprentice.thresholds[1]}s or less⭐⭐</li>
                            <li>⭐ {difficultySettings.Apprentice.thresholds[1]}s +⭐</li>
                        </ul>
                        <span className="">Select a difficulty to begin:</span>
                        <div className="difficulty-buttons space-x-1 mt-3">
                            {Object.keys(difficultySettings).map((level) => (
                                <button className="bg-[rgba(0,96,250,0.71)] hover:bg-[rgb(0,89,255)] text-black text-lg font-semibold rounded
                                    px-1"
                                    key={level} onClick={() => selectDifficulty(level)}>
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Games Button */}
                    <div className="flex flex-col items-center justify-center
                            xxxsm:mb-[10px] xxsm:mb-[12px] xsm:mb-[15px] sm:mb-[15px] md:mb-[20px] lg:mb-[20px] xl:mb-[20px]
                            xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]">
                        <Link className="game-link px-2 mt-5 bg-gradient-to-r from-[rgb(60,217,128)] to-[rgb(44,224,221)] hover:from-[rgba(60,217,128,0.92)]  
                        hover:to-[rgba(44,224,221,0.9)] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)] rounded
                        transform transition duration-75 ease-in-out hover:scale-105 active:scale-95"
                            to="/games">Game Hub
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    <h1 className="memory-main-title">Mentor Memory</h1>
                    <div className="flex items-center">
                        <img className="w-[50px]" alt="time" src="./time-icon.svg" />
                        <span className="mb-0">{time}s</span>
                    </div>
                    {/* <span>Stars: {"⭐".repeat(stars)}</span> */}
                    <div className="grid">
                        {cards.map((card, index) => (
                            <div
                                key={index}
                                ref={(el) => (cardRefs.current[index] = el)}
                                className={`grid-card transform transition
                                        duration-75 ease-in-out hover:scale-105 active:scale-95
                                     ${flippedCards.includes(index) || matchedCards.includes(index) ? "flipped" : ""
                                    }`}
                                onClick={() => handleCardClick(index)}
                            >
                                <span>{flippedCards.includes(index) || matchedCards.includes(index) ? card.text : ""}</span>
                            </div>
                        ))}
                    </div>
                    <div className="control-buttons space-x-2 mt-5">
                        {!gameOver && (
                            <>
                                <div className="space-x-2">
                                    <button className="bg-[rgba(0,154,250,0.71)] hover:bg-[rgba(0,154,250,0.88)]
                                text-black text-lg font-semibold rounded px-1"
                                            onClick={() => startNewGame(difficulty)}>Restart
                                        </button>
                                        <button className="bg-[rgba(0,154,250,0.71)] hover:bg-[rgba(0,154,250,0.88)]
                                text-black text-lg font-semibold rounded px-1"
                                            onClick={handleQuit}>Quit
                                        </button>
                                    </div>
                                    {/* Games Button */}
                                    <div className="flex flex-col items-center justify-center
                                            xxxsm:mb-[10px] xxsm:mb-[12px] xsm:mb-[15px] sm:mb-[15px] md:mb-[20px] lg:mb-[20px] xl:mb-[20px]
                                            xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]">
                                        <Link className="game-link px-2 mt-5 bg-gradient-to-r from-[rgb(60,217,128)] to-[rgb(44,224,221)] hover:from-[rgba(60,217,128,0.92)]  
                                            hover:to-[rgba(44,224,221,0.9)] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)] rounded
                                            transform transition duration-75 ease-in-out hover:scale-105 active:scale-95"
                                            to="/games">Game Hub
                                        </Link>
                                    </div>
                                </>
                            )}
                    </div>
                    {gameOver && (
                        <div className="game-over">
                            <h2>Congratulations! You matched all cards!</h2>
                            <p>Time: {time}s</p>
                            <p>Stars: {"⭐".repeat(stars)}</p>
                            <button className="bg-[rgba(0,154,250,0.71)] hover:bg-[rgba(0,154,250,0.88)]
                                text-black text-lg font-semibold rounded px-1 mt-1"
                                onClick={handleQuit}>Select Difficulty</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MemoryMatch;
