import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/api/auth/[...nextauth]/prizma";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const likedByUserId = searchParams.get('likedByUserId');

    let whereClause = {};

    if (userId) {
      whereClause = {
        userId: userId,
      };
    } else if (likedByUserId) {
      whereClause = {
        likes: {
          some: {
            user: {
              email: likedByUserId,
            },
          },
        },
      };
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        images: true,
        likes: {
          select: {
            id: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content, images } = await req.json();
    
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        userId: user.id,
        images: {
          create: images.map((url: string) => ({ url })),
        },
      },
      include: {
        images: true,
        likes: {
          select: {
            id: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 