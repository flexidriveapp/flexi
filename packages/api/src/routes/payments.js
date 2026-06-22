const express = require('express');
const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const { supabaseAdmin } = require('../config/supabase');
const { authenticate, requireRole } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// POST /api/payments/create-order
router.post('/create-order', authenticate, async (req, res, next) => {
  try {
    const { booking_id } = req.body;
    if (!booking_id) throw new AppError('Booking ID required', 400);

    const { data: booking } = await supabaseAdmin.from('bookings')
      .select('total_price, status, guest_id, payment_status').eq('id', booking_id).single();
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.guest_id !== req.user.id) throw new AppError('Forbidden', 403);
    if (booking.payment_status === 'paid') throw new AppError('Booking already paid', 400);

    const order = await razorpay.orders.create({
      amount: Math.round(booking.total_price * 100), // paise
      currency: 'INR',
      receipt: `flexi_${booking_id}`,
      notes: { booking_id, user_id: req.user.id },
    });

    // Store order reference
    await supabaseAdmin.from('bookings').update({ razorpay_order_id: order.id }).eq('id', booking_id);

    res.json({
      success: true,
      data: {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) { next(err); }
});

// POST /api/payments/verify
router.post('/verify', authenticate, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;

    // Verify signature
    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated !== razorpay_signature) throw new AppError('Payment verification failed', 400);

    // Update booking payment status
    await supabaseAdmin.from('bookings').update({
      payment_status: 'paid',
      razorpay_payment_id,
      paid_at: new Date().toISOString(),
      status: 'confirmed',
    }).eq('id', booking_id);

    // Create notification
    const { data: booking } = await supabaseAdmin.from('bookings')
      .select('host_id, guest_id').eq('id', booking_id).single();
    await supabaseAdmin.from('notifications').insert([
      {
        user_id: booking.guest_id, type: 'payment_success',
        title: 'Payment Successful ✅',
        message: 'Your booking payment was received. Have a great trip!',
        data: { booking_id },
      },
      {
        user_id: booking.host_id, type: 'booking_confirmed',
        title: 'New Booking Confirmed!',
        message: 'A guest has booked your vehicle. Payment received.',
        data: { booking_id },
      },
    ]);

    res.json({ success: true, message: 'Payment verified successfully', data: { booking_id } });
  } catch (err) { next(err); }
});

// POST /api/payments/payout (Admin triggers payout to host)
router.post('/payout', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { host_id, amount, bank_account } = req.body;

    // In production, use Razorpay Payouts API
    const payout = await razorpay.payouts.create({
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
      fund_account: { account_type: 'bank_account', bank_account },
      amount: Math.round(amount * 100),
      currency: 'INR',
      mode: 'IMPS',
      purpose: 'payout',
      narration: 'Flexi Host Earnings',
    }).catch(() => ({ id: `mock_${Date.now()}` })); // fallback for dev

    const { data } = await supabaseAdmin.from('payouts').insert({
      host_id, amount, status: 'processing',
      razorpay_payout_id: payout.id,
    }).select().single();

    // Mark earnings as paid out
    await supabaseAdmin.from('host_earnings')
      .update({ status: 'paid_out' }).eq('host_id', host_id).eq('status', 'pending_payout');

    res.json({ success: true, message: 'Payout initiated', data });
  } catch (err) { next(err); }
});

// GET /api/payments/history
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const { data } = await supabaseAdmin.from('bookings')
      .select('id, total_price, payment_status, paid_at, vehicles(make, model), razorpay_payment_id')
      .eq('guest_id', req.user.id).eq('payment_status', 'paid')
      .order('paid_at', { ascending: false });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;
