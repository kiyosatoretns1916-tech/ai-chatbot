function ChatInput({input, setInput, sendMessage, isSending}){
  const handleKeyDown = (e) => {
    if(e.nativeEvent.isComposing) return;

    if(e.key === "Enter" && !e.shiftKey){
      e.preventDefault();
      sendMessage();
    }
  };

  return(
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="メッセージを入力"
        disabled={isSending}
      />
      <button onClick={sendMessage} disabled={isSending}>
        {isSending ? "送信中..." : "送信"}
        </button>
    </div>
  );
}

export default ChatInput;