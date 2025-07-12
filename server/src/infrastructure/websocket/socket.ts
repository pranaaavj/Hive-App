import { Server } from 'socket.io';
import { CommentModel } from '../model/commentModel';
import { UserModel } from '../model/user.model';
import { MessageModel } from '../model/messageModel';

let io: Server | null = null;

export const onlineUsers = new Map<string, string>();

function setupChangeStream() {
  const changeStream = CommentModel.watch(
    [
      {
        $match: {
          $or: [
            { operationType: 'insert' },
            {
              operationType: 'update',
              'updateDescription.updatedFields.isDeleted': true,
            },
            { operationType: 'delete' },
          ],
        },
      },
    ],
    { fullDocument: 'updateLookup' },
  );

  changeStream.on('change', async (change) => {
    const roomId =
      change.fullDocument?.postId?.toString() || change.documentKey?.postId?.toString();

    if (!roomId) return;

    if (change.operationType === 'insert') {
      const comment = change.fullDocument;
      const populatedComment = await CommentModel.findById(comment._id)
        .populate('userId', 'username profilePicture')
        .lean();

      if (!populatedComment) return;

      if (populatedComment.parentCommentId) {
        io?.to(roomId).emit('newReply', populatedComment);
      } else {
        io?.to(roomId).emit('newComment', populatedComment);
      }
    }
    // Handle soft deletes
    else if (
      change.operationType === 'update' &&
      change.updateDescription?.updatedFields?.isDeleted
    ) {
      io?.to(roomId).emit('commentSoftDeleted', {
        commentId: change.documentKey._id.toString(),
        updatedContent: '[Comment deleted]', // Or fetch from DB
      });
    }
  });

  changeStream.on('error', (err) => {
    console.error('❌ Comment Change Stream Error:', err);
    setTimeout(setupChangeStream, 5000);
  });

  changeStream.on('close', () => {
    console.log('🔁 Change stream closed. Reconnecting...');
    setTimeout(setupChangeStream, 5000);
  });
}

export function setupWebSocket(httpServer: any): Server {
  const allowedOrigins = [
    process.env.CLIENT_URL,
    'https://www.hiveapp.work',
    'https://hiveapp.work',
    'http://localhost:5173',
  ].filter(Boolean) as string[];
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    socket.on('joinPost', (postId: string) => {
      if (!postId) return socket.emit('error', 'Invalid postId');
      socket.join(postId);
      console.log(`📌 Socket ${socket.id} joined room: ${postId}`);
    });

    socket.on('leavePost', (postId: string) => {
      socket.leave(postId);
      console.log(`📤 Socket ${socket.id} left room: ${postId}`);
    });

    //chat socket
    socket.on('joinChat', (chatId: string) => {
      socket.join(chatId);
      console.log(`💬 Socket ${socket.id} joined chat: ${chatId}`);
    });

    socket.on('leaveChat', (chatId: string) => {
      socket.leave(chatId);
      console.log(`💬 Socket ${socket.id} left chat: ${chatId}`);
    });

    /// for showing the typing
    socket.on('typing', ({ chatId, senderId }) => {
      socket.broadcast.to(chatId).emit('userTyping', { chatId, senderId });
    });

    socket.on('stopTyping', ({ chatId, senderId }) => {
      socket.broadcast.to(chatId).emit('userStoppedTyping', { chatId, senderId });
    });

    ///for message seen - UPDATED with better error handling and logging
    socket.on('messageSeen', async ({ chatId, receiverId }) => {
      try {
        console.log(`👁️ Marking messages as seen in chat: ${chatId} by user: ${receiverId}`);

        const result = await MessageModel.updateMany(
          {
            chatId,
            sender: { $ne: receiverId },
            isSeen: false,
          },
          { $set: { isSeen: true } },
        );

        console.log(`✅ Marked ${result.modifiedCount} messages as seen`);

        // Broadcast to all users in the chat that messages have been seen
        if (result.modifiedCount > 0) {
          io?.to(chatId).emit('messageSeen', { chatId, seenBy: receiverId });
        }
      } catch (error) {
        console.error('❌ Error marking messages as seen:', error);
        socket.emit('error', 'Failed to mark messages as seen');
      }
    });

    // Handle message sending through socket
    socket.on('sendMessage', (messageData) => {
      console.log('📤 Message received from client:', messageData);

      // Broadcast the message to everyone in the chat EXCEPT the sender
      socket.broadcast.to(messageData.chatId).emit('receiveMessage', {
        chatId: messageData.chatId,
        senderId: messageData.senderId,
        profilePic: messageData.profilePic,
        username: messageData.username,
        text: messageData.text,
        type: messageData.type,
        createdAt: messageData.createdAt,
      });

      console.log(`📤 Message broadcasted to chat: ${messageData.chatId}`);
    });

    //for user online status
    socket.on('userConnected', async (userId: string) => {
      console.log(`🟢 User Connected ID: ${userId}`);
      onlineUsers.set(userId, socket.id);
      await UserModel.findByIdAndUpdate(userId, { isOnline: true });

      const allOnline = Array.from(onlineUsers.keys());
      console.log(`📡 Emitting onlineUsers to ${userId}`, allOnline);

      socket.emit('onlineUsers', allOnline);
      console.log('all online user are', allOnline);
      io?.emit('userOnline', userId);
    });

    socket.on('requestOnlineUsers', () => {
      socket.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });

    socket.on('disconnect', async () => {
      const userId = [...onlineUsers.entries()].find(([, sid]) => sid === socket.id)?.[0];

      if (userId) {
        onlineUsers.delete(userId);
        await UserModel.findByIdAndUpdate(userId, {
          isOnline: false,
          lastActive: new Date(),
        });

        console.log(`🔴 User ${userId} is now offline`);
        io?.emit('userOffline', userId);
      }

      console.log(`❎ Client disconnected: ${socket.id}`);
    });

    socket.on('error', (err) => {
      console.error('⚠️ Socket error:', err);
    });
  });

  setupChangeStream();
  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('❌ Socket.IO not initialized');
  return io;
}

// Helper function to emit messages from API routes (if needed)
export function broadcastMessage(chatId: string, messageData: any, senderSocketId?: string) {
  if (!io) return;

  if (senderSocketId) {
    // Exclude the sender's socket
    io.to(chatId).except(senderSocketId).emit('receiveMessage', messageData);
  } else {
    // Fallback: broadcast to all in chat (not recommended for new messages)
    io.to(chatId).emit('receiveMessage', messageData);
  }
}
