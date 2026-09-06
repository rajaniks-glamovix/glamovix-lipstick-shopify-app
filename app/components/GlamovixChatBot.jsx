/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { useNavigate, useNavigation, useLocation } from "react-router";
import logoImg from "../assets/logo.png";

// SVG Icons
const SpinnerIcon = ({ size = 13, color = "#913b2c" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{
      animation: "glamovixSpin 0.75s linear infinite",
      display: "inline-block",
      verticalAlign: "middle",
    }}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="3"
      strokeDasharray="31.4"
      strokeDashoffset="10"
      strokeLinecap="round"
    />
  </svg>
);

const SendIcon = ({ size = 18, color = "#fff" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const CloseIcon = ({ size = 18, color = "#8c9196" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const TrashIcon = ({ size = 16, color = "#8c9196" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const ArrowRightIcon = ({ size = 14, color = "#202223" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const INITIAL_MESSAGE = {
  id: "welcome-1",
  sender: "assistant",
  text: `Hey! ✨ Welcome to **Glamovix AI** — your virtual try-on assistant.

Whether you want to adjust shades, test 3D models, or launch the Try-On button live on your Shopify store — I'm here to help.

What would you like to work on today?`,
  actions: [
    { type: "navigate", target: "/app/product", label: "Customize Products" },
    { type: "navigate", target: "/app/help", label: "View Setup Guide" },
    { type: "navigate", target: "/app/3d-editor", label: "Open 3D Studio" },
  ],
};

const SUGGESTED_CHIPS = [
  "How do I add Try-On to my store?",
  "Take me to Products ✨",
  "How does AI shade detection work?",
  "Check pricing & plans",
  "Show me the 3D Studio",
];

/**
 * Formats markdown-like text (bold, bullet points, numbers) into React nodes.
 */
function FormattedMessageText({ text }) {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <div style={{ lineHeight: "1.55", fontSize: "13.5px", color: "#202223" }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
          return <div key={idx} style={{ height: "8px" }} />;
        }

        // Bullet point
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const content = trimmed.substring(2);
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                margin: "3px 0",
              }}
            >
              <span
                style={{
                  color: "#1a1a1a",
                  fontWeight: "bold",
                  lineHeight: "1.4",
                  fontSize: "15px",
                }}
              >
                •
              </span>
              <span style={{ flex: 1 }}>{renderInlineFormatting(content)}</span>
            </div>
          );
        }

        // Numbered list (e.g. "1. Step")
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                margin: "4px 0",
              }}
            >
              <span
                style={{
                  minWidth: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  backgroundColor: "#f1f2f3",
                  color: "#1a1a1a",
                  fontSize: "11px",
                  fontWeight: "700",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "2px",
                }}
              >
                {numMatch[1]}
              </span>
              <span style={{ flex: 1 }}>
                {renderInlineFormatting(numMatch[2])}
              </span>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={idx} style={{ margin: "4px 0" }}>
            {renderInlineFormatting(line)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Handles inline formatting like **bold**, `code`, and #HEX preview chips.
 */
function renderInlineFormatting(text) {
  // Regex to split by bold (**...**) and code (`...`) and hex (#...)
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|#[0-9A-Fa-f]{6}\b)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} style={{ fontWeight: 650, color: "#111213" }}>
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={match.index}
          style={{
            backgroundColor: "#f1f2f3",
            padding: "1px 5px",
            borderRadius: "4px",
            fontSize: "12px",
            fontFamily: "monospace",
            color: "#303030",
          }}
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("#") && token.length === 7) {
      parts.push(
        <span
          key={match.index}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            backgroundColor: "#f6f6f7",
            padding: "1px 6px",
            borderRadius: "4px",
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: token,
              border: "1px solid rgba(0,0,0,0.15)",
              display: "inline-block",
            }}
          />
          {token}
        </span>,
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

export default function GlamovixChatBot() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // Navigation loading tracking to prevent rage/multi-clicking
  const [navigatingTarget, setNavigatingTarget] = useState(null);
  const [navigatingLabel, setNavigatingLabel] = useState("");

  const isNavigating = navigation.state === "loading" || Boolean(navigatingTarget);

  // Clear navigation state when route finishes loading or location matches
  useEffect(() => {
    if (navigation.state === "idle") {
      setNavigatingTarget(null);
      setNavigatingLabel("");
    }
  }, [navigation.state, location.pathname]);

  // Safety fallback timeout for navigation state
  useEffect(() => {
    if (navigatingTarget) {
      const timer = setTimeout(() => {
        setNavigatingTarget(null);
        setNavigatingLabel("");
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [navigatingTarget]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Restore history from sessionStorage on mount
  useEffect(() => {
    try {
      const saved =
        sessionStorage.getItem("glamovix_chat_history") ||
        sessionStorage.getItem("glamovix_concierge_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // Ignore sessionStorage errors
    }

    // Dismiss tooltip after 8s
    const timer = setTimeout(() => setShowTooltip(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  // Save history on change
  useEffect(() => {
    try {
      if (messages.length > 0) {
        sessionStorage.setItem(
          "glamovix_chat_history",
          JSON.stringify(messages),
        );
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, [messages]);

  // Auto-scroll to bottom when messages change or drawer opens
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setShowTooltip(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    setInputText("");

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: messages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      const data = await response.json();

      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text:
          data.reply ||
          "I'm sorry, I couldn't process that. Please try asking in another way.",
        actions: data.actions || [],
      };

      setMessages((prev) => [...prev, botMessage]);
      if (!isOpen) setHasUnread(true);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "assistant",
          text:
            "I'm having a brief connection hitch. You can also explore our step-by-step guides in the Help Center!",
          actions: [
            { type: "navigate", target: "/app/help", label: "Open Help Center" },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action) => {
    if (!action || isNavigating) return;
    if (action.type === "navigate" && action.target) {
      if (location.pathname === action.target) {
        // Already on this page
        return;
      }
      setNavigatingTarget(action.target);
      setNavigatingLabel(action.label || "destination");
      navigate(action.target);
    } else if (action.type === "external" && action.target) {
      window.open(action.target, "_blank", "noopener,noreferrer");
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    try {
      sessionStorage.removeItem("glamovix_chat_history");
      sessionStorage.removeItem("glamovix_concierge_history");
    } catch {
      // Ignore
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div
        style={{
          position: "fixed",
          bottom: "22px",
          right: "24px",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        {/* Subtle Welcome Tooltip */}
        {!isOpen && showTooltip && (
          <div
            style={{
              marginBottom: "10px",
              backgroundColor: "#18191b",
              color: "#ffffff",
              padding: "9px 14px",
              borderRadius: "10px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              fontSize: "12.5px",
              maxWidth: "240px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid rgba(255,255,255,0.1)",
              animation: "fadeIn 0.25s ease-out",
            }}
          >
            <img
              src={logoImg}
              alt=""
              style={{
                width: "18px",
                height: "18px",
                objectFit: "contain",
                borderRadius: "4px",
                backgroundColor: "#ffffff",
                padding: "1px",
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1, lineHeight: "1.35" }}>
              Need help? Ask <strong>Glamovix AI</strong> anytime! ✨
            </span>
            <button
              onClick={() => setShowTooltip(false)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Dismiss tooltip"
            >
              <CloseIcon size={12} color="#a0a0a0" />
            </button>
          </div>
        )}

        {/* Trigger Pill Button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          style={{
            height: "48px",
            padding: "0 18px",
            borderRadius: "24px",
            backgroundColor: "#1a1a1a",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow:
              "0 8px 24px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#2b2b2b";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#1a1a1a";
            e.currentTarget.style.transform = "translateY(0)";
          }}
          aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
        >
          <div
            style={{
              position: "relative",
              width: "22px",
              height: "22px",
              borderRadius: "6px",
              backgroundColor: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              padding: "2px",
              flexShrink: 0,
            }}
          >
            <img
              src={logoImg}
              alt="Glamovix"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
            {hasUnread && !isOpen && (
              <span
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#008060",
                  border: "2px solid #1a1a1a",
                }}
              />
            )}
          </div>

          <span
            style={{
              fontSize: "13.5px",
              fontWeight: "600",
              letterSpacing: "0.2px",
              color: "#ffffff",
            }}
          >
            {isOpen ? "Close AI" : "Glamovix AI"}
          </span>
        </button>
      </div>

      {/* Chat Window Modal */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "82px",
            right: "24px",
            width: "390px",
            maxWidth: "calc(100vw - 32px)",
            height: "590px",
            maxHeight: "calc(100vh - 110px)",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow:
              "0 24px 60px rgba(0, 0, 0, 0.22), 0 6px 18px rgba(0, 0, 0, 0.08)",
            border: "1px solid #e1e3e5",
            zIndex: 99998,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            animation: "slideUpFade 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <style>{`
            @keyframes glamovixSpin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes slideUpFade {
              from { opacity: 0; transform: translateY(12px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .glamovix-action-btn {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 6px 14px;
              border-radius: 20px;
              background-color: #ffffff;
              border: 1px solid #1a1a1a;
              color: #1a1a1a;
              font-size: 12.5px;
              font-weight: 600;
              cursor: pointer;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
              transition: all 0.15s ease;
              outline: none;
            }
            .glamovix-action-btn:hover:not(:disabled) {
              background-color: #1a1a1a !important;
              color: #ffffff !important;
            }
            .glamovix-action-btn.is-loading {
              background-color: #f1f2f4 !important;
              color: #1a1a1a !important;
              border-color: #1a1a1a !important;
              cursor: not-allowed !important;
            }
            .glamovix-action-btn:disabled:not(.is-loading) {
              opacity: 0.45 !important;
              cursor: not-allowed !important;
              background-color: #ffffff !important;
              color: #1a1a1a !important;
            }
          `}</style>
          {/* Header */}
          <div
            style={{
              padding: "14px 18px",
              backgroundColor: "#1a1a1a",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  padding: "3px",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                  flexShrink: 0,
                }}
              >
                <img
                  src={logoImg}
                  alt="Glamovix"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "650",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Glamovix AI
                  <span
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      backgroundColor: "#008060",
                      display: "inline-block",
                    }}
                    title="Active"
                  />
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#a0a5ad",
                    letterSpacing: "0.2px",
                  }}
                >
                  Virtual Try-On Assistant
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                onClick={handleClearChat}
                title="Clear Conversation"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  color: "#a0a5ad",
                }}
              >
                <TrashIcon size={15} color="#a0a5ad" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  color: "#a0a5ad",
                }}
              >
                <CloseIcon size={16} color="#a0a5ad" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div
            style={{
              flex: 1,
              padding: "16px",
              overflowY: "auto",
              backgroundColor: "#f9fafb",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isUser ? "flex-end" : "flex-start",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "86%",
                      padding: isUser ? "10px 14px" : "12px 16px",
                      borderRadius: isUser
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                      backgroundColor: isUser ? "#18191d" : "#ffffff",
                      color: isUser ? "#ffffff" : "#202223",
                      boxShadow: isUser
                        ? "0 2px 8px rgba(0,0,0,0.12)"
                        : "0 2px 8px rgba(0,0,0,0.04)",
                      border: isUser ? "none" : "1px solid #e3e5e7",
                      wordBreak: "break-word",
                    }}
                  >
                    {isUser ? (
                      <div
                        style={{
                          fontSize: "13.5px",
                          lineHeight: "1.45",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {msg.text}
                      </div>
                    ) : (
                      <FormattedMessageText text={msg.text} />
                    )}
                  </div>

                  {/* Render Action Buttons if available */}
                  {!isUser && msg.actions && msg.actions.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        marginTop: "2px",
                        maxWidth: "92%",
                      }}
                    >
                      {msg.actions.map((act, actIdx) => {
                        const isThisActionLoading = navigatingTarget === act.target;

                        return (
                          <button
                            key={actIdx}
                            type="button"
                            onClick={() => handleActionClick(act)}
                            disabled={isNavigating}
                            className={`glamovix-action-btn ${isThisActionLoading ? "is-loading" : ""}`}
                          >
                            {isThisActionLoading ? (
                              <>
                                <SpinnerIcon size={12} color="currentColor" />
                                <span>Opening {act.label}...</span>
                              </>
                            ) : (
                              <>
                                <span>{act.label}</span>
                                <ArrowRightIcon size={12} color="currentColor" />
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Thinking Indicator */}
            {isLoading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  borderRadius: "16px 16px 16px 4px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e3e5e7",
                  width: "fit-content",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <img
                  src={logoImg}
                  alt=""
                  style={{ width: "16px", height: "16px", objectFit: "contain" }}
                />
                <span style={{ fontSize: "12.5px", color: "#6d7175" }}>
                  Glamovix AI is on it... ✨
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips (shown when few messages) */}
          {messages.length <= 2 && (
            <div
              style={{
                padding: "8px 14px",
                backgroundColor: "#ffffff",
                borderTop: "1px solid #f1f2f3",
                display: "flex",
                gap: "6px",
                overflowX: "auto",
                whiteSpace: "nowrap",
                scrollbarWidth: "none",
              }}
            >
              {SUGGESTED_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  style={{
                    backgroundColor: "#f6f6f7",
                    border: "1px solid #e5e6e8",
                    borderRadius: "14px",
                    padding: "5px 10px",
                    fontSize: "11.5px",
                    color: "#303030",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#eceff1";
                    e.currentTarget.style.borderColor = "#c4c7cb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f6f6f7";
                    e.currentTarget.style.borderColor = "#e5e6e8";
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Active Navigation Feedback Bar */}
          {isNavigating && (
            <div
              style={{
                padding: "8px 14px",
                backgroundColor: "#f6f6f7",
                borderTop: "1px solid #e1e3e5",
                color: "#202223",
                fontSize: "12px",
                fontWeight: "550",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <SpinnerIcon size={13} color="#202223" />
              <span>Opening {navigatingLabel || "page"}... Please wait</span>
            </div>
          )}

          {/* Input Footer */}
          <div
            style={{
              padding: "12px 14px",
              backgroundColor: "#ffffff",
              borderTop: "1px solid #e3e5e7",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything or tell me where to go... ✨"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "20px",
                border: "1px solid #d2d5d8",
                fontSize: "13px",
                outline: "none",
                backgroundColor: "#fbfcfd",
                color: "#202223",
                transition: "border-color 0.15s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#1a1a1a";
                e.target.style.backgroundColor = "#ffffff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d2d5d8";
                e.target.style.backgroundColor = "#fbfcfd";
              }}
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                backgroundColor:
                  inputText.trim() && !isLoading ? "#18191d" : "#e4e5e7",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor:
                  inputText.trim() && !isLoading ? "pointer" : "not-allowed",
                transition: "background-color 0.15s ease",
                flexShrink: 0,
              }}
              aria-label="Send message"
            >
              <SendIcon
                size={16}
                color={inputText.trim() && !isLoading ? "#ffffff" : "#8c9196"}
              />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
