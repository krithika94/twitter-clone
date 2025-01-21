import React from 'react';
import RightPanel from '../RightPanel/RightPanel';
import Sidebar from '../Sidebar/Sidebar';
import {Toaster} from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query'
const Layout = (props) => {
  const authUser = props.authUser;
  return (
    <>
        
        <main className='flex max-w-6xl mx-auto'>
        {/* <header> */}
          {authUser && <Sidebar/>}
        {/* </header> */}
          {props.children}
        <aside> 
          {authUser && <RightPanel/>}
        </aside>
        <Toaster/>
        </main>
        {/* <footer></footer> */}
    </>
  )
}

export default Layout