import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import CustomCursor from './CustomCursor';
// import SparkParticles from './SparkParticles';

const discreteMathTerms = [
    { term: "A collection of distinct objects or elements.", definition: "Set" },
    { term: "A set of vertices connected by edges.", definition: "Graph" },
    { term: "A relation where every input has a unique output.", definition: "Function" },
    { term: "A subset of the Cartesian product of sets.", definition: "Relation" },
    { term: "A declarative statement that is either true or false.", definition: "Proposition" },
    { term: "Symbols used to connect propositions, e.g., ∧, ∨, ¬.", definition: "Logical Connective" },
    { term: "A statement that depends on one or more variables.", definition: "Predicate" },
    { term: "A function that is both injective (one-to-one) and surjective (onto).", definition: "Bijective Function" },
    { term: "If n items are put into m containers and n > m, at least one container holds more than one item.", definition: "Pigeonhole Principle" },
    { term: "The study of counting, arrangement, and combination of elements.", definition: "Combinatorics" },
    { term: "The number of elements in a set.", definition: "Cardinality" },
    { term: "The set of all subsets of a given set.", definition: "Power Set" },
    { term: "The set of all ordered pairs formed by two sets.", definition: "Cartesian Product" },
    { term: "A set where every element is also in another set.", definition: "Subset" },
    { term: "A function where every element in the codomain is mapped by an element in the domain.", definition: "Surjective Function" },
    { term: "A function where every element in the codomain is mapped by at most one element in the domain.", definition: "Injective Function" },
    { term: "A table showing all possible truth values for a logical expression.", definition: "Truth Table" },
    { term: "A proposition that is always true.", definition: "Tautology" },
    { term: "A proposition that is always false.", definition: "Contradiction" },
    { term: "Two propositions that always have the same truth value.", definition: "Logical Equivalence" },
    { term: "A logical operation where 'if p then q' is true unless p is true and q is false.", definition: "Implication" },
    { term: "The statement 'if not q then not p,' logically equivalent to 'if p then q'.", definition: "Contrapositive" },
    { term: "A graph whose vertices can be divided into two disjoint sets, with edges only between sets.", definition: "Bipartite Graph" },
    { term: "A path in a graph that starts and ends at the same vertex.", definition: "Cycle" },
    { term: "A connected, acyclic graph.", definition: "Tree" },
    { term: "A path in a graph that visits every vertex exactly once.", definition: "Hamiltonian Path" },
    { term: "A circuit that traverses every edge of a graph exactly once.", definition: "Eulerian Circuit" },
    { term: "A graph that can be drawn in the plane without edges crossing.", definition: "Planar Graph" },
    { term: "The number of edges incident to a vertex.", definition: "Degree of a Vertex" },
    { term: "A square matrix used to represent a graph, indicating connections between vertices.", definition: "Adjacency Matrix" },
    { term: "A mapping between two structures preserving their properties.", definition: "Isomorphism" },
    { term: "An equation defining a sequence based on previous terms.", definition: "Recurrence Relation" },
    { term: "A formal power series representing a sequence.", definition: "Generating Function" },
    { term: "A mathematical notation describing an algorithm's upper bound of complexity.", definition: "Big-O Notation" },
    { term: "An ordered arrangement of elements.", definition: "Permutation" },
    { term: "A selection of elements without regard to order.", definition: "Combination" },
    { term: "The number of ways to choose k elements from n elements, denoted as C(n, k).", definition: "Binomial Coefficient" },
    { term: "A branch of algebra dealing with true and false values.", definition: "Boolean Algebra" },
    { term: "A machine with a finite number of states used to model computations.", definition: "Finite Automaton" },
    { term: "A sequence of characters defining a search pattern.", definition: "Regular Expression" },
    { term: "A set of production rules for generating strings in a language.", definition: "Context-Free Grammar" },
    { term: "An optimization problem involving selection of items with given weights and values.", definition: "Knapsack Problem" },
    { term: "Finding the shortest route visiting all cities and returning to the starting point.", definition: "Travelling Salesman Problem" },
    { term: "The study of secure communication techniques.", definition: "Cryptography" },
    { term: "An operation finding the remainder when one integer is divided by another.", definition: "Modulo Operation" },
    { term: "The probability of events in a discrete sample space.", definition: "Discrete Probability" },
    { term: "The weighted average of all possible outcomes.", definition: "Expected Value" },
    { term: "A measure of the spread of a probability distribution.", definition: "Variance" },
    { term: "A proof technique using a base case and an inductive step.", definition: "Induction" },
    { term: "A proof method where an assumption leads to a contradiction, proving the assumption false.", definition: "Contradiction Proof" },
];


const FlashcardChallenges = () => {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [guess, setGuess] = useState("");
    const [correctGuess, setCorrectGuess] = useState("");
    const [streak, setStreak] = useState(0);
    const [longestStreak, setLongestStreak] = useState(0);
    const [isCheckDisabled, setIsCheckDisabled] = useState(false);
    const [flashRed, setFlashRed] = useState(false);

    const navigate = useNavigate();

    const navToGamePage = () => {
        navigate('/games');
    };

    const handleFlip = () => {
        setFlipped(!flipped);
    };

    const handleNext = () => {
        if (currentCardIndex < discreteMathTerms.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
        } else {
            setCurrentCardIndex(0); // Loop back to the first card
        }
        setFlipped(false);
        setGuess("");
        setCorrectGuess("");
        setIsCheckDisabled(false); // Reset Check button
    };

    const handlePrevious = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1);
        } else {
            setCurrentCardIndex(discreteMathTerms.length - 1); // Loop to the last card
        }
        setFlipped(false);
        setGuess("");
        setCorrectGuess("");
        setIsCheckDisabled(false); // Reset Check button
    };

    const shuffleRandomCard = () => {
        const randomIndex = Math.floor(Math.random() * discreteMathTerms.length);
        setCurrentCardIndex(randomIndex);
        setFlipped(false);
        setGuess("");
        setCorrectGuess("");
        setIsCheckDisabled(false); // Reset Check button
    };

    const checkAnswer = () => {
        const correctAnswer = discreteMathTerms[currentCardIndex].definition.toLowerCase();
        if (guess.toLowerCase().includes(correctAnswer)) {
            setCorrectGuess("correct");
            setStreak(streak + 1);
            if (streak + 1 > longestStreak) {
                setLongestStreak(streak + 1);
            }
            setIsCheckDisabled(true); // Disable the Check button
        } else {
            setCorrectGuess("wrong");
            setStreak(0);

            // Trigger red flash effect
            setFlashRed(true);
            setTimeout(() => setFlashRed(false), 500); // Reset after 500ms
        }
    };

    useEffect(() => {
        // Add class to body
        document.body.classList.add('flashCardBody');

        return () => {
            // Remove class when leaving the page
            document.body.classList.remove('flashCardBody');
        };
    }, []);

    return (
        <div className="card-page-container flex flex-col items-center justify-center text-center text-white
        xxxsm:pt-[70px] xxsm:pt-[75px] xsm:pt-[80px] sm:pt-[80px] md:pt-[80px] lg:pt-[80px] xl:pt-[80px]">
            <CustomCursor />
            <h1 className="flashcard-title mb-6
            xxxsm:text-[16px] xxsm:text-[20px] xsm:text-[25px] sm:text-[30px] md:text-[39px] lg:text-[45px] xl:text-[45px]">
                MentorCards
            </h1>
            <div className="streak-tracker flex mb-4
            xxxsm:space-x-[12px] xxsm:space-x-[14px] xsm:space-x-[16px] sm:space-x-[18px] md:space-x-[20px] lg:space-x-[20px] xl:space-x-[20px]
            xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] xl:text-[20px]">
                <p>Current Streak: {streak}</p>
                <p>Longest Streak: {longestStreak}</p>
            </div>
            <div className="card-container
            xxxsm:mb-[10px] xxsm:mb-[12px] xsm:mb-[15px] sm:mb-[15px] md:mb-[20px] lg:mb-[20px] xl:mb-[20px]
            xxxsm:h-[125px] xxsm:h-[150px] xsm:h-[175px] sm:h-[200px] md:h-[250px] lg:h-[300px] xl:h-[300px]
            xxxsm:w-[200px] xxsm:w-[250px] xsm:w-[325px] sm:w-[350px] md:w-[400px] lg:w-[500px] xl:w-[500px]">
                <div
                    className={`cards ${flipped ? 'flipped' : ''} border-2 border-[rgba(81,233,152,0.34)] rounded-lg
                    xxxsm:text-[12px] xxsm:text-[14px] xsm:text-[16px] sm:text-[20px] md:text-[27px] lg:text-[30px] xl:text-[32px]`}
                    onClick={handleFlip}
                >
                    {!flipped ? (
                        <h2 className="card-front">
                            {discreteMathTerms[currentCardIndex].term}</h2>
                    ) : (
                        <h2 className="card-back">
                            {discreteMathTerms[currentCardIndex].definition}</h2>
                    )}
                </div>
            </div>

            <div className="type-answer flex items-center align-middle mb-2">
                <button
                    className="prev-flashcard bg-[rgba(75,207,137,0.81)] rounded-full hover:bg-[rgb(75,207,115)]
                    xxxsm:w-[27px] xxsm:w-[32px] xsm:w-[32px] sm:w-[35px] md:w-[40px] lg:w-[42px] xl:w-[42px]
                    transform transition duration-75 ease-in-out hover:scale-105 active:scale-95 "
                    onClick={handlePrevious}
                >
                    <img className='' alt='... ...' src='/prev-page.svg' />
                </button>
                <input
                    type="text"
                    placeholder="Enter your guess..."
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    className={`type-answer p-2 mx-2 rounded border
        xxxsm:h-[25px] xxsm:h-[30px] xsm:h-[35px] sm:h-[40px] md:h-[45px] lg:h-[45px] xl:h-[45px]
        xxxsm:w-[150px] xxsm:w-[175px] xsm:w-[200px] sm:w-[225px] md:w-[250px] lg:w-[300px] xl:w-[300px]
        ${flashRed
                            ? "bg-[rgba(255,30,30,0.71)] transition duration-500 ease-in-out"
                            : "bg-[rgba(36,36,36,0.5)]"
                        }
        ${correctGuess === "correct"
                            ? "bg-[rgba(38,255,0,0.68)]"
                            : correctGuess === "wrong"
                                ? "bg-[rgba(255,30,30,0.71)]"
                                : ""
                        }`}
                />
                <button
                    className="next-flashcard bg-[rgba(75,207,137,0.81)] rounded-full hover:bg-[rgb(75,207,115)]
                            xxxsm:w-[27px] xxsm:w-[32px] xsm:w-[32px] sm:w-[35px] md:w-[40px] lg:w-[42px] xl:w-[42px]
                            transform transition duration-75 ease-in-out hover:scale-105 active:scale-95 "
                    onClick={handleNext}
                >
                    <img className='' alt='... ...' src='/next-page.svg' />
                </button>
            </div>
            <div className="flex justify-center gap-6 mt-0">
                <button
                    className="shuffle-button outline-none
                        focus:outline-none hover:outline-none ring-0
                        transform transition duration-75 ease-in-out hover:scale-110 active:scale-95
                        xxxsm:w-[18px] xxsm:w-[22px] xsm:w-[25px] sm:w-[27px] md:w-[30px] lg:w-[32px] xl:w-[32px]"
                    onClick={shuffleRandomCard}
                >
                    <img className='shuffle-button' alt='shuffle' src='/shuffle-icon.svg' />
                </button>
                <button
                    className={`check-flash-button mt-0 px-2 py-1 bg-[rgba(76,221,143,0.71)] text-[#000000] rounded 
        hover:bg-[rgba(95,229,157,0.84)] transform transition duration-75 ease-in-out hover:scale-110 active:scale-95 
        font-semibold xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] xl:text-[20px] 
        ${isCheckDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={checkAnswer}
                    disabled={isCheckDisabled}
                >
                    Check
                </button>

            </div>

            {/* <div className="navigation-buttons flex justify-center gap-4 mt-0">
                <button
                    className="bg-[rgba(75,207,137,0.81)] text-white rounded-full w-8 h-8 hover:bg-[rgb(75,207,115)]"
                    onClick={handlePrevious}
                >
                    <img className='next-page-icon' alt='... ...' src='/prev-page.svg' />
                </button>
                <button
                    className=" rounded-full w-10 h-8 hover:bg-yellow-600"
                    onClick={shuffleRandomCard}
                >
                    <img className='next-page-icon' alt='... ...' src='/shuffle-icon.svg' />
                </button>
                <button
                    className="bg-[rgba(75,207,137,0.81)] text-white rounded-full w-8 h-8 hover:bg-[rgb(75,207,115)]"
                    onClick={handleNext}
                >
                    <img className='next-page-icon' alt='... ...' src='/next-page.svg' />
                </button>
            </div> */}
            {/* Games Button */}
            <button className="game-link-flash-button bg-gradient-to-r from-[rgb(64,212,104)] to-[#149236] 
               hover:from-[#149236] hover:to-[rgb(64,212,104)] text-[rgb(0,0,0)] mt-[15px]
               font-semibold focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)] rounded 
                transform transition duration-75 ease-in-out hover:scale-105 active:scale-95
                xxxsm:px-[8px] xxsm:px-[10px] xsm:px-[10px] sm:px-[12px] md:px-[12px] lg:px-[15px] xl:px-[15px]
                xxxsm:py-[2px] xxsm:py-[2px] xsm:py-[2px] sm:py-[2px] md:py-[2px] lg:py-[2px] xl:py-[2px]
               xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]"
                onClick={navToGamePage}>Game Hub
            </button>
            {/* <div className="flex flex-col items-center justify-center
                            xxxsm:mt-[10px] xxsm:mt-[12px] xsm:mt-[15px] sm:mt-[20px] md:mt-[20px] lg:mt-[15px] xl:mt-[15px]
                            xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]">
                <Link className="game-link px-2 mt-5 bg-gradient-to-r from-[rgb(60,217,128)] to-[rgb(44,224,221)] hover:from-[rgba(60,217,128,0.92)]  
                        hover:to-[rgba(44,224,221,0.9)] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)] rounded
                        transform transition duration-75 ease-in-out hover:scale-105 active:scale-95"
                    to="/games">Game Hub
                </Link>
            </div> */}
        </div>
    );
};

export default FlashcardChallenges;