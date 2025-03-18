<template>
  <div class="chat-container">
    <!-- 左侧用户列表 -->
    <div class="user-list">
      <h3>在线用户</h3>
      <div class="user-item" 
        v-for="user in users" 
        :key="user.id"
        :class="{ active: currentUser && currentUser.id === user.id }"
        @click="selectUser(user)">
        <span class="user-name">{{ user.name }}</span>
        <span class="user-status" :class="{ online: user.online }"></span>
      </div>
    </div>

    <!-- 右侧聊天区域 -->
    <div class="chat-area" v-if="currentUser">
      <div class="chat-header">
        <span>正在与 {{ currentUser.name }} 聊天</span>
      </div>
      <div class="message-list" ref="messageList">
        <div v-for="(msg, index) in messages" 
          :key="index" 
          :class="['message', msg.fromSelf ? 'self' : 'other']">
          <div class="message-content">{{ msg.content }}</div>
          <div class="message-time">{{ formatTime(msg.time) }}</div>
        </div>
      </div>
      <div class="message-input">
        <el-input 
          v-model="newMessage" 
          type="textarea" 
          :rows="3"
          placeholder="请输入消息..."
          @keyup.enter.native="sendMessage">
        </el-input>
        <el-button type="primary" @click="sendMessage">发送</el-button>
      </div>
    </div>
    <div class="no-chat" v-else>
      请选择一个用户开始聊天
    </div>
  </div>
</template>

<script>
import Connect from './Connect.js';

export default {
  data() {
    return {
      userId: null,
      users: [],
      currentUser: null,
      messages: [],
      newMessage: '',
      connect: null
    }
  },
  methods: {
    async initConnect() {
      this.connect = new Connect(this.userId);
      // await this.connect.init();
      this.loadUsers();
      this.setupMessageListener();
    },
    async loadUsers() {
      var usersJson = localStorage.getItem('users');
      if(usersJson != null) {
        this.users = JSON.parse(usersJson);
        console.log('从缓存加载用户列表');
        return;
      }
      this.connect.listAllPeers(users => {
        this.users = users.map(user => ({
          id: user,
          name: user,
          online: true // 这里可以根据实际状态设置
        }));
        console.log('this.users', this.users);
        localStorage.setItem('users', JSON.stringify(this.users));
      });
    },
    selectUser(user) {
      this.currentUser = user;
      this.messages = []; // 清空消息列表
      // TODO: 加载历史消息
      // 与聊天对象建立连接
      this.connect.connect(this.currentUser.id);
    },
    async sendMessage() {
      if (!this.newMessage.trim() || !this.currentUser) {
        console.log('当前聊天对象为空');
        return;
      }
      
      const message = {
        content: this.newMessage,
        time: new Date(),
        fromSelf: true
      };
      
      try {
        this.connect.sendMessage(this.newMessage, this.currentUser.id);
        this.messages.push(message);
        this.newMessage = '';
        this.scrollToBottom();
      } catch (error) {
        console.error('发送消息失败:', error);
      }
    },
    setupMessageListener() {
      this.connect.onMessage((message, fromId) => {
        this.messages.push({
          content: message,  // message 直接是消息内容字符串
          time: new Date(),  // 使用当前时间
          fromSelf: false
        });
        this.scrollToBottom();
      });
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const messageList = this.$refs.messageList;
        if (messageList) {
          messageList.scrollTop = messageList.scrollHeight;
        }
      });
    },
    formatTime(time) {
      return new Date(time).toLocaleTimeString();
    }
  },
  created() {
    // 进入前提醒用户设置用户id
    var selfId = localStorage.getItem('selfId');
    if(selfId != null) {
      this.userId = selfId;
    } else {
      this.userId = prompt('请输入你的用户ID：');
      localStorage.setItem('selfId', this.userId);
    }
    this.initConnect();
  }
}
</script>

<style lang="less" scoped>
.chat-container {
  display: flex;
  height: 100%;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  
  .user-list {
    width: 250px;
    border-right: 1px solid #ddd;
    background: #f5f5f5;
    
    h3 {
      padding: 15px;
      margin: 0;
      border-bottom: 1px solid #ddd;
    }
    
    .user-item {
      padding: 15px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      &:hover {
        background: #e8e8e8;
      }
      
      &.active {
        background: #e0e0e0;
      }
      
      .user-status {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ccc;
        
        &.online {
          background: #67C23A;
        }
      }
    }
  }
  
  .chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    .chat-header {
      padding: 15px;
      border-bottom: 1px solid #ddd;
      background: #f9f9f9;
    }
    
    .message-list {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      
      .message {
        margin-bottom: 15px;
        display: flex;
        flex-direction: column;
        
        &.self {
          align-items: flex-end;
          
          .message-content {
            background: #409EFF;
            color: white;
          }
        }
        
        .message-content {
          max-width: 70%;
          padding: 10px 15px;
          background: #f0f0f0;
          border-radius: 4px;
          word-break: break-all;
        }
        
        .message-time {
          font-size: 12px;
          color: #999;
          margin-top: 5px;
        }
      }
    }
    
    .message-input {
      padding: 20px;
      border-top: 1px solid #ddd;
      background: #f9f9f9;
      
      .el-button {
        margin-top: 10px;
        float: right;
      }
    }
  }
  
  .no-chat {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 16px;
  }
}
</style>