/**
 * Socket.io event handler registry.
 * Called once during server startup with the io instance.
 */
const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Client can join a challenge room for targeted updates
    socket.on('join_challenge', (challengeId) => {
      socket.join(`challenge_${challengeId}`);
      console.log(`Socket ${socket.id} joined challenge_${challengeId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

/**
 * Broadcast updated leaderboard to ALL connected clients.
 * Called from the admin submission review controller after scoring.
 *
 * @param {object} io     - The Socket.io server instance
 * @param {Array}  ranks  - Array of ranked user objects
 */
const broadcastLeaderboard = (io, ranks) => {
  io.emit('leaderboard_update', ranks);
  console.log('📡 Leaderboard update broadcast to all clients');
};

module.exports = { registerSocketHandlers, broadcastLeaderboard };
