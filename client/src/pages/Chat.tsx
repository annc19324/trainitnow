import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, ArrowLeft, Search, Loader2, Users } from "lucide-react";
import { useAuth, apiRequest } from "../components/AuthContext";
import { useLanguage } from "../components/LanguageContext";
import { useToast } from "../components/ToastContext";
import styles from "../styles/Chat.module.css";

interface ChatPartner {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  unreadCount?: number;
}

interface ChatGroup {
  id: string;
  name: string;
  description: string | null;
  isCommunity: boolean;
  avatarUrl: string | null;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  receiverId: string | null;
  groupId: string | null;
  createdAt: string;
}

export default function Chat() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();

  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [directChats, setDirectChats] = useState<ChatPartner[]>([]);
  const [activeGroup, setActiveGroup] = useState<ChatGroup | null>(null);
  const [activePartner, setActivePartner] = useState<ChatPartner | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatPartner[]>([]);
  const [searching, setSearching] = useState(false);
  
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const messageAreaRef = useRef<HTMLDivElement>(null);

  // Fetch groups and direct chats list
  const fetchChatLists = async () => {
    try {
      const groupsRes = await apiRequest("/api/chat/groups");
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setGroups(groupsData);
      }

      const directRes = await apiRequest("/api/chat/direct");
      if (directRes.ok) {
        const directData = await directRes.json();
        setDirectChats(directData);
      }
    } catch (error) {
      console.error("Error fetching chats lists:", error);
    }
  };

  useEffect(() => {
    fetchChatLists();
    // Poll for updates in sidebar lists
    const interval = setInterval(fetchChatLists, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle searching users
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        return;
      }
      
      setSearching(true);
      try {
        const res = await apiRequest(`/api/chat/search-users?query=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Fetch messages for active chat session
  const fetchMessages = async (showLoading = false) => {
    if (!activeGroup && !activePartner) return;
    
    if (showLoading) setLoadingMessages(true);
    try {
      const url = activeGroup 
        ? `/api/chat/messages?groupId=${activeGroup.id}`
        : `/api/chat/messages?userId=${activePartner!.id}`;
        
      const res = await apiRequest(url);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  };

  // Poll for new messages in the current conversation
  useEffect(() => {
    fetchMessages(true);

    const interval = setInterval(() => {
      fetchMessages(false);
    }, 2500);

    return () => clearInterval(interval);
  }, [activeGroup?.id, activePartner?.id]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || sending) return;

    setSending(true);
    const body: any = {
      content: messageInput.trim(),
    };
    if (activeGroup) body.groupId = activeGroup.id;
    if (activePartner) body.receiverId = activePartner.id;

    try {
      const res = await apiRequest("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const newMessage = await res.json();
        setMessages((prev) => [...prev, newMessage]);
        setMessageInput("");
        
        // Refresh direct list immediately to make sure they display in chat list
        if (activePartner) {
          fetchChatLists();
        }
      } else {
        showToast(language === "vi" ? "Lỗi gửi tin nhắn" : "Failed to send message", "error");
      }
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setSending(false);
    }
  };

  const selectGroup = (group: ChatGroup) => {
    setActivePartner(null);
    setActiveGroup(group);
    setSearchQuery("");
  };

  const selectPartner = (partner: ChatPartner) => {
    setActiveGroup(null);
    setActivePartner(partner);
    setSearchQuery("");
  };

  return (
    <div className={styles.chatContainer}>
      {/* Sidebar - list of chats */}
      <div className={`${styles.sidebar} ${activeGroup || activePartner ? styles.sidebarHidden : ""}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>{language === "vi" ? "Trò chuyện" : "Chat"}</h2>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} size={16} />
            <input
              type="text"
              placeholder={language === "vi" ? "Tìm kiếm người dùng..." : "Search users..."}
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searching && (
              <Loader2 
                size={16} 
                className="spin-animation" 
                style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", animation: "spin 1s linear infinite" }} 
              />
            )}

            {/* User Search Results */}
            {searchResults.length > 0 && (
              <div className={styles.searchResults}>
                {searchResults.map((u) => (
                  <div key={u.id} className={styles.searchResultItem} onClick={() => selectPartner(u)}>
                    <div className={styles.avatar}>
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        u.name?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{u.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>@{u.username}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.sidebarContent}>
          {/* Community groups (Always sorted to the top) */}
          <div className={styles.sectionHeader}>{language === "vi" ? "Cộng đồng" : "Community"}</div>
          {groups.map((g) => (
            <div
              key={g.id}
              className={`${styles.chatItem} ${activeGroup?.id === g.id ? styles.chatItemActive : ""}`}
              onClick={() => selectGroup(g)}
            >
              <div className={styles.avatar}>
                {g.avatarUrl ? (
                  <img src={g.avatarUrl} alt={g.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ background: "var(--accent-gradient)", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
                    <Users size={18} style={{ color: "white" }} />
                  </div>
                )}
              </div>
              <div className={styles.chatInfo}>
                <div className={styles.chatName}>{g.name}</div>
                <div className={styles.chatLastMsg}>{g.description || (language === "vi" ? "Nhóm cộng đồng" : "Community Group")}</div>
              </div>
            </div>
          ))}

          {/* Direct chats (Shows unread count) */}
          <div className={styles.sectionHeader}>{language === "vi" ? "Nhắn riêng" : "Direct Messages"}</div>
          {directChats.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", padding: "1rem 1.5rem" }}>
              {language === "vi" ? "Chưa có cuộc trò chuyện riêng nào." : "No direct messages yet."}
            </p>
          ) : (
            directChats.map((c) => (
              <div
                key={c.id}
                className={`${styles.chatItem} ${activePartner?.id === c.id ? styles.chatItemActive : ""}`}
                onClick={() => selectPartner(c)}
              >
                <div className={styles.avatar}>
                  {c.avatarUrl ? (
                    <img src={c.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    c.name?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <div className={styles.chatInfo}>
                  <div className={styles.chatName}>{c.name}</div>
                  <div className={styles.chatLastMsg}>@{c.username}</div>
                </div>
                {/* Direct messages show unread counts */}
                {c.unreadCount && c.unreadCount > 0 ? (
                  <div className={styles.badge}>{c.unreadCount}</div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main chat window */}
      <div className={styles.chatMain}>
        {activeGroup || activePartner ? (
          <>
            {/* Header info */}
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderInfo}>
                <button
                  className={styles.backButton}
                  onClick={() => {
                    setActiveGroup(null);
                    setActivePartner(null);
                  }}
                >
                  <ArrowLeft size={20} />
                </button>
                <div className={styles.avatar}>
                  {activeGroup ? (
                    activeGroup.avatarUrl ? (
                      <img src={activeGroup.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ background: "var(--accent-gradient)", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
                        <Users size={18} style={{ color: "white" }} />
                      </div>
                    )
                  ) : activePartner?.avatarUrl ? (
                    <img src={activePartner.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    activePartner?.name?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <div>
                  <div className={styles.chatHeaderName}>
                    {activeGroup ? activeGroup.name : activePartner?.name}
                  </div>
                  <div className={styles.chatHeaderStatus}>
                    {activeGroup 
                      ? (activeGroup.description || (language === "vi" ? "Kênh cộng đồng" : "Community Channel"))
                      : `@${activePartner?.username}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Message List */}
            <div className={styles.messageArea} ref={messageAreaRef}>
              {loadingMessages && messages.length === 0 ? (
                <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
                  <Loader2 className="spin-animation" style={{ animation: "spin 1s linear infinite" }} />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", flexDirection: "column", color: "var(--text-secondary)" }}>
                  <MessageSquare size={36} style={{ marginBottom: "1rem" }} />
                  <p>{language === "vi" ? "Chưa có tin nhắn nào. Bắt đầu trò chuyện!" : "No messages yet. Say hello!"}</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isSent = m.senderId === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`${styles.messageRow} ${isSent ? styles.messageRowSent : styles.messageRowReceived}`}
                    >
                      <div className={`${styles.messageBubble} ${isSent ? styles.messageBubbleSent : styles.messageBubbleReceived}`}>
                        {!isSent && activeGroup && (
                          <div className={styles.messageSender}>{m.sender.name || `@${m.sender.username}`}</div>
                        )}
                        <div className={styles.messageText}>{m.content}</div>
                        <div className={styles.messageTime}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input area */}
            <div className={styles.chatInputArea}>
              <form onSubmit={handleSendMessage} className={styles.chatInputForm}>
                <input
                  type="text"
                  placeholder={language === "vi" ? "Nhập tin nhắn..." : "Type a message..."}
                  className={styles.chatInput}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  required
                />
                <button type="submit" className={styles.sendButton} disabled={sending || !messageInput.trim()}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className={styles.noChatSelected}>
            <MessageSquare size={64} style={{ color: "var(--text-secondary)", opacity: 0.5 }} />
            <h2 className="gradient-text" style={{ fontSize: "1.75rem", fontWeight: 700 }}>
              {language === "vi" ? "Chào mừng đến với Trò chuyện" : "Welcome to Chat"}
            </h2>
            <p style={{ maxWidth: "400px" }}>
              {language === "vi"
                ? "Chọn một nhóm cộng đồng hoặc nhắn tin riêng cho bạn bè từ danh sách bên trái để bắt đầu cuộc hội thoại."
                : "Select a community group or direct chat with a partner from the sidebar list to start chatting."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
