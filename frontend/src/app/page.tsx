export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="rounded-full bg-pitch-100 px-4 py-1 text-sm font-semibold text-pitch-700">
        GoalPredict Live
      </span>
      <h1 className="text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
        Football-Lover <span className="text-pitch-500">⚽</span>
      </h1>
      <p className="max-w-xl text-ink-700">
        Dự đoán kết quả từng tiêu chí của trận đấu, tranh{' '}
        <span className="font-semibold text-gold-600">gold</span> theo từng trận và leo bảng xếp
        hạng số trận thắng trong tháng.
      </p>
      <div className="flex gap-3">
        <button className="rounded-lg bg-pitch-500 px-5 py-2.5 font-medium text-white transition hover:bg-pitch-600">
          Xem trận đấu
        </button>
        <button className="rounded-lg border border-ink-100 bg-white px-5 py-2.5 font-medium text-ink-800 transition hover:bg-ink-50">
          Đăng nhập
        </button>
      </div>
    </main>
  );
}
