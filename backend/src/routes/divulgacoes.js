import { Router } from "express";
import { getConnection, sql } from "../config/database.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncRoute, validId, sendDatabaseError } from "./helpers.js";

const router = Router();
const divulgacaoSelect = `SELECT d.id_divulgacao, d.id_livro, d.titulo, d.descricao, d.preco,
  d.data_publicacao, d.status, d.id_usuario, l.titulo AS livro_titulo, l.autor,
  l.editora, l.ano_publicacao, l.isbn, l.genero, l.descricao AS livro_descricao,
  u.nome AS usuario_nome
  FROM Divulgacao d
  INNER JOIN Livro l ON l.id_livro=d.id_livro
  INNER JOIN Usuario u ON u.id_usuario=d.id_usuario`;

router.get("/", asyncRoute(async (request, response) => {
  const pool = await getConnection();
  const queryRequest = pool.request();
  const conditions = ["d.status <> 'Inativo'"];
  if (request.query.id_usuario) {
    if (!validId(request.query.id_usuario)) return response.status(400).json({ erro: "id_usuario inválido." });
    queryRequest.input("id_usuario", sql.Int, Number(request.query.id_usuario));
    conditions.push("d.id_usuario=@id_usuario");
  }
  if (request.query.status) {
    queryRequest.input("status", sql.VarChar(20), request.query.status);
    conditions.push("d.status=@status");
  }
  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
  const result = await queryRequest.query(`${divulgacaoSelect}${where} ORDER BY d.data_publicacao DESC`);
  response.json(result.recordset);
}));

router.get("/:id", asyncRoute(async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ erro: "ID inválido." });
  const pool = await getConnection();
  const result = await pool.request().input("id", sql.Int, Number(request.params.id))
    .query(`${divulgacaoSelect} WHERE d.id_divulgacao=@id AND d.status <> 'Inativo'`);
  if (!result.recordset.length) return response.status(404).json({ erro: "Divulgação não encontrada." });
  response.json(result.recordset[0]);
}));

router.post("/", requireAuth, asyncRoute(async (request, response) => {
  const { id_livro, titulo = null, descricao = null, preco = null, status = "Ativo" } = request.body;
  if (!validId(String(id_livro ?? ""))) {
    return response.status(400).json({ erro: "Informe id_livro válido." });
  }
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("id_livro", sql.Int, Number(id_livro))
      .input("titulo", sql.VarChar(150), titulo)
      .input("descricao", sql.VarChar(500), descricao)
      .input("preco", sql.Decimal(8, 2), preco)
      .input("status", sql.VarChar(20), status)
      .input("id_usuario", sql.Int, request.user.id_usuario)
      .query(`INSERT INTO Divulgacao (id_livro, titulo, descricao, preco, status, id_usuario)
        OUTPUT INSERTED.id_divulgacao, INSERTED.id_livro, INSERTED.titulo, INSERTED.descricao,
          INSERTED.preco, INSERTED.data_publicacao, INSERTED.status, INSERTED.id_usuario
        VALUES (@id_livro, @titulo, @descricao, @preco, @status, @id_usuario)`);
    response.status(201).json(result.recordset[0]);
  } catch (error) { sendDatabaseError(error, response); }
}));

router.post("/com-livro", requireAuth, asyncRoute(async (request, response) => {
  const { livro, titulo = null, descricao = null, preco = null } = request.body;
  if (!livro?.titulo || !livro?.autor) {
    return response.status(400).json({ erro: "Informe título e autor do livro." });
  }

  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();
    const newBook = await new sql.Request(transaction)
      .input("titulo", sql.VarChar(150), livro.titulo)
      .input("autor", sql.VarChar(100), livro.autor)
      .input("editora", sql.VarChar(100), livro.editora || null)
      .input("ano_publicacao", sql.Int, livro.ano_publicacao || null)
      .input("isbn", sql.VarChar(20), livro.isbn || null)
      .input("genero", sql.VarChar(50), livro.genero || null)
      .input("livro_descricao", sql.VarChar(500), livro.descricao || null)
      .query(`INSERT INTO Livro (titulo, autor, editora, ano_publicacao, isbn, genero, descricao)
        OUTPUT INSERTED.id_livro, INSERTED.titulo, INSERTED.autor, INSERTED.editora,
          INSERTED.ano_publicacao, INSERTED.isbn, INSERTED.genero, INSERTED.descricao
        VALUES (@titulo, @autor, @editora, @ano_publicacao, @isbn, @genero, @livro_descricao)`);
    const book = newBook.recordset[0];
    const newListing = await new sql.Request(transaction)
      .input("id_livro", sql.Int, book.id_livro)
      .input("titulo", sql.VarChar(150), titulo || book.titulo)
      .input("descricao", sql.VarChar(500), descricao)
      .input("preco", sql.Decimal(8, 2), preco)
      .input("id_usuario", sql.Int, request.user.id_usuario)
      .query(`INSERT INTO Divulgacao (id_livro, titulo, descricao, preco, id_usuario)
        OUTPUT INSERTED.id_divulgacao, INSERTED.id_livro, INSERTED.titulo,
          INSERTED.descricao, INSERTED.preco, INSERTED.data_publicacao,
          INSERTED.status, INSERTED.id_usuario
        VALUES (@id_livro, @titulo, @descricao, @preco, @id_usuario)`);
    await transaction.commit();
    response.status(201).json({ ...newListing.recordset[0], livro: book });
  } catch (error) {
    await transaction.rollback();
    sendDatabaseError(error, response);
  }
}));

router.put("/:id", requireAuth, asyncRoute(async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ erro: "ID inválido." });
  const { id_livro, titulo = null, descricao = null, preco = null, status } = request.body;
  if (!validId(String(id_livro ?? "")) || !status) {
    return response.status(400).json({ erro: "Informe id_livro e status válidos." });
  }
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("id", sql.Int, Number(request.params.id))
      .input("id_livro", sql.Int, Number(id_livro))
      .input("titulo", sql.VarChar(150), titulo)
      .input("descricao", sql.VarChar(500), descricao)
      .input("preco", sql.Decimal(8, 2), preco)
      .input("status", sql.VarChar(20), status)
      .input("id_usuario", sql.Int, request.user.id_usuario)
      .query(`UPDATE Divulgacao SET id_livro=@id_livro, titulo=@titulo, descricao=@descricao,
        preco=@preco, status=@status
        OUTPUT INSERTED.id_divulgacao, INSERTED.id_livro, INSERTED.titulo, INSERTED.descricao,
          INSERTED.preco, INSERTED.data_publicacao, INSERTED.status, INSERTED.id_usuario
        WHERE id_divulgacao=@id AND id_usuario=@id_usuario`);
    if (!result.recordset.length) return response.status(404).json({ erro: "Divulgação não encontrada." });
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
      .query(`UPDATE Divulgacao SET status='Inativo'
        OUTPUT INSERTED.id_divulgacao WHERE id_divulgacao=@id AND id_usuario=@id_usuario`);
    if (!result.recordset.length) return response.status(404).json({ erro: "Divulgação não encontrada." });
    response.status(204).end();
  } catch (error) { sendDatabaseError(error, response); }
}));

export default router;
