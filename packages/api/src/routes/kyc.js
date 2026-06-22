const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticate, requireRole } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// POST /api/kyc/submit
router.post('/submit', authenticate, async (req, res, next) => {
  try {
    const { driving_license_front, driving_license_back, id_proof, selfie_url } = req.body;
    if (!driving_license_front || !id_proof || !selfie_url)
      throw new AppError('All documents are required', 400);

    const existing = await supabaseAdmin.from('kyc_documents').select('id').eq('user_id', req.user.id).single();

    if (existing.data) {
      const { data, error } = await supabaseAdmin.from('kyc_documents')
        .update({ driving_license_front, driving_license_back, id_proof, selfie_url, status: 'pending', submitted_at: new Date().toISOString(), rejection_reason: null })
        .eq('user_id', req.user.id).select().single();
      if (error) throw new AppError(error.message, 500);
      return res.json({ success: true, message: 'KYC documents updated', data });
    }

    const { data, error } = await supabaseAdmin.from('kyc_documents').insert({
      user_id: req.user.id, driving_license_front, driving_license_back,
      id_proof, selfie_url, status: 'pending',
    }).select().single();
    if (error) throw new AppError(error.message, 500);

    // Notify admins
    await supabaseAdmin.from('notifications').insert({
      user_id: req.user.id, type: 'kyc_submitted',
      title: 'KYC Submitted', message: 'Your KYC documents have been submitted for review.',
    });

    res.status(201).json({ success: true, message: 'KYC documents submitted successfully', data });
  } catch (err) { next(err); }
});

// GET /api/kyc/status
router.get('/status', authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('kyc_documents')
      .select('status, rejection_reason, submitted_at, reviewed_at').eq('user_id', req.user.id).single();
    if (error) return res.json({ success: true, data: { status: 'not_submitted' } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/kyc/:userId (admin)
router.get('/:userId', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('kyc_documents')
      .select('*, profiles!kyc_documents_user_id_fkey(full_name, email, phone)')
      .eq('user_id', req.params.userId).single();
    if (error || !data) throw new AppError('KYC not found', 404);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// PUT /api/kyc/:userId/approve
router.put('/:userId/approve', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('kyc_documents')
      .update({ status: 'verified', reviewed_at: new Date().toISOString(), reviewed_by: req.user.id })
      .eq('user_id', req.params.userId).select().single();
    if (error) throw new AppError(error.message, 500);

    await supabaseAdmin.from('profiles').update({ is_verified: true }).eq('id', req.params.userId);
    await supabaseAdmin.from('notifications').insert({
      user_id: req.params.userId, type: 'kyc_approved',
      title: 'KYC Approved ✅', message: 'Your identity has been verified. You can now book cars on Flexi.',
    });

    res.json({ success: true, message: 'KYC approved', data });
  } catch (err) { next(err); }
});

// PUT /api/kyc/:userId/reject
router.put('/:userId/reject', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) throw new AppError('Rejection reason is required', 400);

    const { data, error } = await supabaseAdmin.from('kyc_documents')
      .update({ status: 'rejected', rejection_reason: reason, reviewed_at: new Date().toISOString(), reviewed_by: req.user.id })
      .eq('user_id', req.params.userId).select().single();
    if (error) throw new AppError(error.message, 500);

    await supabaseAdmin.from('notifications').insert({
      user_id: req.params.userId, type: 'kyc_rejected',
      title: 'KYC Rejected', message: `Your KYC was rejected. Reason: ${reason}. Please resubmit.`,
    });

    res.json({ success: true, message: 'KYC rejected', data });
  } catch (err) { next(err); }
});

module.exports = router;
