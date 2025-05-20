import React from 'react'
import { Link } from 'react-router-dom'
import { Mic } from 'lucide-react'

const Header: React.FC = () => {
  return (
    <header className="bg-[#0F172A]/80 backdrop-blur-md border-b border-blue-900/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-2 rounded-xl group-hover:scale-105 transition-transform">
            <Mic className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Practc AI
          </span>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link to="/" className="text-blue-200 hover:text-blue-400 transition-colors font-medium">
            Home
          </Link>
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-200 hover:text-blue-400 transition-colors font-medium"
          >
            About
          </a>
        </nav>
      </div>
    </header>
  )
}

export default Header
