import React, { useEffect, useState } from 'react';
import ChatBox from './ChatBox'
import LessonsColumn from './LessonsColumn';
import ExercisesPage from './ExercisesPage';

const MainPage = () => {

    const [isChatVisible, setIsChatVisible] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    const toggleChatBox = () => {
        setIsChatVisible(!isChatVisible)
    }

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
                <LessonsColumn />
            </div>
            <div className="md:col-span-2 bg-gray-800 pl-3 pt-3 pb-2 rounded overflow-y-auto max-h-full md:h-auto h-[500px]">
                <button className='absolute hidden md:block top-16 right-5 bg-blue-800 text-white px-2 py-1 rounded' onClick={toggleChatBox}>
                    {isChatVisible ? "Hide Tutor" : "Message Tutor"}
                </button>
                <ExercisesPage />
            </div>
            <div className={`rounded overflow-y-auto ${isSmallScreen
                ? 'md:hidden col-span-1 max-h-full h-[500px]'
                : `md:absolute right-1 md:col-span-1 md:w-1/3 w-full z-10 border-4 border-black transition-all duration-1000 ease-in-out 
                ${isChatVisible ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}`}
                {...(!isSmallScreen && {
                    style: { height: '85%', marginTop: '100px', pointerEvents: isChatVisible ? 'auto' : 'none' }
                })}
            >
                <ChatBox />
            </div>
        </div>
    );
}

export default MainPage;