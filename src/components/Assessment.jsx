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
        <div className="assessment-page">
            {!currentQuiz && (
                <div className={`sidebar ${showSidebar ? "open" : ""}`}>
                    <button
                        className="toggle-sidebar-btn"
                        onClick={() => setShowSidebar(!showSidebar)}
                    >
                        {showSidebar ? "Close" : "Review Incorrect"}
                    </button>
                    {showSidebar && (
                        <div className="incorrect-questions">
                            <h2>Review Incorrect Questions</h2>
                            {incorrectQuestions.map((item, idx) => (
                                <div key={idx} className="incorrect-item">
                                    <strong>{item.quiz}:</strong> {item.question} <br />
                                    <span>Correct Answer: {item.correctAnswer}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="main-content">
                <h1 className="assessment-header">
                    {currentQuiz ? `Challenge Center - ${currentQuiz}` : "Challenge Center"}
                </h1>

                {!currentQuiz && (
                    <div className="quizzes-container">
                        {quizzes.map((quiz, index) => (
                            <button
                                key={index}
                                className={`quiz-button ${completedQuizzes.includes(quiz) ? "completed" : ""
                                    }`}
                                onClick={() =>
                                    quiz === "Final Assessment"
                                        ? fetchFinalQuestions()
                                        : fetchQuestions(quiz)
                                }
                                style={{
                                    backgroundColor: completedQuizzes.includes(quiz)
                                        ? "#28a745"
                                        : "#393e46",
                                    color: completedQuizzes.includes(quiz) ? "#ffffff" : "#00adb5",
                                }}
                            >
                                {quiz}
                            </button>
                        ))}
                    </div>
                )}

                {questions.length > 0 && (
                    <div className="quiz-container">
                        <h2>
                            Question {currentQuestionIndex + 1} of{" "}
                            {currentQuiz === "Final Assessment" ? 12 : 6}
                        </h2>
                        <div className="progress-bar">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progressPercentage()}%` }}
                            ></div>
                        </div>
                        <p>{questions[currentQuestionIndex].question}</p>
                        <input
                            type="text"
                            className="answer-input"
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
                                className="prev-button"
                                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                                disabled={currentQuestionIndex === 0}
                            >
                                Previous
                            </button>
                            <button
                                className="next-button"
                                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                                disabled={currentQuestionIndex === questions.length - 1}
                            >
                                Next
                            </button>
                        </div>
                        {currentQuestionIndex === questions.length - 1 && (
                            <button className="submit-button" onClick={submitQuiz}>
                                Submit Quiz
                            </button>
                        )}
                        <button
                            className="quit-button"
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
