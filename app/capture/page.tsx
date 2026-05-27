"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Camera, Upload, Loader2, Check, ArrowLeft } from "lucide-react"
import type { FoodCard, MealType, RecognizedFood } from "@/types"
import { computeRarity } from "@/lib/nutrition"
import { addFoodCard } from "@/lib/storage"
import { makeMockRecognition } from "@/lib/mock/foods"

const mealOptions: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "早餐" },
  { value: "lunch", label: "午餐" },
  { value: "dinner", label: "晚餐" },
  { value: "snack", label: "零食" },
  { value: "drink", label: "饮品" },
]

export default function CapturePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [mealType, setMealType] = useState<MealType>("lunch")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RecognizedFood | null>(null)
  const [error, setError] = useState("")
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
        setResult(makeMockRecognition(mealType))
        setError(`AI识别失败 (${json.error || "unknown"})，已使用模拟数据`)
      }
    } catch {
      setResult(makeMockRecognition(mealType))
      setError("网络错误，已使用模拟数据")
    } finally {
      setLoading(false)
    }
  }

  function handleUseMock() {
    setResult(makeMockRecognition(mealType))
    setError("")
  }

  function handleConfirm() {
    if (!result) return
    const now = new Date()
    const card: FoodCard = {
      ...result,
      id: crypto.randomUUID(),
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      mealType,
      imageUrl,
      rarity: computeRarity(result),
      createdAt: now.toISOString(),
    }
    addFoodCard(card)
    setSaved(true)
    setTimeout(() => router.push("/"), 600)
  }

  return (
    <main className="min-h-screen bg-[#fffaf3] text-[#231f20]">
      <div className="mx-auto max-w-2xl px-5 py-6 sm:px-8">
        <header className="mb-6 flex items-center gap-3 border-b border-[#eadbc7] pb-4">
          <Link href="/" className="rounded-lg border border-[#e4d3be] bg-white p-2 hover:bg-gray-50">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#0f766e]">Capture</p>
            <h1 className="text-xl font-bold">拍照识别</h1>
          </div>
        </header>

        <div
          onClick={() => fileRef.current?.click()}
          className="mb-5 flex h-56 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#e4d3be] bg-white transition-colors hover:border-[#0f766e]"
        >
          {imageUrl ? (
            <img src={imageUrl} alt="preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-[#85786c]">
              <Camera size={40} />
              <p className="text-sm">点击上传食物照片</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
        </div>

        <div className="mb-5">
          <p className="mb-2 text-sm font-medium text-[#766b60]">餐次类型</p>
          <div className="flex flex-wrap gap-2">
            {mealOptions.map((m) => (
              <button
                key={m.value}
                onClick={() => setMealType(m.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  mealType === m.value
                    ? "bg-[#0f766e] text-white"
                    : "border border-[#e4d3be] bg-white text-[#3b3430] hover:bg-[#f8efe3]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 flex gap-2">
          <button
            onClick={handleAnalyze}
            disabled={!imageFile || loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0f766e] py-3 font-semibold text-white shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {loading ? "识别中..." : "AI 识别"}
          </button>
          <button
            onClick={handleUseMock}
            disabled={loading}
            className="rounded-lg border border-[#e4d3be] bg-white px-5 py-3 text-sm font-medium text-[#3b3430] hover:bg-[#f8efe3] disabled:opacity-50"
          >
            模拟
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#eadbc7] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{result.foodName}</h3>
                  <p className="mt-1 text-sm text-[#766b60]">{result.portion} · {mealType}</p>
                </div>
                <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${rarityStyle(computeRarity(result))}`}>
                  {computeRarity(result)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-[#f8efe3] p-3 text-center">
                  <p className="text-xs text-[#766b60]">热量</p>
                  <p className="mt-1 text-sm font-bold">{result.kcalMin}–{result.kcalMax}</p>
                </div>
                <div className="rounded-lg bg-[#f8efe3] p-3 text-center">
                  <p className="text-xs text-[#766b60]">蛋白质</p>
                  <p className="mt-1 text-sm font-bold">{result.protein}g</p>
                </div>
                <div className="rounded-lg bg-[#f8efe3] p-3 text-center">
                  <p className="text-xs text-[#766b60]">脂肪</p>
                  <p className="mt-1 text-sm font-bold">{result.fat}g</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {result.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#f0e3d2] px-2.5 py-0.5 text-xs text-[#665f56]">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="mt-3 text-sm italic text-[#665f56]">{result.advice}</p>
            </div>

            <button
              onClick={handleConfirm}
              disabled={saved}
              className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold text-white shadow-sm transition-colors ${
                saved ? "bg-green-600" : "bg-[#0f766e] hover:bg-[#0d6b63]"
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

function rarityStyle(r: string): string {
  const styles: Record<string, string> = {
    N: "bg-gray-100 text-gray-600",
    R: "bg-blue-50 text-blue-600",
    SR: "bg-purple-50 text-purple-600",
    SSR: "bg-amber-50 text-amber-600 border border-amber-300",
  }
  return styles[r] || styles.N
}
