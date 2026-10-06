import { useState } from "react";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

function FileUpload({ uploadStatus, setUploadStatus }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadStatus("");
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      setUploadStatus("ファイルを選択してください");
      return;
    }

    if (!selectedFile.name.endsWith(".txt")) {
      setUploadStatus(".txtファイルのみアップロードできます");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setIsUploading(true);
      setUploadStatus("アップロード中...");

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "アップロードに失敗しました");
      }

      setUploadStatus(
        `${data.filename} をアップロードしました（${data.chunk_count}チャンク / 保存数 ${data.stored_count}）`
      );
    } catch (error) {
      console.error(error);
      setUploadStatus(error.message || "アップロード中にエラーが発生しました");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto 16px",
        padding: "12px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#f9fafb",
      }}
    >
      <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
        RAG用資料アップロード
      </div>

      <input
        type="file"
        accept=".txt"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <button
        onClick={uploadFile}
        disabled={isUploading}
        style={{
          marginLeft: "8px",
          padding: "6px 12px",
          cursor: isUploading ? "not-allowed" : "pointer",
        }}
      >
        {isUploading ? "アップロード中..." : "アップロード"}
      </button>

      {uploadStatus && (
        <div
          style={{
            marginTop: "8px",
            fontSize: "14px",
            color: uploadStatus.includes("失敗") || uploadStatus.includes("できません")
              ? "red"
              : "#333",
          }}
        >
          {uploadStatus}
        </div>
      )}
    </div>
  );
}

export default FileUpload;