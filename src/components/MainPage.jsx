import React, { useCallback, useEffect, useState } from 'react';
import {ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/solid'
import ChatBox from './ChatBox'
import LessonsColumn from './LessonsColumn';
import ExercisesPage from './ExercisesPage';

const MainPage = () => {

    const [isChatVisible, setIsChatVisible] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [lessonCompleted, setLessonCompleted] = useState(false);

    const toggleChatBox = () => {
        setIsChatVisible(!isChatVisible)
    }

    const handleLessonCompletion = useCallback((isCompleted) => {
        setLessonCompleted(isCompleted)
    }, [])

    const resetLessonCompletion = useCallback(() => {
        setLessonCompleted(false);
    })

    useEffect(() => {

        const handleResize = () => {

            if (window.innerWidth < 768) {
                setIsChatVisible(false)
                setIsSmallScreen(true)
            }
            else {
                setIsSmallScreen(false)
            }
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 p-4 pt-16 min-h-screen md:h-screen">
            <div className="col-span-1 bg-gray-800 pl-3 pt-3 pb-2 rounded md:overflow-y-auto md:max-h-full md:h-auto h-[500px]">
                <LessonsColumn 
                    lessonCompleted={lessonCompleted}
                    onLessonChange={resetLessonCompletion}
                />
            </div>
            <div className="md:col-span-2 bg-gray-800 pl-3 pt-3 pb-2 rounded overflow-y-auto max-h-full md:h-auto h-[500px]">
                <button className={`fixed hidden md:inline-flex top-16 right-5 items-center bg-gradient-to-r
                                 from-yellow-900 to-yellow-700 text-white px-1 py-0 rounded-full 
                                 shadow-lg hover:from-yellow-800 hover:to-yellow-600 focus:outline-none 
                                 focus:ring-2 focus:ring-yellow-500 transition duration-300 ease-in-out`}
                                onClick={toggleChatBox}
                                aria-label={isChatVisible ? "Hide Tutor Chat" : "Message Tutor"}
                >
                    {isChatVisible ? (<><XMarkIcon className="w-4 h-4 mr-1"/>Hide Tutor</>
                        ) : (<><ChevronDownIcon className="w-4 h-4 mr-1"/>Message Tutor</>
                    )}
                </button>
                <ExercisesPage onLessonCompletion={handleLessonCompletion}/>
            </div>
            <div className={`rounded overflow-y-auto ${isSmallScreen
                ? 'md:hidden col-span-1 max-h-full h-[500px]'
                : `md:absolute right-1 md:col-span-1 md:w-1/3 w-full z-10 border-2 border-amber-500 transition-all duration-1000 ease-in-out 
                ${isChatVisible ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'}`}`}
                {...(!isSmallScreen && {
                    style: { height: '85%', marginTop: '95px', pointerEvents: isChatVisible ? 'auto' : 'none' }
                })}
            >
                <ChatBox />
            </div>
        </div>
    );
}

export default MainPage;