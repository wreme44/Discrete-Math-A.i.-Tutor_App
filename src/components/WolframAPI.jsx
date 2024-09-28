import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WolframAPI = ({userSolution, exerciseQuestion}) => {

  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [stepByStep, setStepByStep] = useState(null);
  const [showSteps, setShowSteps] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {

    if (userSolution && exerciseQuestion) {

      const fetchResult = async () => {

        setLoading(true);
        setError(null);
        try {
          const appId = 'J5R44H-3T98YUL575';
          const apiUrl = `https://api.wolframalpha.com/v2/query`;

          const input = `${exerciseQuestion}, Solution: ${userSolution}`

          const response = await axios.get(apiUrl, {
            params: {
              input: input,
              appid: appId,
              format: 'plaintext',
              output: 'JSON'
            }
          });

          const data = response.data.queryresult.pods;
          const resultPod = data.find(pod => pod.title === 'Result');
          const stepByStepPod = data.find(pod => pod.title === 'Step-by-step solution');

          setIsAnswerCorrect(resultPod?.subpods[0]?.plaintext || 'No result available.');
          setStepByStep(stepByStepPod ? stepByStepPod.subpods.map(sp => sp.plaintext) : null);
        } catch (error) {
          setError('An error occurred while fetching data.');
          console.error(error);
        }
        setLoading(false);
      };

      fetchResult();
    }
  }, [userSolution, exerciseQuestion]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      {isAnswerCorrect !== null && (
        <p>Your answer is: {isAnswerCorrect}</p>
      )}

      {stepByStep && (
        <>
          <button onClick={() => setShowSteps(!showSteps)}>
            {showSteps ? "Hide steps" : "View step-by-step solution"}
          </button>

          {showSteps && (
            <div>
              <h3>Step-by-step solution:</h3>
              <ul>
                {stepByStep.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WolframAPI
