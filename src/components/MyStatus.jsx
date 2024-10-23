import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const UserProgress = () => {
  const [userProgress, setUserProgress] = useState([]);
  const [userId, setUserId] = useState(() => {
    const savedUserId = sessionStorage.getItem('userId');
    return savedUserId ? JSON.parse(savedUserId) : (null);
})

  useEffect(() => {
    const fetchUserProgress = async () => {
      if (userId) {
        const { data, error } = await supabase
          .from("userprogress")
          .select(`
            lesson_id,
            completed,
            completed_at,
            lessons (title)`) // Join with lessons table to get the lesson title
          .eq("user_id", userId);

        if (error) {
          console.error("Error fetching user progress:", error);
        } else {
          setUserProgress(data);
        }
      }
    };

    fetchUserProgress();
  }, []);

  return (
    <div className="p-4 bg-gray-800 rounded shadow-lg">
      <h3 className="text-2xl font-bold mb-4 text-white">Your Progress</h3>
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
                <td className="border px-4 py-2">{progress.lessons.title}</td> {/* Display lesson title */}
                <td className="border px-4 py-2">
                  {progress.completed ? "Yes" : "No"}
                </td>
                <td className="border px-4 py-2">
                  {progress.completed_at
                    ? new Date(progress.completed_at).toLocaleString(undefined, {
                      timeZoneName: 'short' // This ensures the timestamp is shown with time zone
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
