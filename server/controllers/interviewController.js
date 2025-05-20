import { supabase } from '../services/supabase.js'
import { generateInterviewQuestion, generateFeedback } from '../services/openai.js'
import { cacheGet, cacheSet, cacheDelete } from '../services/cache.js'

export const startInterview = async (req, res) => {
  try {
    const { resumeId, jobDescriptionId, username } = req.body

    if (!resumeId || !jobDescriptionId || !username) {
      return res.status(400).json({ error: 'Resume ID, Job Description ID, and username are required' })
    }

    const { data: resume } = await supabase.from('resumes').select('content').eq('id', resumeId).single()

    const { data: jobDesc } = await supabase
      .from('job_descriptions')
      .select('content')
      .eq('id', jobDescriptionId)
      .single()

    if (!resume || !jobDesc) {
      return res.status(404).json({ error: 'Resume or job description not found' })
    }

    const { data, error } = await supabase
      .from('interviews')
      .insert([
        {
          resume_id: resumeId,
          job_description_id: jobDescriptionId,
          username: username,
          status: 'in_progress'
        }
      ])
      .select()

    if (error) throw error

    // Cache interview context
    await cacheSet(`interview:${data[0].id}:context`, {
      resume: resume.content,
      jobDesc: jobDesc.content
    })

    return res.status(201).json({
      id: data[0].id,
      resumeId: data[0].resume_id,
      jobDescriptionId: data[0].job_description_id,
      username: data[0].username,
      status: data[0].status,
      createdAt: data[0].created_at,
      updatedAt: data[0].updated_at
    })
  } catch (error) {
    console.error('Error starting interview:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const sendMessage = async (req, res) => {
  try {
    const { interviewId } = req.params
    const { message, isFirstMessage } = req.body

    // Try to get context from cache first
    let context = await cacheGet(`interview:${interviewId}:context`)

    if (!context) {
      // Get interview with context if not in cache
      const { data: interview } = await supabase
        .from('interviews')
        .select(
          `
          *,
          resumes (content),
          job_descriptions (content)
        `
        )
        .eq('id', interviewId)
        .single()

      if (!interview) {
        return res.status(404).json({ error: 'Interview not found' })
      }

      context = {
        resume: interview.resumes.content,
        jobDesc: interview.job_descriptions.content
      }

      // Cache the context
      await cacheSet(`interview:${interviewId}:context`, context)
    }

    // Get messages with caching
    const messagesCacheKey = `interview:${interviewId}:messages`
    let previousMessages = (await cacheGet(messagesCacheKey)) || []

    if (!previousMessages.length) {
      const { data: dbMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('interview_id', interviewId)
        .order('created_at', { ascending: true })

      previousMessages = dbMessages || []
      await cacheSet(messagesCacheKey, previousMessages)
    }

    // Add user message if not first message
    if (!isFirstMessage) {
      const { error: msgError } = await supabase.from('messages').insert([
        {
          interview_id: interviewId,
          role: 'user',
          content: message
        }
      ])

      if (msgError) throw msgError

      previousMessages.push({
        role: 'user',
        content: message
      })
    }

    // Generate AI response
    const aiResponse = await generateInterviewQuestion(context.resume, context.jobDesc, previousMessages)

    // Store AI response
    const { error: aiMsgError } = await supabase.from('messages').insert([
      {
        interview_id: interviewId,
        role: 'assistant',
        content: aiResponse
      }
    ])

    if (aiMsgError) throw aiMsgError

    // Update cache with new message
    previousMessages.push({
      role: 'assistant',
      content: aiResponse
    })
    await cacheSet(messagesCacheKey, previousMessages)

    return res.status(200).json({
      message: aiResponse
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const endInterview = async (req, res) => {
  try {
    const { interviewId } = req.params

    // Get context from cache or database
    let context = await cacheGet(`interview:${interviewId}:context`)

    if (!context) {
      const { data: interview } = await supabase
        .from('interviews')
        .select(
          `
          *,
          resumes (content),
          job_descriptions (content)
        `
        )
        .eq('id', interviewId)
        .single()

      if (!interview) {
        return res.status(404).json({ error: 'Interview not found' })
      }

      context = {
        resume: interview.resumes.content,
        jobDesc: interview.job_descriptions.content
      }
    }

    // Get messages from cache or database
    let messages = await cacheGet(`interview:${interviewId}:messages`)

    if (!messages) {
      const { data: dbMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('interview_id', interviewId)
        .order('created_at', { ascending: true })

      messages = dbMessages || []
    }

    const feedbackContent = await generateFeedback(
      context.resume,
      context.jobDesc,
      messages.map((msg) => ({
        role: msg.role,
        content: msg.content
      }))
    )

    await supabase.from('feedback').insert([
      {
        interview_id: interviewId,
        content: feedbackContent
      }
    ])

    await supabase.from('interviews').update({ status: 'completed' }).eq('id', interviewId)

    // Clear cache for this interview
    await cacheDelete(`interview:${interviewId}:context`)
    await cacheDelete(`interview:${interviewId}:messages`)

    return res.status(200).json({
      feedback: feedbackContent
    })
  } catch (error) {
    console.error('Error ending interview:', error)
    return res.status(200).json({
      feedback: {
        overallFeedback:
          "The interview has been completed. Due to technical difficulties, detailed feedback couldn't be generated.",
        strengths: ['Interview completed successfully'],
        areasForImprovement: ['Technical issues prevented detailed analysis'],
        score: 5
      }
    })
  }
}
