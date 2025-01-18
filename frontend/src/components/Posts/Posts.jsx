import PostSkeleton from "../Skeletons/PostSkeleton";
import {POSTS} from '../../utils/db/dummy';
import Post from "../Post/Post";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
const Posts = ({ feedType, username, userId }) => {

  const getPostEndPoint = ()=>{
    switch(feedType){
        case 'forYou':
            return `/api/posts/all`;
        case 'following':
            return `/api/posts/following `;
        case "posts":
            return `/api/posts/user/${username}`;
        case "likes":
            return `/api/posts/likes/${userId}`;
        default:
            return `/api/posts/all`;
    }
  }
  const postEndPoint = getPostEndPoint();
  const{data:posts,isLoading,refetch,isRefetching} = useQuery({
    queryKey:['posts'],
    queryFn:async()=>{
        try{
            const res = await fetch(postEndPoint,{
                method:'GET',
                headers:{
                    'Content-Type':'application/json'
                },
            })
            const data = await res.json();
            if(!res.ok) throw new Error(data.error||"Something went wrong");
            return data;
        }catch(error){
            throw new Error(error);
        }
    }

  });
  useEffect(()=>{
    refetch();
  },[feedType,refetch,username])

  return (
    <section>
        {/*Post Skeletons*/}
        {(isLoading || isRefetching)  && (
            <div className='flex flex-col justify-center'>
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
            </div>
        )}
        {/* No Post Data */}
        {!isLoading && !isRefetching && posts?.length === 0 && (
			<p className='text-center my-4'>No posts in this tab. Switch 👻</p>
        )}

        {/* Post Data */}
        {!isLoading && !isRefetching && posts && (
            <article>
                {posts.slice().reverse().map((post) => (
                    <Post key={post._id} post={post} />
                ))}
            </article>
        )}
    </section>
  )
}

export default Posts