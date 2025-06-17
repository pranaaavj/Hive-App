import { useGetRepliesQuery } from "@/services/commentApi";
import { ReplyInput } from "./ReplyInput";

interface RepliesListProp{
    commentId:string;
    postId:string;
    depth?:number
}

export const RepliesList = ({ commentId, postId, depth = 1 }: RepliesListProp) => {
    const {data,isLoading,isError} = useGetRepliesQuery({commentId,page:0,limit:10})
      if (isLoading) return <div>Loading replies...</div>;
    if (isError) return <div>Error loading replies</div>;

 return (
    <div className={`ml-${depth * 6} mt-2 border-l border-gray-300 pl-4`}>
      {data?.data.map((reply) => (
        <div key={reply._id} className="mb-2">
          <div className="text-sm p-2 border rounded bg-gray-100">
            <span className="font-semibold">{reply.userId.username}:</span> {reply.content}
          </div>

          {/* Recursively render nested replies */}
          {depth < 3 && ( // Optional: limit depth of nesting
            <RepliesList commentId={reply._id} postId={postId} depth={depth + 1} />
          )}

          {/* Reply Input below each reply */}
          <ReplyInput parentCommentId={reply._id} postId={postId} />
        </div>
      ))}
    </div>
  );
}