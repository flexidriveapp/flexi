const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/messages/:bookingId
router.get('/:bookingId', authenticate, async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    // Verify user is part of this booking
    const { data: booking } = await supabaseAdmin.from('bookings')
      .select('guest_id, host_id').eq('id', bookingId).single();
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.guest_id !== req.user.id && booking.host_id !== req.user.id)
      throw new AppError('Forbidden', 403);

    const { data, error } = await supabaseAdmin.from('messages')
      .select('*, profiles!messages_sender_id_fkey(full_name, avatar_url)')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });
    if (error) throw new AppError(error.message, 500);

    // Mark messages as read
    await supabaseAdmin.from('messages')
      .update({ is_read: true })
      .eq('booking_id', bookingId)
      .neq('sender_id', req.user.id);

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/messages/:bookingId
router.post('/:bookingId', authenticate, async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { content } = req.body;
    if (!content?.trim()) throw new AppError('Message content is required', 400);

    const { data: booking } = await supabaseAdmin.from('bookings')
      .select('guest_id, host_id').eq('id', bookingId).single();
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.guest_id !== req.user.id && booking.host_id !== req.user.id)
      throw new AppError('Forbidden', 403);

    const receiverId = req.user.id === booking.guest_id ? booking.host_id : booking.guest_id;

    const { data: message, error } = await supabaseAdmin.from('messages').insert({
      booking_id: bookingId, sender_id: req.user.id, receiver_id: receiverId,
      content: content.trim(), is_read: false,
    }).select('*, profiles!messages_sender_id_fkey(full_name, avatar_url)').single();
    if (error) throw new AppError(error.message, 500);

    // Emit via Socket.IO
    const io = req.app.get('io');
    io?.to(`booking_${bookingId}`).emit('new_message', message);
    io?.to(`user_${receiverId}`).emit('message_notification', {
      booking_id: bookingId, sender: message.profiles, content,
    });

    res.status(201).json({ success: true, data: message });
  } catch (err) { next(err); }
});

// GET /api/messages - All conversations for a user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { data: bookings } = await supabaseAdmin.from('bookings')
      .select('id, guest_id, host_id, vehicles(make, model, vehicle_images(url, is_primary)), profiles!bookings_guest_id_fkey(full_name, avatar_url), profiles!bookings_host_id_fkey(full_name, avatar_url)')
      .or(`guest_id.eq.${req.user.id},host_id.eq.${req.user.id}`)
      .in('status', ['confirmed', 'active', 'completed']);

    const conversations = await Promise.all((bookings || []).map(async b => {
      const { data: lastMsg } = await supabaseAdmin.from('messages')
        .select('content, created_at, sender_id, is_read')
        .eq('booking_id', b.id).order('created_at', { ascending: false }).limit(1).single();
      const { count: unread } = await supabaseAdmin.from('messages')
        .select('id', { count: 'exact' }).eq('booking_id', b.id).eq('receiver_id', req.user.id).eq('is_read', false);
      return { ...b, last_message: lastMsg, unread_count: unread };
    }));

    res.json({ success: true, data: conversations });
  } catch (err) { next(err); }
});

module.exports = router;
