const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join user's personal room for notifications
    socket.on('join_user', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`[Socket] User ${userId} joined personal room`);
    });

    // Join booking room for chat
    socket.on('join_booking', (bookingId) => {
      socket.join(`booking_${bookingId}`);
      console.log(`[Socket] Joined booking room: ${bookingId}`);
    });

    // Leave booking room
    socket.on('leave_booking', (bookingId) => {
      socket.leave(`booking_${bookingId}`);
    });

    // Typing indicator
    socket.on('typing', ({ bookingId, userId }) => {
      socket.to(`booking_${bookingId}`).emit('user_typing', { userId });
    });

    socket.on('stop_typing', ({ bookingId, userId }) => {
      socket.to(`booking_${bookingId}`).emit('user_stop_typing', { userId });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupSocket };
