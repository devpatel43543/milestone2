
import React, { useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const CreatePost = () => {
  const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL;
  console.log("GATEWAY_URL:", GATEWAY_URL);
  const CREATE_POST_URL = `${GATEWAY_URL}/create-post`;
  console.log("CREATE_POST_URL:", CREATE_POST_URL);
  const [postContent, setPostContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("research");
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [message, setMessage] = useState("");
  const attachmentInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleAttachmentClick = () => {
    attachmentInputRef.current.click();
  };

  const handleImageClick = () => {
    imageInputRef.current.click();
  };

  const handleAttachmentChange = (e) => {
    if (e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files).filter((file) =>
        ["application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)
      );
      if (validFiles.length < e.target.files.length) {
        alert("Only PDF, TXT, DOC, and DOCX files are allowed for attachments.");
      }
      setAttachmentFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      setImageFiles((prev) => [...prev, ...e.target.files]);
    }
  };

  const removeAttachment = (index) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token || token === "undefined") {
        throw new Error("No valid JWT token found in localStorage");
      }
      const decoded = jwtDecode(token);
      if (!decoded.sub) {
        throw new Error("No 'sub' field found in JWT payload");
      }
      return decoded.sub;
    } catch (error) {
      console.error("Error decoding JWT:", error.message);
      return "user123"; // Fallback userId if token is invalid
    }
  };

  const handlePostSubmit = async () => {
    const userId = getUserIdFromToken();
    if (!userId) {
      setMessage("No user ID available. Please log in or set a valid token.");
      return;
    }

    if (!postContent.trim()) {
      setMessage("Post content cannot be empty.");
      return;
    }

    if (attachmentFiles.length === 0) {
      setMessage("Please select at least one document.");
      return;
    }

    setMessage("Uploading..."); // Initial feedback

    try {
      // Step 1: Request presigned URL for the first document
      const file = attachmentFiles[0];
      const response = await axios.post(
        CREATE_POST_URL,
        {
          userId,
          filename: file.name,
          postContent,
          selectedCategory,
          fileType: file.type,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response data:", response.data);
      const body = typeof response.data.body === "string" ? JSON.parse(response.data.body) : response.data;
      console.log("Parsed body:", body);

      if (response.status !== 200 || !body.presignedUrl) {
        throw new Error(`Failed to get presigned URL: ${response.status} - ${body?.message || "Unknown error"}`);
      }

      const presignedUrl = body.presignedUrl;
      const attachmentUrl = body.attachmentUrl;
      console.log("Presigned URL:", presignedUrl);

      // Step 2: Upload document to S3 using presigned URL
      const uploadResponse = await axios.put(presignedUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      console.log("Upload response:", {
        status: uploadResponse.status,
        ok: uploadResponse.ok,
        url: presignedUrl,
      });

      if (uploadResponse.status !== 200) {
        const errorText = await uploadResponse.text();
        throw new Error(`Failed to upload document: ${uploadResponse.status} - ${errorText}`);
      }

      setMessage("Document uploaded successfully!");

      // Step 3: Submit post details to complete creation
      const postResponse = await axios.post(
        CREATE_POST_URL,
        {
          userId,
          postContent,
          selectedCategory,
          attachmentUrls: [attachmentUrl],
          status: "completed",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Post creation response:", postResponse.data);

      if (postResponse.status === 200 || postResponse.status === 201) {
        setMessage("Post created successfully!");
        setPostContent("");
        setSelectedCategory("research");
        setAttachmentFiles([]);
        setImageFiles([]);
        if (attachmentInputRef.current) attachmentInputRef.current.value = "";
        if (imageInputRef.current) imageInputRef.current.value = "";
      } else {
        throw new Error(`Failed to create post: ${postResponse.status} - ${postResponse.data?.message || "Unknown error"}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error("Error details:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">DP</span>
        </div>
        <div className="flex-1">
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Share your research, ask questions, or start a discussion..."
            className="w-full p-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />

          {/* Display selected attachments and images */}
          <div className="mt-4">
            {attachmentFiles.length > 0 && (
              <div className="mb-2">
                <span className="text-sm font-medium text-slate-600">Attachments:</span>
                <ul className="mt-1 space-y-1">
                  {attachmentFiles.map((file, index) => (
                    <li key={`attachment-${index}`} className="flex items-center justify-between text-sm text-slate-700 bg-slate-100 rounded px-2 py-1">
                      <span>
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove attachment"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {imageFiles.length > 0 && (
              <div>
                <span className="text-sm font-medium text-slate-600">Images:</span>
                <ul className="mt-1 space-y-1">
                  {imageFiles.map((file, index) => (
                    <li key={`image-${index}`} className="flex items-center justify-between text-sm text-slate-700 bg-slate-100 rounded px-2 py-1">
                      <span>
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                      <button
                        onClick={() => removeImage(index)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove image"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {message && <p className="mt-2 text-sm text-green-600">{message}</p>}

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

              <button
                onClick={handleAttachmentClick}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-blue-600 transition-colors"
              >
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
              <input
                type="file"
                ref={attachmentInputRef}
                onChange={handleAttachmentChange}
                multiple
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
              />

              <button
                onClick={handleImageClick}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-blue-600 transition-colors"
              >
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
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageChange}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>

            <button
              disabled={!postContent.trim()}
              onClick={handlePostSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;