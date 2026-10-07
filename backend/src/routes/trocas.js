import { Router } from "express";
import { getConnection, sql } from "../config/database.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncRoute, validId, sendDatabaseError } from "./helpers.js";

const router = Router();
const trocaSelect = `SELECT id_troca, id_divulgacao, id_livro_oferecido, id_proponente,
  id_dono, data_troca, status, localizacao.ToString() AS localizacao FROM Trocas`;

router.get("/", requireAuth, asyncRoute(async (request, response) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("id_usuario", sql.Int, request.user.id_usuario)
    .query(`${trocaSelect} WHERE id_proponente=@id_usuario OR id_dono=@id_usuario ORDER BY data_troca DESC`);
  response.json(result.recordset);
}));

router.get("/:id", requireAuth, asyncRoute(async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ erro: "ID inválido." });
  const pool = await getConnection();
  const result = await pool.request()
    .input("id", sql.Int, Number(request.params.id))
    .input("id_usuario", sql.Int, request.user.id_usuario)
    .query(`${trocaSelect} WHERE id_troca=@id AND (id_proponente=@id_usuario OR id_dono=@id_usuario)`);
  if (!result.recordset.length) return response.status(404).json({ erro: "Troca não encontrada." });
  response.json(result.recordset[0]);
}));

router.post("/", requireAuth, asyncRoute(async (request, response) => {
  const { id_divulgacao, id_livro_oferecido, localizacao = null } = request.body;
  if (!validId(String(id_divulgacao ?? "")) || !validId(String(id_livro_oferecido ?? ""))) {
    return response.status(400).json({ erro: "Informe id_divulgacao e id_livro_oferecido válidos." });
  }
  try {
    const pool = await getConnection();
    const userId = request.user.id_usuario;
    const listing = await pool.request()
      .input("id_divulgacao", sql.Int, Number(id_divulgacao))
      .input("id_livro", sql.Int, Number(id_livro_oferecido))
      .input("id_usuario", sql.Int, userId)
      .query(`SELECT d.id_usuario AS id_dono FROM Divulgacao d
        INNER JOIN Livro l ON l.id_livro=d.id_livro
        WHERE d.id_divulgacao=@id_divulgacao AND d.status='Ativo' AND d.preco IS NULL
          AND EXISTS (SELECT 1 FROM Divulgacao own WHERE own.id_livro=@id_livro
            AND own.id_usuario=@id_usuario AND own.status='Ativo')`);
    if (!listing.recordset.length) return response.status(400).json({ erro: "Divulgação ou livro oferecido inválido." });
    const id_dono = listing.recordset[0].id_dono;
    if (id_dono === userId) return response.status(400).json({ erro: "Você não pode propor troca para si mesmo." });
    const result = await pool.request()
      .input("id_divulgacao", sql.Int, Number(id_divulgacao))
      .input("id_livro_oferecido", sql.Int, Number(id_livro_oferecido))
      .input("id_proponente", sql.Int, userId)
      .input("id_dono", sql.Int, id_dono)
      .input("status", sql.VarChar(20), "Aguardando")
      .input("localizacao", sql.NVarChar(200), localizacao)
      .query(`INSERT INTO Trocas (id_divulgacao, id_livro_oferecido, id_proponente,
        id_dono, status, localizacao)
        OUTPUT INSERTED.id_troca, INSERTED.id_divulgacao, INSERTED.id_livro_oferecido,
          INSERTED.id_proponente, INSERTED.id_dono, INSERTED.data_troca,
          INSERTED.status, INSERTED.localizacao.ToString() AS localizacao
        VALUES (@id_divulgacao, @id_livro_oferecido, @id_proponente, @id_dono,
          @status, CASE WHEN @localizacao IS NULL THEN NULL
            ELSE geography::STGeomFromText(@localizacao, 4326) END)`);
    response.status(201).json(result.recordset[0]);
  } catch (error) { sendDatabaseError(error, response); }
}));

router.put("/:id", requireAuth, asyncRoute(async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ erro: "ID inválido." });
  const { status, localizacao = null } = request.body;
  if (!status) return response.status(400).json({ erro: "Informe status válido." });
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("id", sql.Int, Number(request.params.id))
      .input("id_usuario", sql.Int, request.user.id_usuario)
      .input("status", sql.VarChar(20), status)
      .input("localizacao", sql.NVarChar(200), localizacao)
      .query(`UPDATE Trocas SET status=@status,
        localizacao=CASE WHEN @localizacao IS NULL THEN NULL
          ELSE geography::STGeomFromText(@localizacao, 4326) END
        OUTPUT INSERTED.id_troca, INSERTED.id_divulgacao, INSERTED.id_livro_oferecido,
          INSERTED.id_proponente, INSERTED.id_dono, INSERTED.data_troca,
          INSERTED.status, INSERTED.localizacao.ToString() AS localizacao
        WHERE id_troca=@id AND (id_proponente=@id_usuario OR id_dono=@id_usuario)`);
    if (!result.recordset.length) return response.status(404).json({ erro: "Troca não encontrada." });
    response.json(result.recordset[0]);
  } catch (error) { sendDatabaseError(error, response); }
}));

router.delete("/:id", requireAuth, asyncRoute(async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ erro: "ID inválido." });
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("id", sql.Int, Number(request.params.id))
      .input("id_usuario", sql.Int, request.user.id_usuario)
      .query(`DELETE FROM Trocas OUTPUT DELETED.id_troca WHERE id_troca=@id
        AND (id_proponente=@id_usuario OR id_dono=@id_usuario)`);
    if (!result.recordset.length) return response.status(404).json({ erro: "Troca não encontrada." });
    response.status(204).end();
  } catch (error) { sendDatabaseError(error, response); }
}));

export default router;
