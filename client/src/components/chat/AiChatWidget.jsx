import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import apiClient from "../../utils/apiClient";
import "./AiChatWidget.css";

const QUICK_PROMPTS = [
  "⛰️ Tư vấn tour Hà Giang 3 ngày 2 đêm",
  "🚣 Gợi ý tour Ninh Bình khám phá Tràng An",
  "🏖️ Tìm tour ngắm biển dưới 4 triệu",
];

const API_FALLBACK_URL = import.meta.env.VITE_API_BASE 
  ? `${import.meta.env.VITE_API_BASE}/api/ai/chat` 
  : "https://booking-tour-api-gpnf.onrender.com/api/ai/chat";

const renderFormattedContent = (text) => {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} style={{ fontWeight: 700, color: "inherit" }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Xin chào! Tôi là **DTravel AI Agent** 🤖✨\nTôi có thể giúp bạn tìm tour du lịch theo sở thích, kiểm tra lịch trình và hỗ trợ đặt tour tự động. Bạn đang muốn đi du lịch ở đâu?",
      suggested_tours: [],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  // Hàm gửi tin nhắn người dùng đến API backend của AI
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue.trim();
    if (!text || isLoading) return; // Nếu tin nhắn trống hoặc AI đang xử lý thì không làm gì

    // Bước 1: Thêm tin nhắn của người dùng vào giao diện ngay lập tức
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    if (!textToSend) setInputValue("");
    setIsLoading(true);

    try {
      // Bước 2: Chuẩn bị danh sách lịch sử trò chuyện (bỏ tin nhắn chào đầu tiên và tin vừa gửi)
      const historyPayload = newMessages.slice(1, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      let res;
      try {
        // Bước 3: Gửi HTTP POST request sang API backend /api/ai/chat
        res = await apiClient.post("/api/ai/chat", {
          message: text,
          history: historyPayload,
        });
      } catch (err) {
        // Dự phòng nếu proxy chưa sẵn sàng thì gọi trực tiếp cổng 5029
        console.warn("apiClient proxy not ready, fallback to direct port 5029:", API_FALLBACK_URL);
        res = await axios.post(API_FALLBACK_URL, {
          message: text,
          history: historyPayload,
        });
      }

      // Bước 4: Trích xuất lời đáp văn bản và danh sách tour gợi ý từ response backend
      const reply = res.data.reply || "Tôi đã nhận được thông tin, nhưng có chút gián đoạn khi xử lý.";
      const tours = res.data.suggested_tours || [];

      // Bước 5: Cập nhật State messages để render phản hồi của AI + Card Tour lên giao diện
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          suggested_tours: tours,
          booking_created: res.data.booking_created,
          booking_id: res.data.booking_id,
        },
      ]);
    } catch (error) {
      console.error("Lỗi kết nối AI Agent:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Rất tiếc, hệ thống AI đang nâng cấp hoặc bận kết nối. Bạn vui lòng thử lại trong giây lát!",
        },
      ]);
    } finally {
      setIsLoading(false); // Tắt hiệu ứng loading
    }
  };

  // Làm mới cuộc trò chuyện
  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hội thoại đã được làm mới! Bạn muốn tìm kiếm tour du lịch nào tiếp theo? 🏖️",
        suggested_tours: [],
      },
    ]);
  };

  // Xử lý khi nhấn phím Enter để gửi tin nhắn
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Xử lý khi người dùng nhấn nút "Đặt tour ngay" trên Card Tour được gợi ý
  const handleBookClick = (tour) => {
    const promptText = `Tôi muốn đặt Tour '${tour.title}' (ID: ${tour.id}). Hãy giúp tôi điền thông tin đặt tour nhé!`;
    handleSendMessage(promptText);
  };

  return (
    <div className="ai-widget-wrapper">
      {/* Floating Trigger Launcher Button */}
      {!isOpen && (
        <button
          className="ai-widget-button"
          onClick={() => setIsOpen(true)}
          title="Trợ lý AI Tư Vấn Du Lịch"
        >
          <div className="ai-icon-sparkle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor"/>
            </svg>
          </div>
          <span>Tư vấn AI</span>
          <span className="ai-widget-badge">RAG</span>
        </button>
      )}

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div className="ai-widget-container">
          {/* Header */}
          <div className="ai-widget-header">
            <div className="ai-widget-header-info">
              <div className="ai-avatar">✨</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "15px", letterSpacing: "-0.2px" }}>
                  DTravel AI Agent
                </div>
                <div className="ai-status-indicator">
                  <span className="ai-status-dot"></span>Sẵn sàng hỗ trợ 24/7
                </div>
              </div>
            </div>
            <div className="ai-widget-header-actions">
              <button
                className="ai-header-btn"
                onClick={handleClearChat}
                title="Làm mới cuộc trò chuyện"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
              </button>
              <button
                className="ai-header-btn"
                onClick={() => setIsOpen(false)}
                title="Đóng cửa sổ chat"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="ai-widget-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-message ${msg.role}`}>
                <div className="ai-message-bubble">{renderFormattedContent(msg.content)}</div>

                {/* Render Suggested Tour Cards Carousel */}
                {msg.suggested_tours && msg.suggested_tours.length > 0 && (
                  <div className="ai-tour-cards-container">
                    {msg.suggested_tours.map((tour) => (
                      <div key={tour.id} className="ai-tour-card">
                        <div className="ai-tour-card-img-wrapper">
                          <img
                            src={
                              tour.thumbnail_url ||
                              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500"
                            }
                            alt={tour.title}
                          />
                          <div className="ai-tour-card-badge">★ {tour.rating || 5.0}</div>
                        </div>
                        <div className="ai-tour-card-body">
                          <div className="ai-tour-card-title">{tour.title}</div>
                          <div className="ai-tour-card-price">
                            <span>{tour.price ? tour.price.toLocaleString("vi-VN") : 0} đ</span>
                            {tour.old_price && (
                              <span className="ai-tour-card-price-old">
                                {tour.old_price.toLocaleString("vi-VN")} đ
                              </span>
                            )}
                          </div>
                          <div className="ai-tour-card-meta">
                            <span>📍 {tour.location_name || "Việt Nam"}</span>
                            <span>⏱️ {tour.num_day}N{tour.num_night}Đ</span>
                          </div>
                          <div className="ai-tour-card-actions">
                            <a
                              href={`/tours/${tour.slug || tour.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="ai-btn-detail"
                            >
                              Chi tiết
                            </a>
                            <button
                              className="ai-btn-book"
                              onClick={() => handleBookClick(tour)}
                            >
                              Đặt ngay
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading / Typing indicator */}
            {isLoading && (
              <div className="ai-message assistant">
                <div className="ai-typing">
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, marginRight: "4px" }}>
                    DTravel AI đang tìm thông tin...
                  </span>
                  <div className="ai-typing-dot"></div>
                  <div className="ai-typing-dot"></div>
                  <div className="ai-typing-dot"></div>
                </div>
              </div>
            )}

            {/* Quick Prompts on initial load */}
            {messages.length === 1 && !isLoading && (
              <div className="ai-quick-prompts">
                <div className="ai-quick-prompts-title">Gợi ý nhanh:</div>
                {QUICK_PROMPTS.map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    className="ai-quick-prompt-btn"
                    onClick={() => handleSendMessage(prompt)}
                  >
                    <span>{prompt}</span>
                    <span style={{ color: "#94a3b8", fontSize: "14px" }}>→</span>
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="ai-widget-footer">
            <input
              type="text"
              className="ai-widget-input"
              placeholder="Nhập nhu cầu du lịch hoặc câu hỏi..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button
              className="ai-widget-send"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              title="Gửi tin nhắn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
