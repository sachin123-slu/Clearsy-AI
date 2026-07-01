import { FileTextIcon, Sparkles } from 'lucide-react'
import React from 'react'
import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@clerk/react'
import Markdown from 'react-markdown'
import AILoader from '../components/AILoader'

const ReviewResume = () => {
  const loadingSteps = [
    '📄 Analyzing your resume...',
    '🔎 Checking structure and content...',
    '✨ Preparing improvement suggestions...'
  ];

  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [content, setContent] = useState("")
  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input) {
      return toast.error('Please upload a resume');
    }

    setContent('');
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
      const formData = new FormData();
      formData.append('resume', input);
      const { data } = await axios.post('/api/ai/resume-review', formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      })

      if (data.success) {
        setContent(data.content)
        toast.success('Resume Reviewed Successfully')
      } else {
        toast.error(data.message || 'Something went wrong')
      }
    } catch (error) {
      toast.error('Failed to review resume')
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
          <Sparkles className='w-6 text-[#00DA83]' />
          <h1 className='text-xl font-semibold'>Resume Review</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Upload Resume</p>

        <input onChange={(e) => setInput(e.target.files[0])} type='file' accept='application/pdf' className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600' required />

        <p className='text-xs text-gray-500 font-light mt-1'>Support PDF only.</p>


        <button disabled={loading} className='w-full flex items-center justify-center gap-2 bg-primary text-white font-medium px-4 py-2 rounded-lg shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-95 transition mt-6'>
          {loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <FileTextIcon className='w-5' />}
          Review Resume
        </button>
      </form>

      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 '>
        <div className='flex items-center gap-3'>
          <FileTextIcon className='w-5 h-5 text-[#00DA83]' />
          <h1 className='text-xl font-semibold'>Processed Image</h1>
        </div>
        <div className='flex-1 flex justify-center items-center'>
          {loading ? (
            <AILoader
              title="Reviewing Resume..."
              message={loadingMessage}
            />
          ) : content ? (
            <div className='reset-tw'>
              <Markdown>{content}</Markdown>
            </div>
          ) : (
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <FileTextIcon className='w-9 h-9' />
              <p>Upload a PDF resume and click "Review Resume" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReviewResume