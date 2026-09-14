import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {

    getProfile,

    updateProfile,

    changePassword,

    updateAvatar

} from "../controllers/profileController.js";

const router = express.Router();

// ==========================================
// GET PROFILE
// ==========================================

router.get(

    "/profile",

    authMiddleware,

    getProfile

);

// ==========================================
// UPDATE PROFILE
// ==========================================

router.put(

    "/profile",

    authMiddleware,

    updateProfile

);

router.put(

    "/profile/avatar",

    authMiddleware,

    updateAvatar

);

// ==========================================
// CHANGE PASSWORD
// ==========================================

router.put(

    "/change-password",

    authMiddleware,

    changePassword

);

export default router;