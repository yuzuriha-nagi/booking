export type UserRole = 'visitor' | 'host' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  photoURL?: string
  role: UserRole
  userType?: 'student' | 'parent' | 'business' | 'visitor'
  createdAt: Date
  updatedAt: Date
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

export interface RoleApplication {
  id: string
  userId: string
  userName: string
  userEmail: string
  currentRole: UserRole
  requestedRole: UserRole
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
  reviewedBy?: string
  reviewedAt?: Date
  reviewComment?: string
}