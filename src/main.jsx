import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from '../routes/Layout.jsx';
import NotFound from '../routes/NotFound.jsx';
import SignUpRoute from '../routes/SignUpRoute.jsx';
import LoginRoute from '../routes/LoginRoute.jsx';
import Profile from '../routes/Profile.jsx';
import MyStatus from './components/MyStatus.jsx';
import ResetPassword from "./components/ResetPassword";
import Games from './components/Games.jsx';
import FlashcardChallenges from './components/FlashcardChallenges.jsx';
import MemoryMatch from './components/MemoryMatch.jsx';
import DragAndDropPuzzle from './components/DragAndDropPuzzle.jsx';
import MathHangman from './components/MathHangman.jsx';
import Assessment from './components/Assessment.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index={true} element={<App />} />
                    <Route index={false} path="/signup" element={<SignUpRoute />} />
                    <Route index={false} path="/login" element={<LoginRoute />} />
                    <Route index={false} path="/myProfile" element={<Profile />} />
                    <Route path="/myStatus" element={<MyStatus />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/games" element={<Games />} />
                    <Route path="/flashcard-challenges" element={<FlashcardChallenges />} />
                    <Route path="/memory-match" element={<MemoryMatch />} />
                    <Route path="/drag-and-drop-puzzle" element={<DragAndDropPuzzle />} />
                    <Route path="/math-hangman" element={<MathHangman />} />
                    <Route path="/assessment" element={<Assessment />} />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
