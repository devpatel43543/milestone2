import React from "react";
import { Link } from "react-router-dom";

function Sidebar({ activeTab, setActiveTab, trendingTopics = [] }) {
  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Navigation */}
      <div className="bg-white rounded-lg shadow p-6">
        <nav className="space-y-2">
          <Link
            to="/home"
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === "feed" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
            </svg>
            <span>Feed</span>
          </Link>
          <button
            onClick={() => setActiveTab("my-posts")}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === "my-posts" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>My Posts</span>
          </button>
          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === "bookmarks" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <span>Bookmarks</span>
          </button>
          <Link
            to="/create-post"
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === "groups" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <span>Create Post</span>
          </Link>
        </nav>
      </div>

      {/* Trending Topics */}
      {/* <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Trending Topics</h3>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-slate-600 hover:text-blue-600 cursor-pointer">{topic.name}</span>
              <span className="text-xs text-slate-400">{topic.posts}</span>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}

export default Sidebar;