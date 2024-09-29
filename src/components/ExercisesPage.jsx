import React, { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { supabase } from "../supabaseClient";
import LatexRenderer from "./LatexRenderer";
import WolframAPI from "./WolframAPI";
import { MathfieldElement } from 'mathlive'
import '/node_modules/mathlive/dist/mathlive-static.css';
import '/node_modules/mathlive/dist/mathlive-fonts.css';

const MathLiveInput = ({ value, onChange }) => {
    const mathfieldRef = useRef(null);

    useEffect(() => {
        const mathfield = mathfieldRef.current;
        if (mathfield) {
            mathfield.value = value;
            const handleInput = () => {
                onChange(mathfield.value);
            };
            mathfield.addEventListener("input", handleInput);
            return () => {
                mathfield.removeEventListener("input", handleInput);
            };
        }
    }, [value, onChange]);

    return <math-field ref={mathfieldRef} />;
};

const ExercisesPage = () => {
    // State to hold exercises data fetched from the database
    const [exercisesData, setExercisesData] = useState([]);
    const [groupedExercises, setGroupedExercises] = useState({});
    // State to keep track of current lesson index
    const [currentExerciseIndex, setcurrentExerciseIndex] = useState(() => {
        const savedIndex = sessionStorage.getItem("currentExerciseIndex");
        return savedIndex ? parseInt(savedIndex, 10) : 0;
    });
    // Toggle hint
    const [showHint, setShowHint] = useState(false);
    // loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [submittedSolutions, setSubmittedSolutions] = useState({});
    const [wolframResults, setWolframResults] = useState({});

    const [userSolution, setUserSolution] = useState("");

    const [lessonsData, setLessonsData] = useState([]);

    useEffect(() => {
        const fetchExercises = async () => {
            const { data, error } = await supabase
                .from("exercises")
                .select("*")
                .order("exercise_id", { ascending: true });

            if (error) {
                console.error("Error fetching exercises:", error.message);
                setError(error.message);
            } else {
                const grouped = data.reduce((acc, exercise) => {
                    if (!acc[exercise.lesson_id]) {
                        acc[exercise.lesson_id] = [];
                    }
                    acc[exercise.lesson_id].push(exercise);
                    return acc;
                }, {});

                setGroupedExercises(grouped);
                setExercisesData(data);
                setLoading(false);
            }
        };

        const fetchLessons = async () => {
            const { data, error } = await supabase
                .from("lessons")
                .select("*")
                .order("lesson_id", { ascending: true });

            if (error) {
                console.error("Error fetching lessons:", error.message);
                setError(error.message);
            } else {
                setLessonsData(data);
            }
        };

        fetchExercises();
        fetchLessons();
    }, []);

    const handlePrevious = () => {
        const newIndex = currentExerciseIndex - 1;
        setcurrentExerciseIndex(newIndex);
        sessionStorage.setItem("currentExerciseIndex", newIndex);
        setShowHint(false);
        setUserSolution("");
    };

    const handleNext = () => {
        const newIndex = currentExerciseIndex + 1;
        setcurrentExerciseIndex(newIndex);
        sessionStorage.setItem("currentExerciseIndex", newIndex);
        setShowHint(false);
        setUserSolution("");
    };

    const toggleHint = () => {
        setShowHint(!showHint);
    };

    // get all unique lesson Ids
    const lessonIds = Object.keys(groupedExercises);

    // get exercises for current lesson id based on currentExerciseIndex
    const currentLessonId = lessonIds[currentExerciseIndex];
    const currentExercises = groupedExercises[currentLessonId] || [];

    const currentLessonIndex = lessonsData.findIndex(lesson => lesson.lesson_id === parseInt(currentLessonId));

    const handleSubmitSolution = (exerciseId, userSolution, exerciseQuestion) => {
        // ensure userSolution is not empty or undefined before making API call
        if (!userSolution || userSolution.trim() === "") {
            alert("Please enter a solution before submitting.");
            return;
        }
        // store users submitted solution
        setSubmittedSolutions((prev) => ({
            ...prev,
            [exerciseId]: userSolution,
        }));

        // trigger wolfram Api call
        setWolframResults((prev) => ({
            ...prev,
            [exerciseId]: <WolframAPI userSolution={userSolution} exerciseQuestion={exerciseQuestion} />,
        }));
        // have to clear solutions input each time!!!
        // have to clear solutions input each time!!!
        // have to clear solutions input each time!!!
        // have to clear solutions input each time!!!
        // have to clear solutions input each time!!!
        // have to clear solutions input each time!!!







        // have to clear solutions input each time!!!
    };

    if (loading) return <p>Loading exercises...</p>;
    if (error) return <p>{error}</p>;

    // const currentExercise = exercisesData[currentExerciseIndex];


    const renderContent = (question) => {
        // Regex to detect LaTeX code between $...$ or $$...$$
        const latexRegex = /\$\$(.*?)\$\$|\$(.*?)\$/g;

        // Check if question contains LaTeX
        const hasLatex = latexRegex.test(question);

        if (hasLatex) {
            // If LaTeX is detected, use LatexRenderer for LaTeX question
            return <LatexRenderer question={question} />;
        } else {
            // Render non-LaTeX question as plain HTML
            return (
                <div
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(marked(question)),
                    }}
                />
            );
        }
    };

    return (
        <div className="flex flex-col h-full">
            {currentLessonId && (
                <h2 className="text-xl font-bold mb-1">Lesson {currentLessonIndex + 1}</h2>
            )}
            <div className="flex-1 overflow-y-auto pl-4 pb-4 bg-gray-900 rounded prose prose-sm sm:prose lg:prose-lg text-white w-full override-max-width">
                {currentExercises.map((exercise) => (
                    <div key={exercise.exercise_id} className="mb-64 flex-1 overflow-y-auto pl-4 pb-4 bg-gray-900 rounded prose prose-sm sm:prose lg:prose-lg text-white w-full override-max-width">
                        {renderContent(exercise.question)}
                        {/* MathLiveInput for the exercise */}
                        <div className="mt-4">
                            {/* <h3 className="text-lg font-semibold mb-2">Your Solution:</h3> */}

                            <MathLiveInput
                                value={submittedSolutions[exercise.exercise_id] || ""}
                                onChange={(value) =>
                                    setSubmittedSolutions({
                                        ...submittedSolutions,
                                        [exercise.exercise_id]: value,
                                    })
                                }
                            />
                            <button
                                onClick={() =>
                                    handleSubmitSolution(exercise.exercise_id, submittedSolutions[exercise.exercise_id], exercise.question)
                                }
                                className=" px-1 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-full"
                            >
                                Submit Solution
                            </button>
                        </div>
                                                {/* Show user's submitted solution */}

                        {submittedSolutions[exercise.exercise_id] && (
                            <div className="mt-4">
                                <h4 className="text-md font-semibold">Your Solution:</h4>
                                <p>{submittedSolutions[exercise.exercise_id]}</p>
                            </div>
                        )}
                                                {/* Display Wolfram API Results */}

                        {wolframResults[exercise.exercise_id] && (
                            <div className="mt-4">
                                <h4 className="text-md font-semibold">Wolfram Alpha Result:</h4>
                                {wolframResults[exercise.exercise_id]}
                            </div>
                        )}
                        <button
                            onClick={toggleHint}
                            className="mt-1 px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded-full text-white"
                        >
                            {showHint ? "Hide Hint" : "Show Hint"}
                        </button>
                        {showHint && (
                            <div className=" pb-1 pt-0 px-2 bg-gray-600 rounded">
                                <h3 className="text-md font-semibold mb-1">Hint:</h3>
                                <p className="text-sm">{renderContent(exercise.hint)}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-1 flex justify-between">
                <button
                    onClick={handlePrevious}
                    disabled={currentLessonIndex === 0}
                    className={`px-2 py-0 rounded-full ${currentLessonIndex === 0
                        ? "bg-blue-900 cursor-not-allowed"
                        : "bg-blue-700 hover:bg-blue-800"
                        } text-white`}
                >
                    Previous
                </button>
                <p className="text-sm text-gray-400">
                    Exercise {currentLessonIndex + 1} of {lessonsData.length}
                </p>
                <button
                    onClick={handleNext}
                    disabled={currentLessonIndex === lessonsData.length - 1}
                    className={`mr-4 px-4 py-0 rounded-full ${currentLessonIndex === lessonsData.length - 1
                        ? "bg-blue-900 cursor-not-allowed"
                        : "bg-blue-700 hover:bg-blue-800"
                        } text-white`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ExercisesPage;







// return (
//     <div className="flex flex-col h-full">
//         {currentLessonId && (
//             <h2 className="text-xl font-bold mb-1">Lesson {currentLessonId}</h2>
//         )}
        
//         {currentExercises.map((exercise) => (
//             <div key={exercise.exercise_id} className="mb-6">
//                 <div className="flex-1 overflow-y-auto pl-4 pb-4 bg-gray-900 rounded prose prose-sm sm:prose lg:prose-lg text-white w-full override-max-width">
//                     {renderContent(exercise.question)} 
//                 </div>
//                 {showHint && (
//                     <div className="mt-4 pb-1 pt-0 px-2 bg-gray-600 rounded">
//                         <h3 className="text-md font-semibold mb-1">Hint:</h3>
//                         <p className="text-sm">{renderContent(exercise.hint)}</p>
//                     </div>
//                 )}
//                 {/* MathLiveInput for the exercise */}
//                 <div className="mt-4">
//                     {/* <h3 className="text-lg font-semibold mb-2">Your Solution:</h3> */}
//                     <MathLiveInput
//                         value={submittedSolutions[exercise.exercise_id] || ""}
//                         onChange={(value) => setSubmittedSolutions({
//                             ...submittedSolutions,
//                             [exercise.exercise_id]: value
//                         })}
//                     />
//                     <button
//                         onClick={() => handleSubmitSolution(exercise.exercise_id, submittedSolutions[exercise.exercise_id], exercise.question)}
//                         className=" px-1 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-full"
//                     >
//                         Submit Solution
//                     </button>
//                 </div>
//                 {/* Show user's submitted solution */}
//                 {submittedSolutions[exercise.exercise_id] && (
//                     <div className="mt-4">
//                         <h4 className="text-md font-semibold">Your Solution:</h4>
//                         <p>{submittedSolutions[exercise.exercise_id]}</p>
//                     </div>
//                 )}
//                 {/* Display Wolfram API Results */}
//                 {wolframResults[exercise.exercise_id] && (
//                     <div className="mt-4">
//                         <h4 className="text-md font-semibold">Wolfram Alpha Result:</h4>
//                         {wolframResults[exercise.exercise_id]}
//                     </div>
//                 )}
//                 <button
//                     onClick={toggleHint}
//                     className="mt-1 mb-11 px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded-full text-white"
//                 >
//                     {showHint ? "Hide Hint" : "Show Hint"}
//                 </button>
//             </div>
//         ))}
//         <div className="mt-4 flex justify-between">
//             <button
//                 onClick={handlePrevious}
//                 disabled={currentExerciseIndex === 0}
//                 className={px-2 py-1 rounded ${currentExerciseIndex === 0
//                     ? "bg-blue-900 cursor-not-allowed"
//                     : "bg-blue-700 hover:bg-blue-800"
//                     } text-white}
//             >
//                 Previous
//             </button>
//             <button
//                 onClick={handleNext}
//                 disabled={currentExerciseIndex === exercisesData.length - 1}
//                 className={mr-2 px-4 py-1 rounded ${currentExerciseIndex === exercisesData.length - 1
//                     ? "bg-blue-900 cursor-not-allowed"
//                     : "bg-blue-700 hover:bg-blue-800"
//                     } text-white}
//             >
//                 Next
//             </button>
//         </div>
//         <p className="mt-2 text-sm text-gray-400">
//             Exercise {currentExerciseIndex + 1} of {exercisesData.length}
//         </p>
//     </div>
// );