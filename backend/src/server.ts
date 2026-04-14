import express from "express";
import cors from "cors";
import path from "path";
import userRoutes from "./routes/user.routes";
import { authRoutes } from "./routes/auth.routes";
import gameRoutes from "./routes/game.routes";
import listRoutes from "./routes/list.routes";
import reviewRoutes from "./routes/review.routes";
import meRoutes from "./routes/me.routes";

const app = express();

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Bloqueado pelo CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/auth", authRoutes);
app.use(userRoutes);
app.use(gameRoutes);
app.use(listRoutes);
app.use(reviewRoutes);
app.use(meRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});