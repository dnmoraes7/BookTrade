export function asyncRoute(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

export function validId(value) {
  return /^\d+$/.test(value) && Number(value) > 0;
}

export function sendDatabaseError(error, response) {
  console.error("Erro no SQL Server:", error.message);

  if (["EREQUEST", "EINTEGRITY"].includes(error.code)) {
    return response.status(400).json({
      erro: "Não foi possível salvar. Confira os dados e os relacionamentos informados.",
    });
  }

  return response.status(500).json({ erro: "Erro ao acessar o banco de dados." });
}
