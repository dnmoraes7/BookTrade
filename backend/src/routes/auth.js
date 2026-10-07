import { Router } from "express";
import bcrypt from "bcryptjs";
import { getConnection, sql } from "../config/database.js";
import { requireAuth, createToken } from "../middleware/auth.js";
import { asyncRoute } from "./helpers.js";

const router = Router();

router.post("/login", asyncRoute(async (request, response) => {
  const email = String(request.body.email || "").trim().toLowerCase();
  const password = String(request.body.senha || "");
  if (!email || !password) {
    return response.status(400).json({ erro: "Informe email e senha." });
  }

  const pool = await getConnection();
  const result = await pool.request()
    .input("email", sql.VarChar(100), email)
    .query(`SELECT id_usuario, nome, email, senha, telefone, status, tipo_usuario
      FROM Usuario WHERE LOWER(email)=@email`);
  const user = result.recordset[0];
  if (!user || user.status !== "Ativo") {
    return response.status(401).json({ erro: "Email ou senha incorretos." });
  }

  const isHash = /^\$2[aby]\$/.test(user.senha || "");
  const validPassword = isHash
    ? await bcrypt.compare(password, user.senha)
    : password === user.senha;
  if (!validPassword) {
    return response.status(401).json({ erro: "Email ou senha incorretos." });
  }

  // Compatibilidade com os usuários de exemplo, que foram inseridos com senha sem hash.
  const safeUser = {
    id_usuario: user.id_usuario,
    nome: user.nome,
    email: user.email,
    telefone: user.telefone,
    tipo_usuario: user.tipo_usuario,
  };
  response.json({ token: createToken(user.id_usuario), user: safeUser });
}));

router.get("/me", requireAuth, asyncRoute(async (request, response) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("id", sql.Int, request.user.id_usuario)
    .query(`SELECT id_usuario, nome, email, telefone, status, tipo_usuario
      FROM Usuario WHERE id_usuario=@id AND status='Ativo'`);
  if (!result.recordset.length) return response.status(401).json({ erro: "Usuário não encontrado ou inativo." });
  response.json(result.recordset[0]);
}));

export default router;
