import { Edit, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/react';
import Markdown from 'react-markdown';
import AILoader from '../components/AILoader';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || "";


const WriteArticle = () => {

  const articleLength = [
    { length: 800, text: 'Short (500-800 words)' },
    { length: 1200, text: 'Medium (800-1200 words)' },
    { length: 1600, text: 'Large (1200+ words)' }
  ]

  const loadingSteps = [
    "📝 Understanding your topic...",
    "📚 Researching relevant information...",
    "🤖 Writing a high-quality article...",
    "✨ Improving grammar and readability...",
    "🚀 Finalizing your article...",
  ];

  const [selectedLength, setSelectedLenght] = useState(articleLength[0]);
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("");
  const [content, setContent] = useState("")

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      return toast.error("Please enter a topic");
    }
    setContent("");
    setLoading(true);
    let currentStep = 0;
    setLoadingMessage(loadingSteps[0]);
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < loadingSteps.length) {
        setLoadingMessage(loadingSteps[currentStep]);
      }
    }, 1800);

    try {
      const prompt = `Write a detailed, informative, SEO-friendly article about "${input}" in approximately ${selectedLength.length} words. Use proper headings, subheadings, bullet points where necessary, and conclude the article with a summary.`;

      const { data } = await axios.post(
        "/api/ai/generate-article",
        {
          prompt,
          length: selectedLength.length,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Article Generated Successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate article");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      {/*Left Coloum*/}

      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Article Configuration</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Article Topic</p>

        <input onChange={(e) => setInput(e.target.value)} value={input} type='text' className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300' placeholder='The future of Artificial Intelligence is...' required />

        <p className='mt-4 text-sm font-medium'>Article Length</p>
        <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
          {articleLength.map((item, index) => (
            <span onClick={() => setSelectedLenght(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${selectedLength?.text === item.text
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-500 border-gray-300'
                }`}
            >{item.text}</span>
          ))}
        </div>
        <br />
        <button disabled={loading} className='w-full flex items-center justify-center gap-2 bg-primary text-white font-medium px-4 py-2 rounded-lg shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-95 transition mt-6'>
          {
            loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Edit className='w-5' />
          }
          Generate Article
        </button>
      </form>

      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]'>

        <div className='flex items-center gap-3'>
          <Edit className='w-5 h-5 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Generated article</h1>
        </div>

        {loading ? (
          <AILoader
            title="Generating Article..."
            message={loadingMessage}
          />
        ) : !content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Edit className="w-9 h-9" />
              <p>Enter a topic and click "Generate Article" to get started</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-scroll mt-4 text-sm text-slate-600">
            <div className="reset-tw">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}

export default WriteArticle