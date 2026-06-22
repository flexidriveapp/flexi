const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/notifications
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('notifications')
      .select('*').eq('user_id', req.user.id)
      .order('created_at', { ascending: false }).limit(50);
    if (error) throw new AppError(error.message, 500);
    const unread = data?.filter(n => !n.is_read).length || 0;
    res.json({ success: true, data, unread_count: unread });
  } catch (err) { next(err); }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticate, async (req, res, next) => {
  try {
    await supabaseAdmin.from('notifications').update({ is_read: true })
      .eq('id', req.params.id).eq('user_id', req.user.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticate, async (req, res, next) => {
  try {
    await supabaseAdmin.from('notifications').update({ is_read: true })
      .eq('user_id', req.user.id).eq('is_read', false);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
});

module.exports = router;
