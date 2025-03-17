class PeerConnect {
    constructor() {
        this.peer = new Peer();
        this.connections = new Map();
        this.messageCallbacks = [];
        this.initPeer();
    }

    initPeer() {
        this.peer.on('open', (id) => {
            console.log('已连接到服务器，我的 ID 是: ' + id);
            this.peerId = id;
        });

        this.peer.on('connection', (conn) => {
            this.handleConnection(conn);
        });
    }

    connect(targetId) {
        if (this.connections.has(targetId)) {
            console.log('已经连接到该用户');
            return;
        }

        const conn = this.peer.connect(targetId);
        this.handleConnection(conn);
    }

    handleConnection(conn) {
        conn.on('open', () => {
            console.log('已连接到: ' + conn.peer);
            this.connections.set(conn.peer, conn);
        });

        conn.on('data', (data) => {
            console.log('收到消息: ', data);
            this.messageCallbacks.forEach(callback => callback(data, conn.peer));
        });

        conn.on('close', () => {
            console.log('连接关闭: ' + conn.peer);
            this.connections.delete(conn.peer);
        });
    }

    sendMessage(message, targetId = null) {
        if (targetId) {
            // 发送给特定用户
            const conn = this.connections.get(targetId);
            if (conn) {
                conn.send(message);
            }
        } else {
            // 广播给所有连接的用户
            this.connections.forEach(conn => {
                conn.send(message);
            });
        }
    }

    onMessage(callback) {
        this.messageCallbacks.push(callback);
    }

    getPeerId() {
        return this.peerId;
    }
}