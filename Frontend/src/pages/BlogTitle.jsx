import { Hash, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@clerk/react'
import AILoader from '../components/AILoader'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || "";

const BlogTitle = () => {
  const blogCategories = [
    'General', 'Technology', 'Buisness', 'Health', 'Lifestyle', 'Education', 'Travel', 'Food'
  ]

  const loadingSteps = [
    "🧠 Understanding your topic...",
    "✍️ Generating creative ideas...",
    "🎯 Optimizing for SEO...",
    "✨ Finalizing blog title..."
  ];

  const [selectedCategory, setSelectedCategory] = useState('General');
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState("")
  const [loadingMessage, setLoadingMessage] = useState("");
  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      return toast.error('Please enter a topic');
    }

    setContent("");
    setLoading(true);
    setLoadingMessage(loadingSteps[0]);
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < loadingSteps.length) {
        setLoadingMessage(loadingSteps[currentStep]);
      }
    }, 1800);

    try {
      const prompt = `Create a blog title about ${input} in the ${selectedCategory} category.`
      const { data } = await axios.post('/api/ai/generate-blog-title', { prompt }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        setContent(data.content)
        toast.success('Title Generated Successfully')
      } else {
        toast.error(data.message || 'Something went wrong')
      }
    } catch (error) {
      toast.error('Failed to generate title')
    } finally {
      clearInterval(interval);
      setLoading(false)
    }
  }
  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      {/*Left Coloum*/}

      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#8E37EB]' />
          <h1 className='text-xl font-semibold'>AI Title Generator</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Keyword</p>

        <input onChange={(e) => setInput(e.target.value)} value={input} type='text' className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300' placeholder='The future of Artificial Intelligence is...' required />

        <p className='mt-4 text-sm font-medium'>Category</p>
        <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
          {blogCategories.map((item) => (
            <span
              onClick={() => setSelectedCategory(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${selectedCategory === item
                ? 'bg-purple-50 text-purple-700 border-purple-300'
                : 'text-gray-500 border-gray-300'
                }`}
              key={item}>
              {item}
            </span>
          ))}
        </div>
        <br />
        <button disabled={loading} className='w-full flex items-center justify-center gap-2 bg-primary text-white font-medium px-4 py-2 rounded-lg shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-95 transition mt-6'>
          {loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Hash className='w-5' />}
          Generate Title
        </button>
      </form>

      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 '>

        <div className='flex items-center gap-3'>
          <Hash className='w-5 h-5 text-[#8E37EB]' />
          <h1 className='text-xl font-semibold'>Generated Titles</h1>
        </div>
        <div className='flex-1 flex justify-center items-center'>
          {loading ? (
            <AILoader
              title="Generating Title..."
              message={loadingMessage}
            />
          ) : content ? (
            <div className='w-full p-4 rounded-lg bg-purple-50 text-purple-700 text-sm'>
              {content}
            </div>
          ) : (
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Hash className='w-9 h-9' />
              <p>Enter a topic and click "Generate Title" to get started</p>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}

export default BlogTitle