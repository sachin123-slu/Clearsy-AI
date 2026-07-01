const AiLoader = ({ title = "Generating...", message }) => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center">

      <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>

      <h2 className="mt-6 text-xl font-semibold text-slate-700">
        {title}
      </h2>

      <p className="mt-4 text-gray-500 text-center">
        {message}
      </p>

      <div className="w-72 h-2 bg-gray-200 rounded-full mt-8 overflow-hidden">
        <div className="h-full bg-blue-500 animate-pulse w-full"></div>
      </div>

    </div>
  );
};

export default AiLoader;