import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Parse form data
    const formData = await req.formData();
    const selectedModules = formData.getAll('modules') as string[];

    // Delete all existing module assignments for this user
    await prisma.userModule.deleteMany({
      where: { userId: session.user.id },
    });

    // Create new module assignments
    if (selectedModules.length > 0) {
      await prisma.userModule.createMany({
        data: selectedModules.map((moduleId) => ({
          userId: session.user.id,
          moduleId,
        })),
      });
    }

    // Redirect back to settings with success message
    return NextResponse.redirect(
      new URL('/dashboard/settings?success=Modules updated successfully', req.url)
    );
  } catch (error) {
    console.error('Module update error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=Failed to update modules', req.url)
    );
  }
}
