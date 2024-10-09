import React, { useEffect, useState } from "react";
import { useLessonProgress } from './LessonProgressContext';
import { marked } from "marked";
import DOMPurify from "dompurify";
import { supabase } from "../supabaseClient";
import LatexRenderer from "./LatexRenderer";

const LessonsColumn = () => {
    const { allExercisesCompleted } = useLessonProgress(); // Use the context state
    // State to hold lessons data fetched from the database
    const [lessonsData, setLessonsData] = useState([]);
    // State to keep track of current lesson index
    const [currentLessonIndex, setCurrentLessonIndex] = useState(() => {
        const savedIndex = sessionStorage.getItem("currentLessonIndex");
        return savedIndex ? parseInt(savedIndex, 10) : 0;
    });
    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // State to manage user ID
    const [userId, setUserId] = useState(null);
    // State to hold completed lessons
    const [completedLessons, setCompletedLessons] = useState({}); // { lesson_id: true/false }
    // fetching lessons
    useEffect(() => {
        const fetchLessons = async () => {
            const { data, error } = await supabase
                .from('lessons') // Ensure the table name matches exactly
                .select('*')
                .order('lesson_id', { ascending: true }); // Order by 'lesson_id' column in ascending order

            if (error) {
                console.error('Error fetching lessons:', error.message);
                setError(error.message);
            } else {
                setLessonsData(data);
                setLoading(false);
            }
        };

        const fetchUserProgress = async () => {
            const { data, error } = await supabase.auth.getUser(); // data: { user }, error
            const user = data.user
            if (error) {
                console.error("Error fetching user:", error);
                setUserId(null);
                return;
            }

            setUserId(user ? user.id : null);

            if (user) {
                // Fetch user's progress from 'userprogress' table
                const { data: progressData, error: progressError } = await supabase
                    .from("userprogress")
                    .select("lesson_id, completed")
                    .eq("user_id", user.id)
                    .order("completed_at", { ascending: false })
                    .limit(1);  // Fetch the most recent lesson the user completed

                if (progressError) {
                    console.error("Error fetching user progress:", progressError.message);
                } else {
                    // convert to map for lookup
                    const completedMap = {}
                    progressData.forEach(progress => {
                        completedMap[progress.lesson_id] = progress.completed;
                    })
                    setCompletedLessons(completedMap);
                }
            } else {
                // for non logged in users
                const completed = JSON.parse(sessionStorage.getItem('completedLessons')) || {};
                setCompletedLessons(completed);
            }
        }
        fetchLessons().then(fetchUserProgress);

                // Set the current lesson index based on user's progress or default to 0
        //         if (progressData && progressData.length > 0) {
        //             const lastCompletedLessonId = progressData[0].lesson_id;
        //             const lastLessonIndex = lessonsData.findIndex(lesson => lesson.lesson_id === lastCompletedLessonId);

        //             if (lastLessonIndex !== -1) {
        //                 setCurrentLessonIndex(lastLessonIndex + 1); // Go to the next lesson
        //                 sessionStorage.setItem("currentLessonIndex", lastLessonIndex + 1);
        //             }
        //         }
        //     }
        // };

        // fetchLessons();
        // fetchUserProgress();
    }, []); // [lessonsData.length]

    // Function to update the userprogress table
    const updateProgress = async (lessonId, completed = false) => {
        if (!userId) {
            // console.warn("No user is logged in. Progress update aborted.");
            const updatedCompletedLessons = {...completedLessons, [lessonId]: completed};
            setCompletedLessons(updatedCompletedLessons);
            sessionStorage.setItem('completedLessons', JSON.stringify(updatedCompletedLessons));
            return; // Abort the update if no user is logged in
        }

        const { data: progressData, error: progressError } = await supabase
            .from("userprogress")
            .select('*')
            .eq('user_id', userId)
            .eq('lesson_id', lessonId)
            .single(); // Check if the progress for this lesson already exists

        if (progressError && progressError.code !== 'PGRST116') {
            console.error("Error fetching progress:", progressError.message);
        }

        if (!progressData) {
            // If no progress data exists, insert a new row with a completion timestamp
            const { error: insertError } = await supabase
                .from("userprogress")
                .insert({
                    user_id: userId,
                    lesson_id: lessonId,
                    completed: completed,
                    completed_at: new Date(), // Add timestamp
                });

            if (insertError) {
                console.error("Error inserting progress:", insertError.message);
                return;
            }
        } else {
            // If progress data already exists, update it with a new timestamp
            const { error: updateError } = await supabase
                .from("userprogress")
                .update({
                    completed: completed,
                    completed_at: new Date(), // Update timestamp
                })
                .eq('user_id', userId)
                .eq('lesson_id', lessonId);

            if (updateError) {
                console.error("Error updating progress:", updateError);
                return;
            }
        }
        console.log("Progress updated for lesson:", lessonId);
        setCompletedLessons(prev => ({
            ...prev, [lessonId]: completed,
        }));
    };

    const handlePrevious = () => {
        const newIndex = currentLessonIndex - 1;
        setCurrentLessonIndex(newIndex);
        sessionStorage.setItem("currentLessonIndex", newIndex);
    };

    const handleNext = () => {
        // const lessonId = lessonsData[currentLessonIndex].lesson_id;

        // if (allExercisesCompleted){
        //     updateProgress(lessonId, true);
        // }
        const newIndex = currentLessonIndex + 1;

        // Mark current lesson as completed and update user progress
        // updateProgress(lessonId, true);

        setCurrentLessonIndex(newIndex);
        sessionStorage.setItem("currentLessonIndex", newIndex);
    };

    if (loading) return <p>Loading lessons...</p>;
    if (error) return <p>{error}</p>;

    const currentLesson = lessonsData[currentLessonIndex];

    const renderContent = (content) => {
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

    const isLessonCompleted = completedLessons[currentLesson?.lesson_id];

    return (
        <div className="flex flex-col h-full">
            {currentLesson && (
                <h2 className="text-xl font-bold mb-1">{currentLesson.title}</h2>
            )}
            <div className="flex-1 overflow-y-auto pl-2 bg-gray-900 rounded prose prose-sm sm:prose lg:prose-lg text-white w-full override-max-width">
                {currentLesson && (
                    <>
                        {renderContent(currentLesson.content)}
                    </>
                )}
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
                    Lesson {currentLessonIndex + 1} of {lessonsData.length}
                </p>
                <div className="relative group">
                    <button
                        onClick={handleNext}
                        disabled={currentLessonIndex === lessonsData.length - 1} // !isLessonCompleted || 
                        className={`mr-2 px-4 py-0 rounded-full ${currentLessonIndex === lessonsData.length - 1
                            ? "bg-blue-900 cursor-not-allowed"
                            : "bg-blue-700 hover:bg-blue-800"
                            } text-white`}
                    >
                        Next
                    </button>
                    {/* {!isLessonCompleted && (
                        <div className="absolute bottom-full left-1/3 transform -translate-x-1/2 mb-2 bg-teal-600 text-white text-xs rounded-lg py-2 pl-2 pr-0 w-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                            Complete all questions first
                            <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-teal-600 border-x-8 border-x-transparent top-full"></div>
                        </div>
                    )} */}
                </div>
            </div>
        </div>
    );
};

export default LessonsColumn;
