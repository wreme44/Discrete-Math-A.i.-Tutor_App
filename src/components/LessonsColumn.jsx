import React, { useEffect, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { supabase } from "../supabaseClient";
import LatexRenderer from "./LatexRenderer";

const LessonsColumn = () => {
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

    useEffect(() => {

        const fetchLessons = async () => {
            const { data, error } = await supabase
                .from('lessons') // Ensure the table name matches exactly
                .select('*')
                .order('lesson_id', { ascending: true }); // Order by 'id' column in ascending order

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
                <button
                    onClick={handleNext}
                    disabled={currentLessonIndex === lessonsData.length - 1}
                    className={`mr-2 px-4 py-0 rounded-full ${currentLessonIndex === lessonsData.length - 1
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

export default LessonsColumn;