
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

function FoodDiscoveryChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I'm your TasteLocal food discovery assistant. I can help you discover food experiences and food tours. What would you like to explore?",
      recommendations: [],
    },
  ]);

  const messagesEndRef = useRef(null);

  const robotImage = '/images/icons/tastelocal-ai-robot.png';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

  const suggestedQuestions = [
    'Find Chinese food experiences in Singapore',
    'Show me cooking classes',
    'Recommend food tours in Singapore',
    'Find affordable food experiences',
  ];

  const sendMessage = async (messageText) => {
    const query = messageText.trim();

    if (!query || isLoading) return;

    setMessages((previous) => [
      ...previous,
      {
        role: 'user',
        content: query,
        recommendations: [],
      },
    ]);

    setInput('');
    setIsLoading(true);

    try {
      const response = await API.post(
        'food-discovery-assistant/',
        { query }
      );

      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          content:
            response.data.answer ||
            response.data.message ||
            'I could not find a suitable recommendation.',
          recommendations: response.data.recommendations || [],
        },
      ]);
    } catch (error) {
      console.error('Food Discovery Assistant Error:', error);

      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          content:
            'Sorry, I am unable to connect right now. Please try again.',
          recommendations: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          className="food-chat-launcher"
          onClick={() => setIsOpen(true)}
          aria-label="Open TasteLocal food assistant"
        >
          <img
            src={robotImage}
            alt="TasteLocal AI Assistant"
            className="food-chat-launcher-robot"
          />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="food-chat-window">

          {/* Header */}
          <div className="food-chat-header">
            <div className="food-chat-header-info">

              {/* Robot icon replaces the star */}
              <img
                src={robotImage}
                alt="TasteLocal AI Assistant"
                className="food-chat-avatar"
              />

              <div>
                <h3>TasteLocal Assistant</h3>
                <span>Discover local food experiences</span>
              </div>
            </div>

            <button
              className="food-chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="food-chat-messages">

            {messages.map((message, index) => (
              <div
                key={index}
                className={`food-chat-message ${message.role}`}
              >
                <div className="food-chat-bubble">
                  {message.content}

                  {/* Recommendations */}
                  {message.recommendations?.map((item) => (
                    <Link
                      key={`${item.type}-${item.id}`}
                      to={item.url}
                      className="food-chat-recommendation"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="food-chat-recommendation-type">
                        {item.type}
                      </div>

                      <h4>{item.title}</h4>

                      <p>
                        {item.area && `${item.area}, `}
                        {item.city}
                      </p>

                      <div className="food-chat-price">
                        {item.price}
                      </div>

                      <span className="food-chat-view-link">
                        View details →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="food-chat-message assistant">
                <div className="food-chat-bubble food-chat-typing">
                  TasteLocal is finding recommendations...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="food-chat-suggestions">
              <p>Try asking:</p>

              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => sendMessage(question)}
                  disabled={isLoading}
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            className="food-chat-input-area"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask me about food experiences..."
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              ↑
            </button>
          </form>

          <div className="food-chat-footer">
            Powered by TasteLocal AI
          </div>
        </div>
      )}
    </>
  );
}

export default FoodDiscoveryChatbot;
