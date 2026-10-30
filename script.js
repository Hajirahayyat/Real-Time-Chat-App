// Storage key for saving chat messages
const STORAGE_KEY = "whatsapp_chat_messages";

// Get HTML elements
const chatContainer = document.getElementById("chat-messages-container");
const messageList = document.getElementById("message-list");
const messageInput = document.getElementById("message-input");
const chatForm = document.getElementById("chat-form");

const typingIndicator = document.getElementById("typing-indicator");
const sidebarLastMsg = document.getElementById("sidebar-last-msg");
const sidebarLastTime = document.getElementById("sidebar-last-time");
const headerStatusText = document.getElementById("header-status-text");

const moreMenu = document.getElementById("more-menu");
const menuBtn = document.getElementById("menu-dropdown-btn");

const emojiBtn = document.getElementById("emoji-btn");
const emojiPalette = document.getElementById("emoji-palette");

const clearHistoryBtn = document.getElementById("clear-history-btn");
const mobileSidebarToggle = document.getElementById("mobile-sidebar-toggle");
const chatSidebar = document.getElementById("chat-sidebar");
const sidebarSearchInput = document.getElementById("sidebar-search-input");

let messages = [];

// Format the current time
function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

// Choose a chatbot response
function getBotResponse(userText) {
  const text = userText.trim().toLowerCase();

  switch (text) {
    case "hello":
      return "Hello 👋";

    case "hi":
      return "Hi there 😊";

    case "help":
      return "How can I help you?";

    case "internship":
      return "Best of luck with your internship 🚀";

    case "bye":
      return "Goodbye 👋";

    default:
      return "Thanks for your message 😊";
  }
}

// Create one message bubble
function createMessageNode(message) {
  const row = document.createElement("div");
  row.classList.add("message-row", message.type);

  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble");

  const text = document.createElement("span");
  text.textContent = message.text;

  const meta = document.createElement("span");
  meta.classList.add("message-meta");
  meta.textContent = message.timestamp;

  // Show blue ticks on sent messages
  if (message.type === "sent") {
    const check = document.createElement("span");
    check.classList.add("message-check");
    check.textContent = "✓✓";
    meta.appendChild(check);
  }

  bubble.appendChild(text);
  bubble.appendChild(meta);
  row.appendChild(bubble);

  return row;
}

// Add a message to the chat
function addMessage(text, type = "sent", timestamp = null) {
  const message = {
    id: Date.now() + Math.random(),
    text: text,
    type: type,
    timestamp: timestamp || formatTime()
  };

  messages.push(message);

  saveToLocalStorage();

  const messageNode = createMessageNode(message);
  messageList.appendChild(messageNode);

  // Update the contact preview
  if (sidebarLastMsg) {
    sidebarLastMsg.textContent = message.text;
  }

  if (sidebarLastTime) {
    sidebarLastTime.textContent = message.timestamp;
  }

  scrollToBottom();

  return message;
}

// Save messages in the browser
function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.warn("Could not save messages:", error);
  }
}

// Load saved messages
function loadFromLocalStorage() {
  try {
    const savedMessages = localStorage.getItem(STORAGE_KEY);

    if (savedMessages) {
      messages = JSON.parse(savedMessages);

      if (Array.isArray(messages) && messages.length > 0) {
        renderAllMessages();
        return;
      }
    }
  } catch (error) {
    console.warn("Could not load messages:", error);
  }

  loadSampleConversation();
}

// Display saved messages
function renderAllMessages() {
  messageList.innerHTML = "";

  messages.forEach(function (message) {
    messageList.appendChild(createMessageNode(message));
  });

  if (messages.length > 0) {
    const lastMessage = messages[messages.length - 1];

    sidebarLastMsg.textContent = lastMessage.text;
    sidebarLastTime.textContent = lastMessage.timestamp;
  }

  scrollToBottom(false);
}

// Scroll to the latest message
function scrollToBottom(smooth = true) {
  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: smooth ? "smooth" : "auto"
  });
}

// Simulate the chatbot replying
function triggerBotReply(userInput) {
  typingIndicator.classList.remove("hidden");
  headerStatusText.textContent = "typing...";

  scrollToBottom();

  setTimeout(function () {
    typingIndicator.classList.add("hidden");
    headerStatusText.textContent = "online";

    const reply = getBotResponse(userInput);
    addMessage(reply, "received");
  }, 700);
}

// Send a message
function handleSendMessage() {
  const text = messageInput.value.trim();

  if (text === "") {
    return;
  }

  addMessage(text, "sent");

  messageInput.value = "";
  messageInput.focus();

  triggerBotReply(text);
}

// Quick keyword buttons
function quickFillPrompt(keyword) {
  messageInput.value = keyword;
  handleSendMessage();
}

// Clear the conversation
function clearChatMessages() {
  const confirmed = confirm("Do you want to clear all chat messages?");

  if (!confirmed) {
    return;
  }

  messages = [];
  saveToLocalStorage();

  messageList.innerHTML = "";
  sidebarLastMsg.textContent = "No messages";
  sidebarLastTime.textContent = formatTime();

  moreMenu.classList.add("hidden");
}

// Load a sample conversation
function loadSampleConversation() {
  messages = [];
  messageList.innerHTML = "";

  addMessage(
    "Hi candidate! Welcome to the chat portal.",
    "received",
    "10:00 AM"
  );

  addMessage("internship", "sent", "10:01 AM");

  addMessage(
    "Best of luck with your internship 🚀",
    "received",
    "10:01 AM"
  );

  moreMenu.classList.add("hidden");
}

// Make functions available to HTML buttons
window.quickFillPrompt = quickFillPrompt;
window.clearChatMessages = clearChatMessages;
window.loadSampleConversation = loadSampleConversation;

// Start the app
function initApp() {
  loadFromLocalStorage();

  // Send a message when the form is submitted
  chatForm.addEventListener("submit", function (event) {
    event.preventDefault();
    handleSendMessage();
  });

  // Open or close the menu
  menuBtn.addEventListener("click", function (event) {
    event.stopPropagation();
    moreMenu.classList.toggle("hidden");
  });

  // Close popups when clicking elsewhere
  document.addEventListener("click", function () {
    moreMenu.classList.add("hidden");
    emojiPalette.classList.add("hidden");
  });

  // Emoji picker
  emojiBtn.addEventListener("click", function (event) {
    event.stopPropagation();
    emojiPalette.classList.toggle("hidden");
  });

  // Add a selected emoji to the input
  document.querySelectorAll(".emoji-opt").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();

      messageInput.value += button.textContent;
      messageInput.focus();

      emojiPalette.classList.add("hidden");
    });
  });

  // Clear saved chat history
  clearHistoryBtn.addEventListener("click", function () {
    clearChatMessages();
  });

  // Toggle sidebar on small screens
  mobileSidebarToggle.addEventListener("click", function () {
    chatSidebar.classList.toggle("hidden");
  });

  // Filter contacts by search text
  sidebarSearchInput.addEventListener("input", function () {
    const searchText = sidebarSearchInput.value.toLowerCase();
    const contacts = document.querySelectorAll(".chat-contact");

    contacts.forEach(function (contact) {
      const matches = contact.textContent.toLowerCase().includes(searchText);
      contact.style.display = matches ? "flex" : "none";
    });
  });

  messageInput.focus();
}

document.addEventListener("DOMContentLoaded", initApp);