import { notFound } from 'next/navigation'
import { getLessonById, getUnitForLesson } from '@/lib/curriculum/index'
import LessonPage from '@/components/pages/LessonPage'

interface Props {
  params: { lessonId: string }
}

export default function LessonRoute({ params }: Props) {
  const lesson = getLessonById(params.lessonId)
  const unit = getUnitForLesson(params.lessonId)

  if (!lesson || !unit) notFound()

  if (lesson.exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center gap-4">
        <div className="text-5xl">🚧</div>
        <h2 className="text-xl font-bold text-slate-800">Coming Soon</h2>
        <p className="text-slate-500">
          This lesson is being built. Check back soon!
        </p>
        <a
          href="/learn"
          className="mt-4 bg-primary-900 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-primary-800"
        >
          Back to Learn
        </a>
      </div>
    )
  }

  return <LessonPage lesson={lesson} unitId={unit.id} />
}
