import React from 'react'
import { assets } from '../assets/assets'
import { FaLinkedin, FaInstagram, FaGithub } from 'react-icons/fa'



const Footer = () => {
  return (
    <footer className="px-6 md:px-16 lg:px-24 xl:px-32 pt-12 w-full text-gray-500 mt-20 bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-300 pb-10">

        {/* Logo + description */}
        <div className="md:max-w-96">
          <img className="h-20 cursor-pointer hover:scale-105 transition-transform" src={assets.logo} alt="logo" />
          <p className="mt-6 text-sm leading-relaxed">
            Experience the power of <span className="font-semibold text-indigo-600">Clearsy AI</span>.<br />
            Transform your content creation with our suite of premium AI tools.
            Write articles, generate images, and enhance your workflow.
          </p>
          {/* Social icons */}
          <div className="flex gap-4 mt-6 text-gray-600">
            <a href="https://github.com/sachin123-slu"><FaGithub className="w-5 h-5 hover:text-blue-600 transition-colors" /></a>
            <a href="https://www.linkedin.com/in/sachin-kumar-108634300/"><FaLinkedin className="w-5 h-5 hover:text-blue-700 transition-colors" /></a>
            <a href="https://www.instagram.com/sluriya123/"><FaInstagram className="w-5 h-5 hover:text-pink-500 transition-colors" /></a>
          </div>
        </div>

        {/* Links + Newsletter */}
        <div className="flex-1 flex items-start md:justify-end gap-20">
          {/* Company links */}
          <div>
            <h2 className="font-semibold mb-5 text-gray-800">Company</h2>
            <ul className="text-sm space-y-2">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">About us</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact us</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy policy</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h2 className="font-semibold text-gray-800 mb-5">Subscribe to our newsletter</h2>
            <p className="text-sm">The latest news, articles, and resources, sent to your inbox weekly.</p>
            <form className="flex items-center gap-2 pt-4">
              <input
                className="border border-gray-400 placeholder-gray-500 focus:ring-2 ring-indigo-600 outline-none w-full max-w-64 h-9 rounded px-3 transition-shadow focus:shadow-md"
                type="email"
                placeholder="Enter your email"
              />
              <button
                type="submit"
                className="bg-primary w-28 h-9 text-white rounded hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom copyright */}
      <p className="pt-6 text-center text-xs md:text-sm pb-5 text-gray-600">
        © 2026 <a href="/" className="hover:text-indigo-600 transition-colors">Clearsy AI</a>. All Rights Reserved.
      </p>
    </footer>
  )
}

export default Footer
