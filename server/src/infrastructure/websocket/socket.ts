// src/infrastructure/websocket/socket.ts
import { Server } from 'socket.io';
import { CommentModel } from '../model/commentModel';

export function setupWebSocket(httpServer: any) {
  const io = new Server(httpServer, {
    cors: { origin: '*' }, /// Adjust for production
  });

  io.on('connection', (socket) => {
    socket.on('joinPost', (postId: string) => {
      socket.join(postId);
    });
    socket.on('leavePost', (postId: string) => {
      socket.leave(postId);
    });
  });

  const changeStream = CommentModel.watch([{ $match: { operationType: 'insert' } }]);
  changeStream.on('change', (change) => {
    if (change.operationType === 'insert') {
      const comment = change.fullDocument;
      io.to(comment.postId.toString()).emit('newComment', {
        _id: comment._id,
        postId: comment.postId,
        userId: comment.userId,
        content: comment.content,
        parentCommentId: comment.parentCommentId,
        createdAt: comment.createdAt,
      });
    }
  });

  return io;
}