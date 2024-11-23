import React, { useState, useEffect } from "react";
import {Link} from "react-router-dom";
import CustomCursor from './CustomCursor';
// import SparkParticles from './SparkParticles';

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

const FlashcardChallenges = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [guess, setGuess] = useState("");
  const [correctGuess, setCorrectGuess] = useState("");
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

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
  };

  const shuffleRandomCard = () => {
    const randomIndex = Math.floor(Math.random() * discreteMathTerms.length);
    setCurrentCardIndex(randomIndex);
    setFlipped(false);
    setGuess("");
    setCorrectGuess("");
  };

  const checkAnswer = () => {
    const correctAnswer = discreteMathTerms[currentCardIndex].definition.toLowerCase();
    if (guess.toLowerCase().includes(correctAnswer)) {
      setCorrectGuess("correct");
      setStreak(streak + 1);
      if (streak + 1 > longestStreak) {
        setLongestStreak(streak + 1);
      }
    } else {
      setCorrectGuess("wrong");
      setStreak(0);
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
    <div className="flex items-center justify-center pt-[150px] bg-gray-800 text-white">
        <CustomCursor />
      <div className="text-center ">
        <h1 className="text-3xl font-bold mb-6">MentorCards</h1>
        <div className="streak-tracker text-lg mb-4">
          <p>Current Streak: {streak}</p>
          <p>Longest Streak: {longestStreak}</p>
        </div>

        <div
          className={`card-container ${flipped ? 'flipped' : ''} mx-auto mb-6 p-4 border-2 border-green-500 rounded-lg`}
          onClick={handleFlip}
        >
          {!flipped ? (
            <h2 className="card-front">{discreteMathTerms[currentCardIndex].term}</h2>
          ) : (
            <h2 className="card-back">{discreteMathTerms[currentCardIndex].definition}</h2>
          )}
        </div>

        <div className="type-answer flex flex-col items-center mb-4">
          <input
            type="text"
            placeholder="Enter your guess..."
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            className={`p-2 rounded border ${correctGuess === "correct"
              ? "border-green-500"
              : correctGuess === "wrong"
                ? "border-red-500"
                : "border-gray-500"
              }`}
          />
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={checkAnswer}
          >
            Check Guess
          </button>
        </div>

        <div className="navigation-buttons flex justify-center gap-4 mt-6">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            onClick={handlePrevious}
          >
            Previous
          </button>
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
            onClick={shuffleRandomCard}
          >
            Shuffle
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            onClick={handleNext}
          >
            Next
          </button>
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
    </div>
  );
};

export default FlashcardChallenges;