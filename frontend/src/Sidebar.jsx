import "./Sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext";
import { v1 as uuidv1 } from "uuid";
import { useNavigate } from "react-router-dom";

const API_URL = "";

function Sidebar() {

    const {
        allThreads,
        setAllThreads,
        currThreadId,
        setCurrThreadId,
        setPrevChats,
        setPrompt,
        setReply,
        setNewChat
    } = useContext(MyContext);

    const [user, setUser] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    useEffect(() => {
        loadThreads();
    }, [currThreadId]);

    const loadThreads = async () => {

        const token = localStorage.getItem("token");

        if (!token) return;

        try {

            const response = await fetch(
                `${API_URL}/api/thread`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            setAllThreads(
                data.map(thread => ({
                    threadId: thread.threadId,
                    title: thread.title
                }))
            );

        } catch (error) {
            console.error(error);
        }
    };

    const startNewChat = () => {

        setCurrThreadId(uuidv1());
        setPrevChats([]);
        setPrompt("");
        setReply(null);
        setNewChat(true);
    };

    const openThread = async (threadId) => {

        const token = localStorage.getItem("token");

        if (!token) return;

        try {

            const response = await fetch(
                `${API_URL}/api/thread/${threadId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const messages = await response.json();

            setCurrThreadId(threadId);
            setPrevChats(messages);
            setReply(null);
            setNewChat(false);

        } catch (error) {
            console.error(error);
        }
    };

    const deleteThread = async (e, threadId) => {

        e.stopPropagation();

        const token = localStorage.getItem("token");

        if (!token) return;

        try {

            await fetch(
                `${API_URL}/api/thread/${threadId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setAllThreads(prev =>
                prev.filter(
                    thread => thread.threadId !== threadId
                )
            );

            if (threadId === currThreadId) {
                startNewChat();
            }

        } catch (error) {
            console.error(error);
        }
    };

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/auth");
    };

    return (
        <aside className="sidebar">

            <div className="sidebarTop">

                <button
                    className="newChatBtn"
                    onClick={startNewChat}
                >
                    <i className="fa-regular fa-pen-to-square"></i>
                    <span className="newChatLabel">
                        New Chat
                    </span>
                </button>

            </div>

            <div className="historySection">

                {allThreads.length > 0 && (
                    <>
                        <p className="historyLabel">
                            Recent Chats
                        </p>

                        {allThreads.map(thread => (
                            <div
                                key={thread.threadId}
                                className={`historyItem ${
                                    thread.threadId === currThreadId
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    openThread(thread.threadId)
                                }
                            >
                                <span className="historyTitle">
                                    {thread.title}
                                </span>

                                <button
                                    className="deleteBtn"
                                    onClick={(e) =>
                                        deleteThread(
                                            e,
                                            thread.threadId
                                        )
                                    }
                                >
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        ))}
                    </>
                )}

            </div>

            <div className="sidebarBottom">

                <div
                    className="userInfo"
                    onClick={logout}
                    title="Logout"
                >
                    <div className="userAvatar">
                        {user?.username
                            ? user.username[0].toUpperCase()
                            : "G"}
                    </div>

                    <span className="userName">
                        {user?.username || "Guest"}
                    </span>

                    <i className="fa-solid fa-arrow-right-from-bracket userMenu"></i>
                </div>

            </div>

        </aside>
    );
}

export default Sidebar;