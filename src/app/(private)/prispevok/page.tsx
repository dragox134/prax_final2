import { Post } from "@prisma/client";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { Paper, IconButton, Box } from "@mui/material";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { prisma } from "@/app/api/auth/[...nextauth]/prizma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import LikeButton from "@/components/LikeButton";

export const metadata = { title: "Zoznam prispevkov | INSTAGRAM" };

// Define a type for the post data including images and likes
type PostWithImages = Post & {
  images: {
    imageUrl: string;
  }[];
  likes: {
    userId: string;
  }[];
};

// Function to shuffle an array of PostWithImages
function shuffleArray(array: PostWithImages[]): PostWithImages[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

export default async function PostsList() {
  "use server"; // This ensures the code only runs on the server

  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.email ? 
    (await prisma.user.findUnique({ where: { email: session.user.email } }))?.id : 
    null;

  // Explicitly typing the posts result as PostWithImages[]
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      caption: true,
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
    },
  }) as PostWithImages[];

  // Shuffle the posts array to randomize the order
  const shuffledPosts = shuffleArray(posts);

  return (
    <div style={{ paddingBottom: "80px", paddingLeft: "16px", paddingRight: "16px" }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
        Zoznam prispevkov
      </Typography>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: "470px", // Instagram-like width
        }}
      >
        {shuffledPosts.map((post) => (
          <Paper
            key={post.id}
            elevation={3}
            sx={{
              padding: 2,
              borderRadius: 2,
              boxShadow: 3,
              transition: "transform 0.3s ease-in-out",
              "&:hover": { transform: "scale(1.02)", boxShadow: 6 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {post.images && post.images.length > 0 && (
              <Image
                src={post.images[0].imageUrl}
                alt={post.caption || "Post image"}
                width={470}
                height={470}
                style={{ objectFit: "cover", borderRadius: "8px" }}
              />
            )}
            <Box sx={{
              display: 'flex',
              gap: 1,
              mt: 1,
              alignSelf: 'flex-start',
              width: '100%',
              padding: '0 8px'
            }}>
              <LikeButton 
                postId={post.id}
                initialLikes={post.likes.length}
                isLiked={currentUserId ? post.likes.some(like => like.userId === currentUserId) : false}
              />
              <IconButton size="small" color="primary">
                <ChatBubbleOutlineIcon />
              </IconButton>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {post.caption || "No caption available"}
            </Typography>
          </Paper>
        ))}
      </div>
    </div>
  );
}