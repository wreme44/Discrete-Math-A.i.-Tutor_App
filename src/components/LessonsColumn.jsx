import React, { useEffect, useState, useRef } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
// import { supabase } from "../supabaseClient";
import LatexRenderer from "./LatexRenderer";
// import { useNavigate } from "react-router-dom";

const LessonsColumn = ({
    allCorrect, onLessonChange, onPrevLessonButton,
    lessonsData, completedLessons}) => {
    // State to hold lessons data fetched from the database
    // const [lessonsData, setLessonsData] = useState([]);
    // State to keep track of current lesson index
    const [currentLessonIndex, setCurrentLessonIndex] = useState(() => {
        const savedIndex = sessionStorage.getItem("currentLessonIndex");
        return savedIndex ? parseInt(savedIndex, 10) : 0;
    });
    // Loading and error states
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);
    // State to manage user ID
    // const [userId, setUserId] = useState(null);
    // State to hold completed lessons
    // const [completedLessons, setCompletedLessons] = useState({}); // { lesson_id: true/false }
    // ref to scroll to top at next/prev page
    const scrollableContainerRef = useRef(null);
    // const lessonContainerRef = useRef(null); // annother way to enlarge images

    // scroll to top of next/prev page
    useEffect(() => {
        if (scrollableContainerRef.current) {
            scrollableContainerRef.current.scrollTop = 0;
        }
        // window.scrollTo(0, 0)
    }, [currentLessonIndex])

    // Previous and Next buttons
    const handlePrevious = () => {
        const newIndex = currentLessonIndex - 1;
        setCurrentLessonIndex(newIndex);
        sessionStorage.setItem("currentLessonIndex", newIndex);
        onPrevLessonButton(); // unlocking next page button again by setting prev lesson to completed 
    };

    const handleNext = () => {
        const newIndex = currentLessonIndex + 1;
        setCurrentLessonIndex(newIndex);
        sessionStorage.setItem("currentLessonIndex", newIndex);
        onLessonChange(); // Resetting exercise completion
    };

    // if (loading) return <p>Loading lessons...</p>;
    // if (error) return <p>{error}</p>;

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

    useEffect(() => {
        const modal = document.getElementById("imageModal");
        const modalImage = modal.querySelector("img");

        // either useRef or unique classname to prevent Zoom applying across web app (to icon buttons etc.)
        
        // if (lessonContainerRef.current) {
        //     const images = lessonContainerRef.current.querySelectorAll("img");
        //     images.forEach((image) => {
        //         image.classList.add("zoomable-image");
        //         image.addEventListener("click", () => {
        //             modal.classList.add("active");
        //             modalImage.src = image.src;
        //         });
        //     });
    
        //     const closeModal = () => modal.classList.remove("active");
        //     modal.addEventListener("click", closeModal);
        //     document.addEventListener("keydown", (e) => {
        //         if (e.key === "Escape") closeModal();
        //     });
    
        //     return () => {
        //         images.forEach((image) =>
        //             image.removeEventListener("click", () => {})
        //         );
        //         modal.removeEventListener("click", closeModal);
        //         document.removeEventListener("keydown", (e) => {
        //             if (e.key === "Escape") closeModal();
        //         });
        //     };
        // }
        const images = document.querySelectorAll(".IMGs-lessons img");
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
    }, [currentLesson])

    return (
        <div className="flex flex-col h-full -mt-2">
            {currentLesson && (
                <h2 className="xsm:text-[18px] sm:text-[20px] md:text-[16px] lg:text-[18px] xl:text-[20px] font-bold mb-1">{currentLesson.title}</h2>
            )} {/* ref={lessonContainerRef} */}
            <div ref={scrollableContainerRef} className="IMGs-lessons flex-1 overflow-y-auto pl-2 bg-gray-900 rounded prose prose-sm sm:prose lg:prose-lg text-white w-full override-max-width"> 
                {currentLesson && <>{renderContent(currentLesson.content)}</>}
            </div>
            <div className="modal" id="imageModal">
                <img alt="Zoomed view"/>
            </div>
            <div className="flex justify-between items-end -mb-1">
                <div className="relative flex mt-1 -mb-1">
                    <button
                        onClick={handlePrevious}
                        disabled={currentLessonIndex === 0}
                        className={`-mb-1 rounded-full w-8 h-8 ${currentLessonIndex === 0
                            ? "bg-blue-600 hover:bg-red-600"
                            : "bg-blue-500 hover:bg-blue-400"
                            }`}
                    >
                        <img className="prev-page-icon" alt="..." src="/prev-page.svg" />
                    </button>
                </div>
                <p className="text-sm text-gray-400">
                    Lesson {currentLessonIndex + 1} of {lessonsData.length}
                </p>
                <div className="relative group flex mt-1 -mb-1">
                    <button
                        onClick={handleNext}
                        disabled={!(isLessonCompleted || allCorrect) || currentLessonIndex === lessonsData.length - 1}
                        className={`mr-4 -mb-1 rounded-full w-8 h-8 ${currentLessonIndex === lessonsData.length - 1
                                ? "bg-blue-600 hover:bg-red-600"
                                : "bg-blue-500 hover:bg-blue-400"
                            }`}
                    >
                        <img className="next-page-icon" alt="..." src="/next-page.svg" />
                    </button>
                    {!(isLessonCompleted || allCorrect) && (
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

export default LessonsColumn;