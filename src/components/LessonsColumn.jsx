import React, { useEffect, useState, useRef } from "react";
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { marked } from "marked";
import DOMPurify from "dompurify";
import LatexRendererLessons from "./LatexRendererLessons";
import {motion, AnimatePresence} from "framer-motion";
// import ReactMarkdown from 'react-markdown'
// import remarkHtml from 'remark-html';
// import rehypeSanitize from "rehype-sanitize";

marked.setOptions({
    gfm: true,
    breaks: true,
    headerIds: false,
    mangle: false,
});

const LessonsColumn = ({
    allCorrect, onLessonChange, onPrevLessonButton,
    lessonsData, completedLessons
}) => {
    // State to hold lessons data fetched from the database
    // const [lessonsData, setLessonsData] = useState([]);
    // State to keep track of current lesson index
    const [currentLessonIndex, setCurrentLessonIndex] = useState(() => {
        const savedIndex = sessionStorage.getItem("currentLessonIndex");
        return savedIndex ? parseInt(savedIndex, 10) : 0;
    });

    // const [lessonData, setLessonData] = useState(() => {
    //     const savedLessonsData = sessionStorage.getItem('lessonsData');
    //     return savedLessonsData ? JSON.parse(savedLessonsData) : [];
    // })

    // const [completedLesson, setCompletedLesson] = useState(() => {
    //     const savedCompletedLessons = sessionStorage.getItem('completedLessons');
    //     return savedCompletedLessons ? JSON.parse(savedCompletedLessons) : {};
    // });
    // Loading and error states
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);
    // State to manage user ID
    // const [userId, setUserId] = useState(null);
    // State to hold completed lessons
    // const [completedLessons, setCompletedLessons] = useState({}); // { lesson_id: true/false }
    // ref to scroll to top at next/prev page
    const scrollableContainerRef = useRef(null);
    // const lessonContainerRef = useRef(null); // another way to enlarge images

    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown list visibility

    // scroll to top of next/prev page
    useEffect(() => {
        if (scrollableContainerRef.current) {
            scrollableContainerRef.current.scrollTop = 0;
        }
        // window.scrollTo(0, 0)
    }, [currentLessonIndex]);

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

    const navigateToLesson = (lessonIndex) => {
        setCurrentLessonIndex(lessonIndex);
        sessionStorage.setItem("currentLessonIndex", lessonIndex);
        setIsDropdownOpen(false); // Close dropdown after selection
        onLessonChange(); // Resetting exercise completion for the new lesson
    };

    const currentLesson = lessonsData[currentLessonIndex];

    const renderContent = (content) => {
        // Regex to detect LaTeX code between $...$ or $$...$$
        const latexRegex = /\$\$(.*?)\$\$|\$(.*?)\$/g;

        // Check if content contains LaTeX
        const hasLatex = latexRegex.test(content);

        if (hasLatex) {
            // If LaTeX is detected, use LatexRenderer for LaTeX content
            return <LatexRendererLessons content={content} />;
        } else {
           
            // return <LatexRenderer content={content} />;
            // return (
            //     <ReactMarkdown 
            //         remarkPlugins={[remarkHtml]}
            //         rehypePlugins={[rehypeSanitize]}    
            //     >
            //         {content}
            //     </ReactMarkdown>
            // )
            // Render non-LaTeX content as plain HTML
            return (
                <div
                    className="lessons-container"
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(marked(content)),
                    }}
                />
            );
        }
    };

    const isLessonCompleted = completedLessons[currentLesson?.lesson_id];
    // const [isLessonCompleted, setIsLessonCompleted] = useState(() => {
    //     const savedIsLessonCompleted = sessionStorage.getItem("currentLessonIndex");
    //     return savedIsLessonCompleted ? parseInt(savedIndex, 10) : 0;
    // });

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
            });
        });

        const closeModal = () => modal.classList.remove("active");
        modal.addEventListener("click", closeModal);
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeModal();
        });

        return () => {
            images.forEach((image) => image.removeEventListener("click", () => { }));
            modal.removeEventListener("click", closeModal);
            document.removeEventListener("keydown", (e) => {
                if (e.key === "Escape") closeModal();
            });
        };
    }, [currentLesson]);

    return (
        <div className="flex flex-col h-full -mt-2">
            {/* {currentLesson && (
                <h2 className="xxxsm:text-[14px] xxsm:text-[16px] xsm:text-[18px] sm:text-[20px] md:text-[16px] lg:text-[18px] xl:text-[20px] font-bold mb-1">{currentLesson.title}</h2>
            )} */}
            {/* Dropdown for Completed Lessons */}
            {Object.keys(completedLessons).length > 0 ? (
                <div className="relative mr-2">
                    <button
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                        className="flex items-start space-x-1 hover:bg-[#c0c0c02d] hover:border-[#c0c0c000] outline-none focus:outline-none"
                    >   
                        {isDropdownOpen
                                ? (<><h2 className="font-bold mb-1 flex-grow text-left xxxsm:text-[14px] xxsm:text-[16px] xsm:text-[18px] sm:text-[20px] md:text-[16px] lg:text-[18px] xl:text-[20px]">
                                    {currentLesson.title}
                                </h2>
                                <XMarkIcon className="xxxsm:w-[16px] xxsm:w-[20px] xsm:w-[20px] sm:w-[20px] md:w-[20px] lg:w-[20px] xl:w-[20px] 
                                xxxsm:h-[16px] xxsm:h-[20px] xsm:h-[20px] sm:h-[20px] md:h-[20px] lg:h-[20px] xl:h-[20px]" /></>)
                                : (<><h2 className="font-bold mb-1 flex-grow text-left xxxsm:text-[14px] xxsm:text-[16px] xsm:text-[18px] sm:text-[20px] md:text-[16px] lg:text-[18px] xl:text-[20px]">
                                    {currentLesson.title}
                                </h2>
                                <ChevronDownIcon className="xxxsm:w-[16px] xxsm:w-[20px] xsm:w-[20px] sm:w-[20px] md:w-[20px] lg:w-[20px] xl:w-[20px] 
                                xxxsm:h-[16px] xxsm:h-[20px] xsm:h-[20px] sm:h-[20px] md:h-[20px] lg:h-[20px] xl:h-[20px]" /></>)}
                    </button>
                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ maxHeight: 0, opacity: 0 }}
                                animate={{ maxHeight: 800, opacity: 1 }}
                                exit={{ maxHeight: 0, opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="absolute mt-[2px] left-[1px] w-auto bg-[#133053] text-white rounded-lg shadow-lg z-10 p-1 border-[1px] border-[#2a5aa1] border-opacity-75"
                            >
                                {/* <div className={`absolute mt-[2px] left-[1px] w-[300px] bg-gray-800 text-white rounded-lg shadow-lg z-10 p-2
                                border-2 border-amber-500 border-opacity-75 transition-all duration-2000 ease-in-out
                                ${isDropdownOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}> */}
                                {Object.keys(completedLessons).map((lessonId) => {
                                    const lessonIndex = lessonsData.findIndex(lesson => lesson.lesson_id === parseInt(lessonId));
                                    return (
                                        lessonIndex >= 0 && (
                                            <div key={lessonId} className="block">
                                                <button
                                                    onClick={() => navigateToLesson(lessonIndex)}
                                                    className={`inline-block text-left px-2 py-1 hover:bg-[#1b3657] rounded-none ${lessonIndex !== 0 ? 'border-t-[rgba(255,255,255,0.33)]' : ''}`}
                                                >
                                                    {lessonsData[lessonIndex]?.title || `Lesson ${lessonIndex + 1}`}
                                                </button>
                                            </div>
                                        )
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : currentLesson && (
                <div className="relative mr-2">
                    <button
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                        className="flex items-center space-x-1 hover:bg-[#c0c0c02d] hover:border-[#c0c0c000] outline-none focus:outline-none"
                    >   
                        {isDropdownOpen
                                ? (<><XMarkIcon className="xxxsm:w-[16px] xxsm:w-[20px] xsm:w-[20px] sm:w-[20px] md:w-[20px] lg:w-[20px] xl:w-[20px] 
                                xxxsm:h-[16px] xxsm:h-[20px] xsm:h-[20px] sm:h-[20px] md:h-[20px] lg:h-[20px] xl:h-[20px]" />
                                <h2 className="font-bold mb-1 flex-grow text-left xxxsm:text-[14px] xxsm:text-[16px] xsm:text-[18px] sm:text-[20px] md:text-[16px] lg:text-[18px] xl:text-[20px]">
                                    {currentLesson.title}
                                </h2></>)
                                : (<><ChevronDownIcon className="xxxsm:w-[16px] xxsm:w-[20px] xsm:w-[20px] sm:w-[20px] md:w-[20px] lg:w-[20px] xl:w-[20px] 
                                xxxsm:h-[16px] xxsm:h-[20px] xsm:h-[20px] sm:h-[20px] md:h-[20px] lg:h-[20px] xl:h-[20px]" />
                                <h2 className="font-bold mb-1 flex-grow text-left xxxsm:text-[14px] xxsm:text-[16px] xsm:text-[18px] sm:text-[20px] md:text-[16px] lg:text-[18px] xl:text-[20px]">
                                    {currentLesson.title}
                                </h2></>)}
                    </button>
                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ maxHeight: 0, opacity: 0 }}
                                animate={{ maxHeight: 800, opacity: 1 }}
                                exit={{ maxHeight: 0, opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="absolute mt-[2px] left-[1px] w-[70%] bg-[#212d3c] text-white rounded-lg shadow-lg z-10 p-1 border-[1px] border-[#C0C0C0] border-opacity-75"
                            >
                                <div>
                                    No Completed Lessons
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )} {/* ref={lessonContainerRef} */}
            <div ref={scrollableContainerRef} className="IMGs-lessons flex-1 text-center overflow-y-auto pl-2 bg-gray-900 rounded prose prose-sm sm:prose lg:prose-lg text-white w-full override-max-width">
                {currentLesson && <>{renderContent(currentLesson.content)}</>}
            </div>
            <div className="modalZoomIMGs" id="imageModal">
                <img alt="Zoomed view" />
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

// !(isLessonCompleted || allCorrect) ||
