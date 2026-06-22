const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticate, requireRole } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/host/stats
router.get('/stats', authenticate, requireRole('host', 'admin'), async (req, res, next) => {
  try {
    const hostId = req.user.id;
    const [vehiclesRes, bookingsRes, earningsRes, reviewsRes] = await Promise.all([
      supabaseAdmin.from('vehicles').select('id, is_available', { count: 'exact' }).eq('host_id', hostId),
      supabaseAdmin.from('bookings').select('id, status', { count: 'exact' }).eq('host_id', hostId),
      supabaseAdmin.from('host_earnings').select('amount').eq('host_id', hostId),
      supabaseAdmin.from('reviews').select('rating').eq('host_id', hostId),
    ]);

    const totalEarnings = earningsRes.data?.reduce((s, e) => s + e.amount, 0) || 0;
    const avgRating = reviewsRes.data?.length
      ? (reviewsRes.data.reduce((s, r) => s + r.rating, 0) / reviewsRes.data.length).toFixed(1) : null;

    const pending = bookingsRes.data?.filter(b => b.status === 'pending').length || 0;
    const active = bookingsRes.data?.filter(b => b.status === 'active').length || 0;
    const completed = bookingsRes.data?.filter(b => b.status === 'completed').length || 0;

    res.json({
      success: true,
      data: {
        total_vehicles: vehiclesRes.count || 0,
        active_vehicles: vehiclesRes.data?.filter(v => v.is_available).length || 0,
        total_bookings: bookingsRes.count || 0,
        pending_bookings: pending,
        active_bookings: active,
        completed_bookings: completed,
        total_earnings: totalEarnings,
        avg_rating: avgRating,
        total_reviews: reviewsRes.data?.length || 0,
      },
    });
  } catch (err) { next(err); }
});

// GET /api/host/earnings
router.get('/earnings', authenticate, requireRole('host', 'admin'), async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    const hostId = req.user.id;

    const { data: earnings } = await supabaseAdmin.from('host_earnings')
      .select('*, bookings(start_date, end_date, vehicles(make, model))')
      .eq('host_id', hostId)
      .order('created_at', { ascending: false });

    // Monthly breakdown for chart
    const monthlyData = {};
    earnings?.forEach(e => {
      const month = new Date(e.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      monthlyData[month] = (monthlyData[month] || 0) + e.amount;
    });

    const { data: payouts } = await supabaseAdmin.from('payouts')
      .select('*').eq('host_id', hostId).order('created_at', { ascending: false });

    const totalEarnings = earnings?.reduce((s, e) => s + e.amount, 0) || 0;
    const pendingPayout = earnings?.filter(e => e.status === 'pending_payout').reduce((s, e) => s + e.amount, 0) || 0;

    res.json({
      success: true,
      data: { earnings, totalEarnings, pendingPayout, monthlyData, payouts },
    });
  } catch (err) { next(err); }
});

// GET /api/host/performance
router.get('/performance', authenticate, requireRole('host', 'admin'), async (req, res, next) => {
  try {
    const hostId = req.user.id;
    const { data: bookings } = await supabaseAdmin.from('bookings').select('status, created_at').eq('host_id', hostId);
    const { data: reviews } = await supabaseAdmin.from('reviews').select('rating, comment, created_at').eq('host_id', hostId);
    const { data: profile } = await supabaseAdmin.from('profiles').select('response_time, acceptance_rate, is_all_star').eq('id', hostId).single();

    const total = bookings?.length || 0;
    const confirmed = bookings?.filter(b => ['confirmed', 'active', 'completed'].includes(b.status)).length || 0;
    const acceptanceRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        acceptance_rate: acceptanceRate,
        response_time: profile?.response_time || 'N/A',
        is_all_star: profile?.is_all_star || false,
        total_reviews: reviews?.length || 0,
        avg_rating: reviews?.length
          ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null,
        reviews,
      },
    });
  } catch (err) { next(err); }
});

// PUT /api/host/profile
router.put('/profile', authenticate, requireRole('host', 'admin'), async (req, res, next) => {
  try {
    const { full_name, bio, avatar_url, phone } = req.body;
    const { data, error } = await supabaseAdmin.from('profiles')
      .update({ full_name, bio, avatar_url, phone }).eq('id', req.user.id).select().single();
    if (error) throw new AppError(error.message, 500);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/host/become-host
router.post('/become-host', authenticate, async (req, res, next) => {
  try {
    const { data: kyc } = await supabaseAdmin.from('kyc_documents').select('status').eq('user_id', req.user.id).single();
    if (!kyc || kyc.status !== 'verified') throw new AppError('KYC verification required to become a host', 403);

    const { data, error } = await supabaseAdmin.from('profiles')
      .update({ role: 'host' }).eq('id', req.user.id).select().single();
    if (error) throw new AppError(error.message, 500);
    res.json({ success: true, message: 'You are now a host!', data });
  } catch (err) { next(err); }
});

module.exports = router;
