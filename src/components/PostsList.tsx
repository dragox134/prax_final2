'use client';

import { useState, useEffect } from 'react';
import { Box, Card, CardContent, CardMedia, Typography, IconButton, Grid } from '@mui/material';
import { Comment as CommentIcon, Favorite, FavoriteBorder } from '@mui/icons-material';
import LikeButton from './LikeButton';
import CommentDialog from './CommentDialog';
import { useSession } from 'next-auth/react';

interface Post {
  id: string;
  title: string;
  content: string;
  images: { url: string }[];
  likes: { id: string }[];
  _count: {
    comments: number;
    likes: number;
  };
  user: {
    name: string;
    email: string;
  };
}

interface PostsListProps {
  userId?: string;
  likedByUserId?: string;
}

export default function PostsList({ userId, likedByUserId }: PostsListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let url = '/api/posts';
        if (userId) {
          url += `?userId=${userId}`;
        } else if (likedByUserId) {
          url += `?likedByUserId=${likedByUserId}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [userId, likedByUserId]);

  const handleCommentClick = (post: Post) => {
    setSelectedPost(post);
    setIsCommentDialogOpen(true);
  };

  const handleCommentDialogClose = () => {
    setIsCommentDialogOpen(false);
    setSelectedPost(null);
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {posts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={post.images[0]?.url || '/placeholder.jpg'}
                alt={post.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {post.content}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LikeButton 
                    postId={post.id} 
                    initialLikes={post._count.likes} 
                    isLiked={likedByUserId ? true : false}
                  />
                  <IconButton onClick={() => handleCommentClick(post)}>
                    <CommentIcon />
                  </IconButton>
                  <Typography variant="body2" color="text.secondary">
                    {post._count.comments}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedPost && (
        <CommentDialog
          open={isCommentDialogOpen}
          onClose={handleCommentDialogClose}
          postId={selectedPost.id}
        />
      )}
    </Box>
  );
} 