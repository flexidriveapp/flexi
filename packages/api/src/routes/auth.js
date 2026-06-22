const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// POST /api/auth/register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('full_name').trim().notEmpty(),
  body('phone').optional().isMobilePhone(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password, full_name, phone } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name, phone } },
    });
    if (error) throw new AppError(error.message, 400);

    // Create profile
    await supabaseAdmin.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name,
      phone: phone || null,
      role: 'guest',
      avatar_url: null,
      is_verified: false,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: { id: data.user.id, email, full_name },
      session: data.session,
    });
  } catch (err) { next(err); }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new AppError('Invalid email or password', 401);

    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', data.user.id).single();

    res.json({ success: true, message: 'Login successful', session: data.session, user: profile });
  } catch (err) { next(err); }
});

// POST /api/auth/logout
router.post('/logout', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) await supabaseAdmin.auth.admin.signOut(token);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) throw new AppError('Refresh token required', 400);
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });
    if (error) throw new AppError('Invalid refresh token', 401);
    res.json({ success: true, session: data.session });
  } catch (err) { next(err); }
});

// POST /api/auth/send-otp
router.post('/send-otp', [body('phone').isMobilePhone()], async (req, res, next) => {
  try {
    const { phone } = req.body;
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw new AppError(error.message, 400);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) { next(err); }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', [
  body('phone').isMobilePhone(),
  body('token').notEmpty(),
], async (req, res, next) => {
  try {
    const { phone, token } = req.body;
    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) throw new AppError('Invalid OTP', 400);
    res.json({ success: true, session: data.session, user: data.user });
  } catch (err) { next(err); }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', [body('email').isEmail()], async (req, res, next) => {
  try {
    const { email } = req.body;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL}/reset-password`,
    });
    if (error) throw new AppError(error.message, 400);
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get('/me', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new AppError('Not authenticated', 401);
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) throw new AppError('Invalid token', 401);
    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single();
    res.json({ success: true, user: profile });
  } catch (err) { next(err); }
});

module.exports = router;
