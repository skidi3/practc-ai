import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { InterviewProvider } from './context/InterviewContext';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import InterviewPage from './pages/InterviewPage';
import FeedbackPage from './pages/FeedbackPage';
import './App.css';

function App() {
  return (
    <Router>
      <InterviewProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
            </Routes>
          </main>
          <Toaster position="top-center" />
        </div>
      </InterviewProvider>
    </Router>
  );
}

export default App;