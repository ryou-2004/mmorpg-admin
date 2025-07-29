export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          MMORPG 管理画面
        </h1>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-lg text-gray-600 text-center">
            システム管理者用ダッシュボード
          </p>
          <div className="mt-6 text-center">
            <a 
              href="/login" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              ログイン
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}