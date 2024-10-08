import React from 'react';
import { supabase } from './supabaseClient';

const Promotion = ({ userId, currentLevel, newLevel }) => {
  const promoteUser = async () => {
    const { data, error } = await supabase
      .from('Users')
      .update({ current_level: newLevel })
      .eq('user_id', userId);

    if (error) {
      console.log('Error promoting user:', error);
    } else {
      console.log(`User promoted from ${currentLevel} to ${newLevel}`);
    }
  };

  return (
    <div>
      <button onClick={promoteUser}>Promote to {newLevel}</button>
    </div>
  );
};

export default Promotion;



// import React, { useEffect, useRef, useState } from "react";
// import {useLessonProgress} from './LessonProgressContext';
// import { marked } from "marked";
// import DOMPurify from "dompurify";
// import { supabase } from "../supabaseClient";
// import LatexRenderer from "./LatexRenderer";
// import { MathfieldElement } from 'mathlive'
// import '/node_modules/mathlive/dist/mathlive-static.css';
// import '/node_modules/mathlive/dist/mathlive-fonts.css';
// import ReactMarkdown from 'react-markdown';
// import remarkMath from 'remark-math';
// import rehypeKatex from 'rehype-katex';
// import 'katex/dist/katex.min.css';
// import hljs from 'highlight.js';
// import 'highlight.js/styles/atom-one-dark.css';
// import remarkGfm from 'remark-gfm'


// const MathLiveInput = ({value, onChange, onFocus}) => {

//     const mathfieldRef = useRef(null);

//     useEffect(() => {
//         const mathfield = mathfieldRef.current;
//         if (mathfield) {
//             mathfield.value = value;
//             const handleInput = () => {
//                 onChange(mathfield.value);
//             }
//             mathfield.addEventListener("input", handleInput)
//             return () => {
//                 mathfield.removeEventListener("input", handleInput);
//             }
//         }
//     }, [value, onChange]);

//     return <math-field ref={mathfieldRef} onFocus={onFocus}/>;
// }

// const ExercisesPage = () => {

//     const [user, setUser] = useState(null);
//     const [userId, setUserId] = useState(null);
//     // State to hold exercises data fetched from the database
//     const [exercisesData, setExercisesData] = useState([]);
//     const [groupedExercises, setGroupedExercises] = useState({});
//     // pre determined correct answers
//     const [correctAnswers, setCorrectAnswers] = useState({});
//     // State to keep track of current lesson index
//     const [currentExerciseIndex, setcurrentExerciseIndex] = useState(() => {
//         const savedIndex = sessionStorage.getItem("currentExerciseIndex");
//         return savedIndex ? parseInt(savedIndex, 10) : 0;
//     });
//     // Toggle hint
//     const [showHint, setShowHint] = useState({});
//     const [showGPTFeedback, setShowGPTFeedback] = useState({});
//     // loading and error states
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [isTyping, setIsTyping] = useState(false);

//     const [submittedSolutions, setSubmittedSolutions] = useState({});
//     const [inputAlert, setInputAlert] = useState({});
//     const [gptResults, setGptResults] = useState({});

//     const [userSolution, setUserSolution] = useState("");

//     const [lessonsData, setLessonsData] = useState([]);
//     // fetching user info
//     useEffect(() => {
//         const fetchUser = async () => {
//             const {data, error} = await supabase.auth.getUser()
//             if (error) {
//                 console.error("Error fetching user:", error.message)
//             }
//             else {
//                 setUser(data.user)
//                 setUserId(data.user?.id);
//             }
//         }
//         fetchUser();
//     }, [])
//     // fetching exercise & lessons
//     useEffect(() => {
//         const fetchExercises = async () => {
//             const { data, error } = await supabase
//                 .from("exercises") // ensure table name matches exactly
//                 .select("*, answer") // added answer column, not sure if needed since * selects all ?
//                 .order("exercise_id", { ascending: true }); // order by 'id' column in ascending order

//             if (error) {
//                 console.error("Error fetching exercises:", error.message);
//                 setError(error.message);
//             } else {
//                 // grouping exercises by lesson_id for easier access
//                 const grouped = data.reduce((acc, exercise) => {
//                     if (!acc[exercise.lesson_id]) {
//                         acc[exercise.lesson_id] = [];
//                     }
//                     acc[exercise.lesson_id].push(exercise);
//                     return acc;
//                 }, {});

//                 setGroupedExercises(grouped);
//                 setExercisesData(data);
//                 setLoading(false);
//             }
//         };

//         const fetchLessons = async () => {
//             const { data, error } = await supabase
//                 .from("lessons")
//                 .select("*")
//                 .order("lesson_id", { ascending: true });

//             if (error) {
//                 console.error("Error fetching lessons:", error.message);
//                 setError(error.message);
//             } else {
//                 setLessonsData(data);
//             }
//         };

//         fetchExercises();
//         fetchLessons();
//     }, []);

//     // determine current lesson and exercises

//     // get all unique lesson Ids
//     const lessonIds = Object.keys(groupedExercises);
//     // get exercises for current lesson id based on currentExerciseIndex
//     const currentLessonId = lessonIds[currentExerciseIndex];
//     const currentExercises = groupedExercises[currentLessonId] || [];
//     const currentLessonIndex = lessonsData.findIndex(lesson => lesson.lesson_id === parseInt(currentLessonId));

//     const cleanLatexInput = (latexInput) => {

//         return latexInput
//             .replace(/\$\$/g, '') // Remove dollar signs used for wrapping
//             .replace(/\\left/g, '') // Remove LaTeX commands like \left
//             .replace(/\\right/g, '') // Remove \right
//             .replace(/\\text\{([^}]+)\}/g, '$1') // Convert \text{...} to plain text
//             .replace(/\\middle\{\|}/g, '|') // Replace LaTeX middle commands
//             .replace(/\\le/g, '<=') // Replace \le with <=
//             .replace(/\\ge/g, '>=') // Replace \ge with >=
//             .replace(/\\times/g, '*') // Replace \times with *
//             .replace(/\\div/g, '/') // Replace \div with /
//             .replace(/\\cdot/g, '*') // Replace \cdot with *
//             .replace(/\\pm/g, '+/-') // Replace \pm with +/-
//             .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)') // Convert square root
//             .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)') // Convert fractions to division
//             .replace(/\\sum/g, 'sum') // Replace sum notation
//             .replace(/\\infty/g, 'infinity') // Replace infinity symbol
//             .replace(/\\neq/g, '!=') // Replace not equal
//             .replace(/\\approx/g, '~=') // Replace approximately equal
//             .replace(/\\pi/g, 'pi') // Replace pi symbol
//             .replace(/\\alpha/g, 'alpha') // Greek letters example
//             .replace(/\\beta/g, 'beta') // Greek letters example
//             .replace(/\\gamma/g, 'gamma') // Greek letters example
//             .replace(/\\ldots/g, '...') // Replace ellipsis
//             .replace(/[{}]/g, '') // Remove curly braces
//             .trim();
//     };

//     // GPT api call as Math validator
//     const handleSubmitSolution = async (exerciseId, userSolution, exerciseQuestion, correctAnswer) => {

//         if (!userSolution || userSolution.trim() === "") {
//             setInputAlert((prev) => ({...prev, [exerciseId]: true}));
//             return;
//         }

//         setInputAlert((prev) => ({...prev, [exerciseId]: false})); // clear if valid input

//         const cleanedSolution = cleanLatexInput(userSolution);

//         // store users submitted solution
//         setSubmittedSolutions((prev) => ({
//             ...prev,
//             [exerciseId]: userSolution,
//         }));
//         setIsTyping(true);

//         try {
//             // standard api call instead of streaming api
//             const response = await fetch('http://localhost:5000/api/validate-solution', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ question: exerciseQuestion, userSolution: cleanedSolution, correctAnswer })
//             });

//             // check if the response is ok
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }

//             // get JSON result from backend
//             const result = await response.json();
//             // console.log("Received from backend:", result);
//             // extract the 'correct' flag and 'feedback' from the result
//             const { correct, feedback } = result;

//             // update the state for correctness flag
//             setCorrectAnswers((prev) => ({
//                 ...prev,
//                 [exerciseId]: correct,
//             }));

//             // update state for GPT feedback
//             setGptResults((prev) => ({
//                 ...prev,
//                 [exerciseId]: feedback,
//             }));

//             setIsTyping(false);

//         } catch (error) {
//             // error handling for failed requests
//             console.error('Error validating solution:', error);
//             setGptResults((prev) => ({
//                 ...prev,
//                 [exerciseId]: 'An error occurred while validating the solution.'
//             }));
//             setIsTyping(false);
//         }
//     };

//     useEffect(() => {
//         // Loop through correctAnswers and trigger progress update for the correct ones
//         Object.keys(correctAnswers).forEach(async (exerciseId) => {
//             if (correctAnswers[exerciseId]) {
//                 await updateExerciseProgress(exerciseId); // Only update for correct answers
//             }
//         });
//     }, [correctAnswers]); // Runs whenever correctAnswers state changes

//     const updateExerciseProgress = async (exerciseId, currentLessonId) => {

//         try {
//             // updating userprogress
//             if (userId) {
//                 const { data: progressData, error: progressError } = await supabase
//                     .from("user_exercise_progress")
//                     .select('*')
//                     .eq('user_id', userId)
//                     .eq('exercise_id', exerciseId)
//                     .single(); // checking if progress for this exercise exists

//                 if (!progressData) {
//                     // insert new progress for this exercise
//                     const { error: insertError } = await supabase
//                         .from("user_exercise_progress")
//                         .insert({
//                             user_id: userId,
//                             lesson_id: currentLessonId,
//                             exercise_id: exerciseId,
//                             completed: true,
//                             completed_at: new Date(),
//                         });
//                     if (insertError) {
//                         console.error("Error inserting progress:", insertError.message)
//                         return;
//                     }
//                 } else {
//                     // updating existing progress for this exercise
//                     const { error: updateError } = await supabase
//                         .from("user_exercise_progress")
//                         .update({
//                             completed: true,
//                             completed_at: new Date(),
//                         })
//                         .eq('user_id', userId)
//                         .eq('exercise_id', exerciseId);

//                     if (updateError) {
//                         console.error("Error updating progress:", updateError);
//                         return;
//                     }
//                 }
//                 // console.log("Progress updated for exercise:", exerciseId);
//             } else {
//                 // non logged in users
//                 const completedExercises = JSON.parse(sessionStorage.getItem('completedExercises')) || {};
//                 completedExercises[exerciseId] = true;
//                 sessionStorage.setItem('completedExercises', JSON.stringify(completedExercises));
//             }
//         } catch (error){
//             console.error("Error updating exercise progress:", error)
//         }
//     }

//     const renderContent = (question) => {

//         // console.log(question)
//         // regex to detect latex code between $...$ or $$...$$
//         const latexRegex = /\$\$(.*?)\$\$|\$(.*?)\$/g;
//         // regex to check if latex already wrapped  with $$..$$ or \(..\)
//         const alreadyWrappedLatex = /(\$\$(.*?)\$\$)|\\\((.*?)\\\)/g
//         // detect raw latex without wrappings
//         const rawLatexRegex = /\\(frac|sum|int|left|right|cdots|dots|binom|sqrt|text|over|begin|end|matrix|[A-Za-z]+)\b/g
//         // Check if question contains LaTeX
//         const hasLatex = latexRegex.test(question);
//         // check for no latex wrappings
//         const hasRawLatex = rawLatexRegex.test(question)

//         if (hasLatex || hasRawLatex) {

//             if (hasRawLatex) {
//                 const wrappedLatex = `$$ ${question} $$`
//                 // console.log(wrappedLatex)
//                 return (
//                     <div className="math-block overflow-x-auto">
//                     <ReactMarkdown
//                         children={wrappedLatex}
//                         remarkPlugins={[remarkMath, remarkGfm]}
//                         rehypePlugins={[rehypeKatex]}
//                         className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-full break-words"
//                     />
//                     </div>
//                 )
//             }
//             else if (hasLatex) {
//                 return <LatexRenderer question={question}/>
//             }
//         }
//         else {
//             // Render non-LaTeX question as plain HTML
//             return (
//                 <div
//                     dangerouslySetInnerHTML={{
//                         __html: DOMPurify.sanitize(marked(question)),
//                     }}
//                 />
//             );
//         }
//     };

//     const {setAllExercisesCompleted} = useLessonProgress(); // Import the context function
//     // const allCorrect = currentExercises.every((exercise) => correctAnswers[exercise.exercise_id]);
//     const allCorrect = currentExercises.length > 0 && currentExercises.every((exercise) => correctAnswers[exercise.exercise_id]);

//     // When moving to a new page, reset allCorrect and correctAnswers
//     useEffect(() => {
//         // Reset correctAnswers and the completion state when a new set of exercises is loaded
//         setCorrectAnswers({});
//         setAllExercisesCompleted(false);  // Reset the context to lock the buttons again
//         setSubmittedSolutions({}); // Optionally, reset submitted solutions for the new page
//     }, [currentExerciseIndex, setAllExercisesCompleted]); // Runs when moving to a new exercise page    

//     // calculating if all answers are correct for the current set of exercises

//     // // notifying main page / lessons page if all exercises completed
//     // useEffect(() => {
//     //     if (typeof onLessonCompletion === 'function'){ // only call if its defined
//     //         onLessonCompletion(allCorrect)
//     //     }
//     // }, [allCorrect, onLessonCompletion]) 

//     // checking completion status 
//     useEffect(() => {

//         // Update the context state when all exercises are completed
//         if (allCorrect) {
//             setAllExercisesCompleted(true);
//         } else {
//             setAllExercisesCompleted(false);
//         }

//         const checkExerciseCompletion = async () => {
//             if (!currentLessonId) return;

//             if (userId) {
//                 // logged in users - checking completion in supabase
//                 const {data, error} = await supabase
//                     .from("user_exercise_progress")
//                     .select("exercise_id, completed")
//                     .eq("user_id", userId)
//                     .in("exercise_id", currentExercises.map(ex => ex.exercise_id)); // Filter by the current exercise IDs
//                     // .eq("lesson_id", currentLessonId)
//                     // .single();

//                 if (error) {
//                     if (error.code === 'PGRST116') { // no data found
//                         // not completed - do nothing
//                         // maybe reset correctAnswers if needed
//                     } else {
//                         console.error("Error checking lesson completion:", error.message);
//                     }
//                 } else {
//                     const completedExercises = data.reduce((acc, progress) => {
//                         if (progress.completed) {
//                             acc[progress.exercise_id] = true;
//                         }
//                         return acc;
//                     }, {});
//                     // if (data.completed) {
//                     //     // lesson already completed - marking all exercises as correct
//                     //     const allCorrectMap = currentExercises.reduce((acc, exercise) => {
//                     //         acc[exercise.exercise_id] = true;
//                     //         return acc;
//                     //     }, {});
//                         // setCorrectAnswers(allCorrectMap);
//                     setCorrectAnswers(completedExercises)
                    
//                 }
//             } else {
//                 // non logged in users - checking completion in sessionStorage
//                 const completedExercises = JSON.parse(sessionStorage.getItem('completedExercises')) || {};
//                 const completedForThisLesson = currentExercises.reduce((acc, exercise) => {
//                     if (completedExercises[exercise.exercise_id]) {
//                         acc[exercise.exercise_id] = true;
//                     }
//                     return acc;
//                 }, {});
//                 setCorrectAnswers(completedForThisLesson);
//             }
//             //     const completedLessons = JSON.parse(sessionStorage.getItem('completedLessons')) || {};
//             //     if (completedLessons[currentLessonId]) {
//             //         // lesson already completed - marking all exercises as correct
//             //         const allCorrectMap = currentExercises.reduce((acc, exercise) => {
//             //             acc[exercise.exercise_id] = true;
//             //             return acc;
//             //         }, {});
//             //         setCorrectAnswers(allCorrectMap);
//             //     }
//             // }
//         };
//         checkExerciseCompletion();
//     }, [currentLessonId, userId, currentExercises]); // setAllExercisesCompleted, correctAnswers

//     // update completion status when all correct
//     useEffect(() => {
//         console.log('useEffect triggered');
//         console.log('allCorrect:', allCorrect);
//         console.log('currentLessonId:', currentLessonId);
//         console.log('userId:', userId);
//         if (allCorrect && currentLessonId) {
//             if (userId) {
//                 // logged in users - updating supabase
//                 const markLessonCompleted = async () => {
//                     const {error} = await supabase
//                         .from("userprogress")
//                         .upsert(
//                             {
//                                 user_id: userId,
//                                 lesson_id: currentLessonId,
//                                 completed: true,
//                                 completed_at: new Date(),
//                             },
//                             {onConflict: ['user_id', 'lesson_id']} // ensuring upsert on user_id and lesson_id
//                         );
//                     if (error) {
//                         console.error("Error updating lesson completion:", error.message);
//                     } else {
//                         console.log(`Lesson ${currentLessonId} marked as completed for user ${user.id}`);
//                     }
//                 };
//                 markLessonCompleted();
//             } else {
//                 // non logged in users - updating sessionStorage
//                 const completedLessons = JSON.parse(sessionStorage.getItem('completedLessons')) || {};
//                 completedLessons[currentLessonId] = true;
//                 sessionStorage.setItem('completedLessons', JSON.stringify(completedLessons));
//                 console.log(`Lesson ${currentLessonId} marked as completed in sessionStorage`);
//             }
//         }
//     }, [allCorrect, currentLessonId, userId]);

//     // Function to update the userprogress table
//     const updateProgress = async (lessonId, completed = false) => {
//         if (!userId) {
//             // console.warn("No user is logged in. Progress update aborted.");
//             const updatedCompletedLessons = { ...completedLessons, [lessonId]: completed };
//             setCompletedLessons(updatedCompletedLessons);
//             sessionStorage.setItem('completedLessons', JSON.stringify(updatedCompletedLessons));
//             return; // Abort the update if no user is logged in
//         }

//         const { data: progressData, error: progressError } = await supabase
//             .from("userprogress")
//             .select('*')
//             .eq('user_id', userId)
//             .eq('lesson_id', lessonId)
//             .single(); // Check if the progress for this lesson already exists

//         if (progressError && progressError.code !== 'PGRST116') {
//             console.error("Error fetching progress:", progressError.message);
//         }

//         if (!progressData) {
//             // If no progress data exists, insert a new row with a completion timestamp
//             const { error: insertError } = await supabase
//                 .from("userprogress")
//                 .insert({
//                     user_id: userId,
//                     lesson_id: lessonId,
//                     completed: completed,
//                     completed_at: new Date(), // Add timestamp
//                 });

//             if (insertError) {
//                 console.error("Error inserting progress:", insertError.message);
//                 return;
//             }
//         } else {
//             // If progress data already exists, update it with a new timestamp
//             const { error: updateError } = await supabase
//                 .from("userprogress")
//                 .update({
//                     completed: completed,
//                     completed_at: new Date(), // Update timestamp
//                 })
//                 .eq('user_id', userId)
//                 .eq('lesson_id', lessonId);

//             if (updateError) {
//                 console.error("Error updating progress:", updateError);
//                 return;
//             }
//         }
//         console.log("Progress updated for lesson:", lessonId);
//         setCompletedLessons(prev => ({
//             ...prev, [lessonId]: completed,
//         }));
//     };
    
//     // handling navigation buttons
//     const handlePrevious = () => {
//         const newIndex = currentExerciseIndex - 1;
//         setcurrentExerciseIndex(newIndex);
//         sessionStorage.setItem("currentExerciseIndex", newIndex);
//         // setShowHint(false);
//         setUserSolution("");
//     };

//     const handleNext = () => {
//         // const lessonId = lessonsData[currentLessonIndex].lesson_id;
//         const newIndex = currentExerciseIndex + 1;

//         if (allCorrect) {
//             setcurrentExerciseIndex(newIndex);
//             sessionStorage.setItem("currentExerciseIndex", newIndex);
//             setUserSolution("");  // Reset solution field for the new page
//         } else {
//             // Show an alert or prevent navigation if all exercises aren't correct
//             alert("Please complete all exercises before moving to the next page.");
//         }
    
//         // updateProgress(lessonId, true);
//         // setcurrentExerciseIndex(newIndex);
//         // sessionStorage.setItem("currentExerciseIndex", newIndex);
//         // setShowHint(false);
//         // setUserSolution("");
//     };
//     // hint + feedback toggling
//     const toggleHint = (exerciseId) => {
//         setShowHint((prevState) => ({
//             ...prevState, [exerciseId]: !prevState[exerciseId],
//         }));
//     };

//     const toggleGPTFeedback = (exerciseId) => {
//         setShowGPTFeedback((prevState) => ({
//             ...prevState, [exerciseId]: !prevState[exerciseId],
//         }));
//     };
//     // render component
//     if (loading) return <p>Loading exercises...</p>;
//     if (error) return <p>{error}</p>;
//     // const currentExercise = exercisesData[currentExerciseIndex];

//     return (
//         <div className="flex flex-col h-full">
//             {currentLessonId && (
//                 <h2 className="text-xl font-bold mb-1">Lesson {currentLessonIndex + 1}</h2>
//             )}
//             <div className="flex-1 overflow-y-auto pl-4 pb-4 bg-gray-900 rounded prose prose-sm sm:prose lg:prose-lg text-white w-full override-max-width">
//                 {currentExercises.map((exercise) => (
//                     <div key={exercise.exercise_id} className="mb-36 pl-4 pb-4 bg-gray-900 rounded prose prose-sm sm:prose lg:prose-lg text-white w-full override-max-width">
//                         {renderContent(exercise.question)}                         
//                         {/* MathLiveInput for the exercise */}
//                         <div className="relative mt-16">
//                             <MathLiveInput
//                                 value={submittedSolutions[exercise.exercise_id] || ""}
//                                 onChange={(value) => setSubmittedSolutions({
//                                     ...submittedSolutions,
//                                     [exercise.exercise_id]: value,
//                                 })}
//                                 onFocus={() => setInputAlert(false)}
//                             />
//                             <button
//                                 onClick={() =>
//                                     handleSubmitSolution(exercise.exercise_id, submittedSolutions[exercise.exercise_id], exercise.question, exercise.answer)
//                                 }
//                                 className="ml-3 px-1 py-0 bg-blue-700 hover:bg-blue-600 active:bg-blue-900 focus:outline-none 
//                                  focus:ring-2 focus:ring-blue-500 text-white rounded-full transform transition duration-200 ease-in-out hover:scale-105 active:scale-95"
//                                 disabled={isTyping}
//                             >
//                                 Submit Solution
//                             </button>
//                             {inputAlert[exercise.exercise_id] && (
//                                 <div className="absolute bottom-full left-8 mb-2 mt-1 bg-teal-600 text-white text-xs rounded py-1 px-2 w-60 z-10">
//                                     Please enter a solution before submitting
//                                     <div className="absolute left-28 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
//                                 </div>
//                             )}
//                         </div>
//                         {/* Show user's submitted solution */}
//                         {submittedSolutions[exercise.exercise_id] && (
//                             <div className="mt-4">
//                                 <h4 className="text-md font-semibold">Your Solution:</h4>
//                                 <div className="mb-4">
//                                     {renderContent(submittedSolutions[exercise.exercise_id])}
//                                 </div>
//                             </div>
//                         )}
//                         {/* Display GPT Results validation for in/correct*/}
//                         {correctAnswers[exercise.exercise_id] !== undefined && (
//                             <div className="mt-4">
//                                 <h4 className={`text-md font-semibold ${correctAnswers[exercise.exercise_id] ? 'correct-answer' : 'incorrect-answer'}`}>
//                                     {correctAnswers[exercise.exercise_id] ? 'Your solution is correct! Well Done.' : 'Your solution is incorrect.'}
//                                 </h4>
//                             </div>    
//                         )}
//                         {/* hint + feedback buttons */}
//                         <div className="mt-5">
//                             <button
//                                 onClick={() => toggleHint(exercise.exercise_id)}
//                                 className="mt-1 px-2 py-0 bg-gray-600 hover:bg-gray-500 focus:outline-none 
//                                  focus:ring-2 focus:ring-gray-500 rounded-full text-white"
//                             >
//                                 {showHint[exercise.exercise_id] ? 'Hide Hint' : 'Show Hint'}
//                             </button>
//                             {/* GPT feedback button if feedback response exists*/}
//                             {gptResults[exercise.exercise_id] && (
//                                 <button
//                                     onClick={() => toggleGPTFeedback(exercise.exercise_id)}
//                                     className="mt-1 ml-5 px-2 py-1 bg-gradient-to-r from-yellow-900 to-yellow-700 hover:from-yellow-800 hover:to-yellow-600 
//                                      focus:outline-none focus:ring-2 focus:ring-yellow-600 rounded-full text-white"
//                                 >
//                                     {showGPTFeedback[exercise.exercise_id] ? 'Hide Tutor Feedback' : 'Show Tutor Feedback'}
//                                 </button>
//                             )}
//                         </div>
//                         {/* display hint from database */}
//                         {showHint[exercise.exercise_id] && (
//                             <div className="mt-2 pb-1 pt-0 px-2 bg-gray-600 rounded">
//                                 <h3 className="text-md font-semibold mb-1">Hint:</h3>
//                                 <div className="text-sm">{renderContent(exercise.hint)}</div>
//                             </div>
//                         )}
//                         {/* display GPT feedback when the button is clicked */}
//                         {showGPTFeedback[exercise.exercise_id] && (
//                             <div className="mt-2">
//                                 <h4 className="text-md font-semibold">Tutor Feedback:</h4>
//                                 <LatexRenderer content={gptResults[exercise.exercise_id]} />
//                             </div>
//                         )}
//                         {isTyping && (
//                             <div className='mb-2 text-left'>
//                                 <img className='typing-gif' alt='... ...' src='/loading2.1.gif' />
//                             </div>
//                         )}
//                     </div>
//                 ))}
//             </div>
//             <div className="mt-1 flex justify-between">
//                 <button
//                     onClick={handlePrevious}
//                     disabled={currentLessonIndex === 0}
//                     className={`px-2 py-0 rounded-full ${currentLessonIndex === 0
//                         ? "bg-blue-900 cursor-not-allowed"
//                         : "bg-blue-700 hover:bg-blue-800"
//                         } text-white`}
//                 >
//                     Previous
//                 </button>
//                 <p className="text-sm text-gray-400">
//                     Exercise {currentLessonIndex + 1} of {lessonsData.length}
//                 </p>
//                 {/* allCOrrect check, prevent user from next page */}
//                 <div className="relative group">
//                     <button
//                         onClick={handleNext}
//                         disabled={!allCorrect || currentLessonIndex === lessonsData.length - 1}
//                         className={`mr-4 px-4 py-0 rounded-full ${currentLessonIndex === lessonsData.length - 1
//                             ? "bg-blue-900 cursor-not-allowed"
//                             : "bg-blue-700 hover:bg-blue-800"
//                             } text-white`}
//                     >
//                         Next
//                     </button>
//                     {!allCorrect && (
//                         <div className="absolute bottom-full left-1/3 transform -translate-x-1/2 mb-2 bg-teal-600 text-white text-xs rounded-lg py-2 pl-2 pr-0 w-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
//                             Complete all questions first
//                             <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
//                         </div>
//                     )}
//                 </div>
                
//             </div>
//         </div>
//     );
// };

// export default ExercisesPage;




//     // const handleSubmitSolution = async (exerciseId, userSolution, exerciseQuestion, correctAnswer) => {

//     //     // ensure userSolution is not empty or undefined before making API call
//     //     if (!userSolution || userSolution.trim() === "") {
//     //         alert("Please enter a solution before submitting.");
//     //         return;
//     //     }
    
//     //     const cleanedSolution = cleanLatexInput(userSolution);
    
//     //     // store users submitted solution
//     //     setSubmittedSolutions((prev) => ({
//     //         ...prev,
//     //         [exerciseId]: userSolution,
//     //     }));
//     //     setIsTyping(true);
    
//     //     try {
//     //         const response = await fetch('http://localhost:5000/api/validate-solution', {
//     //             method: 'POST',
//     //             headers: {
//     //                 'Content-Type': 'application/json',
//     //             },
//     //             body: JSON.stringify({ question: exerciseQuestion, userSolution: cleanedSolution, correctAnswer })
//     //         });
    
//     //         // error handling
//     //         if (!response.ok) {
//     //             throw new Error('Network response was not ok');
//     //         }
    
//     //         // getting readable stream from 'response body'
//     //         const reader = response.body.getReader();
//     //         const decoder = new TextDecoder('utf-8'); // creating TextDecoder to convert bytes to text
    
//     //         let solutionResponse = ''; // to accumulate the assistant's response
//     //         let correctFlag = null;     // Track whether the solution is correct

//     //         // continuously reading from stream until done
//     //         while (true) {
//     //             // reading next chunk of data
//     //             const { done, value } = await reader.read();
//     //             if (done) break; // exiting loop when no more data
    
//     //             // decoding chunk of data from bytes to string
//     //             const chunk = decoder.decode(value, { stream: true });
//     //             const lines = chunk.split('\n').filter(line => line.trim() !== ''); // splitting chunk into lines, filtering out empty lines
    
//     //             // going through each line of chunk
//     //             for (const line of lines) {
//     //                 // processing data if line starts with 'data: '
//     //                 if (line.startsWith('data: ')) {
//     //                     // removing 'data: ' from start of line
//     //                     const data = line.replace('data: ', '');
    
//     //                     // if data is '[DONE]', stop processing
//     //                     if (data === '[DONE]') {
//     //                         setGptResults((prev) => ({
//     //                             ...prev,
//     //                             [exerciseId]: solutionResponse
//     //                         }));

//     //                         if (correctFlag !== null){
//     //                             setCorrectAnswers((prev) => ({
//     //                                 ...prev, [exerciseId]: correctFlag,
//     //                             }))
//     //                         }

//     //                         // processing if solution is correct
//     //                         // extracting result as json
//     //                         // const result = await response.json()
//     //                         // const isCorrect = result.correct
//     //                         setIsTyping(false);
//     //                         return;
//     //                     }
    
//     //                     try {
//     //                         // parsing data into JSON format
//     //                         const parsed = JSON.parse(data);
//     //                         const text = parsed.content || ''; // extracting content (text) from parsed data
                            
//     //                         solutionResponse += text; // appending to solution response

//     //                         if (parsed.correct !== undefined){
//     //                             correctFlag = parsed.correct;
//     //                         }
    
//     //                         // updating state with the latest assistant response
//     //                         setGptResults((prev) => ({
//     //                             ...prev,
//     //                             [exerciseId]: solutionResponse
//     //                         }));
//     //                     } catch (error) {
//     //                         console.error('Error parsing streaming data:', error);
//     //                     }
//     //                 }
//     //             }
//     //         }
//     //     } catch (error) {
//     //         // error handling during fetch requests or streaming process
//     //         console.error('Error validating solution:', error);
//     //         setGptResults((prev) => ({
//     //             ...prev,
//     //             [exerciseId]: 'An error occurred while validating the solution.'
//     //         }));
//     //         setIsTyping(false); // stopping the gpts typing indication
//     //     }
//     // };

//     // jk
























//     import React, { useEffect, useRef, useState } from "react";
// import {useLessonProgress} from './LessonProgressContext';
// import { marked } from "marked";
// import DOMPurify from "dompurify";
// import { supabase } from "../supabaseClient";
// import LatexRenderer from "./LatexRenderer";
// import { MathfieldElement } from 'mathlive'
// import '/node_modules/mathlive/dist/mathlive-static.css';
// import '/node_modules/mathlive/dist/mathlive-fonts.css';
// import ReactMarkdown from 'react-markdown';
// import remarkMath from 'remark-math';
// import rehypeKatex from 'rehype-katex';
// import 'katex/dist/katex.min.css';
// import hljs from 'highlight.js';
// import 'highlight.js/styles/atom-one-dark.css';
// import remarkGfm from 'remark-gfm'


// const MathLiveInput = ({value, onChange, onFocus}) => {

//     const mathfieldRef = useRef(null);

//     useEffect(() => {
//         const mathfield = mathfieldRef.current;
//         if (mathfield) {
//             mathfield.value = value;
//             const handleInput = () => {
//                 onChange(mathfield.value);
//             }
//             mathfield.addEventListener("input", handleInput)
//             return () => {
//                 mathfield.removeEventListener("input", handleInput);
//             }
//         }
//     }, [value, onChange]);

//     return <math-field ref={mathfieldRef} onFocus={onFocus}/>;
// }

// const ExercisesPage = () => {

//     const [user, setUser] = useState(null);
//     const [userId, setUserId] = useState(null);
//     // State to hold exercises data fetched from the database
//     const [exercisesData, setExercisesData] = useState([]);
//     const [groupedExercises, setGroupedExercises] = useState({});
//     // pre determined correct answers
//     const [correctAnswers, setCorrectAnswers] = useState({});
//     // State to keep track of current lesson index
//     const [currentExerciseIndex, setcurrentExerciseIndex] = useState(() => {
//         const savedIndex = sessionStorage.getItem("currentExerciseIndex");
//         return savedIndex ? parseInt(savedIndex, 10) : 0;
//     });
//     // Toggle hint
//     const [showHint, setShowHint] = useState({});
//     const [showGPTFeedback, setShowGPTFeedback] = useState({});
//     // loading and error states
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [isTyping, setIsTyping] = useState(false);

//     const [submittedSolutions, setSubmittedSolutions] = useState({});
//     const [inputAlert, setInputAlert] = useState({});
//     const [gptResults, setGptResults] = useState({});

//     const [userSolution, setUserSolution] = useState("");

//     const [lessonsData, setLessonsData] = useState([]);
//     // fetching user info
//     useEffect(() => {
//         const fetchUser = async () => {
//             const {data, error} = await supabase.auth.getUser()
//             if (error) {
//                 console.error("Error fetching user:", error.message)
//             }
//             else {
//                 setUser(data.user)
//                 setUserId(data.user?.id);
//             }
//         }
//         fetchUser();
//     }, [])
//     // fetching exercise & lessons
//     useEffect(() => {
//         const fetchExercises = async () => {
//             const { data, error } = await supabase
//                 .from("exercises") // ensure table name matches exactly
//                 .select("*, answer") // added answer column, not sure if needed since * selects all ?
//                 .order("exercise_id", { ascending: true }); // order by 'id' column in ascending order

//             if (error) {
//                 console.error("Error fetching exercises:", error.message);
//                 setError(error.message);
//             } else {
//                 // grouping exercises by lesson_id for easier access
//                 const grouped = data.reduce((acc, exercise) => {
//                     if (!acc[exercise.lesson_id]) {
//                         acc[exercise.lesson_id] = [];
//                     }
//                     acc[exercise.lesson_id].push(exercise);
//                     return acc;
//                 }, {});

//                 setGroupedExercises(grouped);
//                 setExercisesData(data);
//                 setLoading(false);
//             }
//         };

//         const fetchLessons = async () => {
//             const { data, error } = await supabase
//                 .from("lessons")
//                 .select("*")
//                 .order("lesson_id", { ascending: true });

//             if (error) {
//                 console.error("Error fetching lessons:", error.message);
//                 setError(error.message);
//             } else {
//                 setLessonsData(data);
//             }
//         };

//         fetchExercises();
//         fetchLessons();
//     }, []);

//     // determine current lesson and exercises

//     // get all unique lesson Ids
//     const lessonIds = Object.keys(groupedExercises);
//     // get exercises for current lesson id based on currentExerciseIndex
//     const currentLessonId = lessonIds[currentExerciseIndex];
//     const currentExercises = groupedExercises[currentLessonId] || [];
//     const currentLessonIndex = lessonsData.findIndex(lesson => lesson.lesson_id === parseInt(currentLessonId));

//     const cleanLatexInput = (latexInput) => {

//         return latexInput
//             .replace(/\$\$/g, '') // Remove dollar signs used for wrapping
//             .replace(/\\left/g, '') // Remove LaTeX commands like \left
//             .replace(/\\right/g, '') // Remove \right
//             .replace(/\\text\{([^}]+)\}/g, '$1') // Convert \text{...} to plain text
//             .replace(/\\middle\{\|}/g, '|') // Replace LaTeX middle commands
//             .replace(/\\le/g, '<=') // Replace \le with <=
//             .replace(/\\ge/g, '>=') // Replace \ge with >=
//             .replace(/\\times/g, '*') // Replace \times with *
//             .replace(/\\div/g, '/') // Replace \div with /
//             .replace(/\\cdot/g, '*') // Replace \cdot with *
//             .replace(/\\pm/g, '+/-') // Replace \pm with +/-
//             .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)') // Convert square root
//             .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)') // Convert fractions to division
//             .replace(/\\sum/g, 'sum') // Replace sum notation
//             .replace(/\\infty/g, 'infinity') // Replace infinity symbol
//             .replace(/\\neq/g, '!=') // Replace not equal
//             .replace(/\\approx/g, '~=') // Replace approximately equal
//             .replace(/\\pi/g, 'pi') // Replace pi symbol
//             .replace(/\\alpha/g, 'alpha') // Greek letters example
//             .replace(/\\beta/g, 'beta') // Greek letters example
//             .replace(/\\gamma/g, 'gamma') // Greek letters example
//             .replace(/\\ldots/g, '...') // Replace ellipsis
//             .replace(/[{}]/g, '') // Remove curly braces
//             .trim();
//     };

//     // GPT api call as Math validator
//     const handleSubmitSolution = async (exerciseId, userSolution, exerciseQuestion, correctAnswer) => {

//         if (!userSolution || userSolution.trim() === "") {
//             setInputAlert((prev) => ({...prev, [exerciseId]: true}));
//             return;
//         }

//         setInputAlert((prev) => ({...prev, [exerciseId]: false})); // clear if valid input

//         const cleanedSolution = cleanLatexInput(userSolution);

//         // store users submitted solution
//         setSubmittedSolutions((prev) => ({
//             ...prev,
//             [exerciseId]: userSolution,
//         }));
//         setIsTyping(true);

//         try {
//             // standard api call instead of streaming api
//             const response = await fetch('http://localhost:5000/api/validate-solution', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ question: exerciseQuestion, userSolution: cleanedSolution, correctAnswer })
//             });

//             // check if the response is ok
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }

//             // get JSON result from backend
//             const result = await response.json();
//             // console.log("Received from backend:", result);
//             // extract the 'correct' flag and 'feedback' from the result
//             const { correct, feedback } = result;

//             // update the state for correctness flag
//             setCorrectAnswers((prev) => ({
//                 ...prev,
//                 [exerciseId]: correct,
//             }));

//             // update state for GPT feedback
//             setGptResults((prev) => ({
//                 ...prev,
//                 [exerciseId]: feedback,
//             }));

//             setIsTyping(false);

//         } catch (error) {
//             // error handling for failed requests
//             console.error('Error validating solution:', error);
//             setGptResults((prev) => ({
//                 ...prev,
//                 [exerciseId]: 'An error occurred while validating the solution.'
//             }));
//             setIsTyping(false);
//         }
//     };

//     useEffect(() => {
//         // Loop through correctAnswers and trigger progress update for the correct ones
//         Object.keys(correctAnswers).forEach(async (exerciseId) => {
//             if (correctAnswers[exerciseId]) {
//                 await updateExerciseProgress(exerciseId); // Only update for correct answers
//             }
//         });
//     }, [correctAnswers]); // Runs whenever correctAnswers state changes

//     const updateExerciseProgress = async (exerciseId) => {

//         try {
//             // updating userprogress
//             if (userId) {
//                 const { data: progressData, error: progressError } = await supabase
//                     .from("userprogress")
//                     .select('*')
//                     .eq('user_id', userId)
//                     .eq('exercise_id', exerciseId)
//                     .single(); // checking if progress for this exercise exists

//                 if (!progressData) {
//                     // insert new progress for this exercise
//                     const { error: insertError } = await supabase
//                         .from("userprogress")
//                         .insert({
//                             user_id: userId,
//                             exercise_id: exerciseId,
//                             completed: true,
//                             completed_at: new Date(),
//                         });
//                     if (insertError) {
//                         console.error("Error inserting progress:", insertError.message)
//                         return;
//                     }
//                 } else {
//                     // updating existing progress for this exercise
//                     const { error: updateError } = await supabase
//                         .from("userprogress")
//                         .update({
//                             completed: true,
//                             completed_at: new Date(),
//                         })
//                         .eq('user_id', userId)
//                         .eq('exercise_id', exerciseId);

//                     if (updateError) {
//                         console.error("Error updating progress:", updateError);
//                         return;
//                     }
//                 }
//                 // console.log("Progress updated for exercise:", exerciseId);
//             } else {
//                 // non logged in users
//                 const completedExercises = JSON.parse(sessionStorage.getItem('completedExercises')) || {};
//                 completedExercises[exerciseId] = true;
//                 sessionStorage.setItem('completedExercises', JSON.stringify(completedExercises));
//             }
//         } catch (error){
//             console.error("Error updating exercise progress:", error)
//         }
//     }

//     const renderContent = (question) => {

//         // console.log(question)
//         // regex to detect latex code between $...$ or $$...$$
//         const latexRegex = /\$\$(.*?)\$\$|\$(.*?)\$/g;
//         // regex to check if latex already wrapped  with $$..$$ or \(..\)
//         const alreadyWrappedLatex = /(\$\$(.*?)\$\$)|\\\((.*?)\\\)/g
//         // detect raw latex without wrappings
//         const rawLatexRegex = /\\(frac|sum|int|left|right|cdots|dots|binom|sqrt|text|over|begin|end|matrix|[A-Za-z]+)\b/g
//         // Check if question contains LaTeX
//         const hasLatex = latexRegex.test(question);
//         // check for no latex wrappings
//         const hasRawLatex = rawLatexRegex.test(question)

//         if (hasLatex || hasRawLatex) {

//             if (hasRawLatex) {
//                 const wrappedLatex = `$$ ${question} $$`
//                 // console.log(wrappedLatex)
//                 return (
//                     <div className="math-block overflow-x-auto">
//                     <ReactMarkdown
//                         children={wrappedLatex}
//                         remarkPlugins={[remarkMath, remarkGfm]}
//                         rehypePlugins={[rehypeKatex]}
//                         className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-full break-words"
//                     />
//                     </div>
//                 )
//             }
//             else if (hasLatex) {
//                 return <LatexRenderer question={question}/>
//             }
//         }
//         else {
//             // Render non-LaTeX question as plain HTML
//             return (
//                 <div
//                     dangerouslySetInnerHTML={{
//                         __html: DOMPurify.sanitize(marked(question)),
//                     }}
//                 />
//             );
//         }
//     };

//     const {setAllExercisesCompleted} = useLessonProgress(); // Import the context function
//     // const allCorrect = currentExercises.every((exercise) => correctAnswers[exercise.exercise_id]);
//     const allCorrect = currentExercises.length > 0 && currentExercises.every((exercise) => correctAnswers[exercise.exercise_id]);

//     // When moving to a new page, reset allCorrect and correctAnswers
//     useEffect(() => {
//         // Reset correctAnswers and the completion state when a new set of exercises is loaded
//         setCorrectAnswers({});
//         setAllExercisesCompleted(false);  // Reset the context to lock the buttons again
//         setSubmittedSolutions({}); // Optionally, reset submitted solutions for the new page
//     }, [currentExerciseIndex, setAllExercisesCompleted]); // Runs when moving to a new exercise page    

//     // calculating if all answers are correct for the current set of exercises

//     // // notifying main page / lessons page if all exercises completed
//     // useEffect(() => {
//     //     if (typeof onLessonCompletion === 'function'){ // only call if its defined
//     //         onLessonCompletion(allCorrect)
//     //     }
//     // }, [allCorrect, onLessonCompletion]) 

//     // checking completion status 
//     useEffect(() => {

//         // Update the context state when all exercises are completed
//         if (allCorrect) {
//             setAllExercisesCompleted(true);
//         } else {
//             setAllExercisesCompleted(false);
//         }

//         const checkExerciseCompletion = async () => {
//             if (!currentLessonId) return;

//             if (userId) {
//                 // logged in users - checking completion in supabase
//                 const {data, error} = await supabase
//                     .from("userprogress")
//                     .select("exercise_id, completed")
//                     .eq("user_id", userId)
//                     .in("exercise_id", currentExercises.map(ex => ex.exercise_id)); // Filter by the current exercise IDs
//                     // .eq("lesson_id", currentLessonId)
//                     // .single();

//                 if (error) {
//                     if (error.code === 'PGRST116') { // no data found
//                         // not completed - do nothing
//                         // maybe reset correctAnswers if needed
//                     } else {
//                         console.error("Error checking lesson completion:", error.message);
//                     }
//                 } else {
//                     const completedExercises = data.reduce((acc, progress) => {
//                         if (progress.completed) {
//                             acc[progress.exercise_id] = true;
//                         }
//                         return acc;
//                     }, {});
//                     // if (data.completed) {
//                     //     // lesson already completed - marking all exercises as correct
//                     //     const allCorrectMap = currentExercises.reduce((acc, exercise) => {
//                     //         acc[exercise.exercise_id] = true;
//                     //         return acc;
//                     //     }, {});
//                         // setCorrectAnswers(allCorrectMap);
//                     setCorrectAnswers(completedExercises)
                    
//                 }
//             } else {
//                 // non logged in users - checking completion in sessionStorage
//                 const completedExercises = JSON.parse(sessionStorage.getItem('completedExercises')) || {};
//                 const completedForThisLesson = currentExercises.reduce((acc, exercise) => {
//                     if (completedExercises[exercise.exercise_id]) {
//                         acc[exercise.exercise_id] = true;
//                     }
//                     return acc;
//                 }, {});
//                 setCorrectAnswers(completedForThisLesson);
//             }
//             //     const completedLessons = JSON.parse(sessionStorage.getItem('completedLessons')) || {};
//             //     if (completedLessons[currentLessonId]) {
//             //         // lesson already completed - marking all exercises as correct
//             //         const allCorrectMap = currentExercises.reduce((acc, exercise) => {
//             //             acc[exercise.exercise_id] = true;
//             //             return acc;
//             //         }, {});
//             //         setCorrectAnswers(allCorrectMap);
//             //     }
//             // }
//         };
//         checkExerciseCompletion();
//     }, [currentLessonId, userId, currentExercises]); // setAllExercisesCompleted, correctAnswers

//     // update completion status when all correct
//     useEffect(() => {
//         console.log('useEffect triggered');
//         console.log('allCorrect:', allCorrect);
//         console.log('currentLessonId:', currentLessonId);
//         console.log('userId:', userId);
//         if (allCorrect && currentLessonId) {
//             if (userId) {
//                 // logged in users - updating supabase
//                 const markLessonCompleted = async () => {
//                     const {error} = await supabase
//                         .from("userprogress")
//                         .upsert(
//                             {
//                                 user_id: userId,
//                                 lesson_id: currentLessonId,
//                                 completed: true,
//                                 completed_at: new Date(),
//                             },
//                             {onConflict: ['user_id', 'lesson_id']} // ensuring upsert on user_id and lesson_id
//                         );
//                     if (error) {
//                         console.error("Error updating lesson completion:", error.message);
//                     } else {
//                         console.log(`Lesson ${currentLessonId} marked as completed for user ${user.id}`);
//                     }
//                 };
//                 markLessonCompleted();
//             } else {
//                 // non logged in users - updating sessionStorage
//                 const completedLessons = JSON.parse(sessionStorage.getItem('completedLessons')) || {};
//                 completedLessons[currentLessonId] = true;
//                 sessionStorage.setItem('completedLessons', JSON.stringify(completedLessons));
//                 console.log(`Lesson ${currentLessonId} marked as completed in sessionStorage`);
//             }
//         }
//     }, [allCorrect, currentLessonId, userId]);

//     // Function to update the userprogress table
//     const updateProgress = async (lessonId, completed = false) => {
//         if (!userId) {
//             // console.warn("No user is logged in. Progress update aborted.");
//             const updatedCompletedLessons = { ...completedLessons, [lessonId]: completed };
//             setCompletedLessons(updatedCompletedLessons);
//             sessionStorage.setItem('completedLessons', JSON.stringify(updatedCompletedLessons));
//             return; // Abort the update if no user is logged in
//         }

//         const { data: progressData, error: progressError } = await supabase
//             .from("userprogress")
//             .select('*')
//             .eq('user_id', userId)
//             .eq('lesson_id', lessonId)
//             .single(); // Check if the progress for this lesson already exists

//         if (progressError && progressError.code !== 'PGRST116') {
//             console.error("Error fetching progress:", progressError.message);
//         }

//         if (!progressData) {
//             // If no progress data exists, insert a new row with a completion timestamp
//             const { error: insertError } = await supabase
//                 .from("userprogress")
//                 .insert({
//                     user_id: userId,
//                     lesson_id: lessonId,
//                     completed: completed,
//                     completed_at: new Date(), // Add timestamp
//                 });

//             if (insertError) {
//                 console.error("Error inserting progress:", insertError.message);
//                 return;
//             }
//         } else {
//             // If progress data already exists, update it with a new timestamp
//             const { error: updateError } = await supabase
//                 .from("userprogress")
//                 .update({
//                     completed: completed,
//                     completed_at: new Date(), // Update timestamp
//                 })
//                 .eq('user_id', userId)
//                 .eq('lesson_id', lessonId);

//             if (updateError) {
//                 console.error("Error updating progress:", updateError);
//                 return;
//             }
//         }
//         console.log("Progress updated for lesson:", lessonId);
//         setCompletedLessons(prev => ({
//             ...prev, [lessonId]: completed,
//         }));
//     };
    
//     // handling navigation buttons
//     const handlePrevious = () => {
//         const newIndex = currentExerciseIndex - 1;
//         setcurrentExerciseIndex(newIndex);
//         sessionStorage.setItem("currentExerciseIndex", newIndex);
//         // setShowHint(false);
//         setUserSolution("");
//     };

//     const handleNext = () => {
//         // const lessonId = lessonsData[currentLessonIndex].lesson_id;
//         const newIndex = currentExerciseIndex + 1;

//         if (allCorrect) {
//             setcurrentExerciseIndex(newIndex);
//             sessionStorage.setItem("currentExerciseIndex", newIndex);
//             setUserSolution("");  // Reset solution field for the new page
//         } else {
//             // Show an alert or prevent navigation if all exercises aren't correct
//             alert("Please complete all exercises before moving to the next page.");
//         }
    
//         // updateProgress(lessonId, true);
//         // setcurrentExerciseIndex(newIndex);
//         // sessionStorage.setItem("currentExerciseIndex", newIndex);
//         // setShowHint(false);
//         // setUserSolution("");
//     };
//     // hint + feedback toggling
//     const toggleHint = (exerciseId) => {
//         setShowHint((prevState) => ({
//             ...prevState, [exerciseId]: !prevState[exerciseId],
//         }));
//     };

//     const toggleGPTFeedback = (exerciseId) => {
//         setShowGPTFeedback((prevState) => ({
//             ...prevState, [exerciseId]: !prevState[exerciseId],
//         }));
//     };
//     // render component
//     if (loading) return <p>Loading exercises...</p>;
//     if (error) return <p>{error}</p>;
//     // const currentExercise = exercisesData[currentExerciseIndex];

//     return (
//         <div className="flex flex-col h-full">
//             {currentLessonId && (
//                 <h2 className="text-xl font-bold mb-1">Lesson {currentLessonIndex + 1}</h2>
//             )}
//             <div className="flex-1 overflow-y-auto pl-4 pb-4 bg-gray-900 rounded prose prose-sm sm:prose lg:prose-lg text-white w-full override-max-width">
//                 {currentExercises.map((exercise) => (
//                     <div key={exercise.exercise_id} className="mb-36 pl-4 pb-4 bg-gray-900 rounded prose prose-sm sm:prose lg:prose-lg text-white w-full override-max-width">
//                         {renderContent(exercise.question)}                         
//                         {/* MathLiveInput for the exercise */}
//                         <div className="relative mt-16">
//                             <MathLiveInput
//                                 value={submittedSolutions[exercise.exercise_id] || ""}
//                                 onChange={(value) => setSubmittedSolutions({
//                                     ...submittedSolutions,
//                                     [exercise.exercise_id]: value,
//                                 })}
//                                 onFocus={() => setInputAlert(false)}
//                             />
//                             <button
//                                 onClick={() =>
//                                     handleSubmitSolution(exercise.exercise_id, submittedSolutions[exercise.exercise_id], exercise.question, exercise.answer)
//                                 }
//                                 className="ml-3 px-1 py-0 bg-blue-700 hover:bg-blue-600 active:bg-blue-900 focus:outline-none 
//                                  focus:ring-2 focus:ring-blue-500 text-white rounded-full transform transition duration-200 ease-in-out hover:scale-105 active:scale-95"
//                                 disabled={isTyping}
//                             >
//                                 Submit Solution
//                             </button>
//                             {inputAlert[exercise.exercise_id] && (
//                                 <div className="absolute bottom-full left-8 mb-2 mt-1 bg-teal-600 text-white text-xs rounded py-1 px-2 w-60 z-10">
//                                     Please enter a solution before submitting
//                                     <div className="absolute left-28 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
//                                 </div>
//                             )}
//                         </div>
//                         {/* Show user's submitted solution */}
//                         {submittedSolutions[exercise.exercise_id] && (
//                             <div className="mt-4">
//                                 <h4 className="text-md font-semibold">Your Solution:</h4>
//                                 <div className="mb-4">
//                                     {renderContent(submittedSolutions[exercise.exercise_id])}
//                                 </div>
//                             </div>
//                         )}
//                         {/* Display GPT Results validation for in/correct*/}
//                         {correctAnswers[exercise.exercise_id] !== undefined && (
//                             <div className="mt-4">
//                                 <h4 className={`text-md font-semibold ${correctAnswers[exercise.exercise_id] ? 'correct-answer' : 'incorrect-answer'}`}>
//                                     {correctAnswers[exercise.exercise_id] ? 'Your solution is correct! Well Done.' : 'Your solution is incorrect.'}
//                                 </h4>
//                             </div>    
//                         )}
//                         {/* hint + feedback buttons */}
//                         <div className="mt-5">
//                             <button
//                                 onClick={() => toggleHint(exercise.exercise_id)}
//                                 className="mt-1 px-2 py-0 bg-gray-600 hover:bg-gray-500 focus:outline-none 
//                                  focus:ring-2 focus:ring-gray-500 rounded-full text-white"
//                             >
//                                 {showHint[exercise.exercise_id] ? 'Hide Hint' : 'Show Hint'}
//                             </button>
//                             {/* GPT feedback button if feedback response exists*/}
//                             {gptResults[exercise.exercise_id] && (
//                                 <button
//                                     onClick={() => toggleGPTFeedback(exercise.exercise_id)}
//                                     className="mt-1 ml-5 px-2 py-1 bg-gradient-to-r from-yellow-900 to-yellow-700 hover:from-yellow-800 hover:to-yellow-600 
//                                      focus:outline-none focus:ring-2 focus:ring-yellow-600 rounded-full text-white"
//                                 >
//                                     {showGPTFeedback[exercise.exercise_id] ? 'Hide Tutor Feedback' : 'Show Tutor Feedback'}
//                                 </button>
//                             )}
//                         </div>
//                         {/* display hint from database */}
//                         {showHint[exercise.exercise_id] && (
//                             <div className="mt-2 pb-1 pt-0 px-2 bg-gray-600 rounded">
//                                 <h3 className="text-md font-semibold mb-1">Hint:</h3>
//                                 <div className="text-sm">{renderContent(exercise.hint)}</div>
//                             </div>
//                         )}
//                         {/* display GPT feedback when the button is clicked */}
//                         {showGPTFeedback[exercise.exercise_id] && (
//                             <div className="mt-2">
//                                 <h4 className="text-md font-semibold">Tutor Feedback:</h4>
//                                 <LatexRenderer content={gptResults[exercise.exercise_id]} />
//                             </div>
//                         )}
//                         {isTyping && (
//                             <div className='mb-2 text-left'>
//                                 <img className='typing-gif' alt='... ...' src='/loading2.1.gif' />
//                             </div>
//                         )}
//                     </div>
//                 ))}
//             </div>
//             <div className="mt-1 flex justify-between">
//                 <button
//                     onClick={handlePrevious}
//                     disabled={currentLessonIndex === 0}
//                     className={`px-2 py-0 rounded-full ${currentLessonIndex === 0
//                         ? "bg-blue-900 cursor-not-allowed"
//                         : "bg-blue-700 hover:bg-blue-800"
//                         } text-white`}
//                 >
//                     Previous
//                 </button>
//                 <p className="text-sm text-gray-400">
//                     Exercise {currentLessonIndex + 1} of {lessonsData.length}
//                 </p>
//                 {/* allCOrrect check, prevent user from next page */}
//                 <div className="relative group">
//                     <button
//                         onClick={handleNext}
//                         disabled={!allCorrect || currentLessonIndex === lessonsData.length - 1}
//                         className={`mr-4 px-4 py-0 rounded-full ${currentLessonIndex === lessonsData.length - 1
//                             ? "bg-blue-900 cursor-not-allowed"
//                             : "bg-blue-700 hover:bg-blue-800"
//                             } text-white`}
//                     >
//                         Next
//                     </button>
//                     {!allCorrect && (
//                         <div className="absolute bottom-full left-1/3 transform -translate-x-1/2 mb-2 bg-teal-600 text-white text-xs rounded-lg py-2 pl-2 pr-0 w-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
//                             Complete all questions first
//                             <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
//                         </div>
//                     )}
//                 </div>
                
//             </div>
//         </div>
//     );
// };

// export default ExercisesPage;




//     // const handleSubmitSolution = async (exerciseId, userSolution, exerciseQuestion, correctAnswer) => {

//     //     // ensure userSolution is not empty or undefined before making API call
//     //     if (!userSolution || userSolution.trim() === "") {
//     //         alert("Please enter a solution before submitting.");
//     //         return;
//     //     }
    
//     //     const cleanedSolution = cleanLatexInput(userSolution);
    
//     //     // store users submitted solution
//     //     setSubmittedSolutions((prev) => ({
//     //         ...prev,
//     //         [exerciseId]: userSolution,
//     //     }));
//     //     setIsTyping(true);
    
//     //     try {
//     //         const response = await fetch('http://localhost:5000/api/validate-solution', {
//     //             method: 'POST',
//     //             headers: {
//     //                 'Content-Type': 'application/json',
//     //             },
//     //             body: JSON.stringify({ question: exerciseQuestion, userSolution: cleanedSolution, correctAnswer })
//     //         });
    
//     //         // error handling
//     //         if (!response.ok) {
//     //             throw new Error('Network response was not ok');
//     //         }
    
//     //         // getting readable stream from 'response body'
//     //         const reader = response.body.getReader();
//     //         const decoder = new TextDecoder('utf-8'); // creating TextDecoder to convert bytes to text
    
//     //         let solutionResponse = ''; // to accumulate the assistant's response
//     //         let correctFlag = null;     // Track whether the solution is correct

//     //         // continuously reading from stream until done
//     //         while (true) {
//     //             // reading next chunk of data
//     //             const { done, value } = await reader.read();
//     //             if (done) break; // exiting loop when no more data
    
//     //             // decoding chunk of data from bytes to string
//     //             const chunk = decoder.decode(value, { stream: true });
//     //             const lines = chunk.split('\n').filter(line => line.trim() !== ''); // splitting chunk into lines, filtering out empty lines
    
//     //             // going through each line of chunk
//     //             for (const line of lines) {
//     //                 // processing data if line starts with 'data: '
//     //                 if (line.startsWith('data: ')) {
//     //                     // removing 'data: ' from start of line
//     //                     const data = line.replace('data: ', '');
    
//     //                     // if data is '[DONE]', stop processing
//     //                     if (data === '[DONE]') {
//     //                         setGptResults((prev) => ({
//     //                             ...prev,
//     //                             [exerciseId]: solutionResponse
//     //                         }));

//     //                         if (correctFlag !== null){
//     //                             setCorrectAnswers((prev) => ({
//     //                                 ...prev, [exerciseId]: correctFlag,
//     //                             }))
//     //                         }

//     //                         // processing if solution is correct
//     //                         // extracting result as json
//     //                         // const result = await response.json()
//     //                         // const isCorrect = result.correct
//     //                         setIsTyping(false);
//     //                         return;
//     //                     }
    
//     //                     try {
//     //                         // parsing data into JSON format
//     //                         const parsed = JSON.parse(data);
//     //                         const text = parsed.content || ''; // extracting content (text) from parsed data
                            
//     //                         solutionResponse += text; // appending to solution response

//     //                         if (parsed.correct !== undefined){
//     //                             correctFlag = parsed.correct;
//     //                         }
    
//     //                         // updating state with the latest assistant response
//     //                         setGptResults((prev) => ({
//     //                             ...prev,
//     //                             [exerciseId]: solutionResponse
//     //                         }));
//     //                     } catch (error) {
//     //                         console.error('Error parsing streaming data:', error);
//     //                     }
//     //                 }
//     //             }
//     //         }
//     //     } catch (error) {
//     //         // error handling during fetch requests or streaming process
//     //         console.error('Error validating solution:', error);
//     //         setGptResults((prev) => ({
//     //             ...prev,
//     //             [exerciseId]: 'An error occurred while validating the solution.'
//     //         }));
//     //         setIsTyping(false); // stopping the gpts typing indication
//     //     }
//     // };

//     // jk
