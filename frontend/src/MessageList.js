import { useEffect, useRef } from "react";

function MessageList({ messages, loadingDots }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ padding: "10px" }}>
      {messages.map((msg, index) => {
        const isUser = msg.sender === "user";

        return (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: isUser ? "flex-end" : "flex-start",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                padding: "10px 14px",
                borderRadius: "16px",
                backgroundColor: isUser ? "#007aff" : "#e5e5ea",
                color: isUser ? "#fff" : "#000",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              <div>{msg.isLoading ? `考え中${loadingDots}` : msg.text}</div>

              {msg.references && msg.references.length > 0 && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "10px",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "#333",
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
                    参考文献
                  </div>

                  {msg.references.map((ref, refIndex) => (
                    <div
                      key={refIndex}
                      style={{
                        marginBottom: "10px",
                        paddingBottom: "10px",
                        borderBottom:
                          refIndex === msg.references.length - 1
                            ? "none"
                            : "1px solid #ddd",
                      }}
                    >
                      <div style={{ fontWeight: "bold" }}>
                        {refIndex + 1}. {ref.filename}
                        {ref.page !== null && ref.page !== undefined
                          ? ` / p.${ref.page}`
                          : ""}
                        {` / chunk ${ref.chunk_index}`}
                      </div>

                      <div
                        style={{
                          marginTop: "4px",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {ref.chunk}
                      </div>

                      {ref.score !== undefined && (
                        <div
                          style={{
                            marginTop: "4px",
                            color: "#666",
                            fontSize: "12px",
                          }}
                        >
                          類似度: {ref.score.toFixed(3)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;