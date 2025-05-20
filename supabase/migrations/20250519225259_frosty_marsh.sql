/*
  # Initial schema setup for Practc AI Interviewer

  1. New Tables
    - `resumes` - Stores uploaded resume files and content
    - `job_descriptions` - Stores uploaded job description files
    - `interviews` - Tracks interview sessions with username
    - `messages` - Stores the interview transcript
    - `feedback` - Stores AI-generated feedback
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated and anonymous users
    
  3. Storage
    - Add storage-related columns
    - Configure Redis integration
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS redis_fdw;

-- Create Redis server configuration
CREATE SERVER IF NOT EXISTS redis_server
  FOREIGN DATA WRAPPER redis_fdw
  OPTIONS (address '127.0.0.1', port '6379');

-- Create user mapping for Redis
CREATE USER MAPPING IF NOT EXISTS FOR CURRENT_USER
  SERVER redis_server
  OPTIONS (password 'your_redis_password');

-- Create foreign table for Redis data
CREATE FOREIGN TABLE IF NOT EXISTS redis_data (
  key text,
  value text
) SERVER redis_server;

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  file_name text NOT NULL,
  file_path text NOT NULL,
  storage_path text,
  public_url text,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create job_descriptions table
CREATE TABLE IF NOT EXISTS job_descriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  file_name text NOT NULL,
  file_path text NOT NULL,
  storage_path text,
  public_url text,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  username text NOT NULL,
  resume_id uuid REFERENCES resumes(id) NOT NULL,
  job_description_id uuid REFERENCES job_descriptions(id) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid REFERENCES interviews(id) NOT NULL,
  role text NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid REFERENCES interviews(id) NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for both authenticated and anonymous users
-- Resumes policies
CREATE POLICY "Allow access to resumes"
  ON resumes
  FOR ALL
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Job descriptions policies
CREATE POLICY "Allow access to job descriptions"
  ON job_descriptions
  FOR ALL
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Interviews policies
CREATE POLICY "Allow access to interviews"
  ON interviews
  FOR ALL
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Allow access to messages"
  ON messages
  FOR ALL
  USING (
    interview_id IN (
      SELECT id FROM interviews WHERE user_id IS NULL OR user_id = auth.uid()
    )
  );

-- Feedback policies
CREATE POLICY "Allow access to feedback"
  ON feedback
  FOR ALL
  USING (
    interview_id IN (
      SELECT id FROM interviews WHERE user_id IS NULL OR user_id = auth.uid()
    )
  );

-- Functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_job_descriptions_updated_at
  BEFORE UPDATE ON job_descriptions
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();