const { PeerServer } = require('peer');

const peerServer = PeerServer({
    port: 9000,
    path: '/myapp',
    allow_discovery: true
});

// peerjs --port 9000 --path /myapp --allow_discovery true
console.log('PeerJS server is running on port 9000');