import { Router } from "express";
import { getConnection, sql } from "../config/database.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncRoute, validId, sendDatabaseError } from "./helpers.js";

const router = Router();
const vendaSelect = `SELECT v.id_venda, v.id_divulgacao, v.id_vendedor, v.id_comprador, v.data_venda,
  v.valor_total, v.metodo_pagamento, v.status, v.localizacao.ToString() AS localizacao,
  l.titulo AS titulo, l.autor AS autor
  FROM Vendas v
  INNER JOIN Divulgacao d ON d.id_divulgacao=v.id_divulgacao
  INNER JOIN Livro l ON l.id_livro=d.id_livro`;
router.get("/", requireAuth, asyncRoute(async (request, response) => {
  const pool = await getConnection();
  const result = await pool.request().input("id_usuario", sql.Int, request.user.id_usuario)
    .query(`${vendaSelect} WHERE v.id_vendedor=@id_usuario OR v.id_comprador=@id_usuario ORDER BY v.data_venda DESC`);
  response.json(result.recordset);
}));

router.get("/:id", requireAuth, asyncRoute(async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ erro: "ID inválido." });
  const pool = await getConnection();
  const result = await pool.request()
    .input("id", sql.Int, Number(request.params.id))
    .input("id_usuario", sql.Int, request.user.id_usuario)
    .query(`${vendaSelect} WHERE v.id_venda=@id AND (v.id_vendedor=@id_usuario OR v.id_comprador=@id_usuario)`);
  if (!result.recordset.length) return response.status(404).json({ erro: "Venda não encontrada." });
  response.json(result.recordset[0]);
}));

router.post("/checkout", requireAuth, asyncRoute(async (request, response) => {
  const ids = request.body.id_divulgacoes;
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => validId(String(id)))) {
    return response.status(400).json({ erro: "Informe uma lista válida de divulgações." });
  }
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();
    const vendasCriadas = [];
    for (const id of ids) {
      const listing = await new sql.Request(transaction)
        .input("id_divulgacao", sql.Int, Number(id))
        .query(`SELECT id_usuario, preco FROM Divulgacao
          WHERE id_divulgacao=@id_divulgacao AND status='Ativo' AND preco IS NOT NULL`);
      if (!listing.recordset.length) throw new Error("Um anúncio do carrinho não está mais disponível para venda.");
      const dono = listing.recordset[0].id_usuario;
      if (dono === request.user.id_usuario) throw new Error("O carrinho contém um anúncio seu.");
      const inserted = await new sql.Request(transaction)
        .input("id_divulgacao", sql.Int, Number(id))
        .input("id_vendedor", sql.Int, dono)
        .input("id_comprador", sql.Int, request.user.id_usuario)
        .input("valor_total", sql.Decimal(8, 2), listing.recordset[0].preco)
        .input("metodo_pagamento", sql.VarChar(30), "A definir")
        .query(`INSERT INTO Vendas (id_divulgacao, id_vendedor, id_comprador, valor_total, metodo_pagamento)
          OUTPUT INSERTED.id_venda, INSERTED.id_divulgacao, INSERTED.id_vendedor,
            INSERTED.id_comprador, INSERTED.data_venda, INSERTED.valor_total,
            INSERTED.metodo_pagamento, INSERTED.status
          VALUES (@id_divulgacao, @id_vendedor, @id_comprador, @valor_total, @metodo_pagamento)`);
      vendasCriadas.push(inserted.recordset[0]);
    }
    await transaction.commit();
    response.status(201).json(vendasCriadas);
  } catch (error) {
    try { await transaction.rollback(); } catch { /* A transação pode não ter iniciado. */ }
    if (error.code) return sendDatabaseError(error, response);
    response.status(400).json({ erro: error.message });
  }
}));

router.post("/", requireAuth, asyncRoute(async (request, response) => {
  const { id_divulgacao, metodo_pagamento = null, localizacao = null } = request.body;
  if (!validId(String(id_divulgacao ?? ""))) return response.status(400).json({ erro: "Informe id_divulgacao válido." });
  try {
    const pool = await getConnection();
    const listing = await pool.request().input("id_divulgacao", sql.Int, Number(id_divulgacao))
      .query(`SELECT d.id_usuario, d.preco FROM Divulgacao d
        WHERE d.id_divulgacao=@id_divulgacao AND d.status='Ativo' AND d.preco IS NOT NULL`);
    if (!listing.recordset.length) return response.status(400).json({ erro: "Anúncio de venda indisponível." });
    if (listing.recordset[0].id_usuario === request.user.id_usuario) {
      return response.status(400).json({ erro: "Você não pode comprar o próprio anúncio." });
    }
    const result = await pool.request()
      .input("id_divulgacao", sql.Int, Number(id_divulgacao))
      .input("id_vendedor", sql.Int, listing.recordset[0].id_usuario)
      .input("id_comprador", sql.Int, request.user.id_usuario)
      .input("valor_total", sql.Decimal(8, 2), listing.recordset[0].preco)
      .input("metodo_pagamento", sql.VarChar(30), metodo_pagamento)
      .input("status", sql.VarChar(20), "Aguardando")
      .input("localizacao", sql.NVarChar(200), localizacao)
      .query(`INSERT INTO Vendas (id_divulgacao, id_vendedor, id_comprador, valor_total,
        metodo_pagamento, status, localizacao)
        OUTPUT INSERTED.id_venda, INSERTED.id_divulgacao, INSERTED.id_vendedor,
          INSERTED.id_comprador, INSERTED.data_venda, INSERTED.valor_total,
          INSERTED.metodo_pagamento, INSERTED.status,
          INSERTED.localizacao.ToString() AS localizacao
        VALUES (@id_divulgacao, @id_vendedor, @id_comprador, @valor_total,
          @metodo_pagamento, @status,
          CASE WHEN @localizacao IS NULL THEN NULL
            ELSE geography::STGeomFromText(@localizacao, 4326) END)`);
    response.status(201).json(result.recordset[0]);
  } catch (error) { sendDatabaseError(error, response); }
}));

router.put("/:id", requireAuth, asyncRoute(async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ erro: "ID inválido." });
  const { status, metodo_pagamento = null, localizacao = null } = request.body;
  if (!status) return response.status(400).json({ erro: "Informe status válido." });
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("id", sql.Int, Number(request.params.id))
      .input("id_usuario", sql.Int, request.user.id_usuario)
      .input("metodo_pagamento", sql.VarChar(30), metodo_pagamento)
      .input("status", sql.VarChar(20), status)
      .input("localizacao", sql.NVarChar(200), localizacao)
      .query(`UPDATE Vendas SET metodo_pagamento=@metodo_pagamento, status=@status,
        localizacao=CASE WHEN @localizacao IS NULL THEN NULL
          ELSE geography::STGeomFromText(@localizacao, 4326) END
        OUTPUT INSERTED.id_venda, INSERTED.id_divulgacao, INSERTED.id_vendedor,
          INSERTED.id_comprador, INSERTED.data_venda, INSERTED.valor_total,
          INSERTED.metodo_pagamento, INSERTED.status,
          INSERTED.localizacao.ToString() AS localizacao
        WHERE id_venda=@id AND (id_vendedor=@id_usuario OR id_comprador=@id_usuario)`);
    if (!result.recordset.length) return response.status(404).json({ erro: "Venda não encontrada." });
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
      .query(`DELETE FROM Vendas OUTPUT DELETED.id_venda WHERE id_venda=@id
        AND (id_vendedor=@id_usuario OR id_comprador=@id_usuario)`);
    if (!result.recordset.length) return response.status(404).json({ erro: "Venda não encontrada." });
    response.status(204).end();
  } catch (error) { sendDatabaseError(error, response); }
}));

export default router;
