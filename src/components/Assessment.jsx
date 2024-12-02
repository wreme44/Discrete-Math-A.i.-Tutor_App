import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import CustomModal from "./CustomModal";
import "./Assessment.css";

const Assessment = () => {
    const [quizzes, setQuizzes] = useState([
        "Quiz 1",
        "Quiz 2",
        "Quiz 3",
        "Quiz 4",
        "Final Assessment",
    ]);

    const [questions, setQuestions] = useState([]);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [showCongratulatoryModal, setShowCongratulatoryModal] = useState(false);
    const [score, setScore] = useState(0);
    const [completedQuizzes, setCompletedQuizzes] = useState([]);
    const [incorrectQuestions, setIncorrectQuestions] = useState([]);
    const [showSidebar, setShowSidebar] = useState(false);
    const [userId, setUserId] = useState(() => {
        const savedUserId = sessionStorage.getItem("userId");
        return savedUserId ? JSON.parse(savedUserId) : null;
    });

    useEffect(() => {
        // Add class to body
        document.body.classList.add('assessmentBody');

        return () => {
            // Remove class when leaving the page
            document.body.classList.remove('assessmentBody');
        };
    }, []);

    // Fetch completed quizzes on load
    useEffect(() => {
        const fetchCompletedQuizzes = async () => {
            if (userId) {
                const { data, error } = await supabase
                    .from("user_assessment_progress")
                    .select("*")
                    .eq("user_id", userId);

                if (error) {
                    console.error("Error fetching quiz progress:", error);
                } else {
                    const completed = data.map((entry) => ({
                        quiz:
                            entry.quiz_id === 1
                                ? "Quiz 1"
                                : entry.quiz_id === 2
                                    ? "Quiz 2"
                                    : "Final Assessment",
                        score: entry.score,
                        completed: entry.completed,
                    }));
                    setCompletedQuizzes(completed.map((item) => item.quiz));
                }
            }
        };
        fetchCompletedQuizzes();
    }, [userId]);

    const fetchQuestions = async (quiz) => {
        let lessonIds;
        if (quiz === "Quiz 1") {
            lessonIds = [1, 2, 3];
        } else if (quiz === "Quiz 2") {
            lessonIds = [4, 5, 6];
        } else if (quiz === "Quiz 3") {
            lessonIds = [7, 8, 9];
        } else if (quiz === "Quiz 4") {
            lessonIds = [10, 11, 12];
        }

        const { data, error } = await supabase
            .from("assessment")
            .select("*")
            .in("lesson_id", lessonIds)
            .limit(6);

        if (error) {
            console.error("Error fetching questions:", error);
            return;
        }

        setQuestions(data);
        setCurrentQuiz(quiz);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setScore(0);
    };

    const fetchFinalQuestions = async () => {
        const { data, error } = await supabase
            .from("assessment")
            .select("*")
            .order("question_id", { ascending: false })
            .limit(12);

        if (error) {
            console.error("Error fetching final questions:", error);
            return;
        }

        setQuestions(data);
        setCurrentQuiz("Final Assessment");
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setScore(0);
    };

    const handleAnswer = (questionId, answer) => {
        setUserAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: answer }));
    };

    // Define progressPercentage outside of submitQuiz
    const progressPercentage = () => {
        if (questions.length === 0) return 0;
        return ((currentQuestionIndex + 1) / questions.length) * 100;
    };

    const submitQuiz = async () => {
        const calculatedScore = questions.reduce((acc, question) => {
            return acc + (userAnswers[question.question_id] === question.answer ? 1 : 0);
        }, 0);

        setScore(calculatedScore);

        const passingScore = currentQuiz === "Final Assessment" ? 8 : 5; // Final: 8/12, Regular: 5/6
        const totalQuestions = currentQuiz === "Final Assessment" ? 12 : 6;

        const passed = calculatedScore >= passingScore;

        // Track incorrect questions
        const incorrect = questions.filter(
            (q) => userAnswers[q.question_id] !== q.answer
        );
        setIncorrectQuestions((prev) => [
            ...prev,
            ...incorrect.map((q) => ({
                quiz: currentQuiz,
                question: q.question,
                correctAnswer: q.answer,
            })),
        ]);

        if (passed) {
            setCompletedQuizzes((prev) => [...prev, currentQuiz]);
            setShowCongratulatoryModal(true);
        } else {
            alert(`You scored ${calculatedScore}/${totalQuestions}. Try again!`);
        }

        // Insert into database
        if (userId) {
            const quizIdMapping = {
                "Quiz 1": 1,
                "Quiz 2": 2,
                "Quiz 3": 3,
                "Quiz 4": 4,
                "Final Assessment": 5,
            };

            const quizId = quizIdMapping[currentQuiz]; // Map the quiz name to its ID

            if (userId) {
                const { error } = await supabase.from("user_assessment_progress").insert({
                    user_id: userId,
                    quiz_id: quizId, // Use the mapped quiz ID
                    score: calculatedScore,
                    completed: passed,
                    timestamp: new Date().toISOString(),
                });

                if (error) {
                    console.error("Error saving progress:", error);
                }
            }

            setQuestions([]);
            setCurrentQuiz(null);
        }

        // Removed progressPercentage definition here
    };



    return (
        <div className="assessment-page
        xxxsm:pt-[60px] xxsm:pt-[60px] xsm:pt-[60px] sm:pt-[60px] md:pt-[60px] lg:pt-[60px] xl:pt-[60px]
        xxxsm:px-[10px] xxsm:px-[12px] xsm:px-[15px] sm:px-[32px] md:px-[20px] lg:px-[20px] xl:px-[32px]">
            {!currentQuiz && (
                <div className={`sidebar ${showSidebar ? "open" : ""}
                xxxsm:text-[9px] xxsm:text-[10px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[16px] xl:text-[16px]
                xxxsm:w-[125px] xxsm:w-[150px] xsm:w-[175px] sm:w-[200px] md:w-[250px] lg:w-[300px] xl:w-[300px]`}>
                    <button
                        className="toggle-sidebar-btn
                        xxxsm:right-[135px] xxsm:right-[160px] xsm:right-[185px] sm:right-[210px] md:right-[260px] lg:right-[310px] xl:right-[310px]"
                        onClick={() => setShowSidebar(!showSidebar)}
                    >
                        {showSidebar ? "Close" : "Review Incorrect"}
                    </button>
                    {showSidebar && (
                        <div className="incorrect-questions">
                            <h2 className="
                            xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[16px] sm:text-[18px] md:text-[20px] lg:text-[24px] xl:text-[24px]">
                                Review Incorrect Questions
                            </h2>
                            {incorrectQuestions.map((item, idx) => (
                                <div key={idx} className="incorrect-item
                                xxxsm:text-[10px] xxsm:text-[10px] xsm:text-[12px] sm:text-[14px] md:text-[16px] lg:text-[17px] xl:text-[18px]">
                                    <strong>{item.quiz}:</strong> {item.question} <br />
                                    <span>Correct Answer: {item.correctAnswer}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="main-content">
                <h1 className="assessment-header font-semibold
                xxxsm:mb-[30px] xxsm:mb-[40px] xsm:mb-[50px] sm:mb-[60px] md:mb-[70px] lg:mb-[80px] xl:mb-[90px]
                xxxsm:text-[18px] xxsm:text-[20px] xsm:text-[26px] sm:text-[32px] md:text-[36px] lg:text-[39px] xl:text-[45px]">
                    {currentQuiz ? `Challenge Center - ${currentQuiz}` : "Challenge Center"}
                </h1>

                {!currentQuiz && (
                    <div className="quizzes-container xxxsm:flex-col xsm:flex-row items-center p-[10px]">
                        {quizzes.map((quiz, index) => {
                            const isPassed = completedQuizzes.includes(quiz); // Check if the quiz is completed (passed)
                            return (
                                <button
                                    key={index}
                                    className={`quiz-button ${isPassed ? "completed" : ""}
                                    bg-gradient-to-r from-[#414854] to-[#393e46] hover:from-[#393e46]  
                            hover:to-[#414854] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)] text-[#00adb5] hover:text-[#FFFFFF]
                            font-[500] xxxsm:text-[12px] xxsm:text-[14px] xsm:text-[18px] sm:text-[20px] md:text-[25px] lg:text-[28px] xl:text-[28px]`}
                                    onClick={() =>
                                        quiz === "Final Assessment"
                                            ? fetchFinalQuestions()
                                            : fetchQuestions(quiz)
                                    }
                                    style={{
                                        backgroundColor: isPassed ? "#16c2a2" : "", // Green for passed quizzes
                                        color: isPassed ? "#000000" : "#00adb5",
                                    }}
                                >
                                    {quiz}
                                </button>
                            );
                        })}

                    </div>
                )}

                {questions.length > 0 && (
                    <div className="quiz-container">
                        <h2 className="font-[500] xxxsm:text-[12px] xxsm:text-[14px] xsm:text-[18px] sm:text-[20px] md:text-[22px] lg:text-[26px] xl:text-[28px]">
                            Question {currentQuestionIndex + 1} of{" "}
                            {currentQuiz === "Final Assessment" ? 12 : 6}
                        </h2>
                        <div className="progress-bar
                        xxxsm:h-[12px] xxsm:h-[14px] xsm:h-[16px] sm:h-[18px] md:h-[19px] lg:h-[20px] xl:h-[20px]">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progressPercentage()}%` }}
                            ></div>
                        </div>
                        <p className="font-[500] xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[14px] sm:text-[16px] md:text-[18x] lg:text-[19px] xl:text-[20px]">
                            {questions[currentQuestionIndex].question}</p>
                        <input
                            type="text"
                            className="answer-input
                            font-[500] xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[14px] sm:text-[15px] md:text-[16x] lg:text-[16px] xl:text-[18px]"
                            placeholder="Your answer"
                            value={userAnswers[questions[currentQuestionIndex].question_id] || ""}
                            onChange={(e) =>
                                handleAnswer(
                                    questions[currentQuestionIndex].question_id,
                                    e.target.value
                                )
                            }
                        />
                        <div className="navigation-buttons">
                            <button
                                className="prev-button
                                bg-[#00adb5] rounded-full hover:bg-[#00eaf6]
                            xxxsm:w-[27px] xxsm:w-[32px] xsm:w-[32px] sm:w-[35px] md:w-[40px] lg:w-[42px] xl:w-[42px]
                            transform transition duration-75 ease-in-out hover:scale-105 active:scale-95
                            focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)]"
                                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                                disabled={currentQuestionIndex === 0}
                            >
                                <img className='' alt='... ...' src='/prev-page.svg' />
                            </button>
                            <button
                                className="next-button
                                bg-[#00adb5] rounded-full hover:bg-[#00eaf6]
                            xxxsm:w-[27px] xxsm:w-[32px] xsm:w-[32px] sm:w-[35px] md:w-[40px] lg:w-[42px] xl:w-[42px]
                            transform transition duration-75 ease-in-out hover:scale-105 active:scale-95
                            focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)]"
                                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                                disabled={currentQuestionIndex === questions.length - 1}
                            >
                               <img className='' alt='... ...' src='/next-page.svg' />
                            </button>
                        </div>
                        {currentQuestionIndex === questions.length - 1 && (
                            <button className="submit-button mr-2 font-[500]
                            xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[14px] sm:text-[15px] md:text-[16x] lg:text-[16px] xl:text-[18px]
                            bg-gradient-to-r from-[#00adb5] to-[#00dbe6] hover:from-[#12e9f5]  
                            hover:to-[#45d7df] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)]" 
                            onClick={submitQuiz}>
                                Submit
                            </button>
                        )}
                        <button
                            className="quit-button
                            xxxsm:text-[10px] xxsm:text-[12px] xsm:text-[14px] sm:text-[15px] md:text-[16x] lg:text-[16px] xl:text-[18px]
                            bg-gradient-to-r from-[rgb(0,0,0)] to-[rgba(28,15,15,0.72)] hover:from-[rgba(255,17,0,0.72)]  
                            hover:to-[rgb(255,0,0)] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)]"
                            onClick={() => {
                                setQuestions([]);
                                setCurrentQuiz(null);
                            }}
                        >
                            Quit Quiz
                        </button>
                    </div>
                )}

                <CustomModal
                    isOpen={showCongratulatoryModal}
                    onClose={() => setShowCongratulatoryModal(false)}
                >
                    <h2>Congratulations!</h2>
                    <p>You passed the quiz! 🎉</p>
                    <p>
                        Your Score: {score}/
                        {currentQuiz === "Final Assessment" ? 12 : 6}
                    </p>
                    <button onClick={() => setShowCongratulatoryModal(false)}>Close</button>
                </CustomModal>
            </div>
        </div>
    );
};

export default Assessment;
