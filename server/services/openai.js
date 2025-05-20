import OpenAI from 'openai'
import { config } from '../config/index.js'
import CircuitBreaker from './circuitBreaker.js'

export const openai = new OpenAI({
  apiKey: config.openai.apiKey
})

const breaker = new CircuitBreaker(
  async (prompt, messages) => {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [prompt, ...messages],
      temperature: 0.7,
      max_tokens: 500
    })
    return completion.choices[0].message.content
  },
  { failureThreshold: 3, resetTimeout: 30000 }
)

export const generateInterviewQuestion = async (resume, jobDesc, messages) => {
  const systemMessage = {
    role: 'system',
    content: `You are an AI interviewer conducting a job interview. Here is the context:
    
    Resume:
    ${resume}
    
    Job Description:
    ${jobDesc}
    
    Your task is to:
    1. Ask relevant questions based on the candidate's resume and the job requirements
    2. Follow-up on their responses to dig deeper into their experience
    3. Evaluate their responses for technical accuracy and communication skills
    4. Be professional and encouraging while maintaining high standards
    
    Ask one question at a time and adapt your questions based on their previous responses.
    If this is the first message, introduce yourself briefly and ask the first question.`
  }

  try {
    return await breaker.fire(systemMessage, messages)
  } catch (error) {
    console.error('OpenAI API error:', error)
    return "I apologize, but I'm having trouble generating a response right now. Could you please repeat your last answer?"
  }
}

export const generateFeedback = async (resume, jobDesc, messages) => {
  const systemMessage = {
    role: 'system',
    content: `You are an expert AI interviewer analyzing an interview. Based on the candidate's resume, job description, and interview responses, provide structured feedback in the following JSON format:

    {
      "overallFeedback": "A detailed paragraph evaluating the candidate's performance",
      "strengths": ["Array of specific strengths demonstrated"],
      "areasForImprovement": ["Array of specific areas needing improvement"],
      "score": A number between 1-100 representing overall performance,
      "questionAnalysis": [{
        "question": "The question asked",
        "answer": "The candidate's response",
        "feedback": "Specific feedback on this response"
      }]
    }

    Ensure the response is valid JSON. Focus on:
    1. Technical competency
    2. Communication skills
    3. Experience relevance
    4. Problem-solving ability`
  }

  try {
    const response = await breaker.fire(systemMessage, messages)
    console.log(response)
    let feedback

    try {
      feedback = JSON.parse(response)
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      // Provide fallback structured feedback
      feedback = {
        overallFeedback:
          'Based on the interview, the candidate showed good potential but we encountered technical difficulties in generating detailed feedback.',
        strengths: ['Communication skills demonstrated', 'Willingness to engage in the interview process'],
        areasForImprovement: ['Further evaluation needed for detailed assessment'],
        score: 70
      }
    }

    return feedback
  } catch (error) {
    console.error('Error generating feedback:', error)
    return {
      overallFeedback:
        'We encountered an issue generating detailed feedback. However, the interview was completed successfully.',
      strengths: ['Interview completed successfully'],
      areasForImprovement: ['Technical difficulties prevented detailed analysis'],
      score: 70
    }
  }
}
