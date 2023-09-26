const jwt = require("jsonwebtoken");

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, nome: user.nome },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );

  return accessToken;
};

const validateTokens = (req, res, next) => {
  const accessToken = req.cookies["access-token"];
  if (!accessToken) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  try {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token inválido" });
  }
};

module.exports = {
  generateTokens,
  validateTokens,
};
