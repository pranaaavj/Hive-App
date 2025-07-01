// src/lib/socketListeners.ts
import { socket } from './socket';
import { store } from '@/redux/store/store';
import { postApi } from '@/services/postApi';

export const  setupPostSocketListeners = () => {
  socket.on('postLiked', ({ postId, likeCount, likedUserId }) => {
    store.dispatch(
      postApi.util.updateQueryData('getHomeFeed', { page: 1, limit: 10 }, (draft) => {
        draft.posts.forEach((post) => {
          if (post._id === postId) {
            post.likeCount = likeCount;
            if (!post.likes.includes(likedUserId)) {
              post.likes.push(likedUserId);
            }
          }
        });
      })
    );
  });

  socket.on('postUnliked', ({ postId, likeCount, unlikedUserId }) => {
    store.dispatch(
      postApi.util.updateQueryData('getHomeFeed', { page: 1, limit: 10 }, (draft) => {
        draft.posts.forEach((post) => {
          if (post._id === postId) {
            post.likeCount = likeCount;
            post.likes = post.likes.filter((id) => id !== unlikedUserId);
          }
        });
      })
    );
  });
};
