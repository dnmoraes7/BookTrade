import { Router } from "express";
import bcrypt from "bcryptjs";
import { getConnection, sql } from "../config/database.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncRoute, validId, sendDatabaseError } from "./helpers.js";

const router = Router();
const publicFields = `id_usuario, nome, email, telefone, data_cadastro, status, tipo_usuario`;

// O cadastro sempre cria uma conta comum e nunca recebe o ID do usuário do cliente.
router.post("/", asyncRoute(async (request, response) => {
  const nome = String(request.body.nome || "").trim();
  const email = String(request.body.email || "").trim().toLowerCase();
  const senha = String(request.body.senha || "");
  const telefone = request.body.telefone || null;
  if (!nome || !email || !senha) {
    return response.status(400).json({ erro: "Informe nome, email e senha." });
  }

  try {
    const pool = await getConnection();
    const senhaHash = await bcrypt.hash(senha, 10);
    const result = await pool.request()
      .input("nome", sql.VarChar(100), nome)
      .input("email", sql.VarChar(100), email)
      .input("senha", sql.VarChar(100), senhaHash)
      .input("telefone", sql.VarChar(20), telefone)
      .query(`INSERT INTO Usuario (nome, email, senha, telefone)
        OUTPUT INSERTED.${publicFields.replaceAll(", ", ", INSERTED.")}
        VALUES (@nome, @email, @senha, @telefone)`);
    response.status(201).json(result.recordset[0]);
  } catch (error) { sendDatabaseError(error, response); }
}));

router.get("/:id", requireAuth, asyncRoute(async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ erro: "ID inválido." });
  if (Number(request.params.id) !== request.user.id_usuario) {
    return response.status(403).json({ erro: "Você só pode consultar seu próprio usuário." });
  }
  const pool = await getConnection();
  const result = await pool.request().input("id", sql.Int, request.user.id_usuario)
    .query(`SELECT ${publicFields} FROM Usuario WHERE id_usuario=@id`);
  if (!result.recordset.length) return response.status(404).json({ erro: "Usuário não encontrado." });
  response.json(result.recordset[0]);
}));

router.put("/:id", requireAuth, asyncRoute(async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ erro: "ID inválido." });
  if (Number(request.params.id) !== request.user.id_usuario) {
    return response.status(403).json({ erro: "Você só pode editar seu próprio usuário." });
  }
  const nome = String(request.body.nome || "").trim();
  const email = String(request.body.email || "").trim().toLowerCase();
  const telefone = request.body.telefone || null;
  if (!nome || !email) return response.status(400).json({ erro: "Informe nome e email." });

  try {
    const pool = await getConnection();
    const queryRequest = pool.request()
      .input("id", sql.Int, request.user.id_usuario)
      .input("nome", sql.VarChar(100), nome)
      .input("email", sql.VarChar(100), email)
      .input("telefone", sql.VarChar(20), telefone);
    let passwordSql = "";
    if (request.body.senha) {
      queryRequest.input("senha", sql.VarChar(100), await bcrypt.hash(request.body.senha, 10));
      passwordSql = ", senha=@senha";
    }
    const result = await queryRequest.query(`UPDATE Usuario
      SET nome=@nome, email=@email, telefone=@telefone${passwordSql}
      OUTPUT INSERTED.${publicFields.replaceAll(", ", ", INSERTED.")}
      WHERE id_usuario=@id`);
    if (!result.recordset.length) return response.status(404).json({ erro: "Usuário não encontrado." });
    response.json(result.recordset[0]);
  } catch (error) { sendDatabaseError(error, response); }
}));

export default router;
