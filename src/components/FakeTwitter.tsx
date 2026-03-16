interface FakeTwitterProps {
  onReveal?: () => void;
}

const FakeTwitter = ({ onReveal }: FakeTwitterProps) => {
  return (
    <div 
      className="min-h-screen bg-black text-white"
      onClick={onReveal}
    >
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-20 border-r border-gray-800 p-4 flex flex-col gap-6">
        <div className="text-3xl font-bold">X</div>
        <div className="space-y-6 mt-8">
          <div className="text-xl">🏠</div>
          <div className="text-xl">🔍</div>
          <div className="text-xl">🔔</div>
          <div className="text-xl">✉️</div>
          <div className="text-xl">👤</div>
          <div className="text-xl">More</div>
        </div>
        <button className="bg-[#1d9bf0] rounded-full p-3 mt-auto">Post</button>
      </div>

      {/* Main Feed */}
      <div className="ml-20 max-w-[600px] border-r border-gray-800 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-black/80 backdrop-blur p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Home</h1>
        </div>

        {/* What's happening */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-700"></div>
            <div className="flex-1">
              <p className="text-gray-500 mb-4">What's happening?</p>
              <div className="flex items-center gap-4 text-[#1d9bf0]">
                <span>📷</span>
                <span>📊</span>
                <span>😊</span>
                <span>📍</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tweets */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border-b border-gray-800 hover:bg-gray-900/50 cursor-pointer">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0"></div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold">John Doe</span>
                  <span className="text-gray-500">@johndoe</span>
                  <span className="text-gray-500">·{i}h</span>
                </div>
                <p className="mt-1">
                  This is a fake tweet #{i}. Just demonstrating what a Twitter profile would look like. 
                  The real content is hidden behind this disguise! 🚀
                </p>
                <div className="flex items-center justify-between mt-3 text-gray-500 max-w-[80%]">
                  <span className="hover:text-[#1d9bf0]">💬 {i * 12}</span>
                  <span className="hover:text-green-500">↻ {i * 5}</span>
                  <span className="hover:text-red-500">❤️ {i * 47}</span>
                  <span className="hover:text-[#1d9bf0]">📊 {i * 3}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block ml-[600px] p-4">
        <div className="bg-gray-900 rounded-full p-3 mb-4">
          <span className="text-gray-500">🔍 Search</span>
        </div>
        <div className="bg-gray-900 rounded-xl p-4">
          <h2 className="font-bold text-xl mb-4">What's happening</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <p className="text-xs text-gray-500">Trending in Technology</p>
                <p className="font-bold">#TechNews{i}</p>
                <p className="text-xs text-gray-500">{i * 10}K posts</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FakeTwitter;
