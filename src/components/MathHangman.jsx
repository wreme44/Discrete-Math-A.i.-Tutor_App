import React, { useState } from "react";

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

  const renderHangman = () => {
    const parts = [
      <circle key="head" cx="50" cy="30" r="10" stroke="white" fill="none" />,
      <line key="body" x1="50" y1="40" x2="50" y2="70" stroke="white" />,
      <line key="left-arm" x1="50" y1="50" x2="40" y2="60" stroke="white" />,
      <line key="right-arm" x1="50" y1="50" x2="60" y2="60" stroke="white" />,
      <line key="left-leg" x1="50" y1="70" x2="40" y2="80" stroke="white" />,
      <line key="right-leg" x1="50" y1="70" x2="60" y2="80" stroke="white" />,
    ];

    return parts.slice(0, MAX_ATTEMPTS - attemptsLeft);
  };

  return (
    <div className="hangman-container">
      <style>
        {`
          .hangman-container {
            text-align: center;
            font-family: Arial, sans-serif;
            color: white;
            background-color: #1a202c;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .word-container {
            font-size: 24px;
            margin-bottom: 20px;
          }
          .letter, .underscore, .space {
            margin: 0 5px;
            font-size: 28px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .underscore {
            text-decoration: underline;
          }
          .space {
            display: inline-block;
            width: 20px;
          }
          .hint {
            font-size: 18px;
            margin-bottom: 20px;
            color: #81e6d9;
          }
          .keyboard {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            margin-bottom: 20px;
          }
          .key {
            background-color: #4a5568;
            color: white;
            padding: 10px 15px;
            margin: 5px;
            border-radius: 5px;
            cursor: pointer;
          }
          .key.disabled {
            background-color: #2d3748;
            cursor: not-allowed;
          }
          .lifeline {
            margin-bottom: 20px;
            padding: 10px 20px;
            background-color: #38b2ac;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
          .lifeline:disabled {
            background-color: #2d3748;
            cursor: not-allowed;
          }
          .game-status {
            font-size: 24px;
            margin-bottom: 20px;
          }
          .restart-button {
            padding: 10px 20px;
            background-color: #4a5568;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
        `}
      </style>

      {showInstructions && (
        <div className="instructions-modal">
          <div className="instructions-content">
            <h2>Welcome to Math Hangman</h2>
            <p>
              Guess the discrete math term letter by letter. You have {MAX_ATTEMPTS} chances!
            </p>
            <p>
              <strong>Hints:</strong> Use the provided hint to assist you in guessing.
            </p>
            <p>
              <strong>Lifeline:</strong> Reveal a random letter to help you, but you can only use it once!
            </p>
            <button className="restart-button" onClick={startNewGame}>
              Start Game
            </button>
          </div>
        </div>
      )}

      {selectedWord && (
        <>
          <h1>Mathman</h1>
          <div className="hangman-drawing">
            <svg width="100" height="100">
              {renderHangman()}
            </svg>
          </div>
          <div className="word-container">{renderWord()}</div>
          <div className="hint">Hint: {hint}</div>
          <button
            className="lifeline"
            onClick={useLifeline}
            disabled={lifelineUsed || gameStatus !== "playing"}
          >
            Use Lifeline
          </button>
          <div className="keyboard">
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
              <button
                key={letter}
                className={`key ${guessedLetters.includes(letter) ? "disabled" : ""}`}
                onClick={() => handleGuess(letter)}
                disabled={guessedLetters.includes(letter) || gameStatus !== "playing"}
              >
                {letter}
              </button>
            ))}
          </div>
          {gameStatus === "lost" && (
            <div className="game-status">
              You Lost! 😢 <br />
              <strong>The correct word was: {selectedWord}</strong>
            </div>
          )}
          {gameStatus === "won" && (
            <div className="game-status">You Won! 🎉</div>
          )}
          {(gameStatus === "won" || gameStatus === "lost") && (
            <button className="restart-button" onClick={startNewGame}>
              Play Again
            </button>




          )}
        </>
      )}
    </div>
  );
};

export default MathHangman;
