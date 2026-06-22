const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/supabase');
const { authenticate, requireRole } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// POST /api/bookings - Create a booking
router.post('/', authenticate, [
  body('vehicle_id').notEmpty(),
  body('start_date').isISO8601(),
  body('end_date').isISO8601(),
  body('protection_plan').isIn(['basic', 'standard', 'premium']),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { vehicle_id, start_date, end_date, protection_plan, pickup_location } = req.body;

    // Verify KYC
    const { data: kyc } = await supabaseAdmin.from('kyc_documents').select('status').eq('user_id', req.user.id).single();
    if (!kyc || kyc.status !== 'verified') throw new AppError('Please complete KYC verification before booking', 403);

    // Check vehicle availability
    const { data: vehicle } = await supabaseAdmin.from('vehicles')
      .select('*, profiles!vehicles_host_id_fkey(id)').eq('id', vehicle_id).single();
    if (!vehicle || !vehicle.is_available) throw new AppError('Vehicle is not available', 400);
    if (vehicle.host_id === req.user.id) throw new AppError('You cannot book your own vehicle', 400);

    // Check for conflicting bookings
    const { data: conflicts } = await supabaseAdmin.from('bookings')
      .select('id').eq('vehicle_id', vehicle_id)
      .in('status', ['confirmed', 'active'])
      .or(`start_date.lte.${end_date},end_date.gte.${start_date}`);
    if (conflicts?.length > 0) throw new AppError('Vehicle is already booked for these dates', 409);

    // Calculate pricing
    const days = Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24));
    const base_price = vehicle.price_per_day * days;
    const protection_fees = { basic: 0, standard: 299 * days, premium: 499 * days };
    const platform_fee = Math.round(base_price * 0.1);
    const protection_fee = protection_fees[protection_plan];
    const total_price = base_price + platform_fee + protection_fee;

    const status = vehicle.instant_book ? 'confirmed' : 'pending';

    const { data: booking, error } = await supabaseAdmin.from('bookings').insert({
      vehicle_id, guest_id: req.user.id, host_id: vehicle.host_id,
      start_date, end_date, days,
      base_price, platform_fee, protection_fee, total_price,
      protection_plan, status, pickup_location: pickup_location || vehicle.address,
    }).select().single();
    if (error) throw new AppError(error.message, 500);

    // Notify host via socket
    const io = req.app.get('io');
    io?.to(`user_${vehicle.host_id}`).emit('new_booking_request', { booking_id: booking.id });

    // Create notification for host
    await supabaseAdmin.from('notifications').insert({
      user_id: vehicle.host_id,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `You have a new booking request for your ${vehicle.make} ${vehicle.model}`,
      data: { booking_id: booking.id },
    });

    res.status(201).json({ success: true, message: 'Booking created successfully', data: booking });
  } catch (err) { next(err); }
});

// GET /api/bookings/me - My bookings as guest
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let q = supabaseAdmin.from('bookings')
      .select(`*, vehicles(make, model, year, city, vehicle_images(url, is_primary)), profiles!bookings_host_id_fkey(full_name, avatar_url)`, { count: 'exact' })
      .eq('guest_id', req.user.id);
    if (status) q = q.eq('status', status);
    const offset = (Number(page) - 1) * Number(limit);
    const { data, error, count } = await q.order('created_at', { ascending: false }).range(offset, offset + Number(limit) - 1);
    if (error) throw new AppError(error.message, 500);
    res.json({ success: true, data, total: count });
  } catch (err) { next(err); }
});

// GET /api/bookings/host - Bookings as host
router.get('/host', authenticate, requireRole('host', 'admin'), async (req, res, next) => {
  try {
    const { status } = req.query;
    let q = supabaseAdmin.from('bookings')
      .select(`*, vehicles(make, model, year, vehicle_images(url, is_primary)), profiles!bookings_guest_id_fkey(full_name, avatar_url, phone)`)
      .eq('host_id', req.user.id);
    if (status) q = q.eq('status', status);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw new AppError(error.message, 500);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/bookings/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('bookings')
      .select(`*, vehicles(*, vehicle_images(url, is_primary)), profiles!bookings_host_id_fkey(full_name, avatar_url, phone), profiles!bookings_guest_id_fkey(full_name, avatar_url, phone)`)
      .eq('id', req.params.id).single();
    if (error || !data) throw new AppError('Booking not found', 404);
    if (data.guest_id !== req.user.id && data.host_id !== req.user.id && req.user.profile?.role !== 'admin')
      throw new AppError('Forbidden', 403);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/bookings/:id/confirm - Host confirms booking
router.post('/:id/confirm', authenticate, async (req, res, next) => {
  try {
    const { data: booking } = await supabaseAdmin.from('bookings').select('*').eq('id', req.params.id).single();
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.host_id !== req.user.id) throw new AppError('Forbidden', 403);
    if (booking.status !== 'pending') throw new AppError('Booking cannot be confirmed', 400);

    const { data, error } = await supabaseAdmin.from('bookings')
      .update({ status: 'confirmed' }).eq('id', req.params.id).select().single();
    if (error) throw new AppError(error.message, 500);

    // Notify guest
    const io = req.app.get('io');
    io?.to(`user_${booking.guest_id}`).emit('booking_confirmed', { booking_id: booking.id });
    await supabaseAdmin.from('notifications').insert({
      user_id: booking.guest_id, type: 'booking_confirmed',
      title: 'Booking Confirmed!', message: 'Your booking has been confirmed by the host.',
      data: { booking_id: booking.id },
    });

    res.json({ success: true, message: 'Booking confirmed', data });
  } catch (err) { next(err); }
});

// POST /api/bookings/:id/cancel
router.post('/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const { data: booking } = await supabaseAdmin.from('bookings').select('*').eq('id', req.params.id).single();
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.guest_id !== req.user.id && booking.host_id !== req.user.id && req.user.profile?.role !== 'admin')
      throw new AppError('Forbidden', 403);
    if (['completed', 'cancelled'].includes(booking.status)) throw new AppError('Cannot cancel this booking', 400);

    const { reason } = req.body;
    const { data, error } = await supabaseAdmin.from('bookings')
      .update({ status: 'cancelled', cancellation_reason: reason, cancelled_by: req.user.id, cancelled_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error) throw new AppError(error.message, 500);

    // Notify the other party
    const notifyId = req.user.id === booking.guest_id ? booking.host_id : booking.guest_id;
    const io = req.app.get('io');
    io?.to(`user_${notifyId}`).emit('booking_cancelled', { booking_id: booking.id });

    res.json({ success: true, message: 'Booking cancelled', data });
  } catch (err) { next(err); }
});

// POST /api/bookings/:id/complete
router.post('/:id/complete', authenticate, async (req, res, next) => {
  try {
    const { data: booking } = await supabaseAdmin.from('bookings').select('*').eq('id', req.params.id).single();
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.host_id !== req.user.id && req.user.profile?.role !== 'admin') throw new AppError('Forbidden', 403);
    if (booking.status !== 'active') throw new AppError('Only active bookings can be completed', 400);

    const { data, error } = await supabaseAdmin.from('bookings')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error) throw new AppError(error.message, 500);

    // Create earnings record for host
    const hostEarnings = booking.total_price - booking.platform_fee;
    await supabaseAdmin.from('host_earnings').insert({
      host_id: booking.host_id, booking_id: booking.id,
      amount: hostEarnings, status: 'pending_payout',
    });

    res.json({ success: true, message: 'Booking completed', data });
  } catch (err) { next(err); }
});

module.exports = router;
