import React, { useCallback, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/solid'
import ChatBox from './ChatBox'
import LessonsColumn from './LessonsColumn';
import ExercisesPage from './ExercisesPage';
import { use } from 'marked';
import { supabase } from '../supabaseClient';
// import { LessonProgressProvider } from './LessonProgressContext';

const MainPage = () => {

    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    // session storage:
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

    const toggleChatBox = () => {
        setIsChatVisible(!isChatVisible)
    }
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
                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 p-4 pt-16 min-h-screen md:h-screen">
                    <div className="col-span-1 bg-gray-800 pl-3 pt-3 pb-2 rounded md:overflow-y-auto md:max-h-full md:h-auto h-[500px]">
                        <LessonsColumn
                            allCorrect={allExercisesCompleted}
                            onLessonChange={resetLessonCompletion}
                            onPrevLessonButton={prevLessonCompleted}
                            lessonsData={lessonsData}
                            // userId={userId}
                            completedLessons={completedLessons}
                        />
                    </div>
                    <div className="md:col-span-2 bg-gray-800 pl-3 pt-3 pb-2 rounded overflow-y-auto max-h-full md:h-auto h-[500px]">
                        <button className={`fixed hidden md:inline-flex top-16 right-5 items-center bg-gradient-to-r
                             from-yellow-900 to-yellow-700 text-white px-1 py-0 rounded-full 
                             shadow-lg hover:border-yellow-500 hover:from-yellow-800 hover:to-yellow-600 focus:outline-none 
                             focus:ring-2 focus:ring-yellow-500 transition duration-300 ease-in-out`}
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
                        // loading={loading}
                        // error={error}
                        />
                    </div>
                    <div className={`rounded overflow-y-auto ${isSmallScreen
                        ? 'md:hidden col-span-1 max-h-full h-[500px]'
                        : `md:absolute right-1 md:col-span-1 md:w-1/3 w-full z-10 border-2 border-amber-500 border-opacity-75 transition-all duration-1000 ease-in-out 
                            ${isChatVisible ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'}`}`}
                        {...(!isSmallScreen && {
                            style: { height: '85%', marginTop: '95px', pointerEvents: isChatVisible ? 'auto' : 'none' }
                        })}
                    >
                        <ChatBox />
                    </div>
                </div>
            ) : (
                <div className="main-page-no-user ">
                    <p className="text-3xl font-bold text-white mb-8">Get started with your Discrete Mentor</p>
                    <div className="flex items-center justify-items-center mt-6 space-x-4">
                        <Link className="link-to-login-signup text-xl font-bold" to="/login">Login</Link>
                        <p className='font-bold'>|</p>
                        <Link className="link-to-login-signup text-xl font-bold" to="/signup">Sign Up</Link>
                    </div>
                </div>
            )}
        </>
    );
}

export default MainPage;