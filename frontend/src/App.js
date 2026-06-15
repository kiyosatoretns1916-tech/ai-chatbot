import { useState, useEffect } from "react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import FileUpload from "./FileUpload";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("messages");
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [loadingDots, setLoadingDots] = useState(".");
  const [isSending, setIsSending] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [chatMode, setChatMode] = useState("normal");

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLoadingDots((prev) => {
        if (prev === "...") return ".";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const savedMessages = messages.filter((msg) => !msg.isLoading);
    localStorage.setItem("messages", JSON.stringify(savedMessages));
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    if(isSending) return;

    setIsSending(true);

    const userMessage = { sender: "user", text: input };
    const currentInput = input;
    setInput("");
    const endpoint =
      chatMode === "rag"
        ? "http://127.0.0.1:8000/rag-chat"
        : "http://127.0.0.1:8000/chat";

    const loadingMessage = {
      sender: "ai",
      text: "考え中",
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: currentInput }),
      });

      const data = await res.json();

      if (!res.ok) {
          throw new Error(data.detail || "APIエラー");
      }

      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          sender: "ai",
          text: data.response,
          references: data.references,
        },
      ]);

    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { sender: "ai", text: error.message || "エラーが発生しました…" },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    localStorage.removeItem("messages");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7f7f8",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          padding: "20px",
          paddingBottom: "120px",
        }}
      >
        <h1 style={{ textAlign: "center" }}>AIチャット</h1>

        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <button
            onClick={() => setChatMode("normal")}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              backgroundColor: chatMode === "normal" ? "#2563eb" : "#fff",
              color: chatMode === "normal" ? "#fff" : "#333",
              cursor: "pointer",
              marginRight: "8px",
            }}
          >
            通常チャット
          </button>

          <button
            onClick={() => setChatMode("rag")}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              backgroundColor: chatMode === "rag" ? "#2563eb" : "#fff",
              color: chatMode === "rag" ? "#fff" : "#333",
              cursor: "pointer",
            }}
          >
            RAGモード
          </button>
        </div>

        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <button
            onClick={resetChat}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              backgroundColor: "#fff",
              cursor: "pointer",
            }}
          >
            会話をリセット
          </button>
        </div>

        {chatMode === "rag" && (
          <FileUpload
            uploadStatus={uploadStatus}
            setUploadStatus={setUploadStatus}
          />
        )}

        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <MessageList messages={messages} loadingDots={loadingDots} />
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          backgroundColor: "#f7f7f8",
          padding: "16px 20px",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: "800px" }}>
          <ChatInput
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            isSending = {isSending}
          />
        </div>
      </div>
    </div>
  );
}

export default App;