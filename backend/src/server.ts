import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes";
import { authRoutes } from "./routes/auth.routes";
import gameRoutes from "./routes/game.routes";
import listRoutes from "./routes/list.routes";
import reviewRoutes from "./routes/review.routes";
import { authMiddleware, type AuthRequest } from "./middlewares/AuthMiddleware";
import type { Response } from "express";
import { UserService } from "./services/user.service";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api", userRoutes);
app.use("/api/auth", authRoutes);
// Aliases for frontend-friendly paths (keep /api/* as primary)
app.use("/auth", authRoutes);
app.use("/api", gameRoutes);
app.use("/api", listRoutes);
app.use("/api", reviewRoutes);

// Root aliases (optional): allow calling without /api prefix
app.use(userRoutes);
app.use(gameRoutes);
app.use(listRoutes);
app.use(reviewRoutes);

// Alias for "GET /me" expected by frontend prompt
app.get("/api/me", authMiddleware, (req: AuthRequest, res: Response) => {
  res.json(req.user);
});

app.get("/me", authMiddleware, (req: AuthRequest, res: Response) => {
  res.json(req.user);
});

const userService = new UserService();

function sanitizeBio(raw: unknown) {
  if (raw === undefined) return undefined;
  if (raw === null) return null;
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.length > 280) {
    throw new Error("bio_too_long");
  }
  return trimmed;
}

async function patchMe(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  let bio: string | null | undefined;
  try {
    bio = sanitizeBio((req.body as any)?.bio);
  } catch (e) {
    if ((e as Error).message === "bio_too_long") {
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
  } catch (error) {
    console.error("Erro ao atualizar bio:", error);
    return res.status(500).json({ error: "Erro ao atualizar bio" });
  }
}

app.patch("/api/me", authMiddleware, patchMe);
app.patch("/me", authMiddleware, patchMe);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
