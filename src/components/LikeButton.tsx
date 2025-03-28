"use client";

import { useState } from 'react';
import { IconButton, Typography, Box } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
  isLiked: boolean;
}

export default function LikeButton({ postId, initialLikes, isLiked: initialIsLiked }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  const handleLike = async () => {
    const newIsLiked = !isLiked;
    const newLikes = newIsLiked ? likes + 1 : likes - 1;

    // Optimistic update
    setIsLiked(newIsLiked);
    setLikes(newLikes);

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: newIsLiked ? 'POST' : 'DELETE',
      });

      if (!response.ok) {
        // Revert on error
        setIsLiked(initialIsLiked);
        setLikes(initialLikes);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(initialIsLiked);
      setLikes(initialLikes);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="body2" color="textSecondary" sx={{ mr: 0.5 }}>
        {likes}
      </Typography>
      <IconButton 
        size="small" 
        color={isLiked ? "error" : "primary"}
        onClick={handleLike}
      >
        {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
    </Box>
  );
} 