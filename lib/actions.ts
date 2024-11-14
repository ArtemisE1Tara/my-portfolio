'use server'

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function analyzeImage(base64Image: string) {
  console.log('Server action: analyzeImage called')

  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key is not set')
    throw new Error('OpenAI API key is not set')
  }

  try {
    console.log('Calling OpenAI API...')
    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image and tell me if there are any occupied chairs. If there are, describe their locations." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    })

    console.log('OpenAI API response received')
    return response.choices[0].message.content
  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    throw new Error('Failed to analyze image')
  }
}