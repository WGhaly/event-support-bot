import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ArrowLeft, Users } from 'lucide-react'

export default async function RegistrationsPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      registrations: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!event || event.userId !== session.user.id) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href={`/dashboard/modules/events/${event.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Event
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Registrations</h1>
          <p className="text-muted-foreground">
            Manage registrations for {event.name}
          </p>
        </div>

        {event.registrations.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No registrations yet</h3>
            <p className="text-muted-foreground">
              Share your registration link to start receiving registrations
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Registered</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {event.registrations.map((registration) => (
                  <tr key={registration.id}>
                    <td className="px-4 py-3">{registration.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          registration.status === 'accepted'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : registration.status === 'rejected'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {registration.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(registration.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-sm text-primary hover:underline">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
