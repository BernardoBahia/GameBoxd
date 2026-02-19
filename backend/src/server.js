"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const auth_routes_1 = require("./routes/auth.routes");
const game_routes_1 = __importDefault(require("./routes/game.routes"));
const list_routes_1 = __importDefault(require("./routes/list.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const AuthMiddleware_1 = require("./middlewares/AuthMiddleware");
const user_service_1 = require("./services/user.service");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use(express_1.default.json());
app.use("/api", user_routes_1.default);
app.use("/api/auth", auth_routes_1.authRoutes);
// Aliases for frontend-friendly paths (keep /api/* as primary)
app.use("/auth", auth_routes_1.authRoutes);
app.use("/api", game_routes_1.default);
app.use("/api", list_routes_1.default);
app.use("/api", review_routes_1.default);
// Root aliases (optional): allow calling without /api prefix
app.use(user_routes_1.default);
app.use(game_routes_1.default);
app.use(list_routes_1.default);
app.use(review_routes_1.default);
// Alias for "GET /me" expected by frontend prompt
app.get("/api/me", AuthMiddleware_1.authMiddleware, (req, res) => {
    res.json(req.user);
});
app.get("/me", AuthMiddleware_1.authMiddleware, (req, res) => {
    res.json(req.user);
});
const userService = new user_service_1.UserService();
function sanitizeBio(raw) {
    if (raw === undefined)
        return undefined;
    if (raw === null)
        return null;
    if (typeof raw !== "string")
        return undefined;
    const trimmed = raw.trim();
    if (!trimmed)
        return null;
    if (trimmed.length > 280) {
        throw new Error("bio_too_long");
    }
    return trimmed;
}
async function patchMe(req, res) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ error: "Token não fornecido" });
    }
    let bio;
    try {
        bio = sanitizeBio(req.body?.bio);
    }
    catch (e) {
        if (e.message === "bio_too_long") {
            return res
                .status(400)
                .json({ error: "Bio deve ter no máximo 280 caracteres" });
        }
        return res.status(400).json({ error: "Bio inválida" });
    }
    if (bio === undefined) {
        return res.status(400).json({ error: "bio é obrigatório" });
    }
    try {
        const updated = await userService.updateUser(userId, { bio });
        return res.status(200).json({
            id: updated.id,
            email: updated.email,
            name: updated.name,
            bio: updated.bio ?? null,
        });
    }
    catch (error) {
        console.error("Erro ao atualizar bio:", error);
        return res.status(500).json({ error: "Erro ao atualizar bio" });
    }
}
app.patch("/api/me", AuthMiddleware_1.authMiddleware, patchMe);
app.patch("/me", AuthMiddleware_1.authMiddleware, patchMe);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
