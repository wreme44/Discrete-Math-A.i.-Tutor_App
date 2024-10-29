import React, { useEffect, useRef, useState } from "react";
// import {useLessonProgress} from './LessonProgressContext';
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

const ExercisesPage = ({
    onExerciseCompletion, userId, exercisesData, 
    groupedExercises, lessonsData}) => {

    // const [user, setUser] = useState(null);
    // const [userId, setUserId] = useState(null);
    // State to hold exercises data fetched from the database
    // const [exercisesData, setExercisesData] = useState([]);
    // const [groupedExercises, setGroupedExercises] = useState({});
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
    const [inputAlert, setInputAlert] = useState({});
    const [gptResults, setGptResults] = useState({});

    const [userSolution, setUserSolution] = useState("");

    // const [lessonsData, setLessonsData] = useState([]);
    const [lessonMarkedDone, setLessonMarkedDone] = useState({});
    // ref to scroll to top at next/prev page
    const scrollableContainerRef = useRef(null);

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
        // console.log("Sending payload:", payload);
        // store users submitted solution
        setSubmittedSolutions((prev) => ({
            ...prev,
            [exerciseId]: userSolution,
        }));
        // while processing / validating
        // setIsTyping((prev) => ({...prev, [exerciseId]: true}));
        setIsTyping(true)

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
            images.forEach((image) => image.removeEventListener("click", () => {}));
            modal.removeEventListener("click", closeModal);
            document.removeEventListener("keydown", (e) => {
                if (e.key === "Escape") closeModal();
            })
        }
    }, [imagesDisplay])

    
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
    // if (loading) return <p>Loading exercises...</p>;
    // if (error) return <p>{error}</p>;
    // const currentExercise = exercisesData[currentExerciseIndex];

    const currentLesson = lessonsData[currentLessonIndex];
    const isLessonCompleted = lessonMarkedDone[currentLesson?.lesson_id];
    // const isLessonCompleted = lessonComplete[currentLessonId];

    return (
        <div className="flex flex-col h-full -mt-2">
            {currentLessonId && (
                <h2 className="xsm:text-[18px] sm:text-[20px] md:text-[18px] lg:text-[20px] xl:text-[20px] font-bold mb-1">Lesson {currentLessonIndex + 1}</h2>
            )}
            <div ref={scrollableContainerRef} className="flex-1 overflow-y-auto pl-1 pb-1 bg-gray-900 rounded prose prose-sm sm:prose lg:prose-lg text-white w-full override-max-width">
                {currentExercises.map((exercise) => (
                    <div key={exercise.exercise_id} className="mb-36 pl-4 pb-4 bg-gray-900 rounded prose prose-sm sm:prose lg:prose-lg text-white w-full override-max-width">
                        {renderContent(exercise.question)}                         
                        {/* MathLiveInput for the exercise */}
                        <div className="relative mt-2 flex items-center space-x-1">
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
                                    className="relative flex items-center ml-2 focus:outline-none
                                        outline-none border-none rounded-full transform transition
                                        duration-75 ease-in-out hover:scale-105 active:scale-95
                                        xsm:w-[16px] sm:w-[20px] md:w-[20px] lg:w-[24px] xl:w-[24px]"
                                >
                                    <img className='upload-user-image' alt='upload image' src='/image-upload.svg' />
                                </button>
                                <div className="absolute xsm:bottom-11 sm:bottom-14 md:bottom-14 lg:bottom-16 xl:bottom-16 
                                        left-1/2 transform -translate-x-1/2 mb-2 bg-teal-600 text-white
                                        text-xs rounded-lg py-1 pl-1 pr-0 w-20 opacity-0 group-hover:opacity-100 
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
                                        handleSubmitSolution(exercise.exercise_id, submittedSolutions[exercise.exercise_id], exercise.question, exercise.answer)}
                                    className="relative flex items-center justify-center mr-[4px] px-0 py-0
                                        xsm:ml-[25px] sm:ml-[30px] md:ml-[35px] lg:ml-[40px] xl:ml-[40px]
                                        xsm:w-[70px] sm:w-[90px] md:w-[90px] lg:w-[110px] xl:w-[110px]
                                        xsm:h-[25px] sm:h-[35px] md:h-[35px] lg:h-[40px] xl:h-[40px] bg-blue-900 outline-none
                                        focus:outline-none border-1 border-cyan-600 hover:border-cyan-600 
                                        rounded-full transform transition duration-75 ease-in-out hover:scale-105 active:scale-95"
                                        disabled={isTyping}
                                    >
                                    <div className="flex items-center">
                                        <img className="xsm:w-[16px] sm:w-[24px] md:w-[24px] lg:w-[28px] xl:w-[28px] 
                                                        h-auto mr-1" alt="Submit" src="/submit3.svg"/>
                                        <span className="text-slate-100 font-serif ml-0 mr-1 
                                        xsm:text-[12px] sm:text-[16px] md:text-[16px] lg:text-[18px] xl:text-[18px]">Submit</span>
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
                                    <div className="absolute xsm:right-[150px] sm:right-[220px] md:right-[200px] lg:right-[300px] xl:right-[360px] 
                                        xsm:bottom-[48px] sm:bottom-[56px] md:bottom-[57px] lg:bottom-[62px] xl:bottom-[62px]
                                        w-full xsm:w-[235px] sm:w-[235px] md:w-[235px] lg:w-[235px] xl:w-[235px]
                                        mt-1 bg-teal-600 text-white text-xs rounded py-1 px-2 z-10">
                                        Please enter a solution before submitting
                                        <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Show user's solution */}
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
                                    className="IMGs-user-upload w-2/3 h-auto border-2 border-gray-600 rounded mt-2"
                                />
                            </div>
                        )}
                        {/* Display GPT Results validation for in/correct*/}
                        {correctAnswers[exercise.exercise_id] !== undefined && (
                            <div className="flex items-center -mt-10 -mb-5">
                                <h4 className={`flex items-center justify-center text-md font-semibold ${correctAnswers[exercise.exercise_id] ? 'correct-answer' : 'incorrect-answer'}`}> 
                                    {correctAnswers[exercise.exercise_id] 
                                    ? <>
                                        Your solution is correct! Well Done
                                        <img className="ml-1 w-6" src="correct.svg"/>
                                        {/* <img className="ml-1 w-10" src="correct2.svg"/>
                                        <img className="ml-1 w-10" src="correct2copy.svg"/> */}
                                    </> 
                                    : <>
                                        Your solution is incorrect.
                                        <img className="ml-1 w-6" src="incorrect.svg"/>
                                        {/* <img className="ml-1 w-10" src="incorrect2.svg"/> */}
                                    </>}
                                </h4>
                            </div>    
                        )}
                        {/* hint + feedback buttons */}
                        <div className="flex items-center mt-5"> {/* -mb-14 */}
                            <button
                                onClick={() => toggleHint(exercise.exercise_id)}
                                className="flex items-center justify-center mt-2 px-0 py-0 outline-none 
                                    focus:outline-none border-none rounded-full transform transition duration-75 ease-in-out hover:scale-110 active:scale-90
                                    xsm:ml-[-18px] sm:ml-[-20px] md:ml-[-28px] lg:ml-[-28px] xl:ml-[-28px]
                                    xsm:mt-[2px] sm:mt-[2px] md:mt-[2px] lg:mt-[2px] xl:mt-[8px]
                                    xsm:w-[60px] sm:w-[75px] md:w-[80px] lg:w-[96px] xl:w-[96px]
                                    xsm:h-[15px] sm:h-[25px] md:h-[30px] lg:h-[40px] xl:h-[40px]"
                                // className="flex items-center justify-center w-20 h-10 ml-0 px-0 py-0 bg-gray-900 outline-none 
                                //     focus:outline-none border-2 border-gray-500 hover:border-gray-500 rounded-full transform  
                                //     transition duration-75 ease-in-out hover:scale-105 active:scale-95"
                            >
                                {showHint[exercise.exercise_id]
                                    ? <img className='' alt='hide hint' src='/hide-hint.svg'/>
                                    : <img className='' alt='show hint' src='/show-hint.svg'/>

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
                                     xsm:w-[100px] sm:w-[140px] md:w-[140px] lg:w-[158px] xl:w-[158px]
                                     xsm:h-[22px] sm:h-[27px] md:h-[27px] lg:h-[30px] xl:h-[30px]"
                                >
                                    {showGPTFeedback[exercise.exercise_id] 
                                    ? (<><XMarkIcon className="xsm:w-[12px] sm:w-[14px] md:w-[14px] lg:w-[16px] xl:w-[16px] mr-1" />
                                    <span className="xsm:text-[10px] sm:text-[16px] md:text-[16px] lg:text-[18px] xl:text-[18px]">
                                        Tutor Feedback</span></>)
                                    : (<><ChevronDownIcon className="xsm:w-[12px] sm:w-[14px] md:w-[14px] lg:w-[16px] xl:w-[16px] mr-1" />
                                    <span className="xsm:text-[10px] sm:text-[16px] md:text-[16px] lg:text-[18px] xl:text-[18px]">
                                        Tutor Feedback</span></>)}
                                </button>
                            )}
                        </div>
                        {/* display hint from database */}
                        {showHint[exercise.exercise_id] && (
                            <div className="mt-8 pb-1 pt-0 pl-2 pr-2 bg-gray-700 rounded w-max max-w-full">
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
                        )} {/* [exercise.exercise_id] */}
                        {isTyping && (
                            <div className='flex items-center justify-center'>
                                <img className='loading-gif' alt='... ...' src='/loading-ripple.svg'/>
                            </div>
                        )}
                    </div>
                ))}
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
    );
};

export default ExercisesPage;