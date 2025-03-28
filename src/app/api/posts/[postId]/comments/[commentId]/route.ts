import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/api/auth/[...nextauth]/prizma";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string; commentId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the comment exists and belongs to the user
    const comment = await prisma.comment.findUnique({
      where: { id: params.commentId },
      select: { userId: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id: params.commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 