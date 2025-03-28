import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/api/auth/[...nextauth]/prizma";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
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

    const like = await prisma.like.create({
      data: {
        userId: user.id,
        postId: params.postId,
      },
    });

    return NextResponse.json(like);
  } catch (error) {
    console.error("Error creating like:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
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

    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: user.id,
          postId: params.postId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting like:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 