import { ClassEvent, TimeSlot } from '@/types'

export const sampleClassEvents: ClassEvent[] = [
  {
    id: 'class-1a',
    className: '1年A組',
    grade: '1年',
    eventName: '謎解き脱出ゲーム',
    description: '教室を使った本格的な謎解きゲームです。チームで協力して謎を解き明かそう！',
    location: '1A教室',
    maxCapacity: 6,
    duration: 30,
    imageUrl: '/images/escape-room.jpg',
    tags: ['謎解き', 'チーム戦', '体験型'],
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01'),
  },
  {
    id: 'class-2b',
    className: '2年B組',
    grade: '2年',
    eventName: 'プログラミング体験教室',
    description: 'Scratchを使って簡単なゲームを作ってみよう。プログラミング初心者大歓迎！',
    location: '第1情報処理室',
    maxCapacity: 12,
    duration: 45,
    imageUrl: '/images/programming.jpg',
    tags: ['プログラミング', '体験', '学習'],
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01'),
  },
  {
    id: 'class-3c',
    className: '3年C組',
    grade: '3年',
    eventName: 'ロボット操縦体験',
    description: '学生が製作したロボットを実際に操縦できます。最新技術を体感しよう！',
    location: 'ロボット工学実習室',
    maxCapacity: 4,
    duration: 20,
    imageUrl: '/images/robot.jpg',
    tags: ['ロボット', '技術', '操縦体験'],
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01'),
  },
  {
    id: 'class-4d',
    className: '4年D組',
    grade: '4年',
    eventName: 'カフェ＆軽食',
    description: '学生が手作りするドリンクと軽食をお楽しみください。テイクアウトも可能です。',
    location: '4D教室',
    maxCapacity: 20,
    duration: 60,
    imageUrl: '/images/cafe.jpg',
    tags: ['カフェ', '軽食', 'ドリンク'],
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01'),
  },
  {
    id: 'class-5e',
    className: '5年E組',
    grade: '5年',
    eventName: '卒業研究発表',
    description: '5年生の卒業研究成果を分かりやすく解説します。最新の研究成果をご覧ください。',
    location: '大講義室',
    maxCapacity: 50,
    duration: 30,
    imageUrl: '/images/presentation.jpg',
    tags: ['研究発表', '学術', '卒業研究'],
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01'),
  },
]

export const generateTimeSlots = (classEventId: string, date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = []
  const startHour = 10 // 10:00から開始
  const endHour = 16   // 16:00まで

  const event = sampleClassEvents.find(e => e.id === classEventId)
  if (!event) return []

  const slotCount = ((endHour - startHour) * 60) / event.duration

  for (let i = 0; i < slotCount; i++) {
    const startTime = new Date(date)
    startTime.setHours(startHour, 0 + (i * event.duration), 0, 0)

    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + event.duration)

    slots.push({
      id: `${classEventId}-slot-${i}`,
      classEventId,
      startTime,
      endTime,
      currentBookings: Math.floor(Math.random() * (event.maxCapacity + 1)),
      maxCapacity: event.maxCapacity,
      isAvailable: true,
    })
  }

  return slots
}