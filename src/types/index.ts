export interface User {
  id: string
  email: string
  name: string
  photoURL?: string
  userType: 'student' | 'parent' | 'business' | 'visitor'
  createdAt: Date
}

export interface ClassEvent {
  id: string
  className: string
  grade: string
  eventName: string
  description: string
  location: string
  maxCapacity: number
  duration: number // minutes
  imageUrl?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface TimeSlot {
  id: string
  classEventId: string
  startTime: Date
  endTime: Date
  currentBookings: number
  maxCapacity: number
  isAvailable: boolean
}

export interface Reservation {
  id: string
  userId: string
  classEventId: string
  timeSlotId: string
  userName: string
  userEmail: string
  numberOfPeople: number
  specialRequests?: string
  status: 'confirmed' | 'cancelled' | 'pending'
  reservationCode: string
  createdAt: Date
  updatedAt: Date
}

export interface BookingFormData {
  numberOfPeople: number
  specialRequests?: string
}