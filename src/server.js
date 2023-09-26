import express, { json } from "express";
import { PrismaClient } from "@prisma/client";
import cookieParser from "cookie-parser";
import { hash as _hash, compare } from "bcrypt";
import { createTokens, validateTokens } from "./jwt";

const app = express();
const prisma = new PrismaClient();

app.use(json());
app.use(cookieParser());

app.post("/registrar", async (req, res) => {
  const { nome, senha } = req.body;
  await _hash(senha, 10).then(async (hash) => {
    try {
      await prisma.usuario.create({
        data: {
          nome,
          senha: hash,
        },
      });
      res.json("Usuário criado");
    } catch (err) {
      res.status(500).json({ error: "Algo deu errado" });
    }
  });
});

app.post("/login", async (req, res) => {
  const { nome, senha } = req.body;
  const usuario = await prisma.usuario.findFirst({
    where: { nome },
  });
  if (!usuario) {
    res.status(404).json({ error: "Usuário não existe" });
  }
  const psenha = usuario.senha;
  compare(senha, psenha).then((match) => {
    if (!match) {
      res.status(401).json({ error: "Senha incorreta" });
    } else {
      const accessToken = createTokens(usuario);
      res.cookie("access-token", accessToken, {
        httpOnly: true,
      });
      res.json("Logged in");
    }
  });
});

app.get("/perfil", validateTokens, async (req, res) => {
  res.json("Entrou no perfil");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Rodando na porta ${PORT}`);
});
