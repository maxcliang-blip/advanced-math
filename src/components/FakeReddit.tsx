interface FakeRedditProps {
  onReveal?: () => void;
}

const FakeReddit = ({ onReveal }: FakeRedditProps) => {
  return (
    <div 
      className="min-h-screen bg-[#dae0e6]"
      onClick={onReveal}
    >
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 border-b">
        <div className="max-w-[1200px] mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-orange-500 text-2xl font-bold">r</div>
            <span className="font-bold text-lg">reddit</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 rounded-full px-4 py-2 text-gray-500">Search Reddit</div>
            <button className="text-blue-500 font-bold">Log In</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto flex gap-6 p-4">
        {/* Feed */}
        <div className="flex-1 space-y-3">
          {/* Create Post */}
          <div className="bg-white rounded p-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-300"></div>
            <input 
              type="text" 
              placeholder="Create Post" 
              className="flex-1 bg-gray-100 rounded px-4 py-2"
            />
            <button className="text-gray-500">🖼️</button>
            <button className="text-gray-500">🔗</button>
          </div>

          {/* Filter */}
          <div className="bg-white rounded p-2 flex items-center gap-2">
            <button className="bg-orange-500 text-white rounded-full px-3 py-1 text-sm font-bold">Hot</button>
            <button className="text-gray-500 font-bold px-3 py-1">New</button>
            <button className="text-gray-500 font-bold px-3 py-1">Top</button>
          </div>

          {/* Posts */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded border hover:border-gray-400 cursor-pointer">
              <div className="flex">
                {/* Vote buttons */}
                <div className="w-10 bg-gray-50 p-2 flex flex-col items-center rounded-l">
                  <button className="text-orange-500 text-xl">▲</button>
                  <span className="font-bold text-sm my-1">{12 + i * 3}</span>
                  <button className="text-blue-500 text-xl">▼</button>
                </div>
                
                {/* Post content */}
                <div className="p-2 flex-1">
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <span className="font-bold text-black hover:underline">r/technology</span>
                    <span>·</span>
                    <span>Posted by u/user{i} • {i} hours ago</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">
                    This is a fake Reddit post #{i} - The real content is hidden!
                  </h3>
                  <div className="bg-gray-200 h-48 rounded mb-2 flex items-center justify-center text-gray-500">
                    [Image {i}]
                  </div>
                  <div className="flex items-center gap-4 text-gray-500 text-sm">
                    <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded">💬 {5 + i} Comments</button>
                    <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded">↗️ Share</button>
                    <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded">🔖 Save</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="w-[312px] space-y-4">
          <div className="bg-white rounded border p-3">
            <p className="text-xs text-gray-500 mb-2">Home</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">r</div>
              <span className="font-bold">Home</span>
            </div>
            <p className="text-xs text-gray-500">
              Your personal Reddit frontpage. Come here to check in with your favorite communities.
            </p>
            <button className="bg-orange-500 text-white font-bold rounded-full w-full py-2 mt-3">Create Post</button>
            <button className="border border-orange-500 text-orange-500 font-bold rounded-full w-full py-2 mt-2">Create Community</button>
          </div>

          <div className="bg-white rounded border p-3">
            <p className="font-bold text-sm mb-2">Recent Communities</p>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                <span className="text-sm">r/community{i}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FakeReddit;
