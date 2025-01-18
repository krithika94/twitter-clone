import User from "../models/user.model.js";
import Posts from '../models/post.model.js';
import Notification from "../models/notification.model.js";
import cloudinary from 'cloudinary';

export const createPost = async(req,res)=>{
    try{
        let {text} = req.body;
        let {img} = req.body;
        const userId = req.user._id.toString();
        const user =  await User.findOne({_id:userId});
        if(!user){
            return res.status(404).json({e:'User not found'});
        }
        if(!text && !img){
            return res.status(400).json({e:'Post must have text or image'});
        }
        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url
        }
        const newPost = new Posts({
            user:userId,
            text:text,
            img:img,
        })
        await newPost.save();
        res.status(201).json(newPost);
    }catch(e){
        console.log(`Error: error in create post controller${e}`);
        res.status(500).json({e:'Internal server error'});
    }
}
export const deletePost = async(req,res)=>{
    try{
        const{_id} = req.params;
        const post = await Posts.findOne({_id:_id});
        if(!post){
            return res.status(404).json({e:"Post not found"});
        }
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({e:"You are not authorized to delete this post"});
        }
        if(post.img){
            const imgId = post.img.split('/').pop().split('.')[0];
            await cloudinary .destroy(imgId);
        }
        await Posts.findByIdAndDelete({_id:_id});
        res.status(200).json({message:'Post deleted successfully'})

    }catch(e){
        console.log(`Error in delete post controller ${e}`)
        res.status(500).json({e:"Internal server error"});
    }
}
export const createComment = async(req,res)=>{
    console.log(req)
    try {
		let { text } = req.body;
		const postId = req.params.id;
        console.log(postId)
		const userId = req.user._id;

		if (!text) {
            console.log(text)
            return res.status(400).json({ error: "Text field is required" });
		}
		const post = await Posts.findById(postId);
        console.log(post)

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const comment = { user: userId, text };

		post.comments.push(comment);
		await post.save();

		res.status(200).json(post);
	} catch (e) {
		console.log(`Error in commentOnPost controller: ${e}`);
		res.status(500).json({ e: "Internal server error" });
	}
}
export const likeUnlikePost = async(req,res)=>{
    try{
        const userId = req.user._id;
        const{_id:postId} = req.params;
        const post = await Posts.findOne({_id:postId});
        if(!post){
            return res.status(404).json({e:"Post not found"});
        }
        const userLikedPost =  post.likes.includes(userId);
        if(userLikedPost){
            //unlike post
            await Posts.findByIdAndUpdate({_id:postId},{$pull:{likes:userId }});
            await User.updateOne({_id:userId},{$pull:{likedPosts:postId}})
            const updatedLikes = post.likes.filter((_id)=>_id.toString()!==userId.toString())
            return res.status(200).json(updatedLikes);
        }else{
            //like post
            // await Posts.findByIdAndUpdate({_id:postId},{$push:{likes:userId}})
            post.likes.push(userId);
            await User.updateOne({_id:userId},{$push:{likedPosts:postId}});
            await post.save();

            const newNotification = new Notification({
                type:"like",
                from:userId,
                to:post.user
            });
            await newNotification.save();
            const updatedLikes = post.likes;
            res.status(200).json(updatedLikes);

        }
    }catch(e){
        console.log(`Error in like post controller ${e}`);
        res.status(500).json({e:"Internal server error"});
    }
}
export const getAllPosts = async(req,res)=>{
    try{
        const allPosts = await Posts.find().sort({createAt:-1}).populate({path:"user",select:"-password"})
        .populate({
            path:'comments.user',
            select:["-password",'-email','-following',
            '-followers','-bio','-link']
        })
        if(allPosts.length === 0){
            return res.status(200).json([]);
        }
        res.status(200).json(allPosts)
        }catch(e){
            console.log(`Error in get all posts controller ${e}`);
            res.status(500).json({e:"Internal server error"
        });
    }
    
}
export const getLikedPosts = async(req,res)=>{
    try{
        const {_id} = req.params;
        const user = await User.findOne({_id:_id});
        if(!user){
            return res.status(404).json({e:"User not found"});
        }
        const likedPosts = await Posts.find({_id:{$in:user.likedPosts}}).populate({
            path:'user',
            select:'-password',
        })
        .populate({
            path:'comments.user',
            select:["-password",'-email','-following',
                '-followers','-bio','-link'],
        })
        res.status(200).json(likedPosts);
    }catch(e){
        console.log(`Error in get all posts controller ${e}`);
        return res.status(500).json({e:'Internal server error'});
    }
}
export const getFollowingPosts = async(req,res)=>{
    try{
        const userId = req.user._id;
        const user = await User.findById({_id:userId});
        if(!user){
            return res.status(404).json({e:"User not found"});
        }
        const following = user.following;
        const feedPosts = await Posts.find({user:{$in:following}}).sort({createdAt:-1})
        .populate({
            path:'user',
            select:'-password'
        })
        .populate({
            path:'comments.user',
            select:'-password'
        })
        res.status(200).json(feedPosts);
    }catch(e){
        console.log(`Error in get following posts controller ${e}`);
        return res.status(500).json({e:'Internal server error'});
    }
}
export const getUserPosts = async(req,res)=>{
    try{
        const userId = req.user._id;
        const{username} = req.params;
        const user = await User.findOne({username:username});
        if(!user){
            return res.status(404).json({e:"User not found"});
        }
        const posts = await Posts.find({user:userId}).sort({createdAt:-1})
        .populate({
            path:'user',
            select:'-password'
        })
        .populate({
            path:'comments.user',
            select:'-password'
        })
        res.status(200).json(posts);
    }catch(e){
        console.log(`Error in get user posts controller ${e}`);
        return res.status(500).json({e:'Internal server error'});
    }

}