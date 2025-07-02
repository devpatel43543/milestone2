import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import frontEndRoutes from "../constants/frontendRoutes";

export default function MyPosts() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [downloadingFiles, setDownloadingFiles] = useState(new Set()); // Track downloading files
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_URL = "https://fj0raf09t7.execute-api.us-east-1.amazonaws.com/prod/get-user-posts";
  const DELETE_API_URL = "https://fj0raf09t7.execute-api.us-east-1.amazonaws.com/prod/delete-post";
  const DOWNLOAD_API_URL = "https://fj0raf09t7.execute-api.us-east-1.amazonaws.com/prod/download-object";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token || token === "undefined") {
          setError("Please sign in to view your posts");
          setLoading(false);
          navigate(frontEndRoutes.LOGIN);
          return;
        }
        const decoded = jwtDecode(token);
        const userId = decoded.sub;
        if (!userId) {
          setError("No userId found in JWT payload");
          setLoading(false);
          return;
        }

        const response = await axios.post(API_URL, { userId }, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          let body;
          try {
            body = JSON.parse(response.data.body);
          } catch (parseError) {
            setError("Invalid API response format");
            setLoading(false);
            return;
          }

          // Check if posts exists and is an array; fallback to empty array
          const postsArray = Array.isArray(body.posts) ? body.posts : [];
          const fetchedPosts = postsArray.map(post => ({
            postId: post.postId,
            content: post.postContent,
            timestamp: post.createdAt,
            category: post.selectedCategory,
            attachments: Array.isArray(post.attachmentUrls) ? post.attachmentUrls.map(url => ({
              type: url.endsWith(".pdf") ? "pdf" : "document",
              name: url.split("/").pop() || "attachment",
              url: url,
            })) : [],
            interactions: { likes: 0, comments: 0, shares: 0, views: 0 },
            status: "published",
          }));
          setPosts(fetchedPosts);
        } else {
          setError(`Failed to fetch posts: ${response.data.body?.error || "Unknown error"}`);
        }
      } catch (err) {
        console.error("Fetch posts error:", err.response?.data || err.message);
        setError(`Error fetching posts: ${err.response?.data?.error || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const handleDownload = async (postId, fileName) => {
    const fileKey = `${postId}-${fileName}`;
    
    try {
      // Add to downloading set
      setDownloadingFiles(prev => new Set([...prev, fileKey]));
      
      const token = localStorage.getItem("accessToken");
      if (!token || token === "undefined") {
        setError("Please sign in to download files");
        navigate(frontEndRoutes.LOGIN);
        return;
      }

      console.log("Requesting download for postId:", postId);
      
      const response = await axios.post(DOWNLOAD_API_URL, {
        postId: postId
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("Download API response:", response.data);

      if (response.status === 200) {
        let body;
        try {
          body = typeof response.data.body === 'string' 
            ? JSON.parse(response.data.body) 
            : response.data.body || response.data;
        } catch (parseError) {
          console.error("Parse error:", parseError);
          setError("Invalid response format from download API");
          return;
        }

        const presignedUrl = body.presignedUrl;
        
        if (presignedUrl && presignedUrl !== "Not available") {
          // Create a temporary anchor element to trigger download
          const link = document.createElement('a');
          link.href = presignedUrl;
          link.download = fileName; // This suggests a filename for download
          link.target = '_blank'; // Open in new tab as fallback
          
          // Append to body, click, and remove
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          console.log("Download initiated for:", fileName);
        } else {
          setError("Download link not available. Please try again later.");
        }
      } else {
        const errorMsg = response.data.body?.error || response.data.error || "Failed to get download link";
        setError(`Download failed: ${errorMsg}`);
      }
    } catch (err) {
      console.error("Download error:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.body?.error || 
                          err.message || 
                          "Failed to download file";
      setError(`Download error: ${errorMessage}`);
    } finally {
      // Remove from downloading set
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileKey);
        return newSet;
      });
    }
  };

  const handleEdit = (postId, content) => {
    setEditingPost(postId);
    setEditContent(content);
  };

  const handleSaveEdit = (postId) => {
    setPosts(posts.map((post) => (post.postId === postId ? { ...post, content: editContent } : post)));
    setEditingPost(null);
    setEditContent("");
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditContent("");
  };

  const handleDelete = async (postId) => {
    setError("");
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token || token === "undefined") {
        setError("Please sign in to delete posts");
        navigate(frontEndRoutes.LOGIN);
        return;
      }

      console.log("Sending delete request for postId:", postId);
      const response = await axios.post(DELETE_API_URL, {
        data: { postId },
        headers: {
          "Content-Type": "application/json"
        },
      });

      console.log("Delete response:", response.data);

      if (response.status === 200) {
        setPosts(posts.filter((post) => post.postId !== postId));
        setShowDeleteModal(null);
      } else {
        setError(`Failed to delete post: ${response.data.error || "Unknown error"}`);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      setError(`Error deleting post: ${errorMessage}`);
      console.error("Delete error:", err.response?.data || err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredPosts = posts
    .filter((post) => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "drafts") return post.status === "draft";
      return post.category === selectedFilter;
    })
    .filter((post) => post.content.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (sortBy === "oldest") return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      if (sortBy === "most-liked") return b.interactions.likes - a.interactions.likes;
      if (sortBy === "most-viewed") return b.interactions.views - a.interactions.views;
      return 0;
    });

  const totalStats = posts.reduce(
    (acc, post) => ({
      likes: acc.likes + post.interactions.likes,
      comments: acc.comments + post.interactions.comments,
      shares: acc.shares + post.interactions.shares,
      views: acc.views + post.interactions.views,
    }),
    { likes: 0, comments: 0, shares: 0, views: 0 },
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => setError(null)} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 lg:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Posts</h1>
          <p className="text-slate-600">Manage and track all your academic content</p>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-red-700">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <div key={post.postId} className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        post.status === "draft"
                          ? "bg-yellow-100 text-yellow-700"
                          : post.category === "research"
                            ? "bg-blue-100 text-blue-700"
                            : post.category === "question"
                              ? "bg-green-100 text-green-700"
                              : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {post.status === "draft" ? "Draft" : post.category}
                    </span>
                    <span className="text-sm text-slate-500">{formatDate(post.timestamp)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(post.postId, post.content)}
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Edit post"
                      disabled={deleteLoading}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(post.postId)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete post"
                      disabled={deleteLoading}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {editingPost === post.postId ? (
                  <div className="space-y-4">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      disabled={deleteLoading}
                    />
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleSaveEdit(post.postId)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        disabled={deleteLoading}
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                        disabled={deleteLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-700 leading-relaxed mb-4">{post.content}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {/* Tags can be added if API provides them */}
                    </div>

                    {post.attachments.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {post.attachments.map((attachment, index) => {
                          const fileKey = `${post.postId}-${attachment.name}`;
                          const isDownloading = downloadingFiles.has(fileKey);
                          
                          return (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                              <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
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
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-slate-700">
                                    {attachment.name}
                                  </span>
                                  <button
                                    onClick={() => handleDownload(post.postId, attachment.name)}
                                    disabled={isDownloading}
                                    className={`text-xs px-2 py-1 rounded transition-colors ${
                                      isDownloading 
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                    }`}
                                  >
                                    {isDownloading ? (
                                      <div className="flex items-center space-x-1">
                                        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Downloading...</span>
                                      </div>
                                    ) : (
                                      'Download'
                                    )}
                                  </button>
                                </div>
                                <p className="text-xs text-slate-500">{attachment.size || "Unknown size"}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-6 text-sm text-slate-600">
                    <div className="flex items-center space-x-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>{post.interactions.likes} likes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>{post.interactions.comments} comments</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span>{post.interactions.views} views</span>
                    </div>
                  </div>

                  {post.status === "published" && (
                    <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">View Post</button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-slate-900">No posts found</h3>
              <p className="mt-1 text-sm text-slate-500">
                {searchQuery ? "Try adjusting your search terms." : "Get started by creating your first post."}
              </p>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900">Delete Post</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete this post? This action cannot be undone and will permanently remove the
              post and all its comments.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}