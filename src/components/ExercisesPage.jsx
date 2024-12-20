import React, { useEffect, useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import debounce from 'lodash/debounce'
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
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { useNavigate, Link } from "react-router-dom";
import Games from './Games';

const MathLiveInput = ({ value, onChange, onFocus }) => {

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

    return <math-field ref={mathfieldRef} onFocus={onFocus} />;
}

const ExercisesPage = ({
    onExerciseCompletion, userId, exercisesData,
    groupedExercises, lessonsData, toggleViewWithScroll, username }) => {

    const navigate = useNavigate();

    // const [user, setUser] = useState(null);
    // const [userId, setUserId] = useState(null);
    // State to hold exercises data fetched from the database
    // const [exercisesData, setExercisesData] = useState([]);
    // const [groupedExercises, setGroupedExercises] = useState({});
    const [name, setName] = useState('');
    const [showGames, setShowGames] = useState(false);
    const [shouldScroll, setShouldScroll] = useState(false);
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
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);
    const [isTyping, setIsTyping] = useState(false);

    const [submittedSolutions, setSubmittedSolutions] = useState({});
    const [uploadedImage, setUploadedImage] = useState({});
    const [imagesDisplay, setImagesDisplay] = useState({});
    const [excaliDisplay, setExcaliDisplay] = useState({});
    const [inputAlert, setInputAlert] = useState({});
    const [gptResults, setGptResults] = useState({});

    const [userSolution, setUserSolution] = useState("");

    const [excalidrawData, setExcalidrawData] = useState(() => {
        const savedExcalidrawData = sessionStorage.getItem('excalidrawData');
        return savedExcalidrawData ? JSON.parse(savedExcalidrawData) : {};
    });

    const [isDrawing, setIsDrawing] = useState({});

    // const [lessonsData, setLessonsData] = useState([]);
    // const [lessonMarkedDone, setLessonMarkedDone] = useState({});
    const [lessonMarkedDone, setLessonMarkedDone] = useState(() => {
        const savedCompletedLessons = sessionStorage.getItem('completedLessons');
        return savedCompletedLessons ? JSON.parse(savedCompletedLessons) : {};
    });
    // ref to scroll to top at next/prev page
    const scrollableContainerRef = useRef(null);
    const [saveDrawingClicked, setSaveDrawingClicked] = useState(false);

    // determine current lesson and exercises

    // get all unique lesson Ids
    const lessonIds = Object.keys(groupedExercises);
    // get exercises for current lesson id based on currentExerciseIndex
    const currentLessonId = lessonIds[currentExerciseIndex];
    const currentExercises = groupedExercises[currentLessonId] || [];
    const currentLessonIndex = lessonsData.findIndex(lesson => lesson.lesson_id === parseInt(currentLessonId));

    const toggleGames = () => {
        setShowGames(prev => !prev);
        toggleViewWithScroll();
        // setShouldScroll(true); // Set the state to trigger the scroll
    };

    // useEffect(() => {
    //     if (shouldScroll) {
    //         setTimeout(() => {
    //             window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    //             setShouldScroll(false); // Reset the state after scrolling
    //         }, 3000); // Adjust the delay as needed
    //     }
    // }, [shouldScroll]);

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

    // clear any user input (images)
    const clearImageInput = (exerciseId) => {
        setUploadedImage(prev => ({
            ...prev,
            [exerciseId]: null,
        }));
        setImagesDisplay(prev => ({
            ...prev,
            [exerciseId]: null,
        }));
    }

    const clearDrawingInput = (exerciseId) => {
        setExcaliDisplay(prev => ({
            ...prev,
            [exerciseId]: null,
        }));
    }

    // displaying excalidraw
    const displayExcalidraw = (exerciseId) => {
        setIsDrawing((prevState) => ({
            ...prevState, [exerciseId]: !isDrawing[exerciseId],
        }));
    }

    // const toggleSaveImage = (exerciseId, elements, state) => {
    //     setSaveDrawingClicked(true);
    //     setExcalidrawData((prevData) => {
    //         const currentData = prevData[exerciseId] || {};
    //         if (JSON.stringify(currentData.elements) !== JSON.stringify(elements)) {
    //             // Save updated drawing data
    //             const newData = { ...prevData, [exerciseId]: { elements, state } };
    //             sessionStorage.setItem('excalidrawData', JSON.stringify(newData));
    //             return newData;
    //         }
    //         return prevData;
    //     });
    //     setSaveDrawingClicked(false);
    // };

    // excalidraw
    // const handleExcalidrawChange = debounce((exerciseId, elements, state) => {
    //     if (!saveDrawingClicked){
    //         return
    //     } else {
    //         setExcalidrawData((prevData) => {
    //             const currentData = prevData[exerciseId] || {};
    //             if (JSON.stringify(currentData.elements) !== JSON.stringify(elements)) {
    //                 return {...prevData, [exerciseId]: {elements, state}};
    //             }
    //             return prevData;
    //         })
    //         setSaveDrawingClicked(false);
    //     }

    // }, 500)

    const handleExcalidrawChange = debounce((exerciseId, elements, state) => {
        setExcalidrawData((prevData) => {
            const currentData = prevData[exerciseId] || {};
            if (JSON.stringify(currentData.elements) !== JSON.stringify(elements)) {
                return { ...prevData, [exerciseId]: { elements, state } };
            }
            return prevData;
        });
    }, 500);

    const exportExcalidrawToBase64 = async (exerciseId) => {
        if (!excalidrawData[exerciseId]) return null;
        const excalidrawRef = document.querySelector(".excalidraw-container canvas");
        if (!excalidrawRef) return null;
        return excalidrawRef.toDataURL("image/png");
    }

    const handleExcalidrawSubmit = async (exerciseId) => {
        try {
            const base64image = await exportExcalidrawToBase64(exerciseId);
            if (base64image) {
                setExcaliDisplay((prevImages) => ({
                    ...prevImages, [exerciseId]: base64image,
                }))

            } else {
                alert("error: could not generate image from drawing.")
            }
        } catch (error) {
            console.error("error exporting excalidraw:", error)
            alert("error occured preparing solution, please try again.")
        }
    }

    // image handler for user uploads
    const handleImageUpload = (event, exerciseId) => {

        const file = event.target.files[0];
        if (file) {
            if (file.size > 2000000) { // 10mb limit for now
                alert("The image size must be less than 20 MB.")
                return;
            }
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
            if (!allowedTypes.includes(file.type)) {
                alert("Only JPEG, JPG, PNG, GIF, or WEBP image types allowed.")
                return;
            }
            setImagesDisplay(prevImages => ({
                ...prevImages, [exerciseId]: URL.createObjectURL(file),
            }));
            setUploadedImage(prevUploaded => ({
                ...prevUploaded, [exerciseId]: file,
            }));
        }
    }

    // converting image to base64
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        })
    }

    // GPT api call as Math validator
    const handleSubmitSolution = async (exerciseId, userSolution, exerciseQuestion, correctAnswer) => {

        if ((!userSolution || userSolution.trim() === "") && !uploadedImage[exerciseId] && !excaliDisplay[exerciseId]) {
            setInputAlert((prev) => ({ ...prev, [exerciseId]: true }));
            return;
        }
        setInputAlert((prev) => ({ ...prev, [exerciseId]: false })); // clear if valid input

        let cleanedSolution = null;
        let base64Image = null;
        let excalidrawBase64 = null;

        let messages = [
            { type: "text", text: `Exercise Question: ${exerciseQuestion}` },
            { type: "text", text: `Correct Answer: ${correctAnswer}` }
        ];

        if (userSolution && userSolution.trim() !== "") {
            cleanedSolution = cleanLatexInput(userSolution);
            messages.push({
                type: "text",
                text: `User solution: ${cleanedSolution}`
            });
        }

        if (uploadedImage && uploadedImage[exerciseId]) {
            const file = uploadedImage[exerciseId];
            base64Image = await convertToBase64(file);
            messages.push({
                type: "image_url",
                // image_url: `data:image/png;base64,${base64Image}`
                image_url: `data:image/png;base64,${base64Image.split(',')[1]}` // remove data prefix as backend expects it
            });
        }

        if (excaliDisplay[exerciseId]) {
            messages.push({
                type: "image_url",
                image_url: `data:image/png;base64,${excaliDisplay[exerciseId].split(',')[1]}`
            })
        }
        // else if (excalidrawData[exerciseId]) {
        //     excalidrawBase64 = await exportExcalidrawToBase64(exerciseId);
        //     if (excalidrawBase64) {
        //         messages.push({
        //             type: "image_url",
        //             image_url: `data:image/png;base64,${excalidrawBase64.split(',')[1]}`
        //         })
        //     }
        // }
        const userName = name
        const payload = { messages, userName }

        // console.log("Sending payload:", payload);
        // store users submitted solution
        setSubmittedSolutions((prev) => ({
            ...prev,
            [exerciseId]: userSolution,
        }));
        // while processing / validating
        // setIsTyping((prev) => ({...prev, [exerciseId]: true}));
        setIsTyping(true)

        const baseURL = process.env.NODE_ENV === 'production'
            ? 'https://discrete-mentor-16b9a1c9e019.herokuapp.com'
            : 'http://localhost:5000';

        try {
            // standard api call instead of streaming api

            const response = await fetch(`${baseURL}/api/validate-solution`, {
                // const response = await fetch('https://discrete-mentor-16b9a1c9e019.herokuapp.com/api/validate-solution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify(payload),
            });
            // check if the response is ok
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error: ${errorData.error || 'Network response was not ok'}`);
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

            // setIsTyping((prev) => ({...prev, [exerciseId]: false}));
            setIsTyping(false)

        } catch (error) {
            if (error.message) {
                console.error('Error validating solution:', error.message);
                setGptResults((prev) => ({
                    ...prev,
                    [exerciseId]: `Error: ${error.message}`
                }));
            } else {
                console.error('Unknown error validating solution:', error);
                setGptResults((prev) => ({
                    ...prev,
                    [exerciseId]: 'An unknown error occurred while validating the solution.'
                }));
            }
            // setIsTyping((prev) => ({...prev, [exerciseId]: false}));
            setIsTyping(false)
        } finally {
            // Resetting image state after submission
            setUploadedImage(prev => ({
                ...prev,
                [exerciseId]: null,
            }));
            setImagesDisplay(prev => ({
                ...prev,
                [exerciseId]: null,
            }));
            setExcaliDisplay(prev => ({
                ...prev,
                [exerciseId]: null,
            }));
        }
    };

    useEffect(() => {
        // Loop through correctAnswers and trigger progress update for the correct ones
        Object.keys(correctAnswers).forEach(async (exerciseId) => {
            if (correctAnswers[exerciseId]) {
                await updateExerciseProgress(exerciseId); // Only update for correct answers
            }
        });
    }, [correctAnswers]); // Runs whenever correctAnswers state changes

    const updateExerciseProgress = async (exerciseId, currentLessonId) => {

        try {
            // updating userprogress
            if (userId) {
                const { data: progressData, error: progressError } = await supabase
                    .from("user_exercise_progress")
                    .select('*')
                    .eq('user_id', userId)
                    .eq('exercise_id', exerciseId)
                    .single(); // checking if progress for this exercise exists

                if (!progressData) {
                    // insert new progress for this exercise
                    const { error: insertError } = await supabase
                        .from("user_exercise_progress")
                        .insert({
                            user_id: userId,
                            lesson_id: currentLessonId,
                            exercise_id: exerciseId,
                            completed: true,
                            completed_at: new Date(),
                        });
                    if (insertError) {
                        console.error("Error inserting progress:", insertError.message)
                        return;
                    }
                } else {
                    // updating existing progress for this exercise
                    const { error: updateError } = await supabase
                        .from("user_exercise_progress")
                        .update({
                            completed: true,
                            completed_at: new Date(),
                        })
                        .eq('user_id', userId)
                        .eq('exercise_id', exerciseId);

                    if (updateError) {
                        console.error("Error updating progress:", updateError);
                        return;
                    }
                }
                // console.log("Progress updated for exercise:", exerciseId);
            } else {
                // non logged in users
                const completedExercises = JSON.parse(sessionStorage.getItem('completedExercises')) || {};
                completedExercises[exerciseId] = true;
                sessionStorage.setItem('completedExercises', JSON.stringify(completedExercises));
            }
        } catch (error) {
            console.error("Error updating exercise progress:", error)
        }
    }

    const renderExerciseQuestion = (content) => {
        // Regex to detect LaTeX code between $...$ or $$...$$
        const latexRegex = /\$\$(.*?)\$\$|\$(.*?)\$/g;

        // Check if content contains LaTeX
        const hasLatex = latexRegex.test(content);

        if (hasLatex) {
            // If LaTeX is detected, use LatexRenderer for LaTeX content
            return <LatexRenderer content={content} />;
        } else {
            // Render non-LaTeX content as plain HTML
            return (
                <div
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(marked(content)),
                    }}
                />
            );
        }
    };

    const renderContent = (question) => {

        // console.log(question)
        // regex to detect latex code between $...$ or $$...$$
        const latexRegex = /\$\$(.*?)\$\$|\$(.*?)\$/g;
        // regex to check if latex already wrapped  with $$..$$ or \(..\)
        // const alreadyWrappedLatex = /(\$\$(.*?)\$\$)|\\\((.*?)\\\)/g
        // detect raw latex without wrappings
        const rawLatexRegex = /\\(frac|sum|int|left|right|cdots|dots|binom|sqrt|text|over|begin|end|matrix|neg|land|lor|to|times|infty|leq|geq|neq|approx|forall|exists|subseteq|supseteq|cup|cap|nabla|partial|alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Phi|Psi|Omega|not|[A-Za-z]+)\b/g;
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
                return <LatexRenderer question={question} />
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

    const renderGptContent = (content) => {
        // console.log(question)
        // regex to detect latex code between $...$ or $$...$$
        const latexRegex = /\$\$(.*?)\$\$|\$(.*?)\$/g;
        // detect raw latex without wrappings
        const rawLatexRegex = /\\(frac|sum|int|left|right|cdots|dots|binom|sqrt|text|over|begin|end|matrix|neg|land|lor|to|times|infty|leq|geq|neq|approx|forall|exists|subseteq|supseteq|cup|cap|nabla|partial|alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Phi|Psi|Omega|not|mathbb|[A-Za-z]+)\b/g;
        // regex to find other LaTeX wrappings such as \(...\) or \[...\]
        const unwantedLatexWrappings = /\\\(|\\\)|\\\[|\\\]/g;

        // Function to wrap raw LaTeX commands in $$ if not already wrapped
        const wrapLatex = (text) => {
            // removing unwanted latex wrappers
            let cleanedText = text.replace(unwantedLatexWrappings, "");
            return cleanedText.replace(rawLatexRegex, (match) => `$$ ${match} $$`);
        };
        // Check if question contains LaTeX
        const hasLatex = latexRegex.test(content);
        // check for no latex wrappings
        const hasRawLatex = rawLatexRegex.test(content)

        if (hasLatex || hasRawLatex) {

            if (hasRawLatex) {
                // if raw latex exists, wrap only those parts, not the entire content
                const wrappedLatex = hasRawLatex ? wrapLatex(content) : content;
                // console.log("Wrapped: ", wrappedLatex)
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
                return <LatexRenderer content={content} />
            }
        }
        else {
            // Render non-LaTeX question as plain HTML
            return (
                <div
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(marked(content)),
                    }}
                />
            );
        }
    };

    // const {setAllExercisesCompleted} = useLessonProgress(); // Import the context function
    // const allCorrect = currentExercises.every((exercise) => correctAnswers[exercise.exercise_id]);
    const allCorrect = currentExercises.length > 0 && currentExercises.every((exercise) => correctAnswers[exercise.exercise_id]);

    // When moving to a new page, reset allCorrect and correctAnswers
    useEffect(() => {
        // Reset correctAnswers and the completion state when a new set of exercises is loaded
        setCorrectAnswers({});
        onExerciseCompletion(false);  // Reset the context to lock the buttons again
        setSubmittedSolutions({}); // Optionally, reset submitted solutions for the new page
    }, [currentExerciseIndex, onExerciseCompletion]); // Runs when moving to a new exercise page    

    // calculating if all answers are correct for the current set of exercises

    // notifying main page / lessons page if all exercises completed
    useEffect(() => {
        if (onExerciseCompletion) {
            onExerciseCompletion(allCorrect)
        }
    }, [allCorrect, onExerciseCompletion])

    // checking completion status 
    useEffect(() => {
        // console.log("all correct:", allCorrect)
        // update lessons next page button when all exercises are completed
        if (allCorrect) {
            onExerciseCompletion(true);
        } else {
            onExerciseCompletion(false);
        }

        const checkExerciseCompletion = async () => {
            if (!currentLessonId) return;

            if (userId) {
                // logged in users - checking completion in supabase
                const { data, error } = await supabase
                    .from("user_exercise_progress")
                    .select("exercise_id, completed")
                    .eq("user_id", userId)
                    .in("exercise_id", currentExercises.map(ex => ex.exercise_id)); // Filter by the current exercise IDs
                // .eq("lesson_id", currentLessonId)
                // .single();
                if (error) {
                    if (error.code === 'PGRST116') { // no data found
                        // not completed - do nothing
                        // maybe reset correctAnswers if needed
                    } else {
                        console.error("Error checking lesson completion:", error.message);
                    }
                } else {
                    const completedExercises = data.reduce((acc, progress) => {
                        if (progress.completed) {
                            acc[progress.exercise_id] = true;
                        }
                        return acc;
                    }, {});
                    setCorrectAnswers(completedExercises)
                }
            } else {
                // non logged in users - checking completion in sessionStorage
                const completedExercises = JSON.parse(sessionStorage.getItem('completedExercises')) || {};
                const completedForThisLesson = currentExercises.reduce((acc, exercise) => {
                    if (completedExercises[exercise.exercise_id]) {
                        acc[exercise.exercise_id] = true;
                    }
                    return acc;
                }, {});
                setCorrectAnswers(completedForThisLesson);
            }
        };
        checkExerciseCompletion();
    }, [currentLessonId, userId, currentExercises]); //, allCorrect, onExerciseCompletion

    // update completion status when all correct
    useEffect(() => {
        // console.log('useEffect triggered');
        // console.log('allCorrect:', allCorrect);
        // console.log('currentLessonId:', currentLessonId);
        // console.log('userId:', userId);
        if (allCorrect && currentLessonId) {
            if (userId) {
                // logged in users - updating supabase
                const markLessonCompleted = async () => {
                    try {
                        // First, check if the lesson has already been marked as completed
                        const { data: existingProgress, error: selectError } = await supabase
                            .from("userprogress")
                            .select('*')
                            .eq('user_id', userId)
                            .eq('lesson_id', currentLessonId)
                            .eq('completed', true) // Ensure we're checking if it's marked as complete
                            .single(); // Get a single row

                        if (selectError && selectError.code !== 'PGRST116') {
                            console.error("Error checking existing progress:", selectError.message);
                            return;
                        }
                        const existingCompletedLessons = JSON.parse(sessionStorage.getItem('completedLessons')) || {};
                        if (existingProgress) {
                            // convert to map for lookup
                            const completedMap = {
                                ...existingCompletedLessons,
                                [existingProgress.lesson_id]: existingProgress.completed
                            };
                            setLessonMarkedDone(completedMap);
                            sessionStorage.setItem('completedLessons', JSON.stringify(completedMap));
                        }
                        else {
                            // if no existing progress or not marked as completed, insert or update
                            const { error: upsertError } = await supabase
                                .from("userprogress")
                                .upsert({
                                    user_id: userId,
                                    lesson_id: currentLessonId,
                                    completed: true,
                                    completed_at: new Date(),
                                });

                            if (upsertError) {
                                console.error("Error marking lesson completed:", upsertError.message);
                            } else {
                                // console.log(`Lesson ${currentLessonId} marked as completed for user ${userId}`);
                                const completedMap = {
                                    ...existingCompletedLessons,
                                    [currentLessonId]: true
                                };
                                setLessonMarkedDone(completedMap);
                                sessionStorage.setItem('completedLessons', JSON.stringify(completedMap));
                            }
                        }
                    } catch (error) {
                        console.error("Error completing the lesson:", error);
                    }
                };
                markLessonCompleted();
            }
            else {
                // non logged in users - updating sessionStorage
                const completedLessons = JSON.parse(sessionStorage.getItem('completedLessons')) || {};
                completedLessons[currentLessonId] = true;
                sessionStorage.setItem('completedLessons', JSON.stringify(completedLessons));
                console.log(`Lesson ${currentLessonId} marked as completed in sessionStorage`);
            }
            // else {
            //     const completedLessons = JSON.parse(sessionStorage.getItem('completedLessons')) || {};
            //     const isLessonCompleted = !!completedLessons[currentLessonId];
            //     setCompletedLessons(prev => ({ ...prev, [currentLessonId]: isLessonCompleted }));

            //     if (!isLessonCompleted) {
            //         completedLessons[currentLessonId] = true;
            //         sessionStorage.setItem('completedLessons', JSON.stringify(completedLessons));
            //         console.log(`Lesson ${currentLessonId} marked as completed in sessionStorage`);
            //     } else {
            //         console.log(`Lesson ${currentLessonId} is already marked as completed in sessionStorage`);
            //     }
            // }
        }
    }, [allCorrect, currentLessonId, userId]);

    // scroll to top of next/prev page
    useEffect(() => {
        if (scrollableContainerRef.current) {
            scrollableContainerRef.current.scrollTop = 0;
        }
        // window.scrollTo(0, 0)
    }, [currentLessonIndex])

    // enlarge user uploaded images
    useEffect(() => {
        const modal = document.getElementById("imageModal");
        const modalImage = modal.querySelector("img");

        const images = Array.from(document.querySelectorAll(".IMGs-user-upload"));
        images.forEach((image) => {
            image.classList.add("zoomable-image");
            image.addEventListener("click", () => {
                modal.classList.add("active");
                modalImage.src = image.src;
            })
        })

        const closeModal = () => modal.classList.remove("active");
        modal.addEventListener("click", closeModal);
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeModal();
        })

        return () => {
            images.forEach((image) => image.removeEventListener("click", () => { }));
            modal.removeEventListener("click", closeModal);
            document.removeEventListener("keydown", (e) => {
                if (e.key === "Escape") closeModal();
            })
        }
    }, [imagesDisplay, excaliDisplay])

    // saving excalidraw
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (excalidrawData) {
                sessionStorage.setItem('excalidrawData', JSON.stringify(excalidrawData))
            }
        }, 500);
        return () => clearTimeout(timeout);

    }, [excalidrawData])

    useEffect(() => {
        const savedName = sessionStorage.getItem('name')
        if (savedName) {
            const fullName = JSON.parse(savedName);
            const firstName = fullName.split(' ')[0];
            setName(firstName)
        }
    }, [username])


    // handling navigation buttons
    const handlePrevious = () => {
        const newIndex = currentExerciseIndex - 1;
        setcurrentExerciseIndex(newIndex);
        sessionStorage.setItem("currentExerciseIndex", newIndex);
        setUserSolution("");
    };

    const handleNext = () => {
        // const lessonId = lessonsData[currentLessonIndex].lesson_id;
        const newIndex = currentExerciseIndex + 1;
        setcurrentExerciseIndex(newIndex);
        sessionStorage.setItem("currentExerciseIndex", newIndex);
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

    const handleGamesNavigation = () => {
        navigate('/games');
    };
    // render component
    // if (loading) return <p>Loading exercises...</p>;
    // if (error) return <p>{error}</p>;
    // const currentExercise = exercisesData[currentExerciseIndex];

    const currentLesson = lessonsData[currentLessonIndex];
    const isLessonCompleted = lessonMarkedDone[currentLesson?.lesson_id];
    // const isLessonCompleted = lessonComplete[currentLessonId];

    return (
        <>
            {!showGames ? (
                <div className="flex flex-col h-full -mt-2">
                    {currentLessonId && (
                        <h2 className="xsm:text-[18px] sm:text-[20px] md:text-[16px] lg:text-[18px] xl:text-[18px] font-bold mb-1 ">
                            Exercise {currentExerciseIndex + 1}: {lessonsData[currentLessonIndex]?.title.replace(/^Lesson \d+:\s*/, '')}
                        </h2>
                    )}
                    <div ref={scrollableContainerRef} className="flex-1 overflow-y-auto pl-1 pb-1 bg-gray-900 rounded prose prose-sm sm:prose lg:prose-lg text-white w-full override-max-width">
                        {currentExercises.map((exercise) => (
                            <div key={exercise.exercise_id} className="mb-20 pl-4 pb-4 bg-gray-900 rounded  text-white w-full override-max-width">
                                {renderExerciseQuestion(exercise.question)}
                                {/* MathLiveInput for the exercise */}
                                <div className="relative mt-2 flex items-center "> {/* space-x-1 */}
                                    <div className="math-input-field w-[86%] overflow-hidden -mr-10
                                        xxxsm:text-[12px] xxsm:text-[14px] xsm:text-[16px] sm:text-[18px] md:text-[20px] lg:text-[24px] xl:text-[24px]"
                                    >
                                        <MathLiveInput
                                            value={submittedSolutions[exercise.exercise_id] || ""}
                                            onChange={(value) => setSubmittedSolutions({
                                                ...submittedSolutions,
                                                [exercise.exercise_id]: value,
                                            })}
                                            onFocus={() => setInputAlert(false)}
                                        />
                                    </div>
                                    {/* image Upload */}
                                    <div className="relative inline-block group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) => handleImageUpload(event, exercise.exercise_id)}
                                            className="hidden"
                                            id={`fileInput-${exercise.exercise_id}`}
                                        />
                                        {/* upload button */}
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById(`fileInput-${exercise.exercise_id}`).click()}
                                            className="relative flex items-center ml-2 focus:outline-none
                                        outline-none border-none rounded-full transform transition
                                        duration-75 ease-in-out hover:scale-105 active:scale-95
                                        xxxsm:w-[12px] xxsm:w-[14px] xsm:w-[16px] sm:w-[20px] md:w-[20px] lg:w-[24px] xl:w-[24px]"
                                        >
                                            <img className='upload-user-image' alt='upload image' src='/image-upload.svg' />
                                        </button>
                                        <div className="absolute xxxsm:bottom-11 xxsm:bottom-11 xsm:bottom-11 sm:bottom-14 md:bottom-14 lg:bottom-16 xl:bottom-16 
                                        left-1/2 transform -translate-x-1/2 mb-2 bg-teal-600 text-white
                                        text-xs rounded-lg py-1 pl-1 pr-0 w-20 opacity-0 group-hover:opacity-100 
                                        transition-opacity duration-500 z-10">
                                            {/* "absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1" */}
                                            Upload Image
                                            <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
                                        </div>
                                    </div>
                                    {/* Excalidraw BUTTON */}
                                    <div className="relative inline-block group">
                                        <button
                                            type="button"
                                            onClick={() => displayExcalidraw(exercise.exercise_id)}
                                            className="relative flex items-center ml-2 focus:outline-none
                                                outline-none border-none rounded-full transform transition
                                                duration-75 ease-in-out hover:scale-105 active:scale-95
                                                xxxsm:w-[14px] xxsm:w-[16px] xsm:w-[24px] sm:w-[28px] md:w-[28px] lg:w-[32px] xl:w-[32px]"
                                        >
                                            <img className='drawing-icon' alt='drawing tool' src='/drawing-icon.svg' />
                                            {/* <img className='drawing-icon' alt='drawing tool' src='/drawing-icon2.svg' /> */}
                                        </button>
                                        <div className="absolute xxxsm:bottom-11 xxsm:bottom-11 xsm:bottom-11 sm:bottom-14 md:bottom-14 lg:bottom-16 xl:bottom-16 
                                        left-1/2 transform -translate-x-1/2 mb-2 bg-teal-600 text-white
                                        text-xs rounded-lg py-1 pl-1 pr-0 w-20 opacity-0 group-hover:opacity-100 
                                        transition-opacity duration-500 z-10">
                                            Drawing Tool
                                            <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
                                        </div>
                                    </div>
                                    {/* Submit Solution */}
                                    <div className="relative inline-block group">
                                        <button
                                            onClick={() =>
                                                handleSubmitSolution(exercise.exercise_id, submittedSolutions[exercise.exercise_id], exercise.question, exercise.answer)}
                                            className="relative flex items-center justify-center mr-[4px] px-0 py-0
                                        xxsm:ml-[0px] xsm:ml-[15px] sm:ml-[20px] md:ml-[20px] lg:ml-[35px] xl:ml-[40px]
                                        xxxsm:w-[40px] xxsm:w-[50px] xsm:w-[70px] sm:w-[90px] md:w-[90px] lg:w-[110px] xl:w-[110px]
                                        xxxsm:h-[12px] xxsm:h-[15px] xsm:h-[25px] sm:h-[35px] md:h-[35px] lg:h-[40px] xl:h-[40px] bg-blue-900 outline-none
                                        focus:outline-none border-1 border-cyan-600 hover:border-cyan-600 
                                        rounded-full transform transition duration-75 ease-in-out hover:scale-105 active:scale-95"
                                            disabled={isTyping}
                                        >
                                            <div className="flex items-center">
                                                <img className="xxxsm:w-[9px] xxsm:w-[12px] xsm:w-[16px] sm:w-[24px] md:w-[24px] lg:w-[28px] xl:w-[28px] 
                                                        h-auto mr-1" alt="Submit" src="/submit3.svg" />
                                                <span className="text-slate-100 font-serif ml-0 mr-1 
                                        xxxsm:text-[8px] xxsm:text-[9px] xsm:text-[12px] sm:text-[16px] md:text-[16px] lg:text-[18px] xl:text-[18px]">Submit</span>
                                            </div>
                                        </button>
                                        {/* info message on hover */}
                                        <div className="absolute bottom-full left-[60%] transform -translate-x-1/2 mb-2 bg-teal-600
                                        text-white text-xs rounded-lg py-1 pl-1 pr-0 w-24 opacity-0 group-hover:opacity-100 
                                        transition-opacity duration-500 z-10">
                                            {/* "absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1" */}
                                            Submit Solution
                                            <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
                                            {/* info alert message when input empty */}
                                        </div>
                                        {inputAlert[exercise.exercise_id] && (
                                            <div className="absolute xxxsm:right-[70px] xxsm:right-[70px] xsm:right-[150px] sm:right-[220px] md:right-[200px] lg:right-[300px] xl:right-[360px] 
                                        xxxsm:bottom-[40px] xxsm:bottom-[44px] xsm:bottom-[48px] sm:bottom-[56px] md:bottom-[57px] lg:bottom-[62px] xl:bottom-[62px]
                                        w-full xxxsm:w-[163px] xxsm:w-[200px] xsm:w-[235px] sm:w-[235px] md:w-[235px] lg:w-[235px] xl:w-[235px]
                                        mt-1 bg-teal-600 text-white xxxsm:text-[8px] xxsm:text-[10px] xsm:text-[12px] sm:text-[12px] md:text-[12px] lg:text-[12px] xl:text-[12px] rounded py-1 px-2 z-10">
                                                Please enter a solution before submitting
                                                <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Display GPT Results validation for in/correct*/}
                                {correctAnswers[exercise.exercise_id] !== undefined && (
                                    <div className="flex items-center -mt-10 -mb-5">
                                        <h4 className={`flex items-center justify-center text-md font-semibold ${correctAnswers[exercise.exercise_id] ? 'correct-answer' : 'incorrect-answer'}`}>
                                            {correctAnswers[exercise.exercise_id]
                                                ? <>
                                                    Your solution is correct! Well Done
                                                    <img className="ml-1 w-6" src="correct.svg" />
                                                    {/* <img className="ml-1 w-10" src="correct2.svg"/>
                                        <img className="ml-1 w-10" src="correct2copy.svg"/> */}
                                                </>
                                                : <>
                                                    Your solution is incorrect.
                                                    <img className="ml-1 w-6" src="incorrect.svg" />
                                                    {/* <img className="ml-1 w-10" src="incorrect2.svg"/> */}
                                                </>}
                                        </h4>
                                    </div>
                                )}
                                {/* Show user's TEXT solution */}
                                {submittedSolutions[exercise.exercise_id] && (
                                    <div className="mt-4">
                                        <h4 className="text-md font-semibold">Your Input Solution:</h4>
                                        <div className="mb-4">
                                            {renderContent(submittedSolutions[exercise.exercise_id])}
                                        </div>
                                    </div>
                                )}
                                {/* Show user's IMAGE solution */}
                                {imagesDisplay[exercise.exercise_id] && (
                                    <>
                                        <div className="mt-1 -mb-0">
                                            <span className="text-md font-semibold">Your Image Solution:</span>
                                            {/* CLEAR user INPUT */}
                                            <div className="relative inline-block group align-middle">
                                                <button
                                                    type="button"
                                                    onClick={() => clearImageInput(exercise.exercise_id)}
                                                    className="relative flex items-center align-middle ml-5 focus:outline-none
                                        outline-none border-none rounded-full transform transition
                                        duration-75 ease-in-out hover:scale-105 active:scale-95
                                        border-1 bg-[rgba(172,172,184,0)] hover:from-cyan-500 hover:to-cyan-700
                                        xxxsm:h-[12px] xxsm:h-[14px] xsm:h-[16px] sm:h-[18px] md:h-[20px] lg:h-[20px] xl:h-[20px]
                                        xxxsm:w-[12px] xxsm:w-[14px] xsm:w-[16px] sm:w-[18px] md:w-[20px] lg:w-[20px] xl:w-[20px]"
                                                >
                                                    <img className='clear-img xxxsm:w-[12px] xxsm:w-[14px] xsm:w-[16px] sm:w-[18px] md:w-[20px] lg:w-[22px] xl:w-[22px]'
                                                        alt='clear img' src='/clear-img.svg' />
                                                </button>
                                                <div className="absolute bottom-[99%] 
                                        left-[75%] transform -translate-x-1/2 mb-2 bg-teal-600 text-white
                                        text-xs rounded-lg py-1 pl-1 pr-0 w-28 opacity-0 group-hover:opacity-100 
                                        transition-opacity duration-500 z-10">
                                                    Clear Image Upload
                                                    <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <img
                                            src={imagesDisplay[exercise.exercise_id]}
                                            alt="Uploaded solution preview"
                                            className="IMGs-user-upload w-[39%] max-h-[300px] h-auto border-[3px] border-gray-600 rounded mt-2"
                                        />
                                    </>
                                )}
                                {/* Show user's DRAWING solution */}
                                {excaliDisplay[exercise.exercise_id] && (
                                    <>
                                        <div className="mt-1 -mb-0">
                                            <span className="text-md font-semibold">Your Drawing Solution:</span>
                                            {/* CLEAR user INPUT */}
                                            <div className="relative inline-block group align-middle">
                                                <button
                                                    type="button"
                                                    onClick={() => clearDrawingInput(exercise.exercise_id)}
                                                    className="relative flex items-center align-middle ml-5 focus:outline-none
                                        outline-none border-none rounded-full transform transition
                                        duration-75 ease-in-out hover:scale-105 active:scale-95
                                        border-1 bg-[rgba(172,172,184,0)] hover:from-cyan-500 hover:to-cyan-700
                                        xxxsm:h-[12px] xxsm:h-[14px] xsm:h-[16px] sm:h-[18px] md:h-[20px] lg:h-[20px] xl:h-[20px]
                                        xxxsm:w-[12px] xxsm:w-[14px] xsm:w-[16px] sm:w-[18px] md:w-[20px] lg:w-[20px] xl:w-[20px]"
                                                >
                                                    <img className='clear-img xxxsm:w-[12px] xxsm:w-[14px] xsm:w-[16px] sm:w-[18px] md:w-[20px] lg:w-[22px] xl:w-[22px]'
                                                        alt='clear img' src='/clear-img.svg' />
                                                </button>
                                                <div className="absolute bottom-[99%] 
                                        left-[75%] transform -translate-x-1/2 mb-2 bg-teal-600 text-white
                                        text-xs rounded-lg py-1 pl-1 pr-0 w-20 opacity-0 group-hover:opacity-100 
                                        transition-opacity duration-500 z-10">
                                                    Clear Drawing
                                                    <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <img
                                            src={excaliDisplay[exercise.exercise_id]}
                                            alt="Drawing solution preview"
                                            className="IMGs-user-upload w-[39%] max-h-[300px] h-auto border-[3px] border-[rgba(79,141,255,0.98)] rounded mt-2"
                                        /> {/* xxxsm:w-[150px] xxsm:w-[200px] xsm:w-[240px] sm:w-[270px] md:w-[300px] lg:w-[330px] xl:w-[330px] */}
                                    </>
                                )}
                                {/* Excalidraw TOOL */}
                                {isDrawing[exercise.exercise_id] && (
                                    <>
                                        {/* <span className="excalidraw-title xxxsm:text-[10px] xxsm:text-[13px] xsm:text-[16px] sm:text-[18px] md:text-[20px] lg:text-[20px] xl:text-[24px]">
                                    Solution Canvas
                                </span> */}
                                        <div className="mb-2 flex justify-between">
                                            <div className="relative inline-block group align-middle">
                                                <button
                                                    type="button"
                                                    onClick={() => handleExcalidrawSubmit(exercise.exercise_id)}
                                                    className="relative flex items-center align-middle ml-0 border-1  px-1
                                                        bg-gradient-to-r from-cyan-700 to-cyan-500 hover:from-cyan-500 hover:to-cyan-700
                                                        focus:outline-none outline-none border-none rounded-full transform transition duration-75 ease-in-out hover:scale-105 active:scale-95
                                                        xxsm:ml-[1px] xsm:ml-[3px] sm:ml-[4px] md:ml-[5px] lg:ml-[5px] xl:ml-[5px]
                                                        xxxsm:h-[13px] xxsm:h-[17px] xsm:h-[20px] sm:h-[22px] md:h-[25px] lg:h-[30px] xl:h-[30px]"
                                                >
                                                    <div className="flex items-center">
                                                        <span className="text-slate-900 font-semibold
                                                        xxsm:mr-[2px] xsm:mr-[4px] sm:mr-[6px] md:mr-[7px] lg:mr-[8px] xl:mr-[8px]
                                                        xxxsm:text-[8px] xxsm:text-[10px] xsm:text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[14px]">
                                                            Review
                                                        </span>
                                                        <img className='pre-drawing xxxsm:hidden xxsm:block xxsm:w-[14px] xsm:w-[16px] sm:w-[20px] md:w-[24px] lg:w-[28px] xl:w-[28px]'
                                                            alt='drawing tool' src='/prep-drawing.svg' />
                                                    </div>
                                                </button>
                                                <div className="absolute bottom-[99.9%]
                                                        left-[80%] transform -translate-x-1/2 mb-2 bg-teal-600 text-white
                                                        text-xs rounded-lg py-1 pl-1 pr-0 w-40 opacity-0 group-hover:opacity-100 
                                                        transition-opacity duration-500 z-10">
                                                    Load and Display Drawing for Review and Submission
                                                    <div className="absolute left-[36%] transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
                                                </div>
                                            </div>
                                            <span className="excalidraw-title xxxsm:text-[10px] xxsm:text-[13px] xsm:text-[16px] sm:text-[18px] md:text-[20px] lg:text-[20px] xl:text-[24px]">
                                                Solution Canvas
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => displayExcalidraw(exercise.exercise_id)}
                                                className=" align-middle ml-2 focus:outline-none
                                                outline-none border-none rounded-full transform transition
                                                duration-75 ease-in-out hover:scale-105 active:scale-95
                                                xxxsm:w-[14px] xxsm:w-[16px] xsm:w-[24px] sm:w-[28px] md:w-[28px] lg:w-[32px] xl:w-[32px]"
                                            >
                                                <XMarkIcon className="xxxsm:w-[10px] xxsm:w-[10px] xsm:w-[12px] sm:w-[14px] md:w-[14px] lg:w-[16px] xl:w-[16px] mr-1" />
                                            </button>
                                        </div>
                                        <div className="excalidraw-container canvas mt-0
                                w-full xxxsm:h-[400px] xxsm:h-[475px] xsm:h-[500px] sm:h-[550px] md:h-[600px] lg:h-[650px] xl:h-[700px]">
                                            <Excalidraw
                                                initialData={excalidrawData[exercise.exercise_id] || { elements: [], state: {} }}
                                                onChange={(elements, state) => handleExcalidrawChange(exercise.exercise_id, elements, state)}
                                            />
                                        </div>
                                    </>
                                )}
                                {/* hint + feedback buttons */}
                                <div className="flex items-center mt-5"> {/* -mb-14 */}
                                    <button
                                        onClick={() => toggleHint(exercise.exercise_id)}
                                        className="flex items-center justify-center mt-2 px-0 py-0 outline-none 
                                    focus:outline-none border-none rounded-full transform transition duration-75 ease-in-out hover:scale-110 active:scale-90
                                    xxxsm:ml-[-16px] xxsm:ml-[-16px] xsm:ml-[-18px] sm:ml-[-20px] md:ml-[-28px] lg:ml-[-28px] xl:ml-[-28px]
                                    xxxsm:mt-[2px] xxsm:mt-[2px] xsm:mt-[2px] sm:mt-[2px] md:mt-[2px] lg:mt-[2px] xl:mt-[8px]
                                    xxxsm:w-[50px] xxsm:w-[55px] xsm:w-[60px] sm:w-[75px] md:w-[80px] lg:w-[96px] xl:w-[96px]
                                    xxxsm:h-[10px] xxsm:h-[12px] xsm:h-[15px] sm:h-[25px] md:h-[30px] lg:h-[40px] xl:h-[40px]"
                                    // className="flex items-center justify-center w-20 h-10 ml-0 px-0 py-0 bg-gray-900 outline-none 
                                    //     focus:outline-none border-2 border-gray-500 hover:border-gray-500 rounded-full transform  
                                    //     transition duration-75 ease-in-out hover:scale-105 active:scale-95"
                                    >
                                        {showHint[exercise.exercise_id]
                                            ? <img className='' alt='hide hint' src='/hide-hint.svg' />
                                            : <img className='' alt='show hint' src='/show-hint.svg' />

                                        }
                                        {/* ? <div className="flex items-center justify-center">
                                        <img className=' w-12 -ml-4' alt='... ...' src='/hide-hint.svg' />
                                        <span className="text-slate-100 font-serif -ml-3 mr-1 text">Hint</span>
                                    </div>
                                    : <div className="flex items-center justify-center">
                                        <img className='' w-12 -ml-4' alt='... ...' src='/show-hint.svg' />
                                        <span className="text-slate-100 font-serif -ml-3 mr-1 text">Hint</span>
                                    </div> */}
                                    </button>
                                    {/* GPT feedback button if feedback response exists*/}
                                    {gptResults[exercise.exercise_id] && (
                                        <button
                                            onClick={() => toggleGPTFeedback(exercise.exercise_id)}
                                            className="flex items-center mt-1 ml-3 px-1 bg-gradient-to-r from-yellow-900 to-yellow-700 hover:from-yellow-800  
                                     hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600 rounded-full text-white
                                     xxxsm:w-[90px]  xxsm:w-[90px] xsm:w-[100px] sm:w-[140px] md:w-[140px] lg:w-[158px] xl:w-[158px]
                                     xxxsm:h-[20px] xxsm:h-[20px] xsm:h-[22px] sm:h-[27px] md:h-[27px] lg:h-[30px] xl:h-[30px]"
                                        >
                                            {showGPTFeedback[exercise.exercise_id]
                                                ? (<><XMarkIcon className="xxxsm:w-[10px] xxsm:w-[10px] xsm:w-[12px] sm:w-[14px] md:w-[14px] lg:w-[16px] xl:w-[16px] mr-1" />
                                                    <span className="xxxsm:text-[9px] xxsm:text-[9px] xsm:text-[10px] sm:text-[16px] md:text-[16px] lg:text-[18px] xl:text-[18px]">
                                                        Tutor Feedback</span></>)
                                                : (<><ChevronDownIcon className="xxxsm:w-[10px] xxsm:w-[10px] xsm:w-[12px] sm:w-[14px] md:w-[14px] lg:w-[16px] xl:w-[16px] mr-1" />
                                                    <span className="xxxsm:text-[9px] xxsm:text-[9px] xsm:text-[10px] sm:text-[16px] md:text-[16px] lg:text-[18px] xl:text-[18px]">
                                                        Tutor Feedback</span></>)}
                                        </button>
                                    )}
                                </div>
                                {/* display hint from database */}
                                {showHint[exercise.exercise_id] && (
                                    <div className="mt-8 pb-1 pt-0 pl-2 pr-2 bg-gray-700 rounded w-max max-w-full">
                                        <h3 className="text-md font-semibold mb-1
                                        xxxsm:text-[12px] xxsm:text-[12px] xsm:text-[15px] sm:text-[18px] md:text-[20px] lg:text-[24px] xl:text-[24px]">
                                            Hint:</h3>
                                        <div className="text-sm xxxsm:text-[8px] xxsm:text-[10px] xsm:text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[16px]">
                                            {renderExerciseQuestion(exercise.hint)}</div>
                                    </div>
                                )}
                                {/* display GPT feedback when the button is clicked */}
                                {showGPTFeedback[exercise.exercise_id] && (
                                    <div className="mt-2">
                                        <h4 className="text-md font-semibold">Tutor Feedback:</h4>
                                        {renderGptContent(gptResults[exercise.exercise_id])}
                                        {/* <LatexRenderer content={gptResults[exercise.exercise_id]} /> */}
                                    </div>
                                )} {/* [exercise.exercise_id] */}
                                {isTyping && (
                                    <div className='flex items-center justify-center'>
                                        <img className='loading-gif' alt='loading' src='/loading-ripple.svg' />
                                    </div>
                                )}
                                <div className="mt-16 -mb-10 border-0 border-t border-gray-600 border-opacity-100 w-[80%] mx-auto"></div>
                                {/* <hr className="border-0 border-t border-gray-600 border-opacity-50 w-[70%] mx-auto" /> */}
                            </div>
                        ))}
                        {/* Games Button */}
                        <div className="flex flex-col items-center justify-center
                            xxxsm:mb-[10px] xxsm:mb-[12px] xsm:mb-[15px] sm:mb-[15px] md:mb-[20px] lg:mb-[20px] xl:mb-[20px]
                            xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]">
                            <img className="xxxsm:w-[30px] xxsm:w-[40px] xsm:w-[50px] sm:w-[60px] md:w-[60px] lg:w-[70px] xl:w-[70px] 
                            h-auto mr-1 focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)]"
                                alt="Games" src="/games-icon.svg"
                            />
                            <button className="game-link px-2 bg-gradient-to-r from-[rgb(60,217,128)] to-[rgb(44,224,221)] hover:from-[rgba(60,217,128,0.92)]  
                            hover:to-[rgba(44,224,221,0.9)] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)] rounded
                            transform transition duration-75 ease-in-out hover:scale-105 active:scale-95"
                                onClick={toggleGames}>
                                <span>D-Mentor Games</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between items-end -mb-1">
                        <div className="relative flex mt-1 -mb-1">
                            <button
                                onClick={handlePrevious}
                                disabled={currentLessonIndex === 0}
                                className={`-mb-1 rounded-full w-8 h-8 ${currentLessonIndex === 0
                                    ? "bg-blue-600 hover:bg-red-600" // cursor-not-allowed
                                    : "bg-blue-500 hover:bg-blue-400"}`}
                            >
                                <img className='prev-page-icon' alt='... ...' src='/prev-page.svg' />
                            </button>
                        </div>
                        <p className="text-sm text-gray-400">
                            Exercise {currentLessonIndex + 1} of {lessonsData.length}
                        </p>
                        {/* allCorrect check, prevent user from next page */}
                        <div className="relative group flex mt-1 -mb-1">
                            <button
                                onClick={handleNext}
                                disabled={!isLessonCompleted || currentLessonIndex === lessonsData.length - 1}
                                className={`mr-4 -mb-1 rounded-full w-8 h-8 ${currentLessonIndex === lessonsData.length - 1
                                    ? "bg-blue-600 hover:bg-red-600" //cursor-not-allowed
                                    : "bg-blue-500 hover:bg-blue-400"}`}
                            >
                                <img className='next-page-icon' alt='... ...' src='/next-page.svg' />
                            </button>
                            {!isLessonCompleted && (
                                <div className="absolute bottom-full left-auto transform -translate-x-1/2 mb-2 bg-teal-600 text-white text-xs rounded-lg py-2 pl-2 pr-0 w-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                                    Complete all questions first
                                    <div className="absolute left-16 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <Games />
                    <div className="flex justify-center items-center">
                        <button className="game-link px-2 bg-gradient-to-r from-[rgb(60,217,128)] to-[rgb(44,224,221)] hover:from-[rgba(60,217,128,0.92)]  
                        hover:to-[rgba(44,224,221,0.9)] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)] rounded
                        transform transition duration-75 ease-in-out hover:scale-105 active:scale-95
                        xxxsm:mt-[10px] xxsm:mt-[12px] xsm:mt-[15px] sm:mt-[15px] md:mt-[20px] lg:mt-[20px] xl:mt-[20px]
                        xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]"
                            onClick={toggleGames}>
                            <span>Back to Exercises</span>
                        </button>
                    </div>
                </>
            )}
        </>
    );
};

export default ExercisesPage;
// !isLessonCompleted ||