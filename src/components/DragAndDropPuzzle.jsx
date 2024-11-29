import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

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
    const [isDragging, setIsDragging] = useState(false);

    const hardcodedInstructions = {
        2: "Drag subsets into the appropriate zone: Subset of A or Not a Subset of A.",
        3: "Drag subsets into the appropriate zone: Subset of A, Subset of B, or Not a Subset of A or B.",
    };

    const navigate = useNavigate();

    const navToGamePage = () => {
        navigate('/games');
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

    useEffect(() => {
        // Add class to body
        document.body.classList.add('dragDropBody');

        return () => {
            // Remove class when leaving the page
            document.body.classList.remove('dragDropBody');
        };
    }, []);

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
        setIsDragging(true);
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

    const handleTouchStart = (event, subset) => {
        // Prevent default behavior (e.g., scrolling)
        // event.preventDefault();
        setDraggedSubset(subset);
        setIsDragging(true);

        // Disable scrolling during drag
        // document.body.style.overflow = 'hidden';

        // Store the initial touch position
        const touch = event.touches[0];
        const touchStartData = {
            x: touch.clientX,
            y: touch.clientY,
        };
        event.target.dataset.touchStart = JSON.stringify(touchStartData);

        // Clone the item for visual feedback
        const clone = event.target.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.pointerEvents = 'none'; // Avoid interfering with drop detection
        clone.style.opacity = '0.7';
        clone.id = 'dragging-clone'; // Unique ID for the clone
        document.body.appendChild(clone);

        // Set initial position of the clone
        clone.style.left = `${touch.clientX}px`;
        clone.style.top = `${touch.clientY}px`;
    };

    const handleTouchMove = (event) => {
        // Prevent scrolling while dragging
        // If dragging, prevent scrolling
        if (isDragging) {
            event.preventDefault(); // Prevent scrolling during drag
        }

        // Update the item's position (optional, for visual feedback)
        const touch = event.touches[0];
        const clone = document.getElementById('dragging-clone');
        if (clone) {
            clone.style.left = `${touch.clientX}px`;
            clone.style.top = `${touch.clientY}px`;
        }


        // const target = event.target;
        // const touchStartData = JSON.parse(target.dataset.touchStart || '{}');

        // Calculate the new position (optional, for custom drag visuals)
        // const dx = touch.clientX - touchStartData.x;
        // const dy = touch.clientY - touchStartData.y;

        // Apply translation for feedback (optional)
        // target.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    const handleTouchEnd = (event) => {
        // Re-enable scrolling
        // document.body.style.overflow = '';
        // Remove dragging state
        setIsDragging(false);

        // Remove the clone
        const clone = document.getElementById('dragging-clone');
        if (clone) {
            clone.remove();
        }

        // Reset transform
        // event.target.style.transform = '';

        // Detect drop target
        const dropTarget = document.elementFromPoint(
            event.changedTouches[0].clientX,
            event.changedTouches[0].clientY
        );
        // same as above:
        // const touch = event.changedTouches[0];
        // const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

        if (dropTarget && dropTarget.classList.contains('drag-category')) {
            handleDrop(dropTarget.textContent.trim());
        }
    };

    useEffect(() => {
        const disableTouchScroll = (e) => {
            if (isDragging) {
                e.preventDefault();
            }
        };

        document.addEventListener('touchmove', disableTouchScroll, { passive: false });

        return () => {
            document.removeEventListener('touchmove', disableTouchScroll);
        };
    }, [isDragging]);


    return (
        <div className="drag-and-drop-container xxxsm:pt-[70px] xxsm:pt-[75px] xsm:pt-[80px] sm:pt-[80px] md:pt-[80px] lg:pt-[80px] xl:pt-[80px]">
            {showInstructions && (
                <div className="instructions-drag-modal">
                    <div className="drag-modal-content xxxsm:p-[20px] xxsm:p-[20px] xsm:p-[20px] sm:p-[20px] md:p-[20px] lg:p-[20px] xl:p-[20px]">
                        <h2>Instructions</h2>
                        <p>{hardcodedInstructions[activeZones.length]}</p>
                        {/* <div className="mt-0 border-2  border-gray-600 border-opacity-100 w-[80%] mx-auto"></div> */}
                        <hr className="my-1 border-1 border-gray-600 border-opacity-50 w-[70%] mx-auto" />
                        <p>Earn 10 points for correct placements and lose 5 for incorrect ones!</p>
                        <button
                            className="drag-start-button px-1 bg-[rgb(0,0,0)] hover:bg-[rgb(84,56,12)] 
                            text-[rgb(255,179,0)] text-lg font-semibold rounded
                            transform transition duration-75 ease-in-out hover:scale-105 active:scale-95"
                            onClick={() => setShowInstructions(false)}
                        >
                            Start Game
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
                        hover:to-[rgba(44,224,221,0.9)] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)] rounded
                        transform transition duration-75 ease-in-out hover:scale-105 active:scale-95"
                            to="/games">Game Hub
                        </Link>
                    </div>
                </div>
            )}

            {!showInstructions && !gameCompleted && (
                <>
                    <h1 className="drop-title xxxsm:text-[16px] xxsm:text-[20px] xsm:text-[25px] sm:text-[30px] md:text-[39px] lg:text-[45px] xl:text-[45px]">
                        Discrete Drops: Subsets</h1>
                    <div className="main-drag-sets xxxsm:mb-[10px] xxsm:mb-[12px] xsm:mb-[15px] sm:mb-[15px] md:mb-[20px] lg:mb-[20px] xl:mb-[20px]
                    xxxsm:p-[5px] xxsm:p-[5px] xsm:p-[5px] sm:p-[8px] md:p-[8px] lg:p-[8px] xl:p-[8px]">
                        <p className="mb-1 xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]">
                            Main Set A: {JSON.stringify(mainSetA)}</p>
                        <p className="xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]">
                            Main Set B: {JSON.stringify(mainSetB)}</p>
                    </div>
                    <div className="flex items-center">
                        <p className="drag-points
                        xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]
                        xxxsm:mr-[10px] xxsm:mr-[10px] xsm:mr-[12px] sm:mr-[14px] md:mr-[16px] lg:mr-[16px] xl:mr-[16px]">
                            Points: {points}
                        </p>
                        <img className="xxxsm:w-[20px] xxsm:w-[25px] xsm:w-[30px] sm:w-[40px] md:w-[50px] lg:w-[50px] xl:w-[50px]
                        xxxsm:mr-[5px] xxsm:mr-[5px] xsm:mr-[5px] sm:mr-[5px] md:mr-[5px] lg:mr-[5px] xl:mr-[5px]"
                            alt="time" src="./time-drag-icon.svg"
                        />
                        <p className="drag-points xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]">
                            {time}s</p>
                    </div>
                    <div className="drag-categories-container">
                        {activeZones.map((zone) => (
                            <div
                                key={zone}
                                className={`drag-category ${highlightWrong === zone ? "wrong" : ""}
                                transform transition duration-75 ease-in-out hover:scale-[1.01]
                                xxxsm:h-[70px] xxsm:h-[80px] xsm:h-[90px] sm:h-[100px] md:h-[125px] lg:h-[150px] xl:h-[150px]
                                xxxsm:w-[70px] xxsm:w-[90px] xsm:w-[125px] sm:w-[150px] md:w-[175px] lg:w-[200px] xl:w-[200px]
                                xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]`}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDrop(zone)}
                            >
                                {zone}
                            </div>
                        ))}
                    </div>
                    <div className="drag-items-container">
                        {subsets.map((subset, index) => (
                            <div
                                key={index}
                                className={`drag-item ${isDragging ? 'dragging' : ''} outline-none
                                        focus:outline-none border-1 rounded-[5px] transform transition duration-75
                                         ease-in-out hover:scale-105 active:scale-95
                                         xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]
                                         xxxsm:px-[10px] xxsm:px-[12px] xsm:px-[15px] sm:px-[18px] md:px-[20px] lg:px-[20px] xl:px-[20px]
                                         xxxsm:py-[3px] xxsm:py-[5px] xsm:py-[6px] sm:py-[8px] md:py-[10px] lg:py-[10px] xl:py-[10px]`}
                                draggable
                                onMouseDown={() => setIsDragging(true)}
                                onMouseUp={() => setIsDragging(false)}
                                onDragStart={() => { handleDragStart(subset) }}
                                onDragEnd={() => setIsDragging(false)}
                                onTouchStart={(e) => handleTouchStart(e, subset)}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                {JSON.stringify(subset.set)}
                            </div>
                        ))}
                    </div>
                    <div className="space-x-1 ">
                        <button className="drag-restart-button bg-[rgba(0,0,0,0.71)] hover:bg-[rgba(50,50,50,0.88)]
                                text-[rgb(255,221,0)] font-semibold outline-none focus:outline-none
                                border-1 rounded-[5px] transform transition duration-75
                                ease-in-out hover:scale-105 active:scale-95
                                xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]
                                xxxsm:px-[10px] xxsm:px-[12px] xsm:px-[15px] sm:px-[18px] md:px-[20px] lg:px-[20px] xl:px-[20px]
                                xxxsm:py-[3px] xxsm:py-[5px] xsm:py-[6px] sm:py-[8px] md:py-[10px] lg:py-[10px] xl:py-[10px]"
                            onClick={restartGame}>
                            Restart Game
                        </button>
                        {/* Games Button */}
                        <button className="game-link-drag-button bg-[rgba(0,0,0,0.71)] hover:bg-[rgba(50,50,50,0.88)]
                                text-[rgb(255,221,0)] font-semibold focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)] rounded 
                                transform transition duration-75 ease-in-out hover:scale-105 active:scale-95
                                xxxsm:px-[10px] xxsm:px-[12px] xsm:px-[15px] sm:px-[18px] md:px-[20px] lg:px-[20px] xl:px-[20px]
                                xxxsm:py-[3px] xxsm:py-[5px] xsm:py-[6px] sm:py-[8px] md:py-[10px] lg:py-[10px] xl:py-[10px]
                                xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]"
                            onClick={navToGamePage}>Game Hub
                        </button>
                    </div>
                </>
            )}

            {gameCompleted && (
                <div className="drag-game-completed-modal">
                    <div className="drag-completed-modal-content">
                        <h2>Congrats!</h2>
                        <p>You completed the challenge!</p>
                        <p>Points: {points}</p>
                        <p>Time: {time}s</p>
                        <p>
                            Badge: <strong>{badge}</strong>
                        </p>

                        <div className="space-x-1 ">
                            <button className="drag-restart-button bg-[rgba(0,0,0,0.71)] hover:bg-[rgba(50,50,50,0.88)]
                                text-[rgb(255,221,0)] font-semibold outline-none focus:outline-none
                                border-1 rounded-[5px] transform transition duration-75
                                ease-in-out hover:scale-105 active:scale-95
                                xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]
                                xxxsm:px-[10px] xxsm:px-[12px] xsm:px-[15px] sm:px-[18px] md:px-[20px] lg:px-[20px] xl:px-[20px]
                                xxxsm:py-[3px] xxsm:py-[5px] xsm:py-[6px] sm:py-[8px] md:py-[10px] lg:py-[10px] xl:py-[10px]"
                                onClick={restartGame}>
                                Restart Game
                            </button>
                            {/* Games Button */}
                            <button className="game-link-drag-button bg-[rgba(0,0,0,0.71)] hover:bg-[rgba(50,50,50,0.88)]
                                text-[rgb(255,221,0)] font-semibold focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)] rounded 
                                transform transition duration-75 ease-in-out hover:scale-105 active:scale-95
                                xxxsm:px-[10px] xxsm:px-[12px] xsm:px-[15px] sm:px-[18px] md:px-[20px] lg:px-[20px] xl:px-[20px]
                                xxxsm:py-[3px] xxsm:py-[5px] xsm:py-[6px] sm:py-[8px] md:py-[10px] lg:py-[10px] xl:py-[10px]
                                xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]"
                                onClick={navToGamePage}>Game Hub
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default DragAndDropPuzzle;
