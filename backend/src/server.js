import "dotenv/config";
import cors from "cors";
import express from "express";
import { closeConnection, getConnection } from "./config/database.js";
import livrosRoutes from "./routes/livros.js";
import usuariosRoutes from "./routes/usuarios.js";
import divulgacoesRoutes from "./routes/divulgacoes.js";
import vendasRoutes from "./routes/vendas.js";
import trocasRoutes from "./routes/trocas.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import mensagensRoutes from "./routes/mensagens.js";

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/livros", livrosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/divulgacoes", divulgacoesRoutes);
app.use("/api/vendas", vendasRoutes);
app.use("/api/trocas", trocasRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/mensagens", mensagensRoutes);

app.get("/api/health", async (_request, response) => {
  try {
    const pool = await getConnection();
    await pool.request().query("SELECT 1 AS conectado");

    response.json({
      api: "ok",
      banco: "conectado",
      database: process.env.DB_NAME,
    });
  } catch (error) {
    console.error("Falha ao verificar o SQL Server:", error.message);
    response.status(503).json({
      api: "ok",
      banco: "desconectado",
      erro: error.message,
    });
  }
});

app.use((error, _request, response, _next) => {
  void _next;
  console.error("Erro na API:", error);
  response.status(500).json({ erro: "Erro interno do servidor." });
});

app.use((_request, response) => {
  response.status(404).json({ erro: "Rota não encontrada." });
});

const server = app.listen(port, () => {
  console.log(`BookTrade API disponível em http://localhost:${port}`);
  console.log(`Verificação da conexão: http://localhost:${port}/api/health`);
});

async function stopServer() {
  server.close(async () => {
    await closeConnection();
    process.exit(0);
  });
}

process.on("SIGINT", stopServer);
process.on("SIGTERM", stopServer);
