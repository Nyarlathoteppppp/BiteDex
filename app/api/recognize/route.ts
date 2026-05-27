import { z } from "zod"
import { foodTags } from "@/types"

const foodSchema = z.object({
  foodName: z.string(),
  portion: z.string(),
  estimatedMealType: z.enum(["breakfast", "lunch", "dinner", "snack", "drink", "other"]),
  kcalMin: z.number().min(0).max(5000),
  kcalMax: z.number().min(0).max(5000),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  tags: z.array(z.enum(foodTags)),
  confidence: z.number().min(0).max(1),
  biteScore: z.number().min(0).max(100),
  advice: z.string(),
})

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json({ success: false, error: "GEMINI_API_KEY not set" }, { status: 500 })
    }

    const formData = await request.formData()
    const image = formData.get("image") as File | null
    const mealType = formData.get("mealType") as string || "lunch"

    if (!image) {
      return Response.json({ success: false, error: "No image provided" }, { status: 400 })
    }

    const bytes = await image.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    const mimeType = image.type || "image/jpeg"

    const { GoogleGenAI } = await import("@google/genai")
    const baseUrl = process.env.GEMINI_BASE_URL
    const ai = new GoogleGenAI({
      apiKey,
      ...(baseUrl ? { httpOptions: { baseUrl } } : {}),
    })

    const prompt = `You are a food recognition AI. Analyze this food photo and return a JSON object with these exact fields:
- foodName: string (name of the food)
- portion: string (estimated portion size)
- estimatedMealType: one of "breakfast", "lunch", "dinner", "snack", "drink", "other" (hint: user said "${mealType}")
- kcalMin: number (minimum estimated calories)
- kcalMax: number (maximum estimated calories)
- protein: number (grams of protein)
- carbs: number (grams of carbohydrates)
- fat: number (grams of fat)
- tags: array of strings from ONLY these options: ${foodTags.join(", ")}
- confidence: number between 0 and 1
- biteScore: number 0-100 (health score, higher = healthier)
- advice: string (one sentence dietary advice)

Return ONLY valid JSON, no markdown, no code blocks.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: base64 } },
            { text: prompt },
          ],
        },
      ],
    })

    const text = response.text?.replace(/```json\n?|\n?```/g, "").trim()
    if (!text) {
      return Response.json({ success: false, error: "Empty response from Gemini" }, { status: 500 })
    }

    const parsed = JSON.parse(text)
    const validated = foodSchema.parse(parsed)

    return Response.json({ success: true, data: validated })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
