import { Router } from "express";
import { getConnection, sql } from "../config/database.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncRoute, validId, sendDatabaseError } from "./helpers.js";

const router = Router();
const livroSelect = `SELECT id_livro, titulo, autor, editora, ano_publicacao, isbn, genero, descricao FROM Livro`;

router.get("/", asyncRoute(async (_request, response) => {
  const pool = await getConnection();
  const result = await pool.request().query(`${livroSelect} ORDER BY titulo`);
  response.json(result.recordset);
}));

router.get("/:id", asyncRoute(async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ erro: "ID inválido." });
  const pool = await getConnection();
  const result = await pool.request().input("id", sql.Int, Number(request.params.id))
    .query(`${livroSelect} WHERE id_livro = @id`);
  if (!result.recordset.length) return response.status(404).json({ erro: "Livro não encontrado." });
  response.json(result.recordset[0]);
}));

router.post("/", requireAuth, asyncRoute(async (request, response) => {
  const { titulo, autor, editora = null, ano_publicacao = null, isbn = null, genero = null, descricao = null } = request.body;
  if (!titulo || !autor) return response.status(400).json({ erro: "Informe titulo e autor." });
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("titulo", sql.VarChar(150), titulo)
      .input("autor", sql.VarChar(100), autor)
      .input("editora", sql.VarChar(100), editora)
      .input("ano_publicacao", sql.Int, ano_publicacao)
      .input("isbn", sql.VarChar(20), isbn)
      .input("genero", sql.VarChar(50), genero)
      .input("descricao", sql.VarChar(500), descricao)
      .query(`INSERT INTO Livro (titulo, autor, editora, ano_publicacao, isbn, genero, descricao)
        OUTPUT INSERTED.id_livro, INSERTED.titulo, INSERTED.autor, INSERTED.editora,
          INSERTED.ano_publicacao, INSERTED.isbn, INSERTED.genero, INSERTED.descricao
        VALUES (@titulo, @autor, @editora, @ano_publicacao, @isbn, @genero, @descricao)`);
    response.status(201).json(result.recordset[0]);
  } catch (error) { sendDatabaseError(error, response); }
}));

router.put("/:id", requireAuth, asyncRoute(async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ erro: "ID inválido." });
  const { titulo, autor, editora = null, ano_publicacao = null, isbn = null, genero = null, descricao = null } = request.body;
  if (!titulo || !autor) return response.status(400).json({ erro: "Informe titulo e autor." });
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("id", sql.Int, Number(request.params.id))
      .input("titulo", sql.VarChar(150), titulo)
      .input("autor", sql.VarChar(100), autor)
      .input("editora", sql.VarChar(100), editora)
      .input("ano_publicacao", sql.Int, ano_publicacao)
      .input("isbn", sql.VarChar(20), isbn)
      .input("genero", sql.VarChar(50), genero)
      .input("descricao", sql.VarChar(500), descricao)
      .input("id_usuario", sql.Int, request.user.id_usuario)
      .query(`UPDATE Livro SET titulo=@titulo, autor=@autor, editora=@editora,
        ano_publicacao=@ano_publicacao, isbn=@isbn, genero=@genero, descricao=@descricao
        OUTPUT INSERTED.id_livro, INSERTED.titulo, INSERTED.autor, INSERTED.editora,
          INSERTED.ano_publicacao, INSERTED.isbn, INSERTED.genero, INSERTED.descricao
        WHERE id_livro=@id AND EXISTS (
          SELECT 1 FROM Divulgacao d WHERE d.id_livro=Livro.id_livro AND d.id_usuario=@id_usuario
        ) AND NOT EXISTS (
          SELECT 1 FROM Divulgacao other WHERE other.id_livro=Livro.id_livro
            AND other.id_usuario<>@id_usuario
        )`);
    if (!result.recordset.length) return response.status(404).json({ erro: "Livro não encontrado." });
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
      .query(`DELETE FROM Livro OUTPUT DELETED.id_livro WHERE id_livro=@id
        AND EXISTS (SELECT 1 FROM Divulgacao d
          WHERE d.id_livro=Livro.id_livro AND d.id_usuario=@id_usuario)
        AND NOT EXISTS (SELECT 1 FROM Divulgacao d WHERE d.id_livro=Livro.id_livro)`);
    if (!result.recordset.length) return response.status(404).json({ erro: "Livro não encontrado." });
    response.status(204).end();
  } catch (error) { sendDatabaseError(error, response); }
}));

export default router;
