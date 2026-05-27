"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { FoodCard, MealType, RecognizedFood } from "@/lib/types"
import { addFoodCard } from "@/lib/storage"
import { computeRarity } from "@/lib/nutrition"
import { getRandomMockFood } from "@/lib/mock"
import { FoodCardComponent } from "@/components/food/FoodCardComponent"
import { Camera, Upload, Loader2, Check } from "lucide-react"

const mealTypes: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "早餐" },
  { value: "lunch", label: "午餐" },
  { value: "dinner", label: "晚餐" },
  { value: "snack", label: "零食" },
]

export default function CapturePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [mealType, setMealType] = useState<MealType>("lunch")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RecognizedFood | null>(null)
  const [error, setError] = useState<string>("")
  const [saved, setSaved] = useState(false)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImageUrl(URL.createObjectURL(file))
    setResult(null)
    setSaved(false)
    setError("")
  }

  async function handleAnalyze() {
    if (!imageFile) return
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("image", imageFile)
      formData.append("mealType", mealType)

      const res = await fetch("/api/recognize", { method: "POST", body: formData })
      const json = await res.json()

      if (json.success && json.data) {
        setResult(json.data)
      } else {
        const mock = getRandomMockFood()
        setResult(mock)
        setError(`AI识别失败 (${json.error || "unknown"})，已使用模拟数据`)
      }
    } catch {
      const mock = getRandomMockFood()
      setResult(mock)
      setError("网络错误，已使用模拟数据")
    } finally {
      setLoading(false)
    }
  }

  function handleUseMock() {
    const mock = getRandomMockFood()
    setResult(mock)
    setError("")
  }

  function handleConfirm() {
    if (!result) return

    const now = new Date()
    const card: FoodCard = {
      id: crypto.randomUUID(),
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      mealType,
      foodName: result.foodName,
      portion: result.portion,
      imageUrl: imageUrl,
      kcalMin: result.kcalMin,
      kcalMax: result.kcalMax,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      tags: result.tags,
      rarity: computeRarity(result.biteScore),
      biteScore: result.biteScore,
      confidence: result.confidence,
      advice: result.advice,
      createdAt: now.toISOString(),
    }

    addFoodCard(card)
    setSaved(true)
    setTimeout(() => router.push("/"), 800)
  }

  return (
    <main className="min-h-screen bg-[#fffaf3] px-4 py-6">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-center text-xl font-bold text-gray-800">拍照识别</h1>

        <div
          onClick={() => fileRef.current?.click()}
          className="relative mb-4 flex h-56 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-white transition-colors hover:border-teal-400"
        >
          {imageUrl ? (
            <img src={imageUrl} alt="preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Camera size={40} />
              <p className="text-sm">点击上传食物照片</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-gray-600">餐次类型</p>
          <div className="flex gap-2">
            {mealTypes.map((m) => (
              <button
                key={m.value}
                onClick={() => setMealType(m.value)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  mealType === m.value
                    ? "bg-teal-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            onClick={handleAnalyze}
            disabled={!imageFile || loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-semibold text-white disabled:opacity-50 hover:bg-teal-700 transition-colors"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {loading ? "识别中..." : "AI 识别"}
          </button>
          <button
            onClick={handleUseMock}
            disabled={loading}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            模拟
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <FoodCardComponent
              card={{
                id: "preview",
                date: new Date().toISOString().slice(0, 10),
                time: new Date().toTimeString().slice(0, 5),
                mealType,
                foodName: result.foodName,
                portion: result.portion,
                imageUrl,
                kcalMin: result.kcalMin,
                kcalMax: result.kcalMax,
                protein: result.protein,
                carbs: result.carbs,
                fat: result.fat,
                tags: result.tags,
                rarity: computeRarity(result.biteScore),
                biteScore: result.biteScore,
                confidence: result.confidence,
                advice: result.advice,
                createdAt: new Date().toISOString(),
              }}
            />

            <button
              onClick={handleConfirm}
              disabled={saved}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition-colors ${
                saved ? "bg-green-500" : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              {saved ? <Check size={18} /> : null}
              {saved ? "已加入今日记录！" : "确认加入今日记录"}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
