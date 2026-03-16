import { useState } from "react";

interface FakeGmailProps {
  onReveal?: () => void;
}

const FakeGmail = ({ onReveal }: FakeGmailProps) => {
  const [selected, setSelected] = useState<number | null>(null);

  const emails = [
    { from: "Google", subject: "Security alert", preview: "New sign-in to your Google Account...", time: "10:42 AM" },
    { from: "Netflix", subject: "Coming soon: New releases", preview: "Check out what's coming to Netflix this week...", time: "9:15 AM" },
    { from: "Amazon", subject: "Your order has shipped", preview: "Your package is on its way. Track your delivery...", time: "Yesterday" },
    { from: "GitHub", subject: "Security notice", preview: "We noticed a new sign-in to your account...", time: "Yesterday" },
    { from: "LinkedIn", subject: "You have new notifications", preview: "See who viewed your profile and more...", time: "Mar 14" },
  ];

  return (
    <div 
      className="min-h-screen bg-white flex"
      onClick={onReveal}
    >
      {/* Sidebar */}
      <div className="w-[250px] border-r p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <div className="text-2xl">✉️</div>
          <span className="text-xl">Gmail</span>
        </div>
        
        <button className="bg-[#c2e7ff] text-left px-4 py-3 rounded-full font-medium mb-4 flex items-center gap-2">
          <span>➕</span> Compose
        </button>

        <div className="space-y-1 flex-1">
          {["Inbox", "Starred", "Sent", "Drafts", "Spam"].map((item, i) => (
            <div 
              key={item} 
              className={`px-4 py-2 rounded-full cursor-pointer flex justify-between ${i === 0 ? "bg-gray-100 font-bold" : "hover:bg-gray-50"}`}
            >
              <span>{item}</span>
              {i === 0 && <span className="text-blue-500">128</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Email List */}
      <div className="w-[400px] border-r flex flex-col">
        {/* Search */}
        <div className="p-3">
          <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2">
            <span>🔍</span>
            <input 
              type="text" 
              placeholder="Search mail" 
              className="bg-transparent flex-1 outline-none"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <div className="px-4 py-3 border-b-2 border-red-500 text-red-500 font-bold cursor-pointer">Primary</div>
          <div className="px-4 py-3 text-gray-500 cursor-pointer">Promotions</div>
          <div className="px-4 py-3 text-gray-500 cursor-pointer">Social</div>
        </div>

        {/* Email Items */}
        <div className="flex-1 overflow-auto">
          {emails.map((email, i) => (
            <div 
              key={i}
              onClick={() => setSelected(i)}
              className={`p-3 border-b cursor-pointer hover:shadow-md ${selected === i ? "bg-blue-50" : ""}`}
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-sm w-[120px] truncate">{email.from}</span>
                <span className="text-xs text-gray-500">{email.time}</span>
              </div>
              <p className="font-bold text-sm mt-1">{email.subject}</p>
              <p className="text-sm text-gray-500 truncate">{email.preview}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Email Preview */}
      <div className="flex-1 p-8">
        {selected !== null ? (
          <div>
            <h1 className="text-2xl font-bold mb-4">{emails[selected].subject}</h1>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {emails[selected].from[0]}
              </div>
              <div>
                <p className="font-bold">{emails[selected].from}</p>
                <p className="text-sm text-gray-500">to me</p>
              </div>
              <span className="ml-auto text-gray-500 text-sm">{emails[selected].time}</span>
            </div>
            <div className="bg-gray-100 p-4 rounded text-gray-600">
              <p>This is a fake email preview.</p>
              <p className="mt-2">The real content is hidden behind this disguise!</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Select an email to read
          </div>
        )}
      </div>
    </div>
  );
};

export default FakeGmail;
