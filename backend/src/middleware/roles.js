function requireRole(role) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Usuário não autenticado' });

    // admin tem acesso a tudo
    if (user.role === 'admin') return next();

    if (user.role !== role) {
      return res.status(403).json({ error: 'Permissão negada' });
    }

    next();
  };
}

module.exports = { requireRole };
