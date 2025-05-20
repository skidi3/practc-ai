import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { InterviewProvider } from './context/InterviewContext'
import { SettingsProvider } from './context/SettingsContext'
import Header from './components/Header'
import LandingPage from './pages/LandingPage'
import InterviewPage from './pages/InterviewPage'
import FeedbackPage from './pages/FeedbackPage'
import './App.css'

function App() {
  return (
    <Router>
      <SettingsProvider>
        <InterviewProvider>
          <div className="min-h-screen bg-[#0F172A] flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/interview" element={<InterviewPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
              </Routes>
            </main>
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: '#3B82F6',
                  color: '#FFFFFF',
                  borderRadius: '12px'
                },
                duration: 2000
              }}
            />
          </div>
        </InterviewProvider>
      </SettingsProvider>
    </Router>
  )
}

export default App
