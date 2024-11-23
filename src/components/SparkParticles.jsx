// import { useCallback } from 'react';
// import { Particles } from '@tsparticles/react';
// import { loadSlim } from '@tsparticles/slim'; // Corrected import

// const SparkParticles = () => {
//     console.log("SparkParticles component mounted");
//     const particlesInit = (engine) => {
//         console.log("Particles engine dummy init function triggered");
//       };
//     // const particlesInit = useCallback(async (engine) => {
//     //     console.log("Attempting to load engine");
//     //     try {
//     //       await loadSlim(engine);
//     //       console.log("Particles engine initialized");
//     //     } catch (error) {
//     //       console.error("Failed to load particles engine:", error);
//     //     }
//     //   }, []);

//   return (
//     <>
//     {console.log("Rendering Particles component")}
//     <Particles
//       id="tsparticles"
//       init={particlesInit}
//       options={{
//         particles: {
//           number: {
//             value: 10,
//             density: {
//               enable: true,
//               value_area: 800,
//             },
//           },
//           color: {
//             value: ['#ffff00', '#ff9900', '#ff0000'],
//           },
//           shape: {
//             type: 'circle',
//           },
//           opacity: {
//             value: 1,
//             animation: {
//               enable: true,
//               speed: 1,
//               minimumValue: 0,
//             },
//           },
//           size: {
//             value: 5,
//             random: true,
//           },
//           move: {
//             enable: true,
//             speed: 5,
//             direction: 'random',
//             outModes: {
//               default: 'out',
//             },
//           },
//         },
//         interactivity: {
//           events: {
//             onClick: {
//               enable: true,
//               mode: 'explode',
//             },
//             onHover: {
//               enable: true,
//               mode: 'bubble',
//             },
//           },
//           modes: {
//             bubble: {
//               size: 10,
//               distance: 200,
//             },
//             repulse: {
//               distance: 150,
//             },
//             explode: {
//                 distance: 450,
//             },
//           },
//         },
//         // background: {
//         //   color: '#000000',
//         // },
//       }}
//     />
//     </>
//   );
// };

// export default SparkParticles;
