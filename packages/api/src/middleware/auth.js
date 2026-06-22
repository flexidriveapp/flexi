const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];

    // Verify with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    // Fetch profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    req.user = { ...user, profile };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user?.profile?.role || !roles.includes(req.user.profile.role)) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
    const token = authHeader.split(' ')[1];
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (user) {
      const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single();
      req.user = { ...user, profile };
    }
  } catch (_) {}
  next();
};

module.exports = { authenticate, requireRole, optionalAuth };
