import { Router } from "express";
import { LoginController } from "../controllers/auth/LoginController";
import { RegisterController } from "../controllers/auth/RegisterController";
import { ForgotPasswordController } from "../controllers/auth/ForgotPasswordController";

const router = Router();
const loginController = new LoginController();
const registerController = new RegisterController();
const forgotPasswordController = new ForgotPasswordController();

router.post("/login", loginController.login);
router.post("/register", registerController.register);
router.post("/forgot-password", forgotPasswordController.requestReset);
router.post("/reset-password", forgotPasswordController.resetPassword);

export { router as authRoutes };
