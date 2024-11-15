import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  console.log('API route: /api/analyze-image called')
  try {
    const { image } = await request.json()
    console.log('Received image data, length:', image.length)

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "")
    const imageUrl = `data:image/png;base64,${base64Data}`

    console.log('Calling OpenAI API...')
    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Identify the occupied chairs. Give the result in JSON form." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    })

    console.log('OpenAI API response received')
    return NextResponse.json({ description: response.choices[0].message.content })
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json({ error: "Error processing image" }, { status: 500 })
  }
}