import { prisma } from "@/app/api/auth/[...nextauth]/prizma";
import PostsList from "./PostsList";

export const metadata = { title: "Zoznam prispevkov | INSTAGRAM" };

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      userId: true,
      caption: true,
      createdAt: true,
      updatedAt: true,
      tags: true,
      images: {
        select: {
          imageUrl: true,
        },
      },
      likes: {
        select: {
          userId: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return <PostsList posts={posts} />;
}