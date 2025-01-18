import React,{useRef} from 'react';
import Xsvg from '../../../components/svgs/X';
import { FaUser } from "react-icons/fa";
import { MdOutlineMail,MdPassword,MdDriveFileRenameOutline } from "react-icons/md";
import {Link} from 'react-router-dom';
import { useMutation,useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

const SignUp = () => {
  // Create a ref for the form
  const formRef = useRef(null);
  const queryClient = useQueryClient();
  const { mutate, isError, isPending, error } = useMutation({
		mutationFn: async ({ email, username, fullName, password }) => {
			try {
				const res = await fetch("/api/auth/signup", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ email, username, fullName, password }),
				});

				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Failed to create account");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			toast.success("Account created successfully");
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
	});

  const handleSignSubmit = (e)=>{
    e.preventDefault(); //Page wont reload
    const formData = new FormData(formRef.current);
    const email = formData.get('email');
    const username = formData.get('username');
    const fullName = formData.get('fullName');
    const password = formData.get('password');
  
    mutate({ email, username, fullName, password });
  }
  return (
    <main className='max-w-screen-xl mx-auto flex h-screen px-10'>
      {/* SVG Section */}
      <aside className='flex-1 hidden lg:flex items-center  justify-center'>
        <Xsvg className='lg:w-2/3 fill-white' />
      </aside>
      {/* Form Section */}
      <section className="flex-1 flex flex-col justify-center items-center">
        
        <form ref = {formRef}  className='lg:w-2/3  mx-auto md:mx-20 flex gap-4 flex-col' onSubmit={handleSignSubmit}>
        <Xsvg className='w-24 lg:hidden fill-white' />
        <h1 className='text-4xl font-extrabold text-white'>Join today.</h1>
          <p className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail/>
            <input type="email" 
            className="grow"
            name="email" placeholder='Email' />
          </p>
          <div className="flex gap-4 flex-wrap">
            <p className="input input-bordered rounded flex items-center gap-2 flex-1">
              <FaUser />
              <input type="text" name="username" placeholder='Username' className="grow"/>
            </p>
            <p className="input input-bordered rounded flex items-center gap-2 flex-1">
              <MdDriveFileRenameOutline />
              <input type="text" name="fullName" placeholder='Full Name' className="grow"/>
            </p>
          </div>
          <p className="input input-bordered rounded flex items-center gap-2">
            <MdPassword/>
            <input type="password" name="password" placeholder='Passwword' className="grow"/>
          </p>
          <button type="submit" className='btn btn-primary rounded-full text-white'>{isPending ? <LoadingSpinner/> : "Signup"}</button>
          {isError && <p className='text-red-500 '>{error.message}</p>}
        </form>
        <div className='flex flex-col max-[639px]:w-full  sm:w-full md:w-3/4 lg:w-2/3 gap-2 mt-4'>
          <p className='text-white text-lg '>Already have an account?</p>
          <Link to='/login'>
            <button type="submit" className='btn btn-primary btn-outline rounded-full w-full'>SignIn</button>
          </Link>
        </div>
      </section>
    </main>        
  )
}

export default SignUp