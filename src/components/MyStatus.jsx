import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const UserProgress = () => {
  const [userProgress, setUserProgress] = useState([]);
  const [userId, setUserId] = useState(() => {
    const savedUserId = sessionStorage.getItem('userId');
    return savedUserId ? JSON.parse(savedUserId) : null;
  });
  const [totalExercises, setTotalExercises] = useState(0);
  const [completedExercises, setCompletedExercises] = useState(0);

  // Calculate completion percentage
  const completionPercentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  useEffect(() => {
    const fetchUserProgress = async () => {
      if (userId) {
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
        }

        // Fetch total exercises from exercises table
        const { data: allExercisesData, error: allExercisesError } = await supabase
          .from("exercises")
          .select("exercise_id");

        if (allExercisesError) {
          console.error("Error fetching total exercises:", allExercisesError);
        } else {
          setTotalExercises(allExercisesData.length);
        }

        // Fetch completed exercises for the user
        const { data: completedData, error: completedError } = await supabase
          .from("user_exercise_progress")
          .select("completed")
          .eq("user_id", userId)
          .eq("completed", true);

        if (completedError) {
          console.error("Error fetching completed exercises:", completedError);
        } else {
          setCompletedExercises(completedData.length);
        }
      }
    };

    fetchUserProgress();
  }, [userId]);

  return (
    <div className="p-4 bg-gray-800 rounded shadow-lg">
      <h3 className="text-2xl font-bold mb-4 text-white">Your Progress</h3>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="text-white font-semibold mb-2">
          {`Exercises Completed: ${completedExercises} / ${totalExercises} (${completionPercentage}%)`}
        </div>
        <div className="w-full bg-gray-700 h-4 rounded">
          <div
            className="bg-green-500 h-full rounded"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      <table className="table-auto w-full text-white">
        <thead>
          <tr className="bg-gray-700">
            <th className="px-4 py-2">Lesson Title</th>
            <th className="px-4 py-2">Completed</th>
            <th className="px-4 py-2">Completed At</th>
          </tr>
        </thead>
        <tbody>
          {userProgress.length > 0 ? (
            userProgress.map((progress) => (
              <tr key={progress.lesson_id} className="bg-gray-600">
                <td className="border px-4 py-2">{progress.lessons.title}</td>
                <td className="border px-4 py-2">
                  {progress.completed ? "Yes" : "No"}
                </td>
                <td className="border px-4 py-2">
                  {progress.completed_at
                    ? new Date(progress.completed_at).toLocaleString(undefined, {
                      timeZoneName: 'short'
                    })
                    : "N/A"}
                </td>
              </tr>
            ))
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
  );
};

export default UserProgress;
