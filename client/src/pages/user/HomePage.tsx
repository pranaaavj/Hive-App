// src/pages/HomePage.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { StorySection } from "@/components/StorySection"; 
import { PostCard } from "@/components/PostCard";
import { Post } from "@/types/post";
import { useGetHomeFeedQuery } from "@/services/postApi";

export function HomePage() {


    const [page,setPage] = useState(1)
    const[allPosts,setAllPosts]=useState<Post[]>([])
    const [hasMore,setHasMore] = useState(true)
    const loaderRef = useRef<HTMLDivElement>(null);
    const { isError, isLoading, data ,isFetching} = useGetHomeFeedQuery({ page: 1, limit: 5 });
 useEffect(() => {
    if (data) {
      const newPosts = data.posts.map(post => ({
        _id: post._id,
        user: {
          username: post.user.username,
          profilePicture: post.user.profilePicture || "/placeholder.svg"
        },
        image: post.imageUrls[0] || "/placeholder.svg",
        caption: post.caption || "",
        likeCount: post.likeCount,
        likes:post.likes,
        commentCount: post.commentCount,
        timestamp: new Date(post.createdAt).toLocaleString(),
        comments: []
      }));

      setAllPosts(prev => [...prev, ...newPosts]);
      setHasMore(data.hasMore);
    }
  }, [data]);

   useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isFetching) {
        setPage(prev => prev + 1);
      }
    });

    const node = loaderRef.current;
    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [hasMore, isFetching]);


  
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading feed</div>;

  return (
    <>
      <StorySection/>
      <div className="h-[calc(100vh-140px)] overflow-auto pr-2">
        <div className="space-y-4">
          {allPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
         {isFetching && <p className="text-center py-4">Loading more...</p>}
        <div ref={loaderRef} className="h-10"></div>
      </div>
    </>
  );
}