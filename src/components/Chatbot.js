import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Mic, MicOff } from "lucide-react";
import { generateContent } from "../components/model"; // Adjust the path as needed
import "../styles/Chatbot.css";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your assistant. How can I help?",
      isBot: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported in this browser");
      setVoiceSupported(false);
      return;
    }

    try {
      // Initialize SpeechRecognition
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition
      recognitionRef.current.continuous = false; // Changed to false for better reliability
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US'; // Set language
      
      // Handle results - log for debugging
      recognitionRef.current.onresult = (event) => {
        console.log("Speech recognition result received:", event.results);
        
        // Get latest result
        const current = event.resultIndex;
        const currentTranscript = event.results[current][0].transcript;
        
        console.log("Current transcript:", currentTranscript);
        
        // If it's a final result
        if (event.results[current].isFinal) {
          console.log("Final transcript:", currentTranscript);
          setInput(prev => prev + " " + currentTranscript.trim());
          setTranscript("");
          
          // Auto-stop listening after getting final result
          recognitionRef.current.stop();
          setIsListening(false);
        } else {
          // Update interim transcript
          setTranscript(currentTranscript);
        }
      };
      
      // Handle errors
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        
        // Add error message to chat
        if (event.error === 'not-allowed') {
          setMessages(prev => [
            ...prev,
            {
              text: "Microphone access denied. Please allow microphone access and try again.",
              isBot: true,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      };
      
      // Handle end of speech recognition
      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended");
        setIsListening(false);
      };
      
      // Handle start of speech recognition
      recognitionRef.current.onstart = () => {
        console.log("Speech recognition started");
        setIsListening(true);
        setTranscript("");
      };
      
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      setVoiceSupported(false);
    }
    
    // Clean up on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error("Error stopping speech recognition:", error);
        }
      }
    };
  }, []);

  const toggleListening = () => {
    if (!voiceSupported) {
      setMessages(prev => [
        ...prev,
        {
          text: "Voice recognition is not supported in your browser. Please try Chrome, Edge, or Safari.",
          isBot: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }
    
    try {
      if (isListening) {
        console.log("Stopping speech recognition...");
        recognitionRef.current.stop();
      } else {
        console.log("Starting speech recognition...");
        recognitionRef.current.start();
        
        // Add notification that we're listening
        setMessages(prev => [
          ...prev,
          {
            text: "I'm listening... Speak now.",
            isBot: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (error) {
      console.error("Error toggling speech recognition:", error);
      setIsListening(false);
      
      // Notify user of error
      setMessages(prev => [
        ...prev,
        {
          text: "There was an error with voice recognition. Please try again.",
          isBot: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, transcript]);

  // Add animation class when opening/closing
  useEffect(() => {
    const chatContainer = document.querySelector(".chat-container");
    if (chatContainer) {
      if (isOpen) {
        // Small delay to ensure the DOM is ready
        setTimeout(() => {
          chatContainer.classList.add("open");
        }, 10);
      }
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message to state
    setMessages((prev) => [
      ...prev, 
      { text: input, isBot: false, time: currentTime }
    ]);
    setInput("");
    setLoading(true);

    try {
      // Use API to generate bot response
      const res = await generateContent(input);
      // The generateContent function returns a function that when called returns the text response.
      const botResponse = res();
      
      setMessages((prev) => [
        ...prev, 
        { 
          text: botResponse, 
          isBot: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error("Error generating response:", err);
      setMessages((prev) => [
        ...prev,
        { 
          text: "Sorry, I couldn't generate a response. Please try again.",
          isBot: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Stop voice recognition if active
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
      setIsListening(false);
    }
    
    // Remove the open class first for smooth animation
    const chatContainer = document.querySelector(".chat-container");
    if (chatContainer) {
      chatContainer.classList.remove("open");
      // Wait for animation to complete before hiding
      setTimeout(() => {
        setIsOpen(false);
      }, 300); // Match the transition duration from CSS
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="chat-toggle-button">
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className={`chat-container`}>
          <div className="chat-header">
            <h3>Assistant</h3>
            <button onClick={handleClose} className="close-button">
              <X size={20} />
            </button>
          </div>

          <div className="messages-container">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message ${msg.isBot ? "bot-message" : "user-message"}`}
              >
                {msg.text}
                <div className="message-time">{msg.time}</div>
              </div>
            ))}
            
            {transcript && (
              <div className="interim-transcript">
                {transcript}
              </div>
            )}
            
            {loading && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            <div className="input-wrapper">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={isListening ? "Listening..." : "Type your message..."}
                className="message-input"
              />
            </div>
            {voiceSupported && (
              <button 
                onClick={toggleListening} 
                className={`voice-button ${isListening ? 'active' : ''}`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}
            <button onClick={handleSend} className="send-button">
              <Send size={18} />
            </button>
          </div>
          
          {isListening && (
            <div className="listening-indicator visible">
              Listening...
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Chatbot;