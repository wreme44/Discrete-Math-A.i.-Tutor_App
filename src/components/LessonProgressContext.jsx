import React, { createContext, useContext, useState } from "react";

// Create context
const LessonProgressContext = createContext();

// Create provider component
export const LessonProgressProvider = ({ children }) => {
    const [allExercisesCompleted, setAllExercisesCompleted] = useState(false);

    return (
        <LessonProgressContext.Provider value={{ allExercisesCompleted, setAllExercisesCompleted }}>
            {children}
        </LessonProgressContext.Provider>
    );
};

// Custom hook to use the lesson progress context
export const useLessonProgress = () => useContext(LessonProgressContext);
