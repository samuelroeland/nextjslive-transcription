'use client'

import Image from 'next/image'
import App from './components/App'
import { XIcon } from './components/icons/XIcon'
import { LinkedInIcon } from './components/icons/LinkedInIcon'
import { FacebookIcon } from './components/icons/FacebookIcon'
import GitHubButton from 'react-github-btn'

const Home = () => {
  return (
    <>
      <div className="py-20 overflow-hidden">
        {/* height 100% minus 8rem */}
        <main className="mx-auto px-4 md:px-6 lg:px-8 -mb-[4rem]">
          <App />
        </main>
      </div>
    </>
  )
}

export default Home
