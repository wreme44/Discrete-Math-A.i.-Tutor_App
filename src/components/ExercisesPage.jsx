import React, { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { supabase } from "../supabaseClient";
import LatexRenderer from "./LatexRenderer";
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


const MathLiveInput = ({value, onChange, onFocus}) => {

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

    return <math-field ref={mathfieldRef} onFocus={onFocus}/>;
}

const ExercisesPage = ({onLessonCompletion}) => {
    // State to hold exercises data fetched from the database
    const [exercisesData, setExercisesData] = useState([]);
    const [groupedExercises, setGroupedExercises] = useState({});
    // pre determined correct answers
    const [correctAnswers, setCorrectAnswers] = useState({});
    // State to keep track of current lesson index
    const [currentExerciseIndex, setcurrentExerciseIndex] = useState(() => {
        const savedIndex = sessionStorage.getItem("currentExerciseIndex");
        return savedIndex ? parseInt(savedIndex, 10) : 0;
    });
    // Toggle hint
    const [showHint, setShowHint] = useState({});
    const [showGPTFeedback, setShowGPTFeedback] = useState({});
    // loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isTyping, setIsTyping] = useState(false);

    const [submittedSolutions, setSubmittedSolutions] = useState({});
    const [inputAlert, setInputAlert] = useState({});
    const [gptResults, setGptResults] = useState({});

    const [userSolution, setUserSolution] = useState("");

    const [lessonsData, setLessonsData] = useState([]);

    useEffect(() => {
        const fetchExercises = async () => {
            const { data, error } = await supabase
                .from("exercises") // ensure table name matches exactly
                .select("*, answer") // added answer column, not sure if needed since * selects all ?
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
    // hint + feedback toggling
    const toggleHint = (exerciseId) => {
        setShowHint((prevState) => ({
            ...prevState, [exerciseId]: !prevState[exerciseId],
        }));
    };

    const toggleGPTFeedback = (exerciseId) => {
        setShowGPTFeedback((prevState) => ({
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

    // GPT api call as Math validator
    const handleSubmitSolution = async (exerciseId, userSolution, exerciseQuestion, correctAnswer) => {

        if (!userSolution || userSolution.trim() === "") {
            setInputAlert((prev) => ({...prev, [exerciseId]: true}));
            return;
        }

        setInputAlert((prev) => ({...prev, [exerciseId]: false})); // clear if valid input

        const cleanedSolution = cleanLatexInput(userSolution);

        // store users submitted solution
        setSubmittedSolutions((prev) => ({
            ...prev,
            [exerciseId]: userSolution,
        }));
        setIsTyping(true);

        try {
            // standard api call instead of streaming api
            const response = await fetch('http://localhost:5000/api/validate-solution', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: exerciseQuestion, userSolution: cleanedSolution, correctAnswer })
            });

            // check if the response is ok
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // get JSON result from backend
            const result = await response.json();
            // console.log("Received from backend:", result);

            // extract the 'correct' flag and 'feedback' from the result
            const { correct, feedback } = result;

            // update the state for correctness flag
            setCorrectAnswers((prev) => ({
                ...prev,
                [exerciseId]: correct,
            }));

            // update state for GPT feedback
            setGptResults((prev) => ({
                ...prev,
                [exerciseId]: feedback,
            }));

            setIsTyping(false);

        } catch (error) {
            // error handling for failed requests
            console.error('Error validating solution:', error);
            setGptResults((prev) => ({
                ...prev,
                [exerciseId]: 'An error occurred while validating the solution.'
            }));
            setIsTyping(false);
        }
    };

        // calculating if all answers are correct for the current set of exercises
    const allCorrect = currentExercises.every((exercise) => correctAnswers[exercise.exercise_id]);

    // notifying main page / lessons page if all exercises completed
    useEffect(() => {
        if (typeof onLessonCompletion === 'function'){ // only call if its defined
            onLessonCompletion(allCorrect)
        }
    }, [allCorrect, onLessonCompletion]) 

    // const handleSubmitSolution = async (exerciseId, userSolution, exerciseQuestion, correctAnswer) => {

    //     // ensure userSolution is not empty or undefined before making API call
    //     if (!userSolution || userSolution.trim() === "") {
    //         alert("Please enter a solution before submitting.");
    //         return;
    //     }
    
    //     const cleanedSolution = cleanLatexInput(userSolution);
    
    //     // store users submitted solution
    //     setSubmittedSolutions((prev) => ({
    //         ...prev,
    //         [exerciseId]: userSolution,
    //     }));
    //     setIsTyping(true);
    
    //     try {
    //         const response = await fetch('http://localhost:5000/api/validate-solution', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ question: exerciseQuestion, userSolution: cleanedSolution, correctAnswer })
    //         });
    
    //         // error handling
    //         if (!response.ok) {
    //             throw new Error('Network response was not ok');
    //         }
    
    //         // getting readable stream from 'response body'
    //         const reader = response.body.getReader();
    //         const decoder = new TextDecoder('utf-8'); // creating TextDecoder to convert bytes to text
    
    //         let solutionResponse = ''; // to accumulate the assistant's response
    //         let correctFlag = null;     // Track whether the solution is correct

    //         // continuously reading from stream until done
    //         while (true) {
    //             // reading next chunk of data
    //             const { done, value } = await reader.read();
    //             if (done) break; // exiting loop when no more data
    
    //             // decoding chunk of data from bytes to string
    //             const chunk = decoder.decode(value, { stream: true });
    //             const lines = chunk.split('\n').filter(line => line.trim() !== ''); // splitting chunk into lines, filtering out empty lines
    
    //             // going through each line of chunk
    //             for (const line of lines) {
    //                 // processing data if line starts with 'data: '
    //                 if (line.startsWith('data: ')) {
    //                     // removing 'data: ' from start of line
    //                     const data = line.replace('data: ', '');
    
    //                     // if data is '[DONE]', stop processing
    //                     if (data === '[DONE]') {
    //                         setGptResults((prev) => ({
    //                             ...prev,
    //                             [exerciseId]: solutionResponse
    //                         }));

    //                         if (correctFlag !== null){
    //                             setCorrectAnswers((prev) => ({
    //                                 ...prev, [exerciseId]: correctFlag,
    //                             }))
    //                         }

    //                         // processing if solution is correct
    //                         // extracting result as json
    //                         // const result = await response.json()
    //                         // const isCorrect = result.correct
    //                         setIsTyping(false);
    //                         return;
    //                     }
    
    //                     try {
    //                         // parsing data into JSON format
    //                         const parsed = JSON.parse(data);
    //                         const text = parsed.content || ''; // extracting content (text) from parsed data
                            
    //                         solutionResponse += text; // appending to solution response

    //                         if (parsed.correct !== undefined){
    //                             correctFlag = parsed.correct;
    //                         }
    
    //                         // updating state with the latest assistant response
    //                         setGptResults((prev) => ({
    //                             ...prev,
    //                             [exerciseId]: solutionResponse
    //                         }));
    //                     } catch (error) {
    //                         console.error('Error parsing streaming data:', error);
    //                     }
    //                 }
    //             }
    //         }
    //     } catch (error) {
    //         // error handling during fetch requests or streaming process
    //         console.error('Error validating solution:', error);
    //         setGptResults((prev) => ({
    //             ...prev,
    //             [exerciseId]: 'An error occurred while validating the solution.'
    //         }));
    //         setIsTyping(false); // stopping the gpts typing indication
    //     }
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
                    <div key={exercise.exercise_id} className="mb-36 pl-4 pb-4 bg-gray-900 rounded prose prose-sm sm:prose lg:prose-lg text-white w-full override-max-width">
                        {renderContent(exercise.question)}                         
                        {/* MathLiveInput for the exercise */}
                        <div className="relative mt-16">
                            <MathLiveInput
                                value={submittedSolutions[exercise.exercise_id] || ""}
                                onChange={(value) => setSubmittedSolutions({
                                    ...submittedSolutions,
                                    [exercise.exercise_id]: value,
                                })}
                                onFocus={() => setInputAlert(false)}
                            />
                            <button
                                onClick={() =>
                                    handleSubmitSolution(exercise.exercise_id, submittedSolutions[exercise.exercise_id], exercise.question, exercise.answer)
                                }
                                className="ml-3 px-1 py-0 bg-blue-700 hover:bg-blue-600 active:bg-blue-900 focus:outline-none 
                                 focus:ring-2 focus:ring-blue-500 text-white rounded-full transform transition duration-200 ease-in-out hover:scale-105 active:scale-95"
                                disabled={isTyping}
                            >
                                Submit Solution
                            </button>
                            {inputAlert[exercise.exercise_id] && (
                                <div className="absolute bottom-full left-8 mb-2 mt-1 bg-teal-600 text-white text-xs rounded py-1 px-2 w-60 z-10">
                                    Please enter a solution before submitting
                                    <div className="absolute left-28 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
                                </div>
                            )}
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
                        {/* Display GPT Results validation for in/correct*/}
                        {correctAnswers[exercise.exercise_id] !== undefined && (
                            <div className="mt-4">
                                <h4 className={`text-md font-semibold ${correctAnswers[exercise.exercise_id] ? 'correct-answer' : 'incorrect-answer'}`}>
                                    {correctAnswers[exercise.exercise_id] ? 'Your solution is correct! Well Done.' : 'Your solution is incorrect.'}
                                </h4>
                            </div>    
                        )}
                        {/* hint + feedback buttons */}
                        <div className="mt-5">
                            <button
                                onClick={() => toggleHint(exercise.exercise_id)}
                                className="mt-1 px-2 py-0 bg-gray-600 hover:bg-gray-500 focus:outline-none 
                                 focus:ring-2 focus:ring-gray-500 rounded-full text-white"
                            >
                                {showHint[exercise.exercise_id] ? 'Hide Hint' : 'Show Hint'}
                            </button>
                            {/* GPT feedback button if feedback response exists*/}
                            {gptResults[exercise.exercise_id] && (
                                <button
                                    onClick={() => toggleGPTFeedback(exercise.exercise_id)}
                                    className="mt-1 ml-5 px-2 py-1 bg-gradient-to-r from-yellow-900 to-yellow-700 hover:from-yellow-800 hover:to-yellow-600 
                                     focus:outline-none focus:ring-2 focus:ring-yellow-600 rounded-full text-white"
                                >
                                    {showGPTFeedback[exercise.exercise_id] ? 'Hide Tutor Feedback' : 'Show Tutor Feedback'}
                                </button>
                            )}
                        </div>
                        {/* display hint from database */}
                        {showHint[exercise.exercise_id] && (
                            <div className="mt-2 pb-1 pt-0 px-2 bg-gray-600 rounded">
                                <h3 className="text-md font-semibold mb-1">Hint:</h3>
                                <div className="text-sm">{renderContent(exercise.hint)}</div>
                            </div>
                        )}
                        {/* display GPT feedback when the button is clicked */}
                        {showGPTFeedback[exercise.exercise_id] && (
                            <div className="mt-2">
                                <h4 className="text-md font-semibold">Tutor Feedback:</h4>
                                <LatexRenderer content={gptResults[exercise.exercise_id]} />
                            </div>
                        )}
                        {isTyping && (
                            <div className='mb-2 text-left'>
                                <img className='typing-gif' alt='... ...' src='/loading2.1.gif' />
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
                {/* allCOrrect check, prevent user from next page */}
                <div className="relative group">
                    <button
                        onClick={handleNext}
                        disabled={!allCorrect || currentLessonIndex === lessonsData.length - 1}
                        className={`mr-4 px-4 py-0 rounded-full ${currentLessonIndex === lessonsData.length - 1
                            ? "bg-blue-900 cursor-not-allowed"
                            : "bg-blue-700 hover:bg-blue-800"
                            } text-white`}
                    >
                        Next
                    </button>
                    {!allCorrect && (
                        <div className="absolute bottom-full left-1/3 transform -translate-x-1/2 mb-2 bg-teal-600 text-white text-xs rounded-lg py-2 pl-2 pr-0 w-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                            Complete all questions first
                            <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
                        </div>
                    )}
                </div>
                
            </div>
        </div>
    );
};

export default ExercisesPage;
