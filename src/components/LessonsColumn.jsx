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
        setShowHint(false);
    };

    const handleNext = () => {
        const newIndex = currentLessonIndex + 1;
        setCurrentLessonIndex(newIndex);
        sessionStorage.setItem("currentLessonIndex", newIndex);
        setShowHint(false);
    };

    const toggleHint = () => {
        setShowHint(!showHint);
    };

    if (loading) return <p>Loading lessons...</p>;
    if (error) return <p>{error}</p>;

    const currentLesson = lessonsData[currentLessonIndex];

    return (
        <div className="flex flex-col h-full">
            {currentLesson && (
                <h2 className="text-xl font-bold mb-1">{currentLesson.title}</h2>
            )}
            <div className="flex-1 overflow-y-auto p-2 bg-gray-900 rounded prose prose-sm sm:prose lg:prose-lg text-white">
                {currentLesson && (
                    <>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(marked(currentLesson.content))
                            }}
                        />
                        {showHint && (
                            <div className="mt-4 pb-1 pt-0 px-2 bg-gray-600 rounded">
                                <h3 className="text-md font-semibold mb-1">Hint:</h3>
                                <p className="text-sm">{currentLesson.hint}</p>
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