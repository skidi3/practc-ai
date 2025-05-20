# Practc AI - AI Interviewer

This project is a mini version of an AI interviewer that conducts interviews based on a user's resume, responses, and job description, then generates feedback on their performance.

## Features

- Upload resume and job description
- AI-powered interview chat interface
- Comprehensive feedback generation
- Complete interview transcript storage
- Responsive design for all devices

## Tech Stack

- **Frontend**: React, TailwindCSS, React Router
- **Backend**: Node.js, Express
- **Database**: Supabase
- **AI**: OpenAI API

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account
- OpenAI API key

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials:
   ```
   cp .env.example .env
   ```
3. Update the `.env` file with your Supabase and OpenAI credentials

### Frontend Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Start the development server:
   ```
   npm run dev
   ```

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm run dev
   ```

### Database Setup

1. Create a new Supabase project
2. Run the SQL migrations from `supabase/migrations/create_tables.sql`

## Usage

1. Open the application in your browser
2. Upload your resume and the job description
3. Start the interview and answer the AI interviewer's questions
4. End the interview to get detailed feedback on your performance

## Demo

[Link to screen recording](https://your-demo-link-here)

## License

MIT