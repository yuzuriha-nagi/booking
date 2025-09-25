import { TimeSlot, ClassEvent } from '@/types'

export const generateTimeSlots = (event: ClassEvent, date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = []
  const startHour = 10 // 10:00から開始
  const endHour = 16   // 16:00まで

  if (!event) return []

  const slotCount = ((endHour - startHour) * 60) / event.duration

  for (let i = 0; i < slotCount; i++) {
    const startTime = new Date(date)
    startTime.setHours(startHour, 0 + (i * event.duration), 0, 0)

    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + event.duration)

    slots.push({
      id: `${event.id}-slot-${i}`,
      classEventId: event.id,
      startTime,
      endTime,
      currentBookings: 0,
      maxCapacity: event.maxCapacity,
      isAvailable: true,
    })
  }

  return slots
}