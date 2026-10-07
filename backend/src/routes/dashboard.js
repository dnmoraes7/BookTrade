import { Router } from "express";
import { getConnection, sql } from "../config/database.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncRoute } from "./helpers.js";

const router = Router();

router.get("/me", requireAuth, asyncRoute(async (request, response) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("id_usuario", sql.Int, request.user.id_usuario)
    .query(`SELECT
      (SELECT COUNT(*) FROM Divulgacao WHERE id_usuario=@id_usuario AND status <> 'Inativo') AS anuncios,
      (SELECT COUNT(*) FROM Trocas WHERE (id_proponente=@id_usuario OR id_dono=@id_usuario)
        AND status IN ('Aguardando', 'Aceita')) AS trocas_em_andamento,
      (SELECT COUNT(*) FROM Mensagem WHERE id_destinatario=@id_usuario AND lida=0) AS mensagens_nao_lidas`);

  response.json(result.recordset[0]);
}));

router.get("/admin", requireAuth, asyncRoute(async (request, response) => {
  const pool = await getConnection();
  const user = await pool.request().input("id", sql.Int, request.user.id_usuario)
    .query("SELECT tipo_usuario FROM Usuario WHERE id_usuario=@id AND status='Ativo'");
  if (user.recordset[0]?.tipo_usuario !== "Administrador") {
    return response.status(403).json({ erro: "Acesso permitido apenas para administradores." });
  }
  const result = await pool.request().query(`SELECT
    (SELECT COUNT(*) FROM Usuario WHERE status='Ativo') AS usuarios_ativos,
    (SELECT COUNT(*) FROM Divulgacao WHERE status <> 'Inativo') AS anuncios_ativos,
    (SELECT COUNT(*) FROM Trocas WHERE data_troca >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0)) AS trocas_no_mes,
    (SELECT COALESCE(SUM(valor_total), 0) FROM Vendas
      WHERE status='Concluida' AND data_venda >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0)) AS vendas_concluidas_no_mes`);
  response.json(result.recordset[0]);
}));

export default router;
