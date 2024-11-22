import React, { useState, useEffect } from "react";

const DragAndDropPuzzle = () => {
  const [mainSetA, setMainSetA] = useState([]);
  const [mainSetB, setMainSetB] = useState([]);
  const [subsets, setSubsets] = useState([]);
  const [activeZones, setActiveZones] = useState(["Subset of A", "Subset of B", "Not a Subset of A or B"]);
  const [draggedSubset, setDraggedSubset] = useState(null);
  const [points, setPoints] = useState(0);
  const [time, setTime] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [highlightWrong, setHighlightWrong] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [badge, setBadge] = useState(null);

  const hardcodedInstructions = {
    2: "Drag subsets into the appropriate zone: Subset of A or Not a Subset of A.",
    3: "Drag subsets into the appropriate zone: Subset of A, Subset of B, or Not a Subset of A or B.",
  };

  useEffect(() => {
    restartGame();
  }, []);

  // Timer
  useEffect(() => {
    let timer;
    if (!showInstructions && !gameCompleted) {
      timer = setInterval(() => setTime((prevTime) => prevTime + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [showInstructions, gameCompleted]);

  const generateRandomSet = (size, max) => {
    const set = new Set();
    while (set.size < size) {
      set.add(Math.floor(Math.random() * max) + 1);
    }
    return Array.from(set);
  };

  const restartGame = () => {
    const newSetA = generateRandomSet(5, 20);
    const newSetB = generateRandomSet(4, 20);
    setMainSetA(newSetA);
    setMainSetB(newSetB);

    const allSubsets = [
      ...generateSubsets(newSetA, "Subset of A"),
      ...generateSubsets(newSetB, "Subset of B"),
      ...generateFakeSubsets(newSetA, newSetB, 6),
    ];

    setSubsets(shuffleArray(allSubsets));
    setPoints(0);
    setTime(0);
    setGameCompleted(false);
    setBadge(null);
  };

  const generateSubsets = (set, label) => {
    const subsets = [];
    const size = Math.max(1, Math.floor(set.length / 2));
    for (let i = 0; i < size; i++) {
      const subset = shuffleArray(set).slice(0, i + 1);
      subsets.push({ set: subset, type: "valid", belongsTo: label });
    }
    return subsets;
  };

  const generateFakeSubsets = (setA, setB, count) => {
    const fakeSubsets = [];
    for (let i = 0; i < count; i++) {
      const randomSet = generateRandomSet(2, 20);
      if (!isSubset(randomSet, setA) && !isSubset(randomSet, setB)) {
        fakeSubsets.push({ set: randomSet, type: "invalid", belongsTo: "Not a Subset of A or B" });
      }
    }
    return fakeSubsets;
  };

  const isSubset = (subset, set) => subset.every((val) => set.includes(val));

  const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

  const handleDragStart = (subset) => {
    setDraggedSubset(subset);
  };

  const handleDrop = (zone) => {
    if (draggedSubset) {
      if (draggedSubset.belongsTo === zone) {
        setPoints((prev) => prev + 10);
        setSubsets((prev) => prev.filter((s) => s !== draggedSubset)); // Remove correctly placed subset
        if (subsets.length === 1) {
          setGameCompleted(true);
          calculateBadge();
        }
      } else {
        setPoints((prev) => prev - 5); // Penalty for wrong placement
        setHighlightWrong(zone); // Temporarily highlight wrong zone
        setTimeout(() => setHighlightWrong(null), 500);
      }
      setDraggedSubset(null);
    }
  };

  const calculateBadge = () => {
    if (points >= 90 && time <= 30) {
      setBadge("Gold");
    } else if (points >= 70 && time <= 60) {
      setBadge("Silver");
    } else if (points >= 50) {
      setBadge("Bronze");
    } else {
      setBadge("None");
    }
  };

  const handleZoneSelection = (numZones) => {
    setActiveZones(numZones === 2 ? ["Subset of A", "Not a Subset of A or B"] : ["Subset of A", "Subset of B", "Not a Subset of A or B"]);
    restartGame();
  };

  return (
    <div className="drag-and-drop-container">
      <style>
        {`
          .drag-and-drop-container {
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
          .main-sets {
            margin-bottom: 20px;
          }
          .categories-container {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 20px 0;
          }
          .category {
            width: 200px;
            height: 150px;
            background-color: #2d3748;
            border: 2px dashed white;
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 10px;
            transition: background-color 0.3s ease;
          }
          .category.wrong {
            background-color: red;
          }
          .items-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
          }
          .item {
            background-color: #4a5568;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: grab;
            color: white;
          }
          .restart-button {
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #4a5568;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
          .restart-button:hover {
            background-color: #2d3748;
          }
          .instructions-modal,
          .game-completed-modal {
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
            z-index: 1000;
            color: white;
          }
          .modal-content {
            background-color: #2d3748;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            max-width: 400px;
          }
          .modal-content h2 {
            margin-bottom: 10px;
          }
          .modal-content p {
            margin-bottom: 10px;
          }
        `}
      </style>

      {showInstructions && (
        <div className="instructions-modal">
          <div className="modal-content">
            <h2>Instructions</h2>
            <p>{hardcodedInstructions[activeZones.length]}</p>
            <p>Earn 10 points for correct placements and lose 5 for incorrect ones!</p>
            <button
              className="restart-button"
              onClick={() => setShowInstructions(false)}
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {!showInstructions && !gameCompleted && (
        <>
          <h1>Discrete Drops: Subsets</h1>
          <div className="main-sets">
            <p>Main Set A: {JSON.stringify(mainSetA)}</p>
            <p>Main Set B: {JSON.stringify(mainSetB)}</p>
          </div>
          <p>Points: {points}</p>
          <p>Time: {time}s</p>
          <div className="categories-container">
            {activeZones.map((zone) => (
              <div
                key={zone}
                className={`category ${highlightWrong === zone ? "wrong" : ""}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(zone)}
              >
                {zone}
              </div>
            ))}
          </div>
          <div className="items-container">
            {subsets.map((subset, index) => (
              <div
                key={index}
                className="item"
                draggable
                onDragStart={() => handleDragStart(subset)}
              >
                {JSON.stringify(subset.set)}
              </div>
            ))}
          </div>
          <button className="restart-button" onClick={restartGame}>
            Restart Game
          </button>
        </>
      )}

      {gameCompleted && (
        <div className="game-completed-modal">
          <div className="modal-content">
            <h2>Congratulations!</h2>
            <p>You completed the challenge!</p>
            <p>Points: {points}</p>
            <p>Time: {time}s</p>
            <p>
              Badge: <strong>{badge}</strong>
            </p>
            <button className="restart-button" onClick={restartGame}>
              Restart Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DragAndDropPuzzle;
