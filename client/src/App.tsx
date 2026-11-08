import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./App.css";
interface ChatMessage {
  _id: string;
  username: string;
  message: string;
  createdAt: string;
}
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001";
function App() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [inputUsername, setInputUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUser, setTypingUser] = useState("");
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    if (!joined || !username) return;
    const newSocket = io(API_URL);
    setSocket(newSocket);
    newSocket.on("connect", () => {
      setConnected(true);
      newSocket.emit("join-chat", username);
    });
    newSocket.on("disconnect", () => {
      setConnected(false);
    });
    newSocket.on("connect_error", () => {
      setError("Unable to connect to the chat server.");
    });
    newSocket.on("online-users", (users: string[]) => {
      setOnlineUsers(users);
    });
    newSocket.on("receive-message", (newMessage: ChatMessage) => {
      setMessages((previous) => {
        if (previous.some((item) => item._id === newMessage._id)) {
          return previous;
        }
        return [...previous, newMessage];
      });
    });
    newSocket.on("user-joined", (name: string) => {
      setError(`${name} joined the chat`);
      setTimeout(() => setError(""), 3000);
    });
    newSocket.on("user-left", (name: string) => {
      setError(`${name} left the chat`);
      setTimeout(() => setError(""), 3000);
    });
    newSocket.on("typing", (name: string) => {
      setTypingUser(name);
    });
    newSocket.on("stop-typing", () => {
      setTypingUser("");
    });
    newSocket.on("message-error", (data: { message: string }) => {
      setError(data.message);
    });
    // Load previous messages from MongoDB
    fetch(`${API_URL}/api/messages`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load messages");
        }
        return response.json();
      })
      .then((history: ChatMessage[]) => {
        setMessages((previous) => {
          const combined = [...history, ...previous];
          const unique = new Map(
            combined.map((item) => [item._id, item])
          );
          return Array.from(unique.values());
        });
      })
      .catch(() => {
        setError("Could not load previous chat history.");
      });
    return () => {
      newSocket.disconnect();
    };
  }, [joined, username]);
  const joinChat = () => {
    const cleanUsername = inputUsername.trim();
    if (!cleanUsername) {
      setError("Please enter a username.");
      return;
    }
    if (cleanUsername.length > 30) {
      setError("Username cannot exceed 30 characters.");
      return;
    }
    setUsername(cleanUsername);
    setJoined(true);
    setError("");
  };
  const sendMessage = () => {
    const cleanMessage = message.trim();
    if (!cleanMessage) {
      setError("Message cannot be empty.");
      return;
    }
    if (cleanMessage.length > 500) {
      setError("Message cannot exceed 500 characters.");
      return;
    }
    if (!socket || !socket.connected) {
      setError("You are not connected to the server.");
      return;
    }
    socket.emit("send-message", {
      username,
      message: cleanMessage,
    });
    setMessage("");
    socket.emit("stop-typing");
    setTypingUser("");
  };
  const handleTyping = (value: string) => {
    setMessage(value);
    if (socket?.connected) {
      if (value.trim()) {
        socket.emit("typing");
      } else {
        socket.emit("stop-typing");
      }
    }
  };
  if (!joined) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="logo">✦</div>
          <h1>Connect.</h1>
          <p>Real-time conversations, wherever you are.</p>
          <input
            type="text"
            placeholder="Enter your username"
            value={inputUsername}
            maxLength={30}
            onChange={(e) => setInputUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") joinChat();
            }}
          />
          {error && <p className="error">{error}</p>}
          <button onClick={joinChat}>Join Chat →</button>
        </div>
      </div>
    );
  }
  return (
    <div className="chat-page">
      <aside className="sidebar">
        <div className="brand">
          <span>✦</span> Connect.
        </div>
        <div className="profile">
          <div className="avatar">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3>{username}</h3>
            <p>My account</p>
          </div>
        </div>
        <div className="users-section">
          <h4>ONLINE USERS</h4>
          {onlineUsers.map((user, index) => (
            <div className="user-item" key={`${user}-${index}`}>
              <div className="small-avatar">
                {user.charAt(0).toUpperCase()}
              </div>
              <span>{user}</span>
              <span className="online-dot"></span>
            </div>
          ))}
        </div>
        <div className="connection">
          <span className={connected ? "online-dot" : "offline-dot"}></span>
          {connected ? "Connected" : "Connecting..."}
        </div>
      </aside>
      <main className="chat-main">
        <header className="chat-header">
          <div>
            <h2>General Chat</h2>
            <p>Welcome to the conversation</p>
          </div>
          <span className="members">
            {onlineUsers.length} online
          </span>
        </header>
        <div className="messages-area">
          {messages.length === 0 && (
            <div className="empty-state">
              <span>✦</span>
              <h3>No messages yet</h3>
              <p>Start the conversation!</p>
            </div>
          )}
          {messages.map((item, index) => {
            const isOwn = item.username === username;
            return (
              <div
                className={`message-row ${isOwn ? "own-message" : ""}`}
                key={item._id || index}
              >
                {!isOwn && (
                  <div className="message-avatar">
                    {item.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="message-content">
                  <div className="message-meta">
                    <strong>
                      {isOwn ? "You" : item.username}
                    </strong>
                    <span>
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="message-bubble">
                    {item.message}
                  </div>
                </div>
              </div>
            );
          })}
          {typingUser && typingUser !== username && (
            <div className="typing-indicator">
              {typingUser} is typing...
            </div>
          )}
        </div>
        {error && <div className="notification">{error}</div>}
        <div className="message-input-area">
          <input
            type="text"
            placeholder="Write your message..."
            value={message}
            maxLength={600}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button onClick={sendMessage} disabled={!connected}>
            Send ↑
          </button>
        </div>
        <div className="input-footer">
          <span>Messages are stored securely in MongoDB.</span>
          <span>{message.length}/500</span>
        </div>
      </main>
    </div>
  );
}
export default App;