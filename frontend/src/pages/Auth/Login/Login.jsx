import React,{useRef} from 'react';
import Xsvg from '../../../components/svgs/X';
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

const Login = () => {
  const formRef = useRef(null);
  const queryClient = useQueryClient();
  const {mutate, isError, isPending, error} = useMutation({
    mutationFn:async({username,password})=>{
      try{
        const res = await fetch('/api/auth/login',{
          method:'POST',
          headers:{
          "Content-Type":"application/json"
          },
          body:JSON.stringify({username,password})
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error||"Failed to login")
        return data;
        }catch(error){
        throw new Error(error);
      }
    },
    onSuccess:()=>{
      toast.success("Successfully login!");
      //refetch the authUser
      queryClient.invalidateQueries({
        queryKey:['authUser']
      })
    }
  })
  const handleLoginSubmit=(e)=>{
    e.preventDefault();
    const formData = new FormData(formRef.current);
    const username = formData.get('username');
    const password = formData.get('password');
    mutate({username,password})

  }
  return (
    <main className='max-w-screen-xl mx-auto flex h-screen px-10'>
      {/* SVG Section */}
      <aside className='flex-1 hidden lg:flex items-center  justify-center'>
        <Xsvg className='lg:w-2/3 fill-white' />
      </aside>
      {/* Form Section */}
      <section className="flex-1 flex flex-col justify-center items-center">
        
        <form ref = {formRef}  className='flex flex-col lg:w-2/3 mx-auto md:mx-20 gap-4 ' onSubmit={handleLoginSubmit}>
        <Xsvg className='w-24 lg:hidden fill-white' />
        <h1 className='text-4xl font-extrabold text-white'>Let's go.</h1>
          <p className="input input-bordered rounded flex items-center gap-2">
            <FaUser />
            <input type="text" name="username" placeholder='Username' className="grow"/>
          </p> 
          <p className="input input-bordered rounded flex items-center gap-2">
            <MdPassword/>
            <input type="password" name="password" placeholder='Password' className="grow"/>
          </p>
          <button type="submit" className='btn btn-primary rounded-full text-white'>{isPending?<LoadingSpinner/>:'Login'}</button>
          {isError && <p className='text-red-500'>{error.message}</p>}
        </form>
        <div className='flex flex-col max-[639px]:w-full  sm:w-full md:w-3/5 lg:w-2/3 gap-2 mt-4'>
          <p className='text-white text-lg '>Already have an account?</p>
          <Link to='/signup'>
            <button type="submit" className='btn btn-primary btn-outline rounded-full w-full'>SignUp</button>
          </Link>
        </div>
       
      </section>
    </main>
  )
}

export default Login