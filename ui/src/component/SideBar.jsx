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
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "feed" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
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
                    <Link
                        to="/my-posts"
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "my-posts" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                            }`}
                        onClick={() => setActiveTab("my-posts")}
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
                    </Link>
                    <button
                        onClick={() => setActiveTab("bookmarks")}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "bookmarks" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
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
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === "groups" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
                            />
                        </svg>
                        <span>Create Post</span>
                    </Link>
                </nav>
            </div>


        </div>
    );
}

export default Sidebar;