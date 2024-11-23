import React, { useState, useEffect } from "react";
import {Link} from "react-router-dom";

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

  return (
    <div className="memory-match-container">
      <style>
        {`
          .memory-match-container {
            text-align: center;
            font-family: Arial, sans-serif;
            color: white;
            background-color: #1a202c;
            // min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding-top: 150px;
          }
          .instructions-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            z-index: 1000;
          }
          .modal-content {
            text-align: center;
            padding: 20px;
            background-color: #2d3748;
            border-radius: 10px;
            max-width: 400px;
          }
          .modal-content h2 {
            margin-bottom: 20px;
          }
          .grid {
            display: grid;
            gap: 10px;
            grid-template-columns: repeat(4, 1fr);
          }
          .card {
            width: 80px;
            height: 100px;
            background-color: #2d3748;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 5px;
            cursor: pointer;
          }
          .card.flipped {
            background-color: #4a5568;
          }
          .control-buttons {
            margin-top: 10px;
          }
          .control-buttons button {
            margin: 5px;
            padding: 10px 20px;
            background-color: #4a5568;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
          .control-buttons button:hover {
            background-color: #2d3748;
          }
        `}
      </style>
      {showInstructions ? (
        <div className="instructions-modal">
          <div className="modal-content">
            <h2>Mentor Memory Instructions</h2>
            <p>Match each term with its definition as fast as possible!</p>
            <ul>
              <li>3 Stars: Finish in {difficultySettings.Apprentice.thresholds[0]}s or less.</li>
              <li>2 Stars: Finish in {difficultySettings.Apprentice.thresholds[1]}s or less.</li>
              <li>1 Star: Finish in more than {difficultySettings.Apprentice.thresholds[1]}s.</li>
            </ul>
            <p>Select a difficulty to begin:</p>
            <div className="difficulty-buttons">
              {Object.keys(difficultySettings).map((level) => (
                <button key={level} onClick={() => selectDifficulty(level)}>
                  {level}
                </button>
              ))}
            </div>
          </div>
          {/* Games Button */}
          <div className="flex flex-col items-center justify-center
                            xxxsm:mb-[10px] xxsm:mb-[12px] xsm:mb-[15px] sm:mb-[15px] md:mb-[20px] lg:mb-[20px] xl:mb-[20px]
                            xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]">
                    {/* <Link className=""
                        to="/games">
                        <img className="xxxsm:w-[30px] xxsm:w-[40px] xsm:w-[50px] sm:w-[60px] md:w-[60px] lg:w-[70px] xl:w-[70px] h-auto mr-1"
                            alt="Games" src="/games-icon.svg" />
                    </Link> */}
                    <Link className="game-link px-2 mt-5 bg-gradient-to-r from-[rgb(60,217,128)] to-[rgb(44,224,221)] hover:from-[rgba(60,217,128,0.92)]  
                        hover:to-[rgba(44,224,221,0.9)] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)] rounded"
                        to="/games">Game Hub</Link>
            </div>
        </div>
      ) : (
        <>
          <h1>Mentor Memory</h1>
          <p>Time: {time}s</p>
          <p>Stars: {"⭐".repeat(stars)}</p>
          <div className="grid">
            {cards.map((card, index) => (
              <div
                key={index}
                className={`card ${flippedCards.includes(index) || matchedCards.includes(index) ? "flipped" : ""
                  }`}
                onClick={() => handleCardClick(index)}
              >
                {flippedCards.includes(index) || matchedCards.includes(index) ? card.text : ""}
              </div>
            ))}
          </div>
          <div className="control-buttons">
            {!gameOver && (
              <>
                <button onClick={() => startNewGame(difficulty)}>Restart</button>
                <button onClick={handleQuit}>Quit</button>
              </>
            )}
          </div>
          {gameOver && (
            <div className="game-over">
              <h2>Congratulations! You matched all cards!</h2>
              <p>Time: {time}s</p>
              <p>Stars: {"⭐".repeat(stars)}</p>
              <button onClick={handleQuit}>Select Difficulty</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MemoryMatch;
