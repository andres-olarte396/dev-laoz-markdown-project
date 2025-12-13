const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header (Bearer token)
 * Assumes dev-laoz-authentication-api signed the token with JWT_SECRET
 */
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            // Si no hay token, podemos permitir acceso limitado (guest) o denegar
            // Si la ruta requiere protección explícita, denegamos.
            // Para mantener compatibilidad con codigo legado que usa req.userId || 1,
            // si no hay token no seteamos req.userId (o dejamos undefined) y que el controller decida.
            // Pero el objetivo es INTEGRAR auth, asi que vamos a loguearlo.
            // logger.warn('No token provided');
            return res.status(401).json({ success: false, error: 'Access token required' });
        }

        if (!process.env.JWT_SECRET) {
             logger.error('JWT_SECRET not defined in environment');
             return res.status(500).json({ success: false, error: 'Server configuration error' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                logger.warn('Token verification failed:', err.message);
                return res.status(403).json({ success: false, error: 'Invalid or expired token' });
            }

            // Token is valid
            // Decoded payload should contain { userId, sessionToken } as per auth-api
            req.userId = decoded.userId;
            req.sessionToken = decoded.sessionToken;
            
            logger.debug(`User authenticated: ${req.userId}`);
            next();
        });

    } catch (error) {
        logger.error('Auth middleware error:', error);
        return res.status(500).json({ success: false, error: 'Authentication error' });
    }
};

/**
 * Optional Authentication
 * Same as above but doesn't block if token is missing (useful for public endpoints that track progress if logged in)
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // req.userId is undefined, controller should handle default/guest
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (!err) {
            req.userId = decoded.userId;
        }
        next();
    });
};

module.exports = { authenticateToken, optionalAuth };
