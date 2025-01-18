import React from 'react'
import {Routes,Route, Navigate} from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import SignUp from './pages/Auth/SignUp/SignUp'
import Login from './pages/Auth/Login/Login'
import Notifications from './pages/Notifications/Notifications'
import Profile from './pages/Profile/Profile'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner'

const App = () => {
  const{data:authUser,isLoading} = useQuery({
    queryKey:['authUser'],
    queryFn:async()=>{
      try{
        const res = await fetch('/api/auth/me',{
          method:'GET',
          headers:{
            'Content-Type':'application/json',
          },
        })
        if (res.status === 400) {
          // If unauthorized, return null to signify no logged-in user
          return null;
        }
        const data = await res.json();
        
        if(!res.ok) throw new Error(data.error||"Something went wrong");
        return data;
      }catch(error){
        throw new Error(error)
      }
    },
    retry:false,
   });
  if(isLoading){
    return(
      <div className='flex justify-center items-center h-screen'>
        <LoadingSpinner size='lg' />
      </div>  
    )
  }
  return (
    <Layout authUser={authUser}>
      <Routes>
        <Route path='/' element={authUser ? <Home/> : <Navigate to ='/login' />}/>
        <Route path='/signup' element={!authUser ? <SignUp/> : <Navigate to = '/'/>}/>
        <Route path='/login' element={!authUser ? <Login/> : <Navigate to ='/'/>}/>
        <Route path='/notification' element={authUser ? <Notifications/> : <Navigate to = '/login'/>}/>
        <Route path = '/profile/:username' element={authUser ? <Profile/>:<Navigate to = '/login'/>}/>
      </Routes>
    </Layout>
  )
}

export default App