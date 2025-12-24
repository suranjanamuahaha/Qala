import { useState } from "react";
import { askGemini } from "../lib/gemini";

type Message = {
  role: "user" | "bot";
  text: string;
};

const FloatingChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi! 👋 I’m Qala Assistant. Ask me anything about artists, commissions, or the platform.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);

    try {
      const reply = await askGemini(
        `You are a helpful assistant for an art marketplace called Qala.
Keep answers short and friendly.

User: ${userMsg}`
      );

      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full h-14 w-14 shadow-lg text-2xl flex items-center justify-center"
      >
        {open ? "✖" : "💬"}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-xl shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-3 border-b">
            <h3 className="font-semibold text-sm">Qala Assistant</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[85%] ${
                  m.role === "user"
                    ? "bg-blue-600 text-white ml-auto"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {m.text}
              </div>
            ))}

            {loading && (
              <div className="text-gray-400 text-xs">Typing...</div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask something..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-600 text-white px-3 rounded-lg text-sm disabled:opacity-60"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;
