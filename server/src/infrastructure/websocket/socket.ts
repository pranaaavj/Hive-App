import { Server } from 'socket.io';
import { CommentModel } from '../model/commentModel';
import { UserModel } from '../model/user.model';

let io: Server | null = null;

const onlineUsers = new Map<string, string>()

function setupChangeStream() {
  const changeStream = CommentModel.watch(
    [
      { 
        $match: {
          $or: [
            { operationType: 'insert' },
            { 
              operationType: 'update',
              'updateDescription.updatedFields.isDeleted': true
            },
            { operationType: 'delete' } 
          ]
        } 
      }
    ],
    { fullDocument: 'updateLookup' }
  );

  changeStream.on('change', async (change) => {
    const roomId = change.fullDocument?.postId?.toString() || 
                  change.documentKey?.postId?.toString();

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
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:5173', 'http://frontend:5173'],
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
    socket.on("joinChat", (chatId: string) => {
      socket.join(chatId)

    })
    socket.on("leaveChat", (chatId: string) => {
      socket.leave(chatId)
    })

    //for use online status
    socket.on('userConnected', async (userId: string) => {
      console.log(`🟢 User Connected ID: ${userId}`);
      onlineUsers.set(userId, socket.id);
      await UserModel.findByIdAndUpdate(userId, { isOnline: true });
    
      const allOnline = Array.from(onlineUsers.keys());
      console.log(`📡 Emitting onlineUsers to ${userId}`, allOnline);
    
      socket.emit('onlineUsers', allOnline);
      console.log("all online user are", allOnline)
      io?.emit('userOnline', userId);
    });

    socket.on('requestOnlineUsers', () => {
      socket.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });


    socket.on('disconnect', async () => {
      const userId = [...onlineUsers.entries()].find(
        ([, sid]) => sid === socket.id
      )?.[0];

      if (userId) {
        onlineUsers.delete(userId);
        await UserModel.findByIdAndUpdate(userId, {
          isOnline: false,
          lastActive: new Date(),
        });

        console.log(`🔴 User ${userId} is now offline`);
        io?.emit('userOffline', userId); // Optional broadcast
      }

      console.log(`❎ Client disconnected: ${socket.id}`);
    });

    socket.on('disconnect', () => {
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
