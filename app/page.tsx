export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffaf3] px-6 py-10 text-[#231f20]">
      <section className="mx-auto flex max-w-4xl flex-col gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#0f766e]">
            BiteDex MVP
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal sm:text-6xl">
            一口图鉴
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#665f56]">
            拍食物，生成卡片，喂养你的热量宠物。Next.js 和 Tailwind 已经启动。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[#f0dfc8] bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#85786c]">Stack</p>
            <p className="mt-2 text-xl font-semibold">Next.js</p>
          </div>
          <div className="rounded-lg border border-[#f0dfc8] bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#85786c]">Styling</p>
            <p className="mt-2 text-xl font-semibold">Tailwind CSS</p>
          </div>
          <div className="rounded-lg border border-[#f0dfc8] bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#85786c]">Recognition</p>
            <p className="mt-2 text-xl font-semibold">Gemini Ready</p>
          </div>
        </div>
      </section>
    </main>
  );
}
