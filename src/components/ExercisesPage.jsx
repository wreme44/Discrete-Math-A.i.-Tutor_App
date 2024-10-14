import React, { useEffect, useRef, useState } from "react";
import {useLessonProgress} from './LessonProgressContext';
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

const ExercisesPage = ({onExerciseCompletion}) => { //currentLessonId lessonComplete

    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
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
    const [uploadedImage, setUploadedImage] = useState({});
    const [imagesDisplay, setImagesDisplay] = useState({});
    const [inputAlert, setInputAlert] = useState({});
    const [gptResults, setGptResults] = useState({});

    const [userSolution, setUserSolution] = useState("");

    const [lessonsData, setLessonsData] = useState([]);
    const [lessonMarkedDone, setLessonMarkedDone] = useState({});
    // const [isLessonCompleted, setIsLessonCompleted] = useState(false);

    // fetching user info
    useEffect(() => {
        const fetchUser = async () => {
            const {data, error} = await supabase.auth.getUser()
            if (error) {
                console.error("Error fetching user:", error.message)
            }
            else {
                setUser(data.user)
                setUserId(data.user?.id);
            }
        }
        fetchUser();
    }, [])
    // fetching exercise & lessons
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
                // grouping exercises by lesson_id for easier access
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

    // determine current lesson and exercises

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

    // image handler for user uploads
    const handleImageUpload = (event, exerciseId) => {

        const file = event.target.files[0];
        if(file){
            if (file.size > 2000000) { // 10mb limit for now
                alert("The image size must be less than 20 MB.")
                return;
            }
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
            if (!allowedTypes.includes(file.type)){
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

    // GPT api call as Math validator
    const handleSubmitSolution = async (exerciseId, userSolution, exerciseQuestion, correctAnswer) => {

        if ((!userSolution || userSolution.trim() === "") && !uploadedImage[exerciseId]) {
            setInputAlert((prev) => ({...prev, [exerciseId]: true}));
            return;
        }
        setInputAlert((prev) => ({...prev, [exerciseId]: false})); // clear if valid input

        let cleanedSolution = null;
        let base64Image = null;

        let messages = [
            {type: "text", text: `Exercise Question: ${exerciseQuestion}`}, 
            {type: "text", text: `Correct Answer: ${correctAnswer}`}
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
                image_url: `data:image/png;base64,${base64Image.split(',')[1]}` // Remove the data prefix as backend expects it
            });
        }
        const payload = {messages}
        // Log the payload to check
        console.log("Sending payload:", payload);
        // store users submitted solution
        setSubmittedSolutions((prev) => ({
            ...prev,
            [exerciseId]: userSolution,
        }));
        // while processing / validating
        setIsTyping(true); 

        try {
            // standard api call instead of streaming api
            const response = await fetch('http://localhost:5000/api/validate-solution', {
                method: 'POST',
                headers: {'Content-Type': 'application/json',},
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
            const {correct, feedback} = result;

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
            setIsTyping(false);
        } finally {
            // Resetting image state after submission
            setUploadedImage(prev => ({
                ...prev,
                [exerciseId]: null,
            }));
        }
    };

    // converting image to base64
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        })
    }

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
        } catch (error){
            console.error("Error updating exercise progress:", error)
        }
    }


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

    const renderGptContent = (content) => {
        // console.log(question)
        // regex to detect latex code between $...$ or $$...$$
        const latexRegex = /\$\$(.*?)\$\$|\$(.*?)\$/g;
        // detect raw latex without wrappings
        const rawLatexRegex = /\\(frac|sum|int|left|right|cdots|dots|binom|sqrt|text|over|begin|end|matrix|neg|land|lor|to|times|infty|leq|geq|neq|approx|forall|exists|subseteq|supseteq|cup|cap|nabla|partial|alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Phi|Psi|Omega|not|[A-Za-z]+)\b/g;
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
                return <LatexRenderer content={content}/>
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
        if (onExerciseCompletion){ 
            onExerciseCompletion(allCorrect)
        }
    }, [allCorrect, onExerciseCompletion]) 

    // checking completion status 
    useEffect(() => {

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
                const {data, error} = await supabase
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
                        if (existingProgress) {
                            // convert to map for lookup
                            const completedMap = {
                                [existingProgress.lesson_id]: existingProgress.completed
                            };
                            setLessonMarkedDone(completedMap);
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
                                    [currentLessonId]: true
                                };
                                setLessonMarkedDone(completedMap);
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
    // render component
    if (loading) return <p>Loading exercises...</p>;
    if (error) return <p>{error}</p>;
    // const currentExercise = exercisesData[currentExerciseIndex];

    const currentLesson = lessonsData[currentLessonIndex];
    const isLessonCompleted = lessonMarkedDone[currentLesson?.lesson_id];
    // const isLessonCompleted = lessonComplete[currentLessonId];

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
                        <div className="relative mt-16 flex items-center space-x-1">
                            <MathLiveInput
                                value={submittedSolutions[exercise.exercise_id] || ""}
                                onChange={(value) => setSubmittedSolutions({
                                    ...submittedSolutions,
                                    [exercise.exercise_id]: value,
                                })}
                                onFocus={() => setInputAlert(false)}
                            />
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
                                    className="relative flex items-center ml-2 w-6 h-6 active:bg-blue-900
                                         focus:outline-none outline-none border-none rounded-full transform 
                                         transition duration-75 ease-in-out hover:scale-105 active:scale-95"
                                >
                                    <img className='upload-icon' alt='... ...' src='/attach-image.svg' />
                                </button>
                                <div className="absolute bottom-9 left-1/2 transform -translate-x-1/2 mb-2 bg-teal-600
                                        text-white text-xs rounded-lg py-1 pl-1 pr-0 w-20 opacity-0 group-hover:opacity-100 
                                        transition-opacity duration-500 z-10">
                                    {/* "absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1" */}
                                    Upload Image
                                    <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
                                </div>
                            </div>
                            {/* Submit Solution */}
                            <div className="relative inline-block group">
                                <button
                                    onClick={() =>
                                        handleSubmitSolution(exercise.exercise_id, submittedSolutions[exercise.exercise_id], exercise.question, exercise.answer)
                                    }
                                    className="relative flex items-center w-11 h-10 ml-2 px-0 py-0 outline-none 
                                    focus:outline-none border-none rounded-full active:bg-blue-900 transform  
                                    transition duration-75 ease-in-out hover:scale-105 active:scale-95"
                                    disabled={isTyping}
                                >
                                    <img className='upload-icon' alt='... ...' src='/submit.svg' />
                                </button>
                                <div className="absolute bottom-11 left-7 transform -translate-x-1/2 mb-2 bg-teal-600
                                        text-white text-xs rounded-lg py-1 pl-1 pr-0 w-24 opacity-0 group-hover:opacity-100 
                                        transition-opacity duration-500 z-10">
                                    {/* "absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1" */}
                                    Submit Solution
                                    <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
                                </div>
                                {inputAlert[exercise.exercise_id] && (
                                    <div className="absolute bottom-12 right-32 mb-2 mt-1 bg-teal-600 text-white text-xs rounded py-1 px-2 w-60 z-10">
                                        Please enter a solution before submitting
                                        <div className="absolute left-28 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Show user's submitted solution */}
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
                            <div className="mt-4">
                                <h4 className="text-md font-semibold">Your Image Solution:</h4>
                                <img
                                    src={imagesDisplay[exercise.exercise_id]}
                                    alt="Uploaded solution preview"
                                    className="w-2/3 h-auto border border-gray-400 rounded mt-2"
                                />
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
                        <div className="flex mt-5">
                            <button
                                onClick={() => toggleHint(exercise.exercise_id)}
                                className="relative flex items-center w-14 h-10 ml-0 px-0 py-0 outline-none 
                                    focus:outline-none border-none rounded-full transform  
                                    transition duration-75 ease-in-out hover:scale-105 active:scale-95"
                            >
                                {showHint[exercise.exercise_id] 
                                ? <img className='upload-icon' alt='... ...' src='/hide-hint.svg' />
                                : <img className='upload-icon' alt='... ...' src='/show-hint.svg' />}
                            </button>
                            {/* GPT feedback button if feedback response exists*/}
                            {gptResults[exercise.exercise_id] && (
                                <button
                                    onClick={() => toggleGPTFeedback(exercise.exercise_id)}
                                    className="mt-1 ml-3 px-1 bg-gradient-to-r from-yellow-900 to-yellow-700 hover:from-yellow-800  
                                     hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600 rounded-full text-white flex items-center"
                                >
                                    {showGPTFeedback[exercise.exercise_id] 
                                    ? (<><XMarkIcon className="w-4 h-4 mr-1" />Tutor Feedback</>)
                                    : (<><ChevronDownIcon className="w-4 h-4 mr-1" />Tutor Feedback</>)}
                                </button>
                            )}
                        </div>
                        {/* display hint from database */}
                        {showHint[exercise.exercise_id] && (
                            <div className="mt-2 pb-1 pt-0 px-2 bg-gray-700 rounded">
                                <h3 className="text-md font-semibold mb-1">Hint:</h3>
                                <div className="text-sm">{renderContent(exercise.hint)}</div>
                            </div>
                        )}
                        {/* display GPT feedback when the button is clicked */}
                        {showGPTFeedback[exercise.exercise_id] && (
                            <div className="mt-2">
                                <h4 className="text-md font-semibold">Tutor Feedback:</h4>
                                {renderGptContent(gptResults[exercise.exercise_id])}
                                {/* <LatexRenderer content={gptResults[exercise.exercise_id]} /> */}
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
            <div className="flex justify-between items-end">
                <button
                    onClick={handlePrevious}
                    disabled={currentLessonIndex === 0}
                    className={`rounded-full w-8 h-8 ${currentLessonIndex === 0
                        ? "bg-blue-600 hover:bg-red-600" // cursor-not-allowed
                        : "bg-blue-500 hover:bg-blue-400"}`}
                >
                    <img className='prev-page-icon' alt='... ...' src='/prev-page.svg' />
                </button>
                <p className="text-sm text-gray-400">
                    Exercise {currentLessonIndex + 1} of {lessonsData.length}
                </p>
                {/* allCorrect check, prevent user from next page */}
                <div className="relative group flex">
                    <button
                        onClick={handleNext}
                        disabled={!isLessonCompleted || currentLessonIndex === lessonsData.length - 1}
                        className={`mr-4 rounded-full w-8 h-8 ${currentLessonIndex === lessonsData.length - 1
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
    );
};

export default ExercisesPage;