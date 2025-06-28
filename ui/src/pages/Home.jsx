
import { useState } from "react"
import { Link } from "react-router-dom";
export default function Home() {
 const [activeTab, setActiveTab] = useState("feed")
  const [postContent, setPostContent] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("research")

  const posts = [
    {
      id: 1,
      author: {
        name: "Dr. Sarah Chen",
        title: "Professor of Computer Science",
        institution: "MIT",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content:
        "Just published our latest research on quantum computing applications in cryptography. The implications for cybersecurity are fascinating. Would love to hear thoughts from the community.",
      timestamp: "2 hours ago",
      category: "Computer Science",
      tags: ["Quantum Computing", "Cryptography", "Cybersecurity"],
      attachments: [{ type: "pdf", name: "quantum-crypto-research.pdf", size: "2.4 MB" }],
      interactions: {
        likes: 24,
        comments: 8,
        shares: 3,
      },
      comments: [
        {
          author: "Prof. Michael Rodriguez",
          content: "Excellent work! Have you considered the implications for blockchain technology?",
          timestamp: "1 hour ago",
        },
      ],
    },
    {
      id: 2,
      author: {
        name: "Emma Thompson",
        title: "PhD Student",
        institution: "Stanford University",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content:
        "Looking for collaborators on a climate change modeling project. We're using machine learning to predict temperature patterns. Anyone with expertise in environmental data analysis?",
      timestamp: "4 hours ago",
      category: "Environmental Science",
      tags: ["Climate Change", "Machine Learning", "Data Analysis"],
      attachments: [],
      interactions: {
        likes: 15,
        comments: 12,
        shares: 5,
      },
      comments: [],
    },
    {
      id: 3,
      author: {
        name: "Dr. James Wilson",
        title: "Research Fellow",
        institution: "Oxford University",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content:
        "Sharing some preliminary findings from our neuroscience study on memory formation. The data suggests interesting patterns in hippocampal activity during learning phases.",
      timestamp: "6 hours ago",
      category: "Neuroscience",
      tags: ["Memory", "Hippocampus", "Learning"],
      attachments: [
        { type: "image", name: "brain-scan-results.jpg", size: "1.2 MB" },
        { type: "data", name: "experiment-data.csv", size: "856 KB" },
      ],
      interactions: {
        likes: 31,
        comments: 6,
        shares: 8,
      },
      comments: [],
    },
  ]

  const trendingTopics = [
    { name: "Artificial Intelligence", posts: 234 },
    { name: "Climate Research", posts: 189 },
    { name: "Quantum Physics", posts: 156 },
    { name: "Biotechnology", posts: 143 },
    { name: "Space Exploration", posts: 98 },
  ]
  return (


          
          <div className="lg:col-span-3 space-y-6">
            {/* Create Post */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Share your research, ask questions, or start a discussion..."
                    className="w-full p-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="research">Research</option>
                        <option value="question">Question</option>
                        <option value="discussion">Discussion</option>
                        <option value="collaboration">Collaboration</option>
                      </select>

                      <button className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-blue-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                        <span className="text-sm">Attach</span>
                      </button>

                      <button className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-blue-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm">Image</span>
                      </button>
                    </div>

                    <button
                      disabled={!postContent.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow">
                  {/* Post Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <img
                          src={post.author.avatar || "/placeholder.svg"}
                          alt={post.author.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold text-slate-900">{post.author.name}</h3>
                          <p className="text-sm text-slate-600">{post.author.title}</p>
                          <p className="text-sm text-slate-500">
                            {post.author.institution} • {post.timestamp}
                          </p>
                        </div>
                      </div>
                      <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="px-6 pb-4">
                    <p className="text-slate-700 leading-relaxed">{post.content}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{post.category}</span>
                      {post.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Attachments */}
                    {post.attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {post.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                            <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                              {attachment.type === "pdf" && (
                                <svg
                                  className="h-4 w-4 text-red-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              )}
                              {attachment.type === "image" && (
                                <svg
                                  className="h-4 w-4 text-green-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              )}
                              {attachment.type === "data" && (
                                <svg
                                  className="h-4 w-4 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">{attachment.name}</p>
                              <p className="text-xs text-slate-500">{attachment.size}</p>
                            </div>
                            <button className="px-3 py-1 text-xs text-blue-600 hover:text-blue-700 transition-colors">
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="px-6 py-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <button className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          <span className="text-sm">{post.interactions.likes}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          <span className="text-sm">{post.interactions.comments}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                            />
                          </svg>
                          <span className="text-sm">{post.interactions.shares}</span>
                        </button>
                      </div>
                      <button className="text-slate-600 hover:text-blue-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Comments */}
                  {post.comments.length > 0 && (
                    <div className="px-6 pb-6">
                      <div className="space-y-4">
                        {post.comments.map((comment, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-slate-300 rounded-full"></div>
                            <div className="flex-1">
                              <div className="bg-slate-50 rounded-lg p-3">
                                <p className="font-medium text-sm text-slate-900">{comment.author}</p>
                                <p className="text-sm text-slate-700 mt-1">{comment.content}</p>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">{comment.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Comment */}
                      <div className="flex items-start space-x-3 mt-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">JD</span>
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
   
  )
}
