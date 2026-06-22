const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/supabase');
const { authenticate, requireRole, optionalAuth } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/vehicles - List/search vehicles
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      location, lat, lng, radius = 50,
      start_date, end_date,
      type, min_price, max_price, min_rating,
      features, instant_book,
      sort = 'created_at', order = 'desc',
      page = 1, limit = 12,
    } = req.query;

    let queryBuilder = supabaseAdmin
      .from('vehicles')
      .select(`
        *,
        profiles!vehicles_host_id_fkey(id, full_name, avatar_url, rating, total_trips),
        vehicle_images(url, is_primary),
        reviews(rating)
      `, { count: 'exact' })
      .eq('is_available', true)
      .eq('is_approved', true);

    if (type) queryBuilder = queryBuilder.eq('type', type);
    if (min_price) queryBuilder = queryBuilder.gte('price_per_day', Number(min_price));
    if (max_price) queryBuilder = queryBuilder.lte('price_per_day', Number(max_price));
    if (instant_book === 'true') queryBuilder = queryBuilder.eq('instant_book', true);
    if (location) queryBuilder = queryBuilder.ilike('city', `%${location}%`);

    const offset = (Number(page) - 1) * Number(limit);
    queryBuilder = queryBuilder
      .order(sort, { ascending: order === 'asc' })
      .range(offset, offset + Number(limit) - 1);

    const { data, error, count } = await queryBuilder;
    if (error) throw new AppError(error.message, 500);

    // Compute avg rating per vehicle
    const vehicles = data.map(v => ({
      ...v,
      avg_rating: v.reviews?.length
        ? (v.reviews.reduce((s, r) => s + r.rating, 0) / v.reviews.length).toFixed(1)
        : null,
      review_count: v.reviews?.length || 0,
      primary_image: v.vehicle_images?.find(i => i.is_primary)?.url || v.vehicle_images?.[0]?.url,
    }));

    res.json({ success: true, data: vehicles, total: count, page: Number(page), limit: Number(limit) });
  } catch (err) { next(err); }
});

// GET /api/vehicles/featured
router.get('/featured', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('vehicles')
      .select(`*, profiles!vehicles_host_id_fkey(full_name, avatar_url, rating), vehicle_images(url, is_primary), reviews(rating)`)
      .eq('is_available', true).eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(8);
    if (error) throw new AppError(error.message, 500);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/vehicles/:id
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('vehicles')
      .select(`
        *,
        profiles!vehicles_host_id_fkey(id, full_name, avatar_url, rating, total_trips, response_time, is_all_star),
        vehicle_images(id, url, is_primary, sort_order),
        vehicle_features(feature),
        reviews(id, rating, comment, created_at, profiles!reviews_reviewer_id_fkey(full_name, avatar_url))
      `)
      .eq('id', req.params.id)
      .single();
    if (error || !data) throw new AppError('Vehicle not found', 404);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/vehicles - Create listing
router.post('/', authenticate, requireRole('host', 'admin'), [
  body('make').notEmpty(), body('model').notEmpty(),
  body('year').isInt({ min: 1990, max: new Date().getFullYear() + 1 }),
  body('price_per_day').isFloat({ min: 0 }),
  body('city').notEmpty(), body('type').notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const {
      make, model, year, color, type, fuel_type, transmission,
      seats, price_per_day, weekly_discount, monthly_discount,
      security_deposit, city, address, lat, lng,
      description, instant_book, registration_number,
      features = [], images = [],
    } = req.body;

    const { data: vehicle, error } = await supabaseAdmin
      .from('vehicles')
      .insert({
        host_id: req.user.id, make, model, year, color, type,
        fuel_type, transmission, seats: Number(seats),
        price_per_day: Number(price_per_day),
        weekly_discount: Number(weekly_discount || 0),
        monthly_discount: Number(monthly_discount || 0),
        security_deposit: Number(security_deposit || 0),
        city, address, lat, lng, description,
        instant_book: Boolean(instant_book),
        registration_number,
        is_available: true, is_approved: false,
      })
      .select().single();
    if (error) throw new AppError(error.message, 500);

    // Insert features
    if (features.length > 0) {
      await supabaseAdmin.from('vehicle_features').insert(
        features.map(f => ({ vehicle_id: vehicle.id, feature: f }))
      );
    }
    // Insert images
    if (images.length > 0) {
      await supabaseAdmin.from('vehicle_images').insert(
        images.map((url, i) => ({ vehicle_id: vehicle.id, url, is_primary: i === 0, sort_order: i }))
      );
    }

    res.status(201).json({ success: true, message: 'Vehicle listed successfully. Pending admin approval.', data: vehicle });
  } catch (err) { next(err); }
});

// PUT /api/vehicles/:id
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { data: vehicle } = await supabaseAdmin.from('vehicles').select('host_id').eq('id', req.params.id).single();
    if (!vehicle) throw new AppError('Vehicle not found', 404);
    if (vehicle.host_id !== req.user.id && req.user.profile?.role !== 'admin') throw new AppError('Forbidden', 403);

    const updateData = { ...req.body, updated_at: new Date().toISOString() };
    delete updateData.host_id; delete updateData.id;

    const { data, error } = await supabaseAdmin.from('vehicles').update(updateData).eq('id', req.params.id).select().single();
    if (error) throw new AppError(error.message, 500);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// DELETE /api/vehicles/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { data: vehicle } = await supabaseAdmin.from('vehicles').select('host_id').eq('id', req.params.id).single();
    if (!vehicle) throw new AppError('Vehicle not found', 404);
    if (vehicle.host_id !== req.user.id && req.user.profile?.role !== 'admin') throw new AppError('Forbidden', 403);
    await supabaseAdmin.from('vehicles').delete().eq('id', req.params.id);
    res.json({ success: true, message: 'Vehicle deleted' });
  } catch (err) { next(err); }
});

// PATCH /api/vehicles/:id/availability
router.patch('/:id/availability', authenticate, async (req, res, next) => {
  try {
    const { is_available } = req.body;
    const { data, error } = await supabaseAdmin
      .from('vehicles').update({ is_available }).eq('id', req.params.id).select().single();
    if (error) throw new AppError(error.message, 500);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;
