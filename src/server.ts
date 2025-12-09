import express from "express";
import userRoutes from "./routes/user.routes";
import { authRoutes } from "./routes/auth.routes";
import gameRoutes from "./routes/game.routes";
import listRoutes from "./routes/list.routes";
import reviewRoutes from "./routes/review.routes";

const app = express();

app.use(express.json());
app.use("/api", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", gameRoutes);
app.use("/api", listRoutes);
app.use("/api", reviewRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
