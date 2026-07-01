import { Scissors, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@clerk/react'
import AILoader from '../components/AILoader'

const RemoveObject = () => {
  const loadingSteps = [
    '🧹 Identifying the object...',
    '🎯 Removing it from the image...',
    '✨ Filling the background naturally...'
  ];

  const [input, setInput] = useState("")
  const [object, setObject] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [imageUrl, setImageUrl] = useState("")
  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input || !object) {
      return toast.error('Please upload an image and describe the object');
    }

    setImageUrl('');
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
      formData.append('image', input);
      formData.append('object', object);
      const { data } = await axios.post('/api/ai/remove-image-object', formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      })

      if (data.success) {
        setImageUrl(data.content)
        toast.success('Object Removed Successfully')
      } else {
        toast.error(data.message || 'Something went wrong')
      }
    } catch (error) {
      toast.error('Failed to remove object')
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
          <Sparkles className='w-6 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Object Removal</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Upload Image</p>

        <input onChange={(e) => setInput(e.target.files[0])} type='file' accept='image/*' className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600' required />

        <p className="mt-6 text-sm font-medium">Describe object name to remove</p>

        <textarea
          onChange={(e) => setObject(e.target.value)}
          value={object}
          rows={4}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="e.g, watch or spoon, Only single object name"
          required
        />

        <button disabled={loading} className='w-full flex items-center justify-center gap-2 bg-primary text-white font-medium px-4 py-2 rounded-lg shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-95 transition mt-6'>
          {loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Scissors className='w-5' />}
          Remove Object
        </button>
      </form>

      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 '>
        <div className='flex items-center gap-3'>
          <Scissors className='w-5 h-5 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Processed Image</h1>
        </div>
        <div className='flex-1 flex justify-center items-center'>
          {loading ? (
            <AILoader
              title="Removing Object..."
              message={loadingMessage}
            />
          ) : imageUrl ? (
            <img src={imageUrl} alt="Processed" className='w-full h-full object-contain rounded-lg' />
          ) : (
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Scissors className='w-9 h-9' />
              <p>Upload an image and click "Remove Object" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>

  )
}

export default RemoveObject