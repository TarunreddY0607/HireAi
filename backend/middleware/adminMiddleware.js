const adminMiddleware = (req, res, next) => {

    // ==========================================
    // Check Authentication
    // ==========================================

    if (!req.user) {

        return res.status(401).json({

            success: false,

            message: "Authentication Required"

        });

    }

    // ==========================================
    // Check Admin Role
    // ==========================================

    if (req.user.role !== "admin") {

        return res.status(403).json({

            success: false,

            message: "Admin Access Required"

        });

    }

    next();

};

export default adminMiddleware;