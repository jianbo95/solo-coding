class PeerConnect {
    constructor(selfId) {
        var option = {
            host: 'localhost',
            port: 9000,
            path: '/myapp',
            allow_discovery: true,
            corsOptions: {
                origin: '*' // 允许所有源访问
            }
        };
        if(selfId != null) {
            this.peer = new Peer(selfId, option);
        } else {
            this.peer = new Peer(option);
        }
        this.connections = new Map();
        this.messageCallbacks = [];
        this.initPeer();
    }

    listAllPeers(_call) {
        this.peer.listAllPeers((peerIds) => {
            console.log('All available peer IDs: ', peerIds);
            // 过滤掉自己的 ID
            // const otherPeerIds = peerIds.filter((peerId) => peerId!== id);
            // console.log('Other peer IDs: ', otherPeerIds);
            _call(peerIds);
        });
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
        console.log('尝试连接到:'+ targetId);
        if (this.connections.has(targetId)) {
            console.log('已经连接到该用户');
            return;
        }

        const conn = this.peer.connect(targetId);
        console.log('尝试链接', conn);
        if(conn == null) {
            console.log('连接失败，请刷新页面后重试');
        } else {
            this.handleConnection(conn);
        }
    }

    // 1. initPeer 时会触发 connection 事件，相当于 被动链接
    // 2. 主动发起链接时，也会触发 connection 事件
    handleConnection(conn) {
        conn.on('open', () => {
            // 存在主动模式和被动模式
            console.log('已连接到: ' + conn.peer); 
            console.log('连接对象: ', conn);
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

    sendMessageToAll(message) {
        // 广播给所有连接的用户
        console.log('广播给所有用户');
        this.connections.forEach(conn => {
            conn.send(message);
        });
    }

    sendMessage(message, targetId) {
        if (targetId) {
            // 发送给特定用户
            const conn = this.connections.get(targetId);
            if (conn) {
                conn.send(message);
                console.log('发送给用户' + targetId);
            } else {
                console.error('用户连接对象不存在' + targetId);
            }
        } else {
            console.error('targetId 不能为空');
        }
    }

    onMessage(callback) {
        this.messageCallbacks.push(callback);
    }

    getPeerId() {
        return this.peerId;
    }
}