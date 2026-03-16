import { useState } from "react";

interface FakeFacebookProps {
  onReveal?: () => void;
}

const FakeFacebook = ({ onReveal }: FakeFacebookProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div 
      className="min-h-screen bg-[#f0f2f5]"
      onClick={onReveal}
    >
      {/* Header */}
      <div className="bg-[#1877f2] px-4 py-2 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="text-white text-2xl font-bold">f</div>
          <div className="bg-white/20 rounded-full px-3 py-2">
            <span className="text-white/80 text-sm">Search Facebook</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-white/20"></div>
          <div className="w-8 h-8 rounded-full bg-white/20"></div>
          <div className="w-8 h-8 rounded-full bg-white/20"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[900px] mx-auto p-4">
        {/* Cover Photo */}
        <div className="bg-gray-300 h-64 rounded-lg mb-16 relative">
          <div className="absolute -bottom-12 left-4 w-32 h-32 bg-gray-400 rounded-full border-4 border-white"></div>
        </div>

        {/* Profile Info */}
        <div className="mb-8 ml-40">
          <h1 className="text-2xl font-bold text-[#050505]">John Doe</h1>
          <p className="text-[#65676b]">1.2K friends</p>
          <div className="flex gap-2 mt-4">
            <button className="bg-[#1877f2] text-white px-4 py-2 rounded-lg font-medium">Add Friend</button>
            <button className="bg-[#e4e6eb] text-[#050505] px-4 py-2 rounded-lg font-medium">Message</button>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="font-medium text-[#050505]">John Doe</p>
                  <p className="text-xs text-[#65676b]">{i} hour ago · Public</p>
                </div>
              </div>
              <p className="text-[#050505] mb-3">
                Just had an amazing day! Feeling grateful for everything. 🎉
              </p>
              <div className="bg-gray-100 h-48 rounded-lg mb-3"></div>
              <div className="flex items-center justify-between text-[#65676b] pt-2 border-t">
                <span className="flex items-center gap-1">👍 Like</span>
                <span className="flex items-center gap-1">💬 Comment</span>
                <span className="flex items-center gap-1">↗️ Share</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FakeFacebook;
