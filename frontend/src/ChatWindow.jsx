import "./ChatWindow.css";
import { useContext, useEffect, useRef, useState } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import AuthPopup from "./AuthPopup";

const suggestions = [
  "What is Arrays?",
  "What is the event loop in JavaScript?",
  "How does useEffect work?",
  "How to center a div in CSS?"
];

const API_URL = "";

function ChatWindow() {
  const {prompt,setPrompt,setReply,currThreadId,prevChats,setPrevChats,setNewChat,newChat} = useContext(MyContext);
  const [loading, setLoading] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [user, setUser] = useState(null);
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [prevChats, loading]);

  const resizeTextarea = (element) => {
    element.style.height = "auto";
    element.style.height =
    Math.min(element.scrollHeight, 160) + "px";
  };

  const handleInputChange = (e) => {
    setPrompt(e.target.value);
    resizeTextarea(e.target);
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setShowAuthPopup(true);
      return;
    }

    setLoading(true);
    setNewChat(false);

    setPrevChats((oldChats) => [
      ...oldChats,
      {
        role: "user",
        content: message
      }
    ]);

    setPrompt("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const response = await fetch(
        `${API_URL}/api/knowledge/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            message,
            threadId: currThreadId
          })
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        setShowAuthPopup(true);
        setLoading(false);
        return;
      }

      const data = await response.json();

      setReply(data.reply);

      setPrevChats((oldChats) => [
        ...oldChats,
        {
          role: "assistant",
          content: data.reply
        }
      ]);
    } catch (error) {
      console.error(error);

      setPrevChats((oldChats) => [
        ...oldChats,
        {
          role: "assistant",
          content: "Something went wrong. Please try again."
        }
      ]);
    }

    setLoading(false);
  };

  const handleSend = () => {
    sendMessage(prompt);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const userInitial =
    user?.username?.charAt(0)?.toUpperCase();

  return (
    <div className="chatWindow">

      {showAuthPopup && (
        <AuthPopup
          onClose={() => setShowAuthPopup(false)}
        />
      )}

      <header className="chatHeader">
        <span className="chatHeaderTitle">
          PrepMind
        </span>
      </header>

      <div className="messagesArea">

        {newChat && prevChats.length === 0 ? (
          <div className="emptyState">

            <div className="emptyLogo">
              <i className="fa-solid fa-brain"></i>
            </div>

            <h1 className="emptyTitle">
              What can I help with?
            </h1>

            <p className="emptySubtitle">
              Ask me anything about DSA, React,
              JavaScript, CSS or interview preparation.
            </p>

            <div className="suggestionGrid">
              {suggestions.map((item, index) => (
                <button
                  key={index}
                  className="suggestionCard"
                  onClick={() => sendMessage(item)}
                >
                  {item}
                </button>
              ))}
            </div>

          </div>
        ) : (
          <>
            {prevChats.map((chat, index) => (
              <div
                key={index}
                className={`messageRow ${chat.role}`}
              >

                {chat.role === "assistant" && (
                  <div className="avatarIcon bot">
                    <i className="fa-solid fa-brain"></i>
                  </div>
                )}

                <div
                  className={`messageBubble ${chat.role}`}
                >
                  {chat.role === "user" ? (
                    chat.content
                  ) : (
                    <ReactMarkdown
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {chat.content}
                    </ReactMarkdown>
                  )}
                </div>

                {chat.role === "user" && (
                  <div className="avatarIcon user">
                    {userInitial || (
                      <i className="fa-solid fa-user"></i>
                    )}
                  </div>
                )}

              </div>
            ))}

            {loading && (
              <div className="messageRow assistant">

                <div className="avatarIcon bot">
                  <i className="fa-solid fa-brain"></i>
                </div>

                <div className="loadingDots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

              </div>
            )}

            <div ref={bottomRef}></div>
          </>
        )}

      </div>

      <div className="inputArea">

        <div className="inputBox">

          <textarea
            ref={textareaRef}
            className="chatTextarea"
            rows={1}
            value={prompt}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              user
                ? "Ask anything..."
                : "Sign in to start chatting"
            }
          />

          <button
            className="sendBtn"
            onClick={handleSend}
            disabled={loading || !prompt.trim()}
          >
            <i className="fa-solid fa-arrow-up"></i>
          </button>

        </div>

        <p className="inputFooter">
          PrepMind can make mistakes. Verify
          important information.
        </p>

      </div>

    </div>
  );
}

export default ChatWindow;