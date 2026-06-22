const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticate, requireRole } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/admin/dashboard
router.get('/dashboard', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const [usersRes, vehiclesRes, bookingsRes, earningsRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, role, created_at', { count: 'exact' }),
      supabaseAdmin.from('vehicles').select('id, is_approved, created_at', { count: 'exact' }),
      supabaseAdmin.from('bookings').select('id, status, total_price, created_at', { count: 'exact' }),
      supabaseAdmin.from('host_earnings').select('amount'),
    ]);

    const totalGMV = bookingsRes.data?.filter(b => b.status === 'completed')
      .reduce((s, b) => s + b.total_price, 0) || 0;
    const totalRevenue = totalGMV * 0.1;
    const pendingKyc = await supabaseAdmin.from('kyc_documents').select('id', { count: 'exact' }).eq('status', 'pending');
    const pendingVehicles = vehiclesRes.data?.filter(v => !v.is_approved).length || 0;

    // Monthly bookings for chart
    const monthlyBookings = {};
    bookingsRes.data?.forEach(b => {
      const month = new Date(b.created_at).toLocaleDateString('en-IN', { month: 'short' });
      monthlyBookings[month] = (monthlyBookings[month] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        total_users: usersRes.count || 0,
        total_hosts: usersRes.data?.filter(u => u.role === 'host').length || 0,
        total_vehicles: vehiclesRes.count || 0,
        pending_vehicles: pendingVehicles,
        total_bookings: bookingsRes.count || 0,
        active_bookings: bookingsRes.data?.filter(b => b.status === 'active').length || 0,
        pending_kyc: pendingKyc.count || 0,
        total_gmv: totalGMV,
        total_revenue: totalRevenue,
        monthly_bookings: monthlyBookings,
      },
    });
  } catch (err) { next(err); }
});

// GET /api/admin/users
router.get('/users', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    let q = supabaseAdmin.from('profiles').select('*, kyc_documents(status)', { count: 'exact' });
    if (role) q = q.eq('role', role);
    if (search) q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    const offset = (Number(page) - 1) * Number(limit);
    const { data, error, count } = await q.order('created_at', { ascending: false }).range(offset, offset + Number(limit) - 1);
    if (error) throw new AppError(error.message, 500);
    res.json({ success: true, data, total: count });
  } catch (err) { next(err); }
});

// PUT /api/admin/users/:id/ban
router.put('/users/:id/ban', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { is_banned, reason } = req.body;
    const { data, error } = await supabaseAdmin.from('profiles')
      .update({ is_banned, ban_reason: reason || null }).eq('id', req.params.id).select().single();
    if (error) throw new AppError(error.message, 500);
    res.json({ success: true, message: is_banned ? 'User banned' : 'User unbanned', data });
  } catch (err) { next(err); }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['guest', 'host', 'admin'].includes(role)) throw new AppError('Invalid role', 400);
    const { data, error } = await supabaseAdmin.from('profiles').update({ role }).eq('id', req.params.id).select().single();
    if (error) throw new AppError(error.message, 500);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/admin/vehicles
router.get('/vehicles', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let q = supabaseAdmin.from('vehicles')
      .select('*, profiles!vehicles_host_id_fkey(full_name, email), vehicle_images(url, is_primary)', { count: 'exact' });
    if (status === 'pending') q = q.eq('is_approved', false);
    if (status === 'approved') q = q.eq('is_approved', true);
    const offset = (Number(page) - 1) * Number(limit);
    const { data, error, count } = await q.order('created_at', { ascending: false }).range(offset, offset + Number(limit) - 1);
    if (error) throw new AppError(error.message, 500);
    res.json({ success: true, data, total: count });
  } catch (err) { next(err); }
});

// PUT /api/admin/vehicles/:id/status
router.put('/vehicles/:id/status', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { is_approved, rejection_reason } = req.body;
    const { data: vehicle } = await supabaseAdmin.from('vehicles').select('host_id, make, model').eq('id', req.params.id).single();
    const { data, error } = await supabaseAdmin.from('vehicles')
      .update({ is_approved, rejection_reason: rejection_reason || null }).eq('id', req.params.id).select().single();
    if (error) throw new AppError(error.message, 500);

    // Notify host
    await supabaseAdmin.from('notifications').insert({
      user_id: vehicle.host_id,
      type: is_approved ? 'vehicle_approved' : 'vehicle_rejected',
      title: is_approved ? 'Vehicle Approved! 🎉' : 'Vehicle Rejected',
      message: is_approved
        ? `Your ${vehicle.make} ${vehicle.model} is now live on Flexi.`
        : `Your ${vehicle.make} ${vehicle.model} was rejected. Reason: ${rejection_reason}`,
    });

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/admin/bookings
router.get('/bookings', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let q = supabaseAdmin.from('bookings')
      .select('*, vehicles(make, model), profiles!bookings_guest_id_fkey(full_name), profiles!bookings_host_id_fkey(full_name)', { count: 'exact' });
    if (status) q = q.eq('status', status);
    const offset = (Number(page) - 1) * Number(limit);
    const { data, error, count } = await q.order('created_at', { ascending: false }).range(offset, offset + Number(limit) - 1);
    if (error) throw new AppError(error.message, 500);
    res.json({ success: true, data, total: count });
  } catch (err) { next(err); }
});

// GET /api/admin/kyc-queue
router.get('/kyc-queue', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;
    const { data, error } = await supabaseAdmin.from('kyc_documents')
      .select('*, profiles!kyc_documents_user_id_fkey(full_name, email, phone, avatar_url)')
      .eq('status', status).order('submitted_at', { ascending: true });
    if (error) throw new AppError(error.message, 500);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/admin/reports
router.get('/reports', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { data: bookings } = await supabaseAdmin.from('bookings').select('total_price, status, created_at, vehicles(city)');
    const { data: users } = await supabaseAdmin.from('profiles').select('role, created_at');

    // Revenue by month
    const revenueByMonth = {};
    bookings?.filter(b => b.status === 'completed').forEach(b => {
      const month = new Date(b.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      revenueByMonth[month] = (revenueByMonth[month] || 0) + (b.total_price * 0.1);
    });

    // Top cities
    const cityCounts = {};
    bookings?.forEach(b => {
      const city = b.vehicles?.city || 'Unknown';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });
    const topCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

    // User growth
    const userGrowth = {};
    users?.forEach(u => {
      const month = new Date(u.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      userGrowth[month] = (userGrowth[month] || 0) + 1;
    });

    res.json({ success: true, data: { revenueByMonth, topCities, userGrowth } });
  } catch (err) { next(err); }
});

module.exports = router;
