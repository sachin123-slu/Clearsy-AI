import React, { useState } from 'react';
import { Image, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/react';
import AILoader from '../components/AILoader';

const GenerateImage = () => {
  const ImageStyle = [
    "Realistic",
    "Ghibli Style",
    "Anime Style",
    "Cartoon Style",
    "Fantasy Style",
    "3D Style",
    "Portrait Style",
    "Realistic Style"
  ];

  const loadingSteps = [
    '🎨 Crafting your image prompt...',
    '🖼️ Generating a high-quality image...',
    '✨ Refining the final visual details...'
  ];

  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  const [input, setInput] = useState('');
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      return toast.error('Please enter an image description');
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
      const prompt = `${input} in ${selectedStyle} style`;
      const { data } = await axios.post('/api/ai/generate-image', { prompt, publish }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        setImageUrl(data.content)
        toast.success('Image Generated Successfully')
      } else {
        toast.error(data.message || 'Something went wrong')
      }
    } catch (error) {
      toast.error('Failed to generate image')
    } finally {
      clearInterval(interval);
      setLoading(false)
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left Column */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#00AD25]" />
          <h1 className="text-xl font-semibold">AI Image Generator</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Describe Your Image</p>
        <textarea
          onChange={(e) => setInput(e.target.value)}
          value={input}
          rows={4}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="Describe what you want to see in the image..."
          required
        />

        <p className="mt-4 text-sm font-medium">Style</p>
        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
          {ImageStyle.map((item, index) => (
            <span
              key={index}
              onClick={() => setSelectedStyle(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${selectedStyle === item
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'text-gray-500 border-gray-300'
                }`}
            >
              {item}
            </span>
          ))}
        </div>

        <br />
        <div className='my-6 flex items-center gap-2'>
          <label className='relative cursor-pointer'>
            <input type='checkbox' onChange={(e) => setPublish(e.target.checked)} checked={publish} className='sr-only peer' />

            <div className='w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-500 transition'></div>
            <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4'></span>
            <p className='text-sm'>Make this image Public</p>
          </label>
        </div>

        <button disabled={loading} className="w-full flex items-center justify-center gap-2 bg-primary text-white font-medium px-4 py-2 rounded-lg shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-95 transition mt-6">
          {loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Image className="w-5" />}
          Generate Image
        </button>

      </form>

      {/* Right Column */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3">
          <Image className="w-5 h-5 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Generated Image</h1>
        </div>

        <div className="flex-1 flex justify-center items-center">
          {loading ? (
            <AILoader
              title="Generating Image..."
              message={loadingMessage}
            />
          ) : imageUrl ? (
            <img src={imageUrl} alt="Generated" className="w-full h-full object-contain rounded-lg" />
          ) : (
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Image className="w-9 h-9" />
              <p>Enter a description and click "Generate Image" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateImage;
