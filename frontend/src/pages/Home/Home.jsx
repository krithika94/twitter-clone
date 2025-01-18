import React,{useState} from 'react'
import CreatePost from './CreatePost';
import Posts from '../../components/Posts/Posts';
const Home = () => {
  const [feedType, setFeedType] = useState("forYou");
  return (
    <main className='flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen'>
      {/* Header Section */}
      <header className='flex w-full border-b border-gray-700'>
        <nav className="flex">
          <button
            className={
              "flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
            }
            onClick={() => setFeedType("forYou")}
          >
            For you
            {feedType === "forYou" && (
              <div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary'></div>
            )}
          </button>
          <button className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative'
              onClick={() => setFeedType("following")}
            >
              Following
              {feedType === "following" && (
                <div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary'></div>
              )}
          </button>
        </nav>
      </header>

        {/* Create Post Input Section */}
      <section>
        <CreatePost/>
      </section>

        {/* Posts Section */}
      <section>
        <Posts feedType={feedType} />
      </section>
        

    </main>
  )
}

export default Home