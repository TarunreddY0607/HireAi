import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        // ==========================================
        // Check Authorization Header
        // ==========================================

        if (!authHeader) {

            return res.status(401).json({

                success: false,

                message: "Access Denied. No Token Provided."

            });

        }

        // ==========================================
        // Check Bearer Token
        // ==========================================

        if (!authHeader.startsWith("Bearer ")) {

            return res.status(401).json({

                success: false,

                message: "Invalid Authorization Format"

            });

        }

        const token = authHeader.split(" ")[1];

        if (!token) {

            return res.status(401).json({

                success: false,

                message: "Token Missing"

            });

        }

        // ==========================================
        // Verify Token
        // ==========================================

        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        );

        // ==========================================
        // Store User Information
        // ==========================================

        req.user = {

            userId: decoded.userId,

            role: decoded.role

        };

        next();

    }

    catch (err) {

        console.log("Auth Middleware Error:", err);

        return res.status(401).json({

            success: false,

            message: "Invalid or Expired Token"

        });

    }

};

export default authMiddleware;