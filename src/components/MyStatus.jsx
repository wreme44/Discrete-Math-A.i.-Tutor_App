import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const UserProgress = () => {

    const [userProgress, setUserProgress] = useState([]);
    const [userId, setUserId] = useState(() => {
        const savedUserId = sessionStorage.getItem('userId');
        return savedUserId ? JSON.parse(savedUserId) : null;
    });
    const [allData, setAllData] = useState([]);
    const [lessonsData, setLessonsData] = useState([]);
    const [totalExercises, setTotalExercises] = useState(0);
    const [completedExercises, setCompletedExercises] = useState(0);
    const [totalLessons, setTotalLessons] = useState(10);
    const [completedLessons, setCompletedLessons] = useState(0);
    const [lessonProgress, setLessonProgress] = useState([]);

    // Calculate completion percentage
    const completionPercentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
    const completionLessons = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    useEffect(() => {
        const fetchUserProgress = async () => {
            if (userId) {
                // lesson data
                const { data: lessonsData, error: lessonsError } = await supabase
                    .from("lessons")
                    .select("lesson_id, title")
                    .order("lesson_id", { ascending: true });
                if (lessonsError) {
                    console.error("Error fetching lessons:", lessonsError.message);
                } else {
                    setLessonsData(lessonsData);
                }

                // Fetch user lesson progress
                const { data: userLessonData, error: lessonError } = await supabase
                    .from("userprogress")
                    .select(`
                        lesson_id,
                        completed,
                        completed_at,
                        lessons (title)
                    `)
                    .eq("user_id", userId);

                if (lessonError) {
                    console.error("Error fetching user progress:", lessonError);
                } else {
                    setUserProgress(userLessonData);
                    const completedCount = userLessonData.filter((lesson) => lesson.completed === true).length;
                    setCompletedLessons(completedCount)
                }

                // Fetch total exercises from exercises table
                const { data: allExercisesData, error: allExercisesError } = await supabase
                    .from("exercises")
                    .select("exercise_id, lesson_id");

                if (allExercisesError) {
                    console.error("Error fetching total exercises:", allExercisesError);
                } else {
                    setTotalExercises(allExercisesData.length);
                }

                // Fetch completed exercises for the user
                const { data: completedData, error: completedError } = await supabase
                    .from("user_exercise_progress")
                    .select("exercise_id, lesson_id, completed")
                    .eq("user_id", userId)
                    .eq("completed", true);

                if (completedError) {
                    console.error("Error fetching completed exercises:", completedError);
                } else {
                    setCompletedExercises(completedData.length);
                }

                const lessonProgressData = allExercisesData.reduce((acc, exercise) => {
                    const { lesson_id } = exercise;
                    if (!acc[lesson_id]) {
                        acc[lesson_id] = {
                            lesson_id,
                            totalExercises: 0,
                            completedExercises: 0,
                        }
                    }
                    acc[lesson_id].totalExercises++;
                    if (completedData.some((e) => e.exercise_id === exercise.exercise_id)) {
                        acc[lesson_id].completedExercises++;
                    }
                    return acc;
                }, {})

                const lessonProgressArray = Object.values(lessonProgressData).map((lesson) => ({
                    ...lesson, completionPercentage: Math.round((lesson.completedExercises / lesson.totalExercises) * 100),
                }))
                setLessonProgress(lessonProgressArray)

                // combine
                const combinedData = lessonsData.map((lesson) => {
                    const userProgressData = userLessonData.find(
                        (userLesson) => userLesson.lesson_id === lesson.lesson_id
                    );
                    const progressData = lessonProgressArray.find(
                        (progress) => progress.lesson_id === lesson.lesson_id
                    );

                    return {
                        lesson_id: lesson.lesson_id,
                        title: lesson.title,
                        completionPercentage: progressData?.completionPercentage || 0,
                        completed_at: userProgressData?.completed_at || null,
                    };
                });

                setAllData(combinedData);


                // Calculate total lessons completed
                // const completedLessonsCount = lessonProgressArray.filter(
                //     (lesson) => lesson.completionPercentage === 100
                // ).length;

                // setCompletedLessons(completedLessonsCount);
                // setTotalLessons(Object.keys(lessonProgressData).length);

                // fetch number / length of lessons
                // const { data: lessonData, error } = await supabase
                //     .from("lessons")
                //     .select("lesson_id"); // Only fetch lesson_id

                // if (error) {
                //     console.error("Error fetching lesson count:", error);
                // } else {
                //     setTotalLessons(lessonData.length); // Set the total lesson count
                // }
            }
        };

        fetchUserProgress();
    }, [userId]);

    // loading bar Exercises
    useEffect(() => {
        const progressBar = new window.ldBar('#progress-bar')
        progressBar.set(completionPercentage)
        // const label = document.querySelector("#progress-bar .ldBar-label");
        // if (label) {
        //     label.innerHTML = `${completionPercentage}%`;
        // }
    }, [completionPercentage])
    // loading bar Lessons
    useEffect(() => {
        const lessonBar = new window.ldBar('#lesson-bar')
        lessonBar.set(completionLessons)
        // const label = document.querySelector("#progress-bar .ldBar-label");
        // if (label) {
        //     label.innerHTML = `${completionPercentage}%`;
        // }
    }, [completionLessons])

    // useEffect(() => {
    //     const lowerBar = new window.ldBar('#lower-bar')
    //     lowerBar.set(completionPercentage)
    //     // const label = document.querySelector("#progress-bar .ldBar-label");
    //     // if (label) {
    //     //     label.innerHTML = `${completionPercentage}%`;
    //     // }
    // }, [completionPercentage])

    // loading bar Table lessons
    useEffect(() => {
        allData.forEach((progress) => {
            const barId = `#loading-bar-${progress.lesson_id}`;
            const barElement = document.querySelector(barId);
            if (barElement) {
                const bar = new window.ldBar(barElement);
                // const bar = new window.ldBar(barElement, {
                //     duration: progress.completionPercentage / 10,
                // })
                // bar.set(progress.completionPercentage)
                let currentValue = 0;
                const targetValue = progress.completionPercentage;
                const step = 1;
                const interval = setInterval(() => {
                    currentValue += step;
                    bar.set(currentValue);
                    if (currentValue >= targetValue) {
                        clearInterval(interval); // stop animation
                    }
                }, 60);
            }
            const label = barElement.querySelector('.ldBar-label');
            if (label) {
                label.remove();
            }
        })
    }, [allData])

    return (
        <div className="pt-[64px] xxxsm:px-[20px] xxsm:px-[30px] xsm:px-[40px] sm:px-[50px] md:px-[60px] lg:px-[70px] xl:px-[80px]
            bg-gray-900 rounded">
            <div className="flex justify-center items-center">
                <h3 className="progress-title xxxsm:text-[14px] xxsm:text-[16px] xsm:text-[18px] sm:text-[20px] md:text-[24px] lg:text-[24px] xl:text-[24px]
                    xxxsm:mb-[10px] xxsm:mb-[20px] xsm:mb-[25px] sm:mb-[25px] md:mb-[20px] lg:mb-[20px] xl:mb-[10px]
                    xxxsm:mt-[35px] xxsm:mt-[30px] xsm:mt-[25px] sm:mt-[20px] md:mt-[10px] lg:mt-[0px] xl:mt-[0px] 
                    font-semibold text-white flex justify-center">
                        Progress Status
                </h3>
                {/* <img className="w-6 ml-3" alt="status" src="/progress-icon.svg" /> */}
            </div>
            {/* Progress Bar */}
            <div className="progress-container 
            xxxsm:mb-[50px] xxsm:mb-[55px] xsm:mb-[55px] sm:mb-[60px] md:mb-[50px] lg:mb-[40px] xl:mb-[20px]" 
            style={{ position: "relative", width: "auto", height: "auto" }}>
                <div className="text-white font-semibold mr-2
                xxxsm:text-[8px] xxsm:text-[10px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[20px]
                xxxsm:mr-[0px] xxsm:mr-[0px] xsm:mr-[0px] sm:mr-[5px] md:mr-[8px] lg:mr-[8px] xl:mr-[8px]">
                    {`Lessons Completed: ${completedLessons} / ${totalLessons}`}
                </div>
                <div
                    id="lesson-bar"
                    className="ldBar progress-container label-center h-auto"
                    style={{ width: "10%", height: "auto" }}
                    // data-preset="bubble"
                    // data-fill-background="#ba21829c"
                    data-fill="data:ldbar/res,bubble(#ffbb00,#00336a,30,5)"
                    data-fill-background="#2c62d780" 
                    // data-path="M10 10L90 10L90 90L10 90Z"
                    data-type="fill"
                    data-img="/cupcake.svg"
                    // data-fill-dir="ltr"
                    data-fill-dir="ttb"
                    // xxxsm:w-[60px] xxsm:w-[70px] xsm:w-[80px] sm:w-[90px] md:w-[00px] lg:w-[300px] xl:w-[200px]
                    // data-preset="rainbow"
                    // data-preset="energy"
                    // data-preset="text"
                    // data-stroke="data:ldbar/res,gradient(0,1,#ff00a6,#00336a)"
                    // data-fill="data:ldbar/res,gradient(90,1,#2151bac2,#ba21829c)"
                    // data-fill="data:ldbar/res,stripe(#f00,#0f0,0.5)"
                    // stroke="red"
                    data-stroke-width="10"
                    data-duration="6"
                    data-pattern-size="63"
                // data-label="false"
                // data-value={completionPercentage}
                // data-unit="%"
                ></div>
                <div className="text-white font-semibold
                xxxsm:text-[8px] xxsm:text-[10px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[20px]
                xxxsm:ml-[5px] xxsm:ml-[5px] xsm:ml-[5px] sm:ml-[35px] md:ml-[50px] lg:ml-[60px] xl:ml-[60px] 
                xxxsm:mr-[0px] xxsm:mr-[0px] xsm:mr-[0px] sm:mr-[5px] md:mr-[8px] lg:mr-[8px] xl:mr-[8px]">
                    {`Exercises Completed: ${completedExercises} / ${totalExercises}`} {/* ${completedExercises} / ${totalExercises} (${completionPercentage}%)`} */}
                </div>
                <div
                    id="progress-bar"
                    className="ldBar progress-container label-center h-auto"
                    style={{ width: "10%", height: "auto" }}
                    // xxxsm:w-[60px] xxsm:w-[70px] xsm:w-[80px] sm:w-[90px] md:w-[100px] lg:w-[200px] xl:w-[500px]
                    // xxxsm:h-[40px] xxsm:h-[40px] xsm:h-[40px] sm:h-[40px] md:h-[50px] lg:h-[60px] xl:h-[60px]
                    data-preset="bubble"
                    // data-stroke="data:ldbar/res,gradient(0,1,#ff9,#fc9)"
                    // data-fill="data:ldbar/res,gradient(0,1, rgba(100, 10, 100, 0.7), rgba(150, 50, 150, 0.5))"
                    data-fill="data:ldbar/res,bubble(#ff00a6,#00336a,50,1)"
                    data-fill-background="#0d214b" 
                    // data-type="fill"
                    // data-img="/cupcake.svg"
                    // data-path="M50 10 C20 10, 0 40, 50 70 C100 40, 80 10, 50 10 Z"
                    // data-fill-background-extrude="5" 
                    // data-fill=""
                    // stroke="red"
                    data-stroke-width="10"
                    data-duration="6"
                    data-pattern-size="33"
                    // data-label="false"
                    // data-value={completionPercentage}
                    // data-unit="%"
                ></div>
                {/* <div className="progress-label">
                        {completionPercentage}
                    </div> */}



                {/* <div className="ldBar"
                    style={{width:"100%", height:"60px"}}
                    data-stroke="data:ldbar/res,gradient(0,1,#9df,#9fd,#df9,#fd9)"
                    data-path="M10 20Q20 15 30 20Q40 25 50 20Q60 15 70 20Q80 25 90 20"
                ></div> */}

            </div>



            {/* <div
                    id="lower-bar"
                    className="ldBar progress-container mb-5"
                    style={{ width: "100px", height: "auto" }}
                    data-preset="rainbow"
                    // data-stroke="data:ldbar/res,gradient(0,1,#ff9,#fc9)"
                    // data-fill="data:ldbar/res,gradient(0,1, rgba(100, 10, 100, 0.7), rgba(150, 50, 150, 0.5))"
                    data-fill="data:ldbar/res,bubble(#ff00a6,#00336a,50,1)"
                    // data-fill=""
                    // stroke="red"
                    data-stroke-width="10"
                    data-duration="5"
                    data-pattern-size="33"
                // data-label="false"
                // data-value={completionPercentage}
                // data-unit="%"
                ></div> */}

            {/* <div
                id="lower-bar"
                className="ldBar"
                style={{ width: "100px", height: "50px" }}
                data-stroke="data:ldbar/res,gradient(0,3,#9df,#9fd,#df9,#fd9)"
                data-path="M10 20Q20 15 30 20Q40 25 50 20Q60 15 70 20Q80 25 90 20"
                data-label="false"
            ></div> */}
            {/* <div className="w-full bg-gray-600 h-4 mb-4 rounded">
                <div
                    className="bg-blue-300 h-full rounded"
                    style={{ width: `${completionPercentage}%` }}
                ></div>
            </div> */}
            <div className="overflow-y-auto max-h-[450px] relative"> {/* absolute bottom-[20px] left-[40px] right-[40px] */}
                <table className="table-auto w-full text-white">
                    <thead className="sticky top-0">
                        <tr className="bg-gray-600">
                            <th className="px-0 py-1
                            xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[13px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[18px]">
                                Lesson Title</th>
                            <th className="px-0 py-1 xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[13px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[18px]">
                                Completed</th>
                            <th className="px-0 py-1 xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[13px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[18px]">
                                Completed At</th>
                        </tr>
                    </thead>
                    <tbody className="border-[2px] border-[rgba(201,74,74,0)]">
                        {allData.length > 0 ? (
                            allData.map((progress) => (
                                // const lessonProgressData = lessonProgress.find(
                                //     (lesson) => lesson.lesson_id === progress.lesson_id
                                // );
                                // return (
                                <tr key={progress.lesson_id} className="bg-gray-800">
                                    <td className="border px-2 py-1
                                    xxxsm:text-[10px] xxsm:text-[11px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[18px]">
                                        {progress.title}</td>
                                    <td className="border px-2 py-2">
                                        <div
                                            id={`loading-bar-${progress.lesson_id}`}
                                            className="ldBar"
                                            style={{ width: "100%", maxHeight: "auto" }}
                                            data-stroke="data:ldbar/res,gradient(0,3,#9df,#9fd,#df9,#fd9)"
                                            data-preset="rainbow"
                                            data-duration="15"
                                            // data-preset="energy"
                                            // data-preset="text"
                                            // data-stroke="data:ldbar/res,gradient(0,1,#ff00a6,#00336a)"
                                            // data-fill="data:ldbar/res,gradient(90,1,#2151bac2,#ba21829c)"
                                            // data-fill="data:ldbar/res,stripe(#f00,#0f0,0.5)"
                                            // stroke="red"
                                            // data-path="M10 20Q20 15 30 20Q40 25 50 20Q60 15 70 20Q80 25 90 20"
                                            // data-label="false"
                                        ></div>
                                        <div className="flex justify-center
                                        xxxsm:text-[9px] xxsm:text-[10px] xsm:text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[14px]">
                                            {allData
                                                ? `${progress.completionPercentage}%`
                                                : "0%"}
                                        </div>
                                    </td>
                                    <td className="border px-2 py-1 text-center
                                    xxxsm:text-[10px] xxsm:text-[11px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[18px]">
                                        {progress.completed_at
                                            ? new Date(progress.completed_at).toLocaleString(undefined, {
                                                timeZoneName: "short",
                                            })
                                            : "Not Completed"}
                                    </td>
                                </tr>
                                // );
                            ))
                            //     <tr key={progress.lesson_id} className="bg-gray-600">
                            //         <td className="border px-4 py-2">{progress.lessons.title}</td>
                            //         <td className="border px-4 py-2">
                            //             {progress.completed ? "Yes" : "No"}
                            //         </td>
                            //         <td className="border px-4 py-2">
                            //             {progress.completed_at
                            //                 ? new Date(progress.completed_at).toLocaleString(undefined, {
                            //                     timeZoneName: 'short'
                            //                 })
                            //                 : "N/A"}
                            //         </td>
                            //     </tr>
                            // ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center py-4">
                                    No progress data available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserProgress;
