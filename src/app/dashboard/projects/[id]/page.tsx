import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { ProjectContent } from '@/components/project-content';

async function getProject(id: string, userId: string) {
  return await prisma.project.findFirst({
    where: { id, userId },
    include: {
      templates: {
        orderBy: { createdAt: 'desc' as const },
      },
      datasets: {
        orderBy: { createdAt: 'desc' as const },
      },
      exports: {
        orderBy: { startedAt: 'desc' as const },
        take: 10,
      },
      _count: {
        select: {
          templates: true,
          datasets: true,
          exports: true,
        },
      },
    },
  });
}

async function getFieldMappings(projectId: string) {
  return await prisma.fieldMapping.findMany({
    where: {
      template: { projectId },
    },
    include: {
      template: {
        select: {
          id: true,
          name: true,
        },
      },
      dataset: {
        select: {
          id: true,
          name: true,
          rowCount: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' as const },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { title: 'Unauthorized' };
  }

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    select: { name: true },
  });

  return {
    title: project ? `${project.name} | ID Card Platform` : 'Project Not Found',
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const { id } = await params;

  const [project, fieldMappings] = await Promise.all([
    getProject(id, session.user.id),
    getFieldMappings(id),
  ]);

  if (!project) {
    notFound();
  }

  return <ProjectContent project={project} fieldMappings={fieldMappings} />;
}
