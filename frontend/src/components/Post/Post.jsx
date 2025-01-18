import React,{useState} from 'react'
import { FaRegComment,FaTrash,FaRegHeart } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegBookmark } from "react-icons/fa6";
import { Link } from "react-router-dom";
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { formatPostDate } from '../../utils/date';

const Post = ({post}) => {
    const [comment, setComment] = useState('');
    const{data:authUser} = useQuery({queryKey:['authUser']});
    
    const queryClient = useQueryClient();
    const { mutate: deletePost, isPending: isDeleting } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/posts/${post._id}`, {
					method: "DELETE",
				});
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			toast.success("Post deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});
    const{mutate:likePost,isPending:isLiking,} = useMutation({
        mutationFn:async()=>{
            try{
                const res = await fetch(`api/posts/like/${post._id}`,{
                    method: "POST",
                    headers:{
                        'Content-Type':'application/json',
                    }
                });
                const data = await res.json();
				if(!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
            }catch(error){
                throw new Error(error);
            }
        },
        onSuccess:(updatedLikes)=>{
            // toast.success('Post liked');
            // queryClient.invalidateQueries({
            //     queryKey:['posts']
            // })//this is not aproper way
            queryClient.setQueryData(['posts'],(oldData)=>{
                return oldData.map((p)=>{
                    if(p._id === post._id){
                        return{...p,likes:updatedLikes}
                    }
                    return p;
                })
            })
        },
        onError:(error)=>{
            toast.error(error.message);
        }
    });
    const{mutate:commentPost,isPending:isCommenting} = useMutation({

        mutationFn:async()=>{
            try{
                const res = await fetch(`/api/posts/comment/${post._id}`,{
                method: "POST",
                headers:{
                    'Content-Type':'application/json',
                },
                
                body: JSON.stringify({ text:comment })
                });

                const data = await res.json();
                if(!res.ok) throw new Error(data.error || 'Something went wrong');
                return data;

            }catch(error){
                throw new Error(error);
            }
        },
        onSuccess:()=>{
            setComment('');
            toast.success('Comment posted successfully');
            queryClient.invalidateQueries({
                queryKey:['posts']
            })
        },
        onError:(error)=>{
            toast.error(error.message);
        }
    })
	const postOwner = post.user;
    const isLiked = post.likes.includes(authUser._id);
	const isMyPost = authUser._id === post.user._id; 
	const formattedDate = formatPostDate(post.createdAt);
	// const isCommenting = true;

    const handleDeletePost = () => {
        deletePost();
	};

	const handlePostComment = (e) => {
		e.preventDefault();
        
        if(isCommenting) return;
        commentPost()
		
	};

	const handleLikePost = () => {
        if(isLiking) return;
		likePost()
	};
    
  return (
    <article className='flex gap-2 items-start p-4 border-b border-gray-700'>
        {/* Post Owner Avatar */}
        <figure className='avatar'>
            <Link to={`/profile/${postOwner.username}`} className='w-8 rounded-full overflow-hidden'>
                <img src={postOwner.profileImg || "/avatar-placeholder.png"} alt="User profile picture"/>
            </Link>
        </figure>
        {/* Post Content */}
        <div className='flex flex-col flex-1'>
            <header className='flex gap-2 items-center'>
                <Link to={`/profile/${postOwner.username}`} className='font-bold'>
                    {postOwner.fullName}
                </Link>
                <span className='text-gray-700 flex gap-1 text-sm'>
                    <Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
                    <span>·</span>
                    <span>{formattedDate}</span>
                </span>
                {isMyPost && (
                    <span className='flex justify-end flex-1'>
                        {!isDeleting && <FaTrash className='cursor-pointer hover:text-red-500' onClick={handleDeletePost} />}
                        {isDeleting && <LoadingSpinner/>}
                    </span>
				)}
            </header>
            {/* Post Text and Image */}
            <section>
                <span>{post.text}</span>
                {post.img && (
                    <figure className='flex flex-col gap-3 overflow-hidden'>
                    <img
                        src={post.img}
                        className='h-80 object-contain rounded-lg border border-gray-700'
                        alt='Post image'
                    />
                    </figure>
                )}
			</section>
            {/* Post Footer */}
            <footer className='flex justify-between mt-3'>
                <div className='flex gap-4 items-center w-2/3 justify-between'>
                    <div
                        className='flex gap-1 items-center cursor-pointer group'
                        onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
                    >
                        <FaRegComment className='w-4 h-4  text-slate-500 group-hover:text-sky-400' />
                        <span className='text-sm text-slate-500 group-hover:text-sky-400'>
                            {post.comments.length}
                        </span>
                    </div>
                    {/* We're using Modal Component from DaisyUI */}
                    <dialog id={`comments_modal${post._id}`} className='modal border-none outline-none'>
                        <div className='modal-box rounded border border-gray-600'>
                            <header>
                                <h3 className="font-bold text-lg mb-4">Comments</h3>
                            </header>
                            <section className='flex flex-col gap-3 max-h-60 overflow-auto'>
                                {post.comments.length === 0 && (
                                    <p className='text-sm text-slate-500'>
                                        No comments yet 🤔 Be the first one 😉
                                    </p>
                                )}
                                {post.comments.map((comment) => (
                                    <article key={comment._id} className='flex gap-2 items-start'>
                                        <figure className='avatar w-8 rounded-full'>
                                            <img
                                                src={comment.user.profileImg || "/avatar-placeholder.png"} alt="Commenter profile"
                                            />
                                        </figure>
                                        <div className='flex flex-col'>
                                            <header className='flex items-center gap-1'>
                                                <strong>{comment.user.fullName}</strong>
                                                <span className='text-gray-700 text-sm'>
                                                    @{comment.user.username}
                                                </span>
                                            </header>
                                            <div className='text-sm'>{comment.text}</div>
                                        </div>
                                    </article>
                                ))}
                            </section>
                            <form
                                className='flex gap-2 items-center mt-4 border-t border-gray-600 pt-2'
                                onSubmit={handlePostComment}
                            >
                                <textarea type="text"
                                    className='textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800'
                                    placeholder='Add a comment...'
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <button className='btn btn-primary rounded-full btn-sm text-white px-4'>
                                    {isCommenting ? <LoadingSpinner size='md' /> : "Post"}
                                </button>
                            </form>
                        </div>
                        <form method='dialog' className='modal-backdrop'>
                            <button className='outline-none'>close</button>
                        </form>
                    </dialog>
                    <div className='flex gap-1 items-center group cursor-pointer'>
                        <BiRepost className='w-6 h-6  text-slate-500 group-hover:text-green-500' />
                        <span className='text-sm text-slate-500 group-hover:text-green-500'>0</span>
                    </div>
                    <div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
                        {isLiking && <LoadingSpinner size='sm' />}
                        {!isLiked && !isLiking && (
                            <FaRegHeart className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
                        )}
                        {isLiked && !isLiking && (
                            <FaRegHeart className='w-4 h-4 cursor-pointer text-pink-500 ' />
                        )}

                        <span
                            className={`text-sm text-slate-500 group-hover:text-pink-500 ${
                                isLiked ? "text-pink-500" : "text-slate-500"
                            }`}
                        >
                            {post.likes.length}
                        </span>
                    </div>
                </div>
                <div className='flex w-1/3 justify-end gap-2 items-center'>
                    <FaRegBookmark className='w-4 h-4 text-slate-500 cursor-pointer' />
                </div>
            </footer>
        </div>
	</article>
  )
}

export default Post