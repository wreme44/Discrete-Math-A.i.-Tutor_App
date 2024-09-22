import React, {useEffect, useState} from "react";
import {marked} from "marked";
import DOMPurify from "dompurify"; // cleansing html of lessons text in case malicious scripts

// array of lessons objects
const lessonsData = [
    {
        title: 'Lesson 1: Introduction to Discrete Mathematics',
        content: `**Discrete Mathematics** is the study of mathematical structures that are fundamentally discrete rather than continuous. It includes topics such as logic, set theory, combinatorics, graph theory, and algorithms.`,
        hint: 'Think of discrete mathematics as the foundation for computer science, focusing on countable, distinct elements.',
    },
    {
        title: 'Lesson 2: Logic and Propositions',
        content: `In discrete mathematics, **logic** is used to form propositions, which are statements that can be either true or false. Understanding logic is essential for developing algorithms and proofs.`,
        hint: 'Remember that logical operators like AND, OR, and NOT are fundamental in constructing complex propositions.',
    },
    {
        title: 'Lesson 3: Set Theory',
        content: `**Set theory** deals with the study of sets, which are collections of distinct objects. It forms the basis for defining functions, relations, and more complex structures in mathematics.`,
        hint: 'Consider how sets can be used to group similar objects and how operations like union and intersection combine them.',
    },
    {
        title: 'Lesson 4: Combinatorics',
        content: `**Combinatorics** is the study of counting, arrangement, and combination of objects. It is essential for probability, statistics, and algorithm analysis.`,
        hint: 'Think about how permutations and combinations differ in counting scenarios.',
    },
]

const LessonsColumn = () => {

    // state to keep track of current lessons index / page
    const [currentLessonIndex, setCurrentLessonIndex] = useState(() => {
        
        const savedIndex = sessionStorage.getItem('currentLessonIndex')
        return savedIndex ? parseInt(savedIndex, 10) : 0;
    })
    // toggle hint
    const [showHint, setShowHint] = useState(false);
    // fetching current lesson from array (or database)
    const currentLesson = lessonsData[currentLessonIndex];
    // handling next page click
    const handleNext = () => {

        if (currentLessonIndex < lessonsData.length -1){
            setCurrentLessonIndex(currentLessonIndex + 1)
            setShowHint(false);
        }
    }
    // handling prev page click
    const handlePrevious = () => {

        if (currentLessonIndex > 0){
            setCurrentLessonIndex(currentLessonIndex - 1)
            setShowHint(false);
        }
    }
    // function to trigger toggle
    const toggleHint = () => {

        setShowHint(!showHint);
    }

    // updating current lessons session if currentLessonIndex changes
    useEffect(() => {

        sessionStorage.setItem('currentLessonIndex', currentLessonIndex)
    }, [currentLessonIndex])

    // removing lessons session in case tab / browser closes or reloads  
    useEffect(() => {

        const handleBeforeUnload = () => {
            sessionStorage.removeItem('currentLessonIndex');
        }
        // adding event listener for when tab or browser is closed
        window.addEventListener('beforeunload', handleBeforeUnload);
        // removing listener once unmounted
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }, [])

    return (
        <div className="flex flex-col h-full">
            <h5 className="text-xl font-bold mb-4">Lessons & Instructions</h5>
            <div className="flex-1 overflow-y-auto p-2 bg-gray-900 rounded">
                <h6 className="text-lg font-semibold mb-2">{currentLesson.title}</h6>
                <div className="prose prose-sm sm:prose lg:prose-lg text-white">
                    {/* rendering lesson content with sanitized html (domPurify, malicious code etc.) */}
                    <div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(marked(currentLesson.content.trim()))}}/>
                </div>
                {showHint && (
                    <div className="mt-4 p-2 bg-gray-600 rounded">
                        <h6 className="text-md font-semibold mb-1">Hint:</h6>
                        <p className="text-sm">{currentLesson.hint}</p>
                    </div>    
                )}
            </div>
            <div className="mt-4 flex justify-between">
                <button
                    onClick={handlePrevious}
                    disabled={currentLessonIndex === 0}
                    className={`px-2 py-1 rounded ${currentLessonIndex === 0
                        ? 'bg-blue-900 cursor-not-allowed'
                        : 'bg-blue-700 hover:bg-blue-800'
                    } text-white`}
                >
                    Previous
                </button>
                <button
                    onClick={toggleHint}
                    className="px-2 py-1 bg-gray-500 hover:bg-gray-600 rounded text-white"
                >
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentLessonIndex === lessonsData.length - 1}
                    className={`px-4 py-1 rounded ${currentLessonIndex === lessonsData.length - 1
                            ? 'bg-blue-900 cursor-not-allowed'
                            : 'bg-blue-700 hover:bg-blue-800'
                        } text-white`}
                >
                    Next
                </button>
            </div>
            <p className="mt-2 text-sm text-gray-400">
                Lesson {currentLessonIndex + 1} of {lessonsData.length}
            </p>
        </div>
    )

}

export default LessonsColumn