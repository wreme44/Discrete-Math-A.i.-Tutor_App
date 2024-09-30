import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WolframAPI = ({ userSolution, exerciseQuestion }) => {

    const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
    const [stepByStep, setStepByStep] = useState(null);
    const [showSteps, setShowSteps] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const cleanLatexInput = (latexInput) => {

        return latexInput
            .replace(/\$\$/g, '') // Remove dollar signs used for wrapping
            .replace(/\\left/g, '') // Remove LaTeX commands like \left
            .replace(/\\right/g, '') // Remove \right
            .replace(/\\text\{([^}]+)\}/g, '$1') // Convert \text{...} to plain text
            .replace(/\\middle\{\|}/g, '|') // Replace LaTeX middle commands
            .replace(/\\le/g, '<=') // Replace \le with <=
            .replace(/\\ge/g, '>=') // Replace \ge with >=
            .replace(/\\times/g, '*') // Replace \times with *
            .replace(/\\div/g, '/') // Replace \div with /
            .replace(/\\cdot/g, '*') // Replace \cdot with *
            .replace(/\\pm/g, '+/-') // Replace \pm with +/-
            .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)') // Convert square root
            .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)') // Convert fractions to division
            .replace(/\\sum/g, 'sum') // Replace sum notation
            .replace(/\\infty/g, 'infinity') // Replace infinity symbol
            .replace(/\\neq/g, '!=') // Replace not equal
            .replace(/\\approx/g, '~=') // Replace approximately equal
            .replace(/\\pi/g, 'pi') // Replace pi symbol
            .replace(/\\alpha/g, 'alpha') // Greek letters example
            .replace(/\\beta/g, 'beta') // Greek letters example
            .replace(/\\gamma/g, 'gamma') // Greek letters example
            .replace(/\\ldots/g, '...') // Replace ellipsis
            .replace(/[{}]/g, ''); // Remove curly braces
    };

    useEffect(() => {

        if (userSolution && exerciseQuestion) {

            const fetchResult = async () => {

                setLoading(true);
                setError(null);
                try {
                    const input = `${exerciseQuestion}, Solution: ${cleanLatexInput(userSolution)}`

                    const formattedQuery = 'Find the Cartesian product of A = {1, 2} and B = {x, y}';
                    const response = await axios.get('http://localhost:5000/api/wolfram', {
                        params: {
                            input: formattedQuery,
                        }
                    });

                    // Log the full response from Wolfram Alpha
                    // console.log('Wolfram Alpha API Response:', response);
                    // console.log('Wolfram raw data:', response.data.queryresult)
                    const data = response.data.queryresult.pods;
                    // console.log(data)

                    // console.log('Did you mean suggestions:', response.data.queryresult.didyoumeans);

                    if (data) {
                        const resultPod = data ? data.find(pod => pod.title === 'Result') : null;
                        const stepByStepPod = data ? data.find(pod => pod.title === 'Step-by-step solution') : null;
                        // console.log('Result Pod:', resultPod);
                        // console.log('Step-by-Step Pod:', stepByStepPod);
                        setIsAnswerCorrect(resultPod?.subpods[0]?.plaintext || 'No result available.');
                        setStepByStep(stepByStepPod ? stepByStepPod.subpods.map(sp => sp.plaintext) : null);
                    }

                }
                catch (error) {
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





// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const WolframAPI = ({ userSolution, exerciseQuestion }) => {

//     const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
//     const [stepByStep, setStepByStep] = useState(null);
//     const [showSteps, setShowSteps] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     useEffect(() => {

//         if (userSolution && exerciseQuestion) {

//             const fetchResult = async () => {

//                 setLoading(true);
//                 setError(null);
//                 try {
//                     const appId = 'J5R44H-3T98YUL575';
//                     const apiUrl = `https://api.wolframalpha.com/v2/query`;

//                     const input = `${exerciseQuestion}, Solution: ${userSolution}`

//                     const response = await axios.get(apiUrl, {
//                         params: {
//                             input: input,
//                             appid: appId,
//                             format: 'plaintext',
//                             output: 'JSON'
//                         }
//                     });

//                     const data = response.data.queryresult.pods;
//                     const resultPod = data.find(pod => pod.title === 'Result');
//                     const stepByStepPod = data.find(pod => pod.title === 'Step-by-step solution');

//                     setIsAnswerCorrect(resultPod?.subpods[0]?.plaintext || 'No result available.');
//                     setStepByStep(stepByStepPod ? stepByStepPod.subpods.map(sp => sp.plaintext) : null);
//                 }
//                 catch (error) {
//                     setError('An error occurred while fetching data.');
//                     console.error(error);
//                 }
//                 setLoading(false);
//             };

//             fetchResult();
//         }
//     }, [userSolution, exerciseQuestion]);

//     if (loading) return <p>Loading...</p>;
//     if (error) return <p>{error}</p>;

//     return (
//         <div>
//             {isAnswerCorrect !== null && (
//                 <p>Your answer is: {isAnswerCorrect}</p>
//             )}

//             {stepByStep && (
//                 <>
//                     <button onClick={() => setShowSteps(!showSteps)}>
//                         {showSteps ? "Hide steps" : "View step-by-step solution"}
//                     </button>

//                     {showSteps && (
//                         <div>
//                             <h3>Step-by-step solution:</h3>
//                             <ul>
//                                 {stepByStep.map((step, index) => (
//                                     <li key={index}>{step}</li>
//                                 ))}
//                             </ul>
//                         </div>
//                     )}
//                 </>
//             )}
//         </div>
//     );
// };

// export default WolframAPI
