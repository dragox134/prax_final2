"use client";

import { Post } from "@prisma/client";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { Paper, IconButton, Box } from "@mui/material";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useState } from "react";
import LikeButton from "@/components/LikeButton";
import CommentDialog from "@/components/CommentDialog";

// Define a type for the post data including images and likes
type PostWithImages = Post & {
  images: {
    imageUrl: string;
  }[];
  likes: {
    userId: string;
  }[];
  _count: {
    comments: number;
  };
};

// Function to shuffle an array of PostWithImages
function shuffleArray(array: PostWithImages[]): PostWithImages[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

export default function PostsList({ posts }: { posts: PostWithImages[] }) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Shuffle the posts array to randomize the order
  const shuffledPosts = shuffleArray(posts);

  const handleCommentClick = (postId: string) => {
    setSelectedPostId(postId);
  };

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
                isLiked={post.likes.some(like => like.userId === post.userId)}
              />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary" sx={{ mr: 0.5 }}>
                  {post._count.comments}
                </Typography>
                <IconButton 
                  size="small" 
                  color="primary"
                  onClick={() => handleCommentClick(post.id)}
                >
                  <ChatBubbleOutlineIcon />
                </IconButton>
              </Box>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {post.caption || "No caption available"}
            </Typography>
          </Paper>
        ))}
      </div>

      <CommentDialog
        open={!!selectedPostId}
        onClose={() => setSelectedPostId(null)}
        postId={selectedPostId || ''}
      />
    </div>
  );
} 