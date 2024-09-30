import React, { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { supabase } from "../supabaseClient";
import LatexRenderer from "./LatexRenderer";
import WolframAPI from "./WolframAPI";
import { MathfieldElement } from 'mathlive'
import '/node_modules/mathlive/dist/mathlive-static.css';
import '/node_modules/mathlive/dist/mathlive-fonts.css';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import remarkGfm from 'remark-gfm'


const MathLiveInput = ({value, onChange}) => {

    const mathfieldRef = useRef(null);

    useEffect(() => {
        const mathfield = mathfieldRef.current;
        if (mathfield) {
            mathfield.value = value;
            const handleInput = () => {
                onChange(mathfield.value);
            }
            mathfield.addEventListener("input", handleInput)
            return () => {
                mathfield.removeEventListener("input", handleInput);
            }
        }
    }, [value, onChange]);

    return <math-field ref={mathfieldRef} />;
}

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
    const [showHint, setShowHint] = useState({});
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
                .from("exercises") // ensure table name matches exactly
                .select("*")
                .order("exercise_id", { ascending: true }); // order by 'id' column in ascending order

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
        // setShowHint(false);
        setUserSolution("");
    };

    const handleNext = () => {
        const newIndex = currentExerciseIndex + 1;
        setcurrentExerciseIndex(newIndex);
        sessionStorage.setItem("currentExerciseIndex", newIndex);
        // setShowHint(false);
        setUserSolution("");
    };

    const toggleHint = (exerciseId) => {

        setShowHint((prevState) => ({
            ...prevState, [exerciseId]: !prevState[exerciseId],
        }));
    };

    // get all unique lesson Ids
    const lessonIds = Object.keys(groupedExercises);

    // get exercises for current lesson id based on currentExerciseIndex
    const currentLessonId = lessonIds[currentExerciseIndex];
    const currentExercises = groupedExercises[currentLessonId] || [];

    const currentLessonIndex = lessonsData.findIndex(lesson => lesson.lesson_id === parseInt(currentLessonId));

    const cleanLatexInput = (latexInput) => {

        return latexInput
            .replace(/\$\$/g, '') // Remove dollar signs used for wrapping
            .replace(/\\left/g, '') // Remove LaTeX commands like \left
            .replace(/\\right/g, '') // Remove \right
            .replace(/\\text\{([^}]+)\}/g, '$1') // Convert \text{...} to plain text
            .replace(/\\middle\{\|}/g, '|') // Replace LaTeX middle commands
            .replace(/\\le/g, '<=') // Replace \le with <=
            .replace(/\\ge/g, '>=') // Replace \ge with >=
            .replace(/\\times/g, '*') // Replace \times with *
            .replace(/\\div/g, '/') // Replace \div with /
            .replace(/\\cdot/g, '*') // Replace \cdot with *
            .replace(/\\pm/g, '+/-') // Replace \pm with +/-
            .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)') // Convert square root
            .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)') // Convert fractions to division
            .replace(/\\sum/g, 'sum') // Replace sum notation
            .replace(/\\infty/g, 'infinity') // Replace infinity symbol
            .replace(/\\neq/g, '!=') // Replace not equal
            .replace(/\\approx/g, '~=') // Replace approximately equal
            .replace(/\\pi/g, 'pi') // Replace pi symbol
            .replace(/\\alpha/g, 'alpha') // Greek letters example
            .replace(/\\beta/g, 'beta') // Greek letters example
            .replace(/\\gamma/g, 'gamma') // Greek letters example
            .replace(/\\ldots/g, '...') // Replace ellipsis
            .replace(/[{}]/g, '') // Remove curly braces
            .trim();
    };




    const handleSubmitSolution = async (exerciseId, userSolution, exerciseQuestion) => {

        // ensure userSolution is not empty or undefined before making API call
        if (!userSolution || userSolution.trim() === "") {
            alert("Please enter a solution before submitting.");
            return;
        }
    
        const cleanedSolution = cleanLatexInput(userSolution);
    
        // store users submitted solution
        setSubmittedSolutions((prev) => ({
            ...prev,
            [exerciseId]: userSolution,
        }));
    
        try {
            const response = await fetch('http://localhost:5000/api/validate-solution', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: exerciseQuestion, userSolution: cleanedSolution })
            });
    
            // error handling
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // getting readable stream from 'response body'
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8'); // creating TextDecoder to convert bytes to text
    
            let solutionResponse = ''; // to accumulate the assistant's response
    
            // continuously reading from stream until done
            while (true) {
                // reading next chunk of data
                const { done, value } = await reader.read();
                if (done) break; // exiting loop when no more data
    
                // decoding chunk of data from bytes to string
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim() !== ''); // splitting chunk into lines, filtering out empty lines
    
                // going through each line of chunk
                for (const line of lines) {
                    // processing data if line starts with 'data: '
                    if (line.startsWith('data: ')) {
                        // removing 'data: ' from start of line
                        const data = line.replace('data: ', '');
    
                        // if data is '[DONE]', stop processing
                        if (data === '[DONE]') {
                            setWolframResults((prev) => ({
                                ...prev,
                                [exerciseId]: solutionResponse
                            }));
                            return;
                        }
    
                        try {
                            // parsing data into JSON format
                            const parsed = JSON.parse(data);
                            const text = parsed.content || ''; // extracting content (text) from parsed data
                            
                            solutionResponse += text; // appending to solution response
    
                            // updating state with the latest assistant response
                            setWolframResults((prev) => ({
                                ...prev,
                                [exerciseId]: solutionResponse
                            }));
                        } catch (error) {
                            console.error('Error parsing streaming data:', error);
                        }
                    }
                }
            }
        } catch (error) {
            // error handling during fetch requests or streaming process
            console.error('Error validating solution:', error);
            setWolframResults((prev) => ({
                ...prev,
                [exerciseId]: 'An error occurred while validating the solution.'
            }));
        }
    };
    




    // const handleSubmitSolution = async (exerciseId, userSolution, exerciseQuestion) => {

    //     // ensure userSolution is not empty or undefined before making API call
    //     if (!userSolution || userSolution.trim() === "") {
    //         alert("Please enter a solution before submitting.");
    //         return;
    //     }

    //     const cleanedSolution = cleanLatexInput(userSolution)
    //     // store users submitted solution
    //     setSubmittedSolutions((prev) => ({
    //         ...prev,
    //         [exerciseId]: userSolution,
    //     }));

    //     try {
    //         const response = await fetch('http://localhost:5000/api/validate-solution', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({question: exerciseQuestion, userSolution: cleanedSolution})
    //         })
    //         const data = await response.json();
    //         // trigger gpt Api call
    //         setWolframResults((prev) => ({
    //             ...prev,
    //             [exerciseId]: data.message
    //         }));
    //     }
    //     catch (error) {
    //         console.error('Error validating solution:', error);
    //         setWolframResults((prev) => ({
    //             ...prev,
    //             [exerciseId]: 'An error occurred while validating the solution.'
    //         }));
    //     }
    //     // have to clear solutions input each time!!!
    //     // have to clear solutions input each time!!!
    //     // have to clear solutions input each time!!!
    //     // have to clear solutions input each time!!!
    //     // have to clear solutions input each time!!!
    //     // have to clear solutions input each time!!!
    //     // have to clear solutions input each time!!!
    // };

    if (loading) return <p>Loading exercises...</p>;
    if (error) return <p>{error}</p>;
    // const currentExercise = exercisesData[currentExerciseIndex];

    const renderContent = (question) => {

        // console.log(question)
        // regex to detect latex code between $...$ or $$...$$
        const latexRegex = /\$\$(.*?)\$\$|\$(.*?)\$/g;
        // regex to check if latex already wrapped  with $$..$$ or \(..\)
        const alreadyWrappedLatex = /(\$\$(.*?)\$\$)|\\\((.*?)\\\)/g
        // detect raw latex without wrappings
        const rawLatexRegex = /\\(frac|sum|int|left|right|cdots|dots|binom|sqrt|text|over|begin|end|matrix|[A-Za-z]+)\b/g
        // Check if question contains LaTeX
        const hasLatex = latexRegex.test(question);
        // check for no latex wrappings
        const hasRawLatex = rawLatexRegex.test(question)

        if (hasLatex || hasRawLatex) {

            if (hasRawLatex) {
                const wrappedLatex = `$$ ${question} $$`
                // console.log(wrappedLatex)
                return (
                    <div className="math-block overflow-x-auto">
                    <ReactMarkdown
                        children={wrappedLatex}
                        remarkPlugins={[remarkMath, remarkGfm]}
                        rehypePlugins={[rehypeKatex]}
                        className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-full break-words"
                    />
                    </div>
                )
            }
            else if (hasLatex) {
                return <LatexRenderer question={question}/>
            }
        }
        else {
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
                    <div key={exercise.exercise_id} className="mb-36 flex-1 overflow-y-auto pl-4 pb-4 bg-gray-900 rounded prose prose-sm sm:prose lg:prose-lg text-white w-full override-max-width">
                        {renderContent(exercise.question)}                         
                        {/* MathLiveInput for the exercise */}
                        <div className="mt-16">
                            {/* <h3 className="text-lg font-semibold mb-2">Your Solution:</h3> */}

                            <MathLiveInput
                                value={submittedSolutions[exercise.exercise_id] || ""}
                                onChange={(value) => setSubmittedSolutions({
                                    ...submittedSolutions,
                                    [exercise.exercise_id]: value,
                                })}
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
                                <div className="mb-4">
                                    {renderContent(submittedSolutions[exercise.exercise_id])}
                                </div>
                            </div>
                        )}
                                                {/* Display Wolfram API Results */}

                        {wolframResults[exercise.exercise_id] && (
                            <div className="mt-4">
                                <h4 className="text-md font-semibold">Tutor Feedback:</h4>
                                <LatexRenderer content={wolframResults[exercise.exercise_id]}/>
                            </div>
                        )}
                        <button
                            onClick={() => toggleHint(exercise.exercise_id)}
                            className="mt-1 px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded-full text-white"
                        >
                            Show Hint
                            {/* {showHint ? "Hide Hint" : "Show Hint"} */}
                        </button>
                        {showHint[exercise.exercise_id] && (
                            <div className=" pb-1 pt-0 px-2 bg-gray-600 rounded">
                                <h3 className="text-md font-semibold mb-1">Hint:</h3>
                                <div className="text-sm">{renderContent(exercise.hint)}</div>
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