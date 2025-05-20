import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import OpenAI from 'openai';
import { Buffer } from 'buffer';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

// Configure environment variables
const PORT = process.env.PORT || 3001;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to ensure bucket exists before upload
async function ensureBucketExists(bucketName) {
  try {
    const { data: bucket, error } = await supabase.storage.getBucket(bucketName);
    
    if (error && error.message === 'Bucket not found') {
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        fileSizeLimit: 5242880 // 5MB in bytes
      });
      
      if (createError) throw createError;
      return data;
    } else if (error) {
      throw error;
    }
    
    return bucket;
  } catch (error) {
    console.error(`Error ensuring bucket ${bucketName} exists:`, error);
    throw error;
  }
}

// Helper function to upload file to Supabase Storage
async function uploadToSupabase(file, bucketName) {
  try {
    // Ensure bucket exists
    await ensureBucketExists(bucketName);
    
    const timestamp = Date.now();
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600'
      });

    if (error) throw error;

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return {
      path: fileName,
      publicUrl
    };
  } catch (error) {
    console.error(`Error uploading to ${bucketName}:`, error);
    throw error;
  }
}

// Helper function to extract text from different file types
async function extractTextFromFile(buffer, mimetype) {
  try {
    if (mimetype === 'application/pdf') {
      const data = await pdf(buffer);
      return data.text;
    } else if (mimetype.includes('word') || mimetype.includes('docx')) {
      const result = await mammoth.extractRawText({ buffer: buffer });
      return result.value;
    } else if (mimetype === 'text/plain') {
      return buffer.toString('utf-8');
    }
    throw new Error('Unsupported file type');
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
}

// Upload Resume
app.post('/api/resume', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.' });
    }

    // Extract text from the resume
    const text = await extractTextFromFile(file.buffer, file.mimetype);
    
    // Upload file to Supabase Storage
    const { path: storagePath, publicUrl } = await uploadToSupabase(file, 'resumes');
    
    // Store resume information in Supabase
    const { data, error } = await supabase
      .from('resumes')
      .insert([
        {
          file_name: file.originalname,
          file_path: file.originalname,
          storage_path: storagePath,
          file_size: file.size,
          mime_type: file.mimetype,
          content: text,
          public_url: publicUrl
        }
      ])
      .select();
    
    if (error) throw error;
    
    return res.status(200).json({
      id: data[0].id,
      fileName: file.originalname,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      content: text
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error'
    });
  }
});

// Upload Job Description
app.post('/api/job-description', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from the job description
    const text = await extractTextFromFile(file.buffer, file.mimetype);
    
    // Upload file to Supabase Storage
    const { path: storagePath, publicUrl } = await uploadToSupabase(file, 'job_descriptions');
    
    // Store job description information in Supabase
    const { data, error } = await supabase
      .from('job_descriptions')
      .insert([
        {
          file_name: file.originalname,
          file_path: file.originalname,
          storage_path: storagePath,
          file_size: file.size,
          mime_type: file.mimetype,
          content: text,
          public_url: publicUrl
        }
      ])
      .select();
    
    if (error) throw error;
    
    return res.status(200).json({
      id: data[0].id,
      fileName: file.originalname,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      content: text
    });
  } catch (error) {
    console.error('Error uploading job description:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start Interview
app.post('/api/interviews', async (req, res) => {
  try {
    const { resumeId, jobDescriptionId } = req.body;
    
    if (!resumeId || !jobDescriptionId) {
      return res.status(400).json({ error: 'Resume ID and Job Description ID are required' });
    }
    
    // Get resume and job description content
    const { data: resume } = await supabase
      .from('resumes')
      .select('content')
      .eq('id', resumeId)
      .single();
    
    const { data: jobDesc } = await supabase
      .from('job_descriptions')
      .select('content')
      .eq('id', jobDescriptionId)
      .single();
    
    if (!resume || !jobDesc) {
      return res.status(404).json({ error: 'Resume or job description not found' });
    }
    
    // Create a new interview in Supabase without user_id for anonymous users
    const { data, error } = await supabase
      .from('interviews')
      .insert([
        {
          resume_id: resumeId,
          job_description_id: jobDescriptionId,
          status: 'in_progress'
        }
      ])
      .select();
    
    if (error) throw error;
    
    return res.status(201).json({
      id: data[0].id,
      resumeId: data[0].resume_id,
      jobDescriptionId: data[0].job_description_id,
      status: data[0].status,
      createdAt: data[0].created_at,
      updatedAt: data[0].updated_at
    });
  } catch (error) {
    console.error('Error starting interview:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Send Message
app.post('/api/interviews/:interviewId/messages', async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { message, isFirstMessage } = req.body;
    
    // Get interview details with resume and job description content
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select(`
        *,
        resumes (content),
        job_descriptions (content)
      `)
      .eq('id', interviewId)
      .single();
    
    if (interviewError) throw interviewError;
    
    // Get previous messages for context
    const { data: previousMessages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('interview_id', interviewId)
      .order('created_at', { ascending: true });
    
    if (messagesError) throw messagesError;
    
    // Store user message if not the first message
    if (!isFirstMessage) {
      const { error: insertError } = await supabase
        .from('messages')
        .insert([
          {
            interview_id: interviewId,
            role: 'user',
            content: message
          }
        ]);
      
      if (insertError) throw insertError;
    }
    
    // Format messages for OpenAI
    const formattedMessages = previousMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Add system message with context
    const systemMessage = {
      role: 'system',
      content: `You are an AI interviewer conducting a job interview. Here is the context:
      
      Resume:
      ${interview.resumes.content}
      
      Job Description:
      ${interview.job_descriptions.content}
      
      Your task is to:
      1. Ask relevant questions based on the candidate's resume and the job requirements
      2. Follow-up on their responses to dig deeper into their experience
      3. Evaluate their responses for technical accuracy and communication skills
      4. Be professional and encouraging while maintaining high standards
      
      Ask one question at a time and adapt your questions based on their previous responses.
      If this is the first message, introduce yourself briefly and ask the first question.`
    };
    
    // Add user's current message if not the first message
    if (!isFirstMessage) {
      formattedMessages.push({
        role: 'user',
        content: message
      });
    }
    
    // Generate AI response using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [systemMessage, ...formattedMessages],
      temperature: 0.7,
      max_tokens: 500
    });
    
    const aiResponse = completion.choices[0].message.content;
    
    // Store AI response
    const { error: aiInsertError } = await supabase
      .from('messages')
      .insert([
        {
          interview_id: interviewId,
          role: 'assistant',
          content: aiResponse
        }
      ]);
    
    if (aiInsertError) throw aiInsertError;
    
    return res.status(200).json({
      message: aiResponse
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// End Interview
app.post('/api/interviews/:interviewId/end', async (req, res) => {
  try {
    const { interviewId } = req.params;
    
    // Get interview details with resume and job description
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select(`
        *,
        resumes (content),
        job_descriptions (content)
      `)
      .eq('id', interviewId)
      .single();
    
    if (interviewError) throw interviewError;
    
    // Get all messages for the interview
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('interview_id', interviewId)
      .order('created_at', { ascending: true });
    
    if (messagesError) throw messagesError;

    let feedbackContent;
    try {
      // Generate feedback using OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert AI interviewer analyzing an interview. Review the following interview transcript and provide comprehensive feedback.
            
            Resume:
            ${interview.resumes.content}
            
            Job Description:
            ${interview.job_descriptions.content}
            
            Analyze the candidate's responses for:
            1. Technical competency
            2. Communication skills
            3. Relevance to job requirements
            4. Areas of strength
            5. Areas for improvement
            
            Format your response as a JSON object with the following structure:
            {
              "overallFeedback": "Detailed paragraph about overall performance",
              "strengths": ["Specific strength 1", "Specific strength 2"],
              "areasForImprovement": ["Specific area 1", "Specific area 2"],
              "questionAnalysis": [
                {
                  "question": "Question asked",
                  "answer": "Candidate's answer",
                  "feedback": "Specific feedback on this response"
                }
              ],
              "score": "Score out of 10 based on overall performance"
            }
            
            Ensure your response is valid JSON.`
          },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      // Parse the response and validate it's proper JSON
      try {
        feedbackContent = JSON.parse(completion.choices[0].message.content);
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        // If parsing fails, create a basic feedback structure
        feedbackContent = {
          overallFeedback: "We encountered an issue generating detailed feedback. However, the interview was completed successfully.",
          strengths: ["Interview completed"],
          areasForImprovement: ["Technical difficulties prevented detailed analysis"],
          score: 5
        };
      }
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      // Provide fallback feedback if OpenAI fails
      feedbackContent = {
        overallFeedback: "Due to technical difficulties, we couldn't generate detailed feedback. The interview was completed successfully.",
        strengths: ["Interview completed"],
        areasForImprovement: ["System encountered issues during feedback generation"],
        score: 5
      };
    }
    
    // Store feedback in Supabase
    const { error: feedbackError } = await supabase
      .from('feedback')
      .insert([
        {
          interview_id: interviewId,
          content: feedbackContent
        }
      ]);
    
    if (feedbackError) {
      console.error('Error storing feedback:', feedbackError);
      // Continue even if feedback storage fails
    }
    
    // Update interview status
    const { error: updateError } = await supabase
      .from('interviews')
      .update({ status: 'completed' })
      .eq('id', interviewId);
    
    if (updateError) {
      console.error('Error updating interview status:', updateError);
      // Continue even if status update fails
    }
    
    return res.status(200).json({
      feedback: feedbackContent
    });
  } catch (error) {
    console.error('Error ending interview:', error);
    // Return basic feedback even if everything fails
    return res.status(200).json({
      feedback: {
        overallFeedback: "The interview has been completed. Due to technical difficulties, detailed feedback couldn't be generated.",
        strengths: ["Interview completed successfully"],
        areasForImprovement: ["Technical issues prevented detailed analysis"],
        score: 5
      }
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment variables loaded:', {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_KEY: !!process.env.SUPABASE_KEY,
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY
  });
});