import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { CheckCircle, AlertCircle, Calendar, User, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import AttendanceActions from './AttendanceActions'

export default async function AttendancePage({
  params,
}: {
  params: Promise<{ registrationId: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const { registrationId } = await params

  const registration = await prisma.eventRegistration.findUnique({
    where: { id: registrationId },
    include: {
      event: {
        include: {
          user: true,
          formFields: {
            orderBy: { order: 'asc' },
          },
        },
      },
      attendance: {
        orderBy: { checkedInAt: 'desc' },
      },
    },
  })

  if (!registration) {
    notFound()
  }

  // Check if current user is the event creator
  const isEventCreator = registration.event.userId === session.user.id

  if (!isEventCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            Only the event creator can mark attendance.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const formData = JSON.parse(registration.formData)
  const hasAttended = registration.attendance.length > 0
  const latestAttendance = registration.attendance[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-12 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link
          href={`/dashboard/modules/events/${registration.event.id}/registrations`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Registrations
        </Link>

        {/* Event Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 mb-2 sm:mb-4">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">{registration.event.name}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Event Check-in</p>
            </div>
          </div>
        </div>

        {/* Attendee Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-8 mb-4 sm:mb-6">
          <h1 className="text-2xl font-bold mb-6">Attendee Information</h1>

          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{registration.email}</div>
              </div>
            </div>

            {/* Registration Status */}
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Registration Status</div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                    registration.status === 'accepted'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : registration.status === 'rejected'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}
                >
                  {registration.status}
                </span>
              </div>
            </div>

            {/* Form Responses */}
            {Object.keys(formData).length > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-3">Registration Details</div>
                <div className="space-y-2">
                  {Object.entries(formData).map(([fieldId, value]) => {
                    const field = registration.event.formFields.find(f => f.id === fieldId)
                    const label = field?.label || fieldId
                    return (
                      <div key={fieldId} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                        <span className="text-sm text-muted-foreground font-medium">{label}:</span>
                        <span className="text-sm font-medium break-words">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-8">
          {hasAttended ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Already Checked In</h2>
              <p className="text-muted-foreground mb-4">
                This attendee was checked in at:
              </p>
              <p className="text-lg font-medium mb-6">
                {new Date(latestAttendance.checkedInAt).toLocaleString()}
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Total check-ins: {registration.attendance.length}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Mark Attendance</h2>
              <p className="text-muted-foreground mb-6">
                Confirm this attendee's presence at the event
              </p>
              <AttendanceActions registrationId={registration.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
