import { Router } from "express";
import { getConnection, sql } from "../config/database.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncRoute, validId, sendDatabaseError } from "./helpers.js";

const router = Router();

router.get("/", requireAuth, asyncRoute(async (request, response) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("id_usuario", sql.Int, request.user.id_usuario)
    .query(`SELECT m.id_mensagem, m.conteudo, m.data_envio, m.lida,
        m.id_venda, m.id_troca, m.id_remetente, m.id_destinatario,
        remetente.nome AS remetente_nome, destinatario.nome AS destinatario_nome
      FROM Mensagem m
      INNER JOIN Usuario remetente ON remetente.id_usuario=m.id_remetente
      INNER JOIN Usuario destinatario ON destinatario.id_usuario=m.id_destinatario
      WHERE m.id_remetente=@id_usuario OR m.id_destinatario=@id_usuario
      ORDER BY m.data_envio`);

  await pool.request().input("id_usuario", sql.Int, request.user.id_usuario)
    .query("UPDATE Mensagem SET lida=1 WHERE id_destinatario=@id_usuario AND lida=0");
  response.json(result.recordset);
}));

router.post("/", requireAuth, asyncRoute(async (request, response) => {
  const conteudo = String(request.body.conteudo || "").trim();
  const id_venda = request.body.id_venda || null;
  const id_troca = request.body.id_troca || null;
  const id_destinatario = request.body.id_destinatario;
  if (!conteudo || !validId(String(id_destinatario ?? "")) || Boolean(id_venda) === Boolean(id_troca)) {
    return response.status(400).json({ erro: "Informe mensagem, destinatário e exatamente uma venda ou troca." });
  }
  if (conteudo.length > 500) return response.status(400).json({ erro: "A mensagem pode ter até 500 caracteres." });

  try {
    const pool = await getConnection();
    const userId = request.user.id_usuario;
    const relatedRequest = pool.request()
      .input("userId", sql.Int, userId)
      .input("destinatario", sql.Int, Number(id_destinatario));
    let relationQuery;
    if (id_venda) {
      if (!validId(String(id_venda))) return response.status(400).json({ erro: "id_venda inválido." });
      relatedRequest.input("relacao", sql.Int, Number(id_venda));
      relationQuery = `SELECT TOP 1 id_venda AS id FROM Vendas
        WHERE id_venda=@relacao AND ((id_vendedor=@userId AND id_comprador=@destinatario)
          OR (id_comprador=@userId AND id_vendedor=@destinatario))`;
    } else {
      if (!validId(String(id_troca))) return response.status(400).json({ erro: "id_troca inválido." });
      relatedRequest.input("relacao", sql.Int, Number(id_troca));
      relationQuery = `SELECT TOP 1 id_troca AS id FROM Trocas
        WHERE id_troca=@relacao AND ((id_proponente=@userId AND id_dono=@destinatario)
          OR (id_dono=@userId AND id_proponente=@destinatario))`;
    }
    const relation = await relatedRequest.query(relationQuery);
    if (!relation.recordset.length) return response.status(403).json({ erro: "A mensagem deve pertencer a uma negociação entre esses usuários." });

    const result = await pool.request()
      .input("conteudo", sql.VarChar(500), conteudo)
      .input("id_venda", sql.Int, id_venda ? Number(id_venda) : null)
      .input("id_troca", sql.Int, id_troca ? Number(id_troca) : null)
      .input("id_remetente", sql.Int, userId)
      .input("id_destinatario", sql.Int, Number(id_destinatario))
      .query(`INSERT INTO Mensagem (conteudo, id_venda, id_troca, id_remetente, id_destinatario)
        OUTPUT INSERTED.id_mensagem, INSERTED.conteudo, INSERTED.data_envio, INSERTED.lida,
          INSERTED.id_venda, INSERTED.id_troca, INSERTED.id_remetente, INSERTED.id_destinatario
        VALUES (@conteudo, @id_venda, @id_troca, @id_remetente, @id_destinatario)`);
    response.status(201).json(result.recordset[0]);
  } catch (error) { sendDatabaseError(error, response); }
}));

export default router;
