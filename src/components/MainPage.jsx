import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Link } from "react-router-dom";
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/solid'
import ChatBox from './ChatBox'
import LessonsColumn from './LessonsColumn';
import ExercisesPage from './ExercisesPage';
import { use } from 'marked';
import { supabase } from '../supabaseClient';

const MainPage = () => {

    const bottomRef = useRef(null);
    const [isRowView, setIsRowView] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    // session storage:
    const [messages, setMessages] = useState([])
    // const [messages, setMessages] = useState(() => {
    //     const savedHistory = sessionStorage.getItem('messages');
    //     return savedHistory ? JSON.parse(savedHistory) : [];
    // });
    const [userId, setUserId] = useState(() => {
        const savedUserId = sessionStorage.getItem('userId');
        return savedUserId ? JSON.parse(savedUserId) : (null);
    })
    const [exercisesData, setExercisesData] = useState(() => {
        const savedExercisesData = sessionStorage.getItem('exercisesData');
        return savedExercisesData ? JSON.parse(savedExercisesData) : [];
    })
    const [groupedExercises, setGroupedExercises] = useState(() => {
        const savedGroupedExercises = sessionStorage.getItem('groupedExercises');
        return savedGroupedExercises ? JSON.parse(savedGroupedExercises) : {};
    })
    const [lessonsData, setLessonsData] = useState(() => {
        const savedLessonsData = sessionStorage.getItem('lessonsData');
        return savedLessonsData ? JSON.parse(savedLessonsData) : [];
    })
    const [completedLessons, setCompletedLessons] = useState(() => {
        const savedCompletedLessons = sessionStorage.getItem('completedLessons');
        return savedCompletedLessons ? JSON.parse(savedCompletedLessons) : {};
    });
    const [isChatVisible, setIsChatVisible] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [allExercisesCompleted, setAllExercisesCompleted] = useState(false);

    // const [dataFetched, setDataFetched] = useState(false);
    // Initialize dataFetched from sessionStorage, or set it to false if not available
    const [dataFetched, setDataFetched] = useState(() => {
        return sessionStorage.getItem('hasFetchedData') === 'true';
    });

    // Toggle between column and row view
    const toggleView = () => setIsRowView((prev) => !prev);

    const toggleViewWithScroll = () => {
        if (!isRowView) {
            setIsRowView((prev) => !prev);
        }
        // setIsRowView((prev) => !prev);
        setTimeout(() => {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    }
    const toggleChatBox = () => { setIsChatVisible(!isChatVisible) }
    // callback to handle the completion of exercises
    const handleExercisesCompletion = useCallback((isCompleted) => {
        setAllExercisesCompleted(isCompleted)
    }, [])
    // reset the completion status when a new lesson is loaded
    const resetLessonCompletion = useCallback(() => {
        setAllExercisesCompleted(false);
    })
    // set prev lesson to completed when prev button clicked
    const prevLessonCompleted = useCallback(() => {
        setAllExercisesCompleted(true);
    })

    // Update completedLessons with the full object from LessonsColumn
    // const handleLessonCompleted = useCallback((completed) => {
    //     setCompletedLessons(completed); // Set the full completedLessons object
    // }, []);

    // fetching user + userId and passing it to children (exercise + lesson page)
    useEffect(() => {
        if (!userId) {
            const fetchUser = async () => {
                // user data
                const { data: userData, error: userError } = await supabase.auth.getUser();
                if (userError) {
                    console.error("Error fetching user:", userError);
                    setIsLoading(false);
                    return;
                }
                else {
                    setUserId(userData.user?.id);
                    sessionStorage.setItem('userId', JSON.stringify(userData.user?.id));
                    setUser(userData.user);
                    // setIsLoading(false);
                }
            }
            fetchUser();
        }
    }, [])

    // fetching lessons, exercise data, passing it to children (exercise + lesson page)
    useEffect(() => {
        // only fetch if there is a user
        if (!userId || dataFetched) {
            setIsLoading(false);
            // console.log("Skipping fetch(!userID): No user or data already fetched");
            // console.log("true or false (!userId): ", dataFetched)
            return
        }
        // console.log("true or false (after !userId): ", dataFetched)
        const fetchData = async () => {
            try {
                // exercise data
                const { data: exerciseData, error: exercisesError } = await supabase
                    .from("exercises")
                    .select("*, answer")
                    .order("exercise_id", { ascending: true }); // order by 'id' column in ascending order
                // console.log("Fetched exercises", exerciseData);
                // console.log("true or false(exercises): ", dataFetched)
                if (exercisesError) {
                    console.error("Error fetching exercises:", exercisesError.message);
                    // setError(exercisesError.message);
                } else {
                    // grouping exercises by lesson_id for easier access
                    const grouped = exerciseData.reduce((acc, exercise) => {
                        if (!acc[exercise.lesson_id]) {
                            acc[exercise.lesson_id] = [];
                        }
                        acc[exercise.lesson_id].push(exercise);
                        return acc;
                    }, {});
                    setGroupedExercises(grouped);
                    setExercisesData(exerciseData);
                    sessionStorage.setItem('exercisesData', JSON.stringify(exerciseData));
                    sessionStorage.setItem('groupedExercises', JSON.stringify(grouped));
                }

                // lesson data
                const { data: lessonsData, error: lessonsError } = await supabase
                    .from("lessons")
                    .select("*")
                    .order("lesson_id", { ascending: true });
                // console.log("Fetched lessons", lessonsData);
                if (lessonsError) {
                    console.error("Error fetching lessons:", lessonsError.message);
                    // setError(lessonsError.message);
                } else {
                    setLessonsData(lessonsData);
                    sessionStorage.setItem('lessonsData', JSON.stringify(lessonsData));
                }

                // userProgress data
                const { data: progressData, error: progressError } = await supabase
                    .from("userprogress")
                    .select("lesson_id, completed")
                    .eq("user_id", userId)
                    .order("completed_at", { ascending: false });
                // console.log("Fetched user progress", progressData);
                if (progressError) {
                    console.error("Error fetching user progress:", progressError.message);
                } else {
                    const completedMap = {};
                    progressData.forEach((progress) => {
                        completedMap[progress.lesson_id] = progress.completed;
                    });
                    setCompletedLessons(completedMap);
                    sessionStorage.setItem('completedLessons', JSON.stringify(completedMap));
                    setDataFetched(true);
                    sessionStorage.setItem('hasFetchedData', 'true');
                }

                // fetch chat history
                const { data: chatHistory, error: chatError } = await supabase
                    .from("chat_history")
                    .select("*")
                    .eq("user_id", userId)
                    .order("created_at", { ascending: true })
                if (chatError) {
                    console.error("error fetching chat history:", chatError.message)
                    setMessages([]);
                } else {
                    // console.log("Fetched chat history:", chatHistory);
                    
                    if (Array.isArray(chatHistory)) {
                        const simplifiedChatHistory = chatHistory.map(({ role, content }) => ({ role, content }));
                        // console.log("Simplified chat history:", simplifiedChatHistory);
                        sessionStorage.setItem('messages', JSON.stringify(simplifiedChatHistory));
                        // console.log("SessionStorage messages after fetch:", sessionStorage.getItem('messages'));
                        setMessages(simplifiedChatHistory);
                    } else {
                        console.error("Fetched chat history is not an array:", chatHistory);
                        setMessages([]);
                    }
                }

            } catch (error) {
                console.error("Error during data fetching:", error)
            } finally {
                // setDataFetched(true);
                setIsLoading(false);
                // console.log("true or false(has to be true, if not then it really is never set): ", dataFetched)
            }
        }
        fetchData();
    }, [userId]);

    useEffect(() => {
        const savedMessages = sessionStorage.getItem('messages');
        if (savedMessages) {
            try {
                const parsedMessages = JSON.parse(savedMessages);
                if (Array.isArray(parsedMessages)) {
                    setMessages(parsedMessages);
                    // console.log("Restored messages from sessionStorage:", parsedMessages);
                }
            } catch (error) {
                console.error("Error parsing messages from sessionStorage:", error);
            }
        }
    }, []);

    // useEffect(() => {
    //     console.log("Updated messages in MainPage:", messages);
    // }, [messages]);

    // tutor chat interface 
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

    // if (isLoading) {
    //     return <div className="flex items-center justify-center min-h-screen"><img src='/loading-ripple.svg' /></div>;
    // }

    return (
        <>
            {isLoading ? (
                <div className="flex items-center justify-center min-h-screen"><img src='/loading-ripple.svg' /></div>
            ) : userId ? (
                <div className={`relative grid ${isRowView ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-2 p-2 pt-16 min-h-screen md:h-screen overflow-y-auto`}>
                    <div className={`col-span-1 bg-gray-800 pl-3 pt-3 pb-2 rounded ${isRowView ? 'overflow-y-auto max-h-full xxxsm:h-[450px] xxsm:h-[500px] xsm:h-[550px] sm:h-[600px] md:h-[600px] lg:h-[625px] xl:h-[650px]' : 'md:overflow-y-auto md:max-h-full md:h-auto xxxsm:h-[450px] xxsm:h-[500px] xsm:h-[550px] sm:h-[600px]'}`}>
                        <LessonsColumn
                            allCorrect={allExercisesCompleted}
                            onLessonChange={resetLessonCompletion}
                            onPrevLessonButton={prevLessonCompleted}
                            lessonsData={lessonsData}
                            // userId={userId}
                            completedLessons={completedLessons}
                        />
                    </div>
                    <div className={`md:col-span-2 bg-gray-800 pl-3 pt-3 pb-2 rounded overflow-y-auto max-h-full  ${isRowView ? 'overflow-y-auto max-h-full xxxsm:h-[450px] xxsm:h-[500px] xsm:h-[550px] sm:h-[600px] md:h-[600px] lg:h-[625px] xl:h-[650px]' : 'md:h-auto xxxsm:h-[450px] xxsm:h-[500px] xsm:h-[550px] sm:h-[600px]'}`}>
                        {/* ROW / COLUMN view button */}
                        <button
                            onClick={toggleView}
                            className="fixed hidden md:inline-flex top-16 right-[170px] items-center bg-gradient-to-r
                             from-[rgba(0,0,0,0)] to-[rgba(0,0,0,0)] px-0 py-0 
                             shadow-lg hover:border-[rgba(0,0,0,0.1)] hover:from-[rgba(0,0,0,0.81)] hover:to-[rgba(0,0,0,0.21)] focus:outline-none 
                             focus:ring-0 transition duration-300 ease-in-out"
                        >
                            {isRowView
                                ? <img className="w-[35px] h-auto" alt="Column" src="/column-view-icon.svg" />
                                : <img className="w-[35px] h-auto" alt="Row" src="/row-view-icon.svg" />}
                        </button>
                        {/* TUTOR button */}
                        <button className={`fixed hidden md:inline-flex top-16 right-5 items-center bg-gradient-to-r
                             from-yellow-900 to-yellow-700 text-white px-1 py-0 rounded-full 
                             shadow-lg hover:border-yellow-500 hover:from-yellow-800 hover:to-yellow-600 focus:outline-none 
                             focus:ring-[1px] focus:ring-yellow-500 transition duration-300 ease-in-out`}
                            onClick={toggleChatBox}
                            aria-label={isChatVisible ? "Hide Tutor Chat" : "Message Tutor"}
                        >
                            {isChatVisible
                                ? (<><XMarkIcon className="w-4 h-4 mr-1" />Hide Tutor</>)
                                : (<><ChevronDownIcon className="w-4 h-4 mr-1" />Message Tutor</>)}
                        </button>
                        <ExercisesPage
                            onExerciseCompletion={handleExercisesCompletion}
                            userId={userId}
                            exercisesData={exercisesData}
                            groupedExercises={groupedExercises}
                            lessonsData={lessonsData}
                            toggleViewWithScroll={toggleViewWithScroll}
                        // loading={loading}
                        // error={error}
                        />
                        <div ref={bottomRef}></div>
                    </div>
                    <div className={`rounded overflow-y-auto 
                        ${isSmallScreen
                            ? 'md:hidden col-span-1 max-h-full h-[600px]'
                            : `md:fixed right-1 md:col-span-1 md:w-1/3 w-full z-10 border-[1px] border-amber-500 border-opacity-75 transition-all duration-1000 ease-in-out 
                            ${isChatVisible ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'}`}`}
                        {...(!isSmallScreen && {
                            style: { height: '81%', marginTop: '95px', pointerEvents: isChatVisible ? 'auto' : 'none' }
                        })}
                    >
                        <ChatBox
                            messages={messages}
                            setMessages={setMessages}
                        />
                    </div>
                </div>
            ) : (
                <div className="main-page-no-user ">
                    <p className="font-bold text-white
                    xxxsm:mb-[6px] xxsm:mb-[8px] xsm:mb-[10px] sm:mb-[20px] md:mb-[28px] lg:mb-[32px] xl:mb-[32px]
                    xxxsm:text-[9px] xxsm:text-[11px] xsm:text-[14px] sm:text-[20px] md:text-[25px] lg:text-[30px] xl:text-[30px]">Get started with your Discrete Mentor</p>
                    <div className="flex items-center justify-items-center
                    xxxsm:space-x-[6px] xxsm:space-x-[8px] xsm:space-x-[14px] sm:space-x-[16px] md:space-x-[16px] lg:space-x-[16px] xl:space-x-[16px]
                    xxxsm:text-[7px] xxsm:text-[8px] xsm:text-[10px] sm:text-[14px] md:text-[18px] lg:text-[20px] xl:text-[20px]
                    xxxsm:mt-[6px] xxsm:mt-[8px] xsm:mt-[10px] sm:mt-[15px] md:mt-[20px] lg:mt-[24px] xl:mt-[24px]">
                        <Link className="link-to-login-signup font-bold" to="/login">Login</Link>
                        <p className='font-bold'>|</p>
                        <Link className="link-to-login-signup font-bold" to="/signup">Sign Up</Link>
                    </div>
                </div>
            )}
        </>
    );
}

export default MainPage;