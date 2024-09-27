import React, { useEffect, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { supabase } from "../supabaseClient";
import LatexRenderer from "./LatexRenderer";

const ExercisesPage = () => {
  // State to hold exercises data fetched from the database
  const [exercisesData, setExercisesData] = useState([]);
  // State to keep track of current lesson index
  const [currentExerciseIndex, setcurrentExerciseIndex] = useState(() => {

    const savedIndex = sessionStorage.getItem("currentExerciseIndex");
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });
  // Toggle hint
  const [showHint, setShowHint] = useState(false);
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const fetchExercises = async () => {
      const { data, error } = await supabase
        .from('exercises') // Ensure the table name matches exactly
        .select('*')
        .order('exercise_id', { ascending: true }); // Order by 'id' column in ascending order

      if (error) {
        console.error('Error fetching exercises:', error.message);
        setError(error.message);
      } else {
        setExercisesData(data);
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const handlePrevious = () => {
    const newIndex = currentExerciseIndex - 1;
    setcurrentExerciseIndex(newIndex);
    sessionStorage.setItem("currentExerciseIndex", newIndex);
    setShowHint(false);
  };

  const handleNext = () => {
    const newIndex = currentExerciseIndex + 1;
    setcurrentExerciseIndex(newIndex);
    sessionStorage.setItem("currentExerciseIndex", newIndex);
    setShowHint(false);
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  if (loading) return <p>Loading exercises...</p>;
  if (error) return <p>{error}</p>;

  const currentExercise = exercisesData[currentExerciseIndex];

  const renderContent = (question) => {
    // Regex to detect LaTeX code between $...$ or $$...$$
    const latexRegex = /\$\$(.*?)\$\$|\$(.*?)\$/g;

    // Check if question contains LaTeX
    const hasLatex = latexRegex.test(question);

    if (hasLatex) {
      // If LaTeX is detected, use LatexRenderer for LaTeX question
      return <LatexRenderer question={question} />;
    } else {
      // Render non-LaTeX question as plain HTML
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(marked(question)),
          }}
        />
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {currentExercise && (
        <h2 className="text-xl font-bold mb-1">{currentExercise.title}</h2>
      )}
      <div className="flex-1 overflow-y-auto p-2 bg-gray-900 rounded prose prose-sm sm:prose lg:prose-lg text-white w-full override-max-width">
        {currentExercise && (
          <>
            {renderContent(currentExercise.question)}
            {showHint && (
              <div className="mt-4 pb-1 pt-0 px-2 bg-gray-600 rounded">
                <h3 className="text-md font-semibold mb-1">Hint:</h3>
                <p className="text-sm">{currentExercise.hint}</p>
              </div>
            )}
          </>
        )}
      </div>
      <div className="mt-4 flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentExerciseIndex === 0}
          className={`px-2 py-1 rounded ${currentExerciseIndex === 0
            ? "bg-blue-900 cursor-not-allowed"
            : "bg-blue-700 hover:bg-blue-800"
            } text-white`}
        >
          Previous
        </button>
        <button
          onClick={toggleHint}
          className="px-2 py-1 bg-gray-500 hover:bg-gray-600 rounded text-white"
        >
          {showHint ? "Hide Hint" : "Show Hint"}
        </button>
        <button
          onClick={handleNext}
          disabled={currentExerciseIndex === exercisesData.length - 1}
          className={`mr-2 px-4 py-1 rounded ${currentExerciseIndex === exercisesData.length - 1
            ? "bg-blue-900 cursor-not-allowed"
            : "bg-blue-700 hover:bg-blue-800"
            } text-white`}
        >
          Next
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-400">
        Exercise {currentExerciseIndex + 1} of {exercisesData.length}
      </p>
    </div>
  );
};

export default ExercisesPage;