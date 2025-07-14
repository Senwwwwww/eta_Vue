<template>
  <div class="chat-wrapper">
    <header class="chat-header">
      <div class="header-left">
        <div class="header-icon">💬</div>
        <h2>AI助手</h2>
      </div>
      <div class="header-actions">
        <el-button
            size="small"
            @click="undoLastMessage"
            :disabled="chatMessages.length === 0"
            class="header-btn"
        >
          <i class="el-icon-refresh-left"></i>
          撤回消息
        </el-button>
        <el-button
            size="small"
            type="danger"
            @click="clearChat"
            class="header-btn danger"
        >
          <i class="el-icon-delete"></i>
          清空聊天
        </el-button>
      </div>
    </header>

    <main ref="chatMain" class="chat-main">
      <div
          v-for="(msg, i) in chatMessages"
          :key="i"
          :class="['chat-msg', msg.role === 'user' ? 'user' : 'ai']"
      >
        <div class="avatar" :title="msg.role === 'user' ? '您' : 'AI助手'">
          <img :src="msg.role === 'user' ? userAvatar : aiAvatar" alt="avatar" />
        </div>
        <div
            class="message-content"
            v-html="formatMessage(msg.text)"
            :title="msg.text"
        ></div>
      </div>

      <!-- 空状态提示 -->
      <div v-if="chatMessages.length === 0" class="empty-state">
        <div class="empty-icon">🤖</div>
        <h3>开始对话吧！</h3>
        <p>我是您的AI助手，有什么可以帮助您的吗？</p>
      </div>
    </main>

    <footer class="chat-footer">
      <div class="input-container">
        <el-input
            v-model="userInput"
            placeholder="请输入消息，按 Enter 发送..."
            @keyup.enter.native="sendMessage"
            type="textarea"
            :rows="1"
            :autosize="{ minRows: 1, maxRows: 5 }"
            class="input-textarea"
        />
        <el-button
            type="primary"
            :loading="loading"
            @click="sendMessage"
            class="send-btn"
            circle
        >
          <i v-if="!loading" class="el-icon-s-promotion"></i>
        </el-button>
      </div>
    </footer>
  </div>
</template>

<script>
import axios from "axios";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import 'element-ui/lib/theme-chalk/index.css';

export default {
  data() {
    return {
      userInput: "",
      loading: false,
      chatMessages: [],
      API_KEY: "M5X110Q-JG5MB4S-GCPA56J-15ZDGCX",
      BASE_URL: "http://localhost:3001",
      WORKSPACE_ID: "3f4f4436-84af-4e5d-a408-1bb3d83fb09f",
      userAvatar: "https://i.pravatar.cc/40?img=3",
      aiAvatar: "https://cdn-icons-png.flaticon.com/512/4712/4712027.png",
      sessionId: "web-session-1",
    };
  },
  created() {
    this.loadChatFromStorage();
  },
  methods: {
    async sendMessage() {
      if (!this.userInput.trim()) return;

      const userMessage = this.userInput.trim();
      this.chatMessages.push({ role: "user", text: userMessage });
      this.saveChatToStorage();
      this.loading = true;
      this.userInput = "";

      this.$nextTick(() => {
        this.scrollToBottom();
      });

      try {
        const response = await axios.post(
            `${this.BASE_URL}/api/v1/workspace/${this.WORKSPACE_ID}/chat`,
            {
              message: userMessage,
              mode: "chat",
              sessionId: this.sessionId,
              reset: 0,
            },
            {
              headers: {
                Authorization: `Bearer ${this.API_KEY}`,
                "Content-Type": "application/json",
              },
            }
        );

        let aiText = response.data.textResponse || "（无响应）";
        aiText = this.removeThinkTags(aiText).trim();

        this.chatMessages.push({ role: "ai", text: aiText });
        this.saveChatToStorage();

        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        this.chatMessages.push({
          role: "ai",
          text: "请求失败：" + error.message,
        });
      } finally {
        this.loading = false;
      }
    },
    removeThinkTags(text) {
      return text.replace(/<think>.*?<\/think>/gs, "");
    },
    scrollToBottom() {
      const chatMain = this.$refs.chatMain;
      if (chatMain) {
        chatMain.scrollTop = chatMain.scrollHeight;
      }
    },
    formatMessage(text) {
      if (!text) return "";
      marked.setOptions({
        breaks: true,
        highlight: function (code, lang) {
          if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
          } else {
            return hljs.highlightAuto(code).value;
          }
        },
      });
      return marked.parse(text);
    },
    undoLastMessage() {
      if (this.chatMessages.length === 0) return;

      // 移除最后两条消息：用户 + AI
      if (this.chatMessages.length >= 2) {
        this.chatMessages.splice(-2, 2);
      } else {
        this.chatMessages.splice(-1, 1);
      }
      this.saveChatToStorage();
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    saveChatToStorage() {
      try {
        localStorage.setItem(
            "chatMessages",
            JSON.stringify(this.chatMessages)
        );
      } catch (e) {
        console.warn("保存聊天记录失败", e);
      }
    },
    loadChatFromStorage() {
      try {
        const saved = localStorage.getItem("chatMessages");
        if (saved) {
          this.chatMessages = JSON.parse(saved);
        }
      } catch (e) {
        console.warn("加载聊天记录失败", e);
      }
    },
    clearChat() {
      this.chatMessages = [];
      localStorage.removeItem("chatMessages");
    },
  },
};
</script>

<style scoped>
.chat-wrapper {
  max-width: 800px;
  margin: 20px auto;
  height: 85vh;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  overflow: hidden;
}

.chat-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 20px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 24px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.header-left h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #2d3748;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.header-btn {
  border-radius: 25px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
  background: #f7fafc;
  color: #4a5568;
}

.header-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.header-btn.danger {
  background: #fed7d7;
  color: #e53e3e;
}

.header-btn.danger:hover {
  background: #feb2b2;
}

.chat-main {
  flex: 1;
  padding: 25px;
  overflow-y: auto;
  background: #ffffff;
  position: relative;
}

.chat-main::-webkit-scrollbar {
  width: 6px;
}

.chat-main::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.chat-main::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.chat-main::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 12px 0;
  font-size: 24px;
  color: #334155;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
  opacity: 0.8;
}

.chat-msg {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-msg.user {
  justify-content: flex-end;
  margin-left: 80px;
}

.chat-msg.ai {
  justify-content: flex-start;
  margin-right: 80px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 3px solid #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.avatar:hover {
  transform: scale(1.05);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-msg.user .avatar {
  order: 2;
  margin-left: 15px;
}

.chat-msg.ai .avatar {
  order: 1;
  margin-right: 15px;
}

.message-content {
  max-width: 70%;
  padding: 16px 20px;
  font-size: 15px;
  line-height: 1.6;
  word-wrap: break-word;
  position: relative;
  transition: all 0.3s ease;
}

.chat-msg.user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 25px 25px 8px 25px;
  order: 1;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.chat-msg.ai .message-content {
  background: #f8fafc;
  color: #2d3748;
  border-radius: 25px 25px 25px 8px;
  order: 2;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.message-content:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Markdown样式优化 */
.message-content :deep(pre) {
  background: #1a202c;
  border-radius: 12px;
  padding: 16px;
  margin: 12px 0;
  overflow-x: auto;
}

.message-content :deep(code) {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: "Fira Code", monospace;
}

.message-content :deep(p) {
  margin: 0 0 8px 0;
}

.message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.chat-footer {
  padding: 20px 25px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  max-width: 100%;
}

.input-textarea {
  flex: 1;
  min-height: 44px;
}

.input-textarea :deep(.el-textarea__inner) {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 22px;
  padding: 12px 20px;
  font-size: 15px;
  line-height: 1.5;
  resize: none;
  transition: all 0.3s ease;
  font-family: inherit;
}

.input-textarea :deep(.el-textarea__inner):focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-textarea :deep(.el-textarea__inner)::placeholder {
  color: #a0aec0;
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 18px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  flex-shrink: 0;
}

.send-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.send-btn:active {
  transform: translateY(0);
}

.send-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-wrapper {
    margin: 10px;
    height: 90vh;
    border-radius: 15px;
  }

  .chat-main {
    padding: 15px;
  }

  .chat-msg.user {
    margin-left: 40px;
  }

  .chat-msg.ai {
    margin-right: 40px;
  }

  .message-content {
    max-width: 85%;
    padding: 12px 16px;
  }

  .header-actions {
    flex-direction: column;
    gap: 8px;
  }

  .header-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>