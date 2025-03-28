"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSession } from 'next-auth/react';

interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
}

interface CommentDialogProps {
  open: boolean;
  onClose: () => void;
  postId: string;
}

export default function CommentDialog({ open, onClose, postId }: CommentDialogProps) {
  const { data: session } = useSession();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [postId]);

  useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [open, fetchComments]);

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments(prev => [...prev, newComment]);
        setComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '600px',
        },
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6">Comments</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        p: 0,
        '&:first-of-type': { pt: 0 }
      }}>
        <List sx={{ flex: 1, overflow: 'auto', px: 2 }}>
          {comments.map((comment) => (
            <ListItem key={comment.id} sx={{ px: 0 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" component="span">
                      {comment.user.name || 'Anonymous'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="span">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </Typography>
                    {session?.user?.email && comment.user.email === session.user.email && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(comment.id)}
                        sx={{ ml: 'auto', color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                }
                secondary={comment.content}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ mr: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || !comment.trim()}
        >
          Post
        </Button>
      </DialogActions>
    </Dialog>
  );
} 