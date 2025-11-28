import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { CheckCircle, Calendar } from 'lucide-react'
import Link from 'next/link'
import QRCodeDisplay from './QRCodeDisplay'

export default async function RegistrationSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ id?: string }>
}) {
  const { slug } = await params
  const { id } = await searchParams

  if (!id) {
    notFound()
  }

  const registration = await prisma.eventRegistration.findUnique({
    where: { id },
    include: {
      event: true,
    },
  })

  if (!registration || registration.event.slug !== slug) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold mb-2">Registration Successful!</h1>
          <p className="text-lg text-muted-foreground mb-8">
            You're all set for {registration.event.name}
          </p>

          {/* Registration Details */}
          <div className="bg-muted/50 rounded-lg p-6 mb-8">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{registration.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  Pending Approval
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Registration ID:</span>
                <span className="font-mono text-sm">{registration.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Event QR Code</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Save this QR code - you'll need it for check-in at the event
            </p>
            <QRCodeDisplay qrCode={registration.qrCode} registrationId={registration.id} />
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h3 className="font-semibold mb-2">What's Next?</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>✓ We've received your registration</li>
                  <li>✓ You'll receive an email once approved</li>
                  <li>✓ Save or screenshot your QR code above</li>
                  <li>✓ Bring your QR code to the event for check-in</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/register/${slug}`}
              className="px-6 py-3 border rounded-lg hover:bg-muted transition-colors"
            >
              Back to Event
            </Link>
          </div>
        </div>

        {/* Save Instructions */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>💡 Tip: Take a screenshot of this page or bookmark it to access your QR code later</p>
        </div>
      </div>
    </div>
  )
}
