const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// POST /api/reviews
router.post('/', authenticate, [
  body('booking_id').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { booking_id, rating, comment } = req.body;
    const { data: booking } = await supabaseAdmin.from('bookings')
      .select('guest_id, host_id, vehicle_id, status').eq('id', booking_id).single();
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.guest_id !== req.user.id) throw new AppError('Only the guest can leave a review', 403);
    if (booking.status !== 'completed') throw new AppError('Can only review completed trips', 400);

    // Check duplicate
    const { data: existing } = await supabaseAdmin.from('reviews').select('id').eq('booking_id', booking_id).single();
    if (existing) throw new AppError('You have already reviewed this trip', 409);

    const { data, error } = await supabaseAdmin.from('reviews').insert({
      booking_id, reviewer_id: req.user.id, host_id: booking.host_id,
      vehicle_id: booking.vehicle_id, rating, comment,
    }).select().single();
    if (error) throw new AppError(error.message, 500);

    // Update host average rating
    const { data: allReviews } = await supabaseAdmin.from('reviews').select('rating').eq('host_id', booking.host_id);
    const avg = allReviews?.reduce((s, r) => s + r.rating, 0) / (allReviews?.length || 1);
    await supabaseAdmin.from('profiles').update({ rating: avg.toFixed(1), total_reviews: allReviews?.length }).eq('id', booking.host_id);

    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/reviews/vehicle/:vehicleId
router.get('/vehicle/:vehicleId', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('reviews')
      .select('*, profiles!reviews_reviewer_id_fkey(full_name, avatar_url)')
      .eq('vehicle_id', req.params.vehicleId)
      .order('created_at', { ascending: false });
    if (error) throw new AppError(error.message, 500);
    const avg = data?.length ? (data.reduce((s, r) => s + r.rating, 0) / data.length).toFixed(1) : null;
    res.json({ success: true, data, avg_rating: avg, count: data?.length || 0 });
  } catch (err) { next(err); }
});

// GET /api/reviews/host/:hostId
router.get('/host/:hostId', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('reviews')
      .select('*, profiles!reviews_reviewer_id_fkey(full_name, avatar_url), vehicles(make, model)')
      .eq('host_id', req.params.hostId).order('created_at', { ascending: false });
    if (error) throw new AppError(error.message, 500);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;
