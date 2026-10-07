import jwt from "jsonwebtoken";

export function createToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("Defina JWT_SECRET no arquivo backend/.env.");
  }

  return jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });
}

export function requireAuth(request, response, next) {
  const authorization = request.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return response.status(401).json({ erro: "Faça login para continuar." });
  }

  try {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET ausente.");
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    request.user = { id_usuario: Number(payload.sub) };
    next();
  } catch {
    response.status(401).json({ erro: "Sessão inválida ou expirada. Entre novamente." });
  }
}
