import React, { useEffect, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { supabase } from "../supabaseClient"; // Ensure supabaseClient is properly configured

const LessonsColumn = () => {
    // State to hold lessons data fetched from the database
    const [lessonsData, setLessonsData] = useState([]);
    // State to keep track of current lesson index
    const [currentLessonIndex, setCurrentLessonIndex] = useState(() => {
        const savedIndex = sessionStorage.getItem("currentLessonIndex");
        return savedIndex ? parseInt(savedIndex, 10) : 0;
    });
    // Toggle hint
    const [showHint, setShowHint] = useState(false);
    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLessons = async () => {
            const { data, error } = await supabase
                .from('lessons') // Ensure the table name matches exactly
                .select('*');

            if (error) {
                console.error('Error fetching lessons:', error.message);
                setError(error.message);
            } else {
                setLessonsData(data);
                setLoading(false);
            }
        };

        fetchLessons();
    }, []);

    const handlePrevious = () => {
        const newIndex = currentLessonIndex - 1;
        setCurrentLessonIndex(newIndex);
        sessionStorage.setItem("currentLessonIndex", newIndex);
    };

    const handleNext = () => {
        const newIndex = currentLessonIndex + 1;
        setCurrentLessonIndex(newIndex);
        sessionStorage.setItem("currentLessonIndex", newIndex);
    };

    const toggleHint = () => {
        setShowHint(!showHint);
    };

    if (loading) return <p>Loading lessons...</p>;
    if (error) return <p>{error}</p>;

    const currentLesson = lessonsData[currentLessonIndex];

    return (
        <div className="lessons-column">
            <div className="lesson-content">
                {currentLesson && (
                    <>
                        <h2>{currentLesson.title}</h2>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(marked(currentLesson.content)),
                            }}
                        />
                        {showHint && (
                            <div className="hint">
                                <h3>Hint</h3>
                                <p>{currentLesson.hint}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className="mt-4 flex justify-between">
                <button
                    onClick={handlePrevious}
                    disabled={currentLessonIndex === 0}
                    className={`px-2 py-1 rounded ${currentLessonIndex === 0
                        ? "bg-blue-900 cursor-not-allowed"
                        : "bg-blue-700 hover:bg-blue-800"
                        } text-white`}
                >
                    Previous
                </button>
                <button
                    onClick={toggleHint}
                    className="px-2 py-1 bg-gray-500 hover:bg-gray-600 rounded text-white"
                >
                    {showHint ? "Hide Hint" : "Show Hint"}
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentLessonIndex === lessonsData.length - 1}
                    className={`px-4 py-1 rounded ${currentLessonIndex === lessonsData.length - 1
                        ? "bg-blue-900 cursor-not-allowed"
                        : "bg-blue-700 hover:bg-blue-800"
                        } text-white`}
                >
                    Next
                </button>
            </div>
            <p className="mt-2 text-sm text-gray-400">
                Lesson {currentLessonIndex + 1} of {lessonsData.length}
            </p>
        </div>
    );
};

export default LessonsColumn;