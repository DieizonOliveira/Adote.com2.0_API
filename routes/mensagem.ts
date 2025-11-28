import { PrismaClient } from '@prisma/client';
import { Router } from "express";
import { verificaToken } from "../middewares/verificaToken";
import { describe } from 'node:test';
const log = (...msg: any) => console.log("\x1b[36m%s\x1b[0m", "[LOG]", ...msg);
const warn = (...msg: any) => console.log("\x1b[33m%s\x1b[0m", "[WARN]", ...msg);
const errorLog = (...msg: any) => console.log("\x1b[31m%s\x1b[0m", "[ERROR]", ...msg);

const prisma = new PrismaClient();
const router = Router();

/**
 * 📌 GET /mensagem/chats
 * Lista os chats onde o usuário está participando
 */
router.get("/chats", verificaToken, async (req, res) => {
  const userId = String(req.userLogadoId);
  log("📥 GET /mensagem/chats — Usuário autenticado:", userId);

  try {
    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { participante1Id: userId },
          { participante2Id: userId },
        ]
      },
      orderBy: { updatedAt: "asc" },
      include: {
        animal: true,
        mensagens: { orderBy: { dataEnvio: "asc" } }
      }
    });

    log("📤 Chats encontrados:", chats.length);

    res.status(200).json(chats);
  } catch (error) {
    errorLog("❌ Erro ao buscar chats:", error);
    res.status(400).json({ erro: "Erro ao buscar chats" });
  }
});


/**
 * 📌 GET /mensagem/:chatId
 * Retorna todas as mensagens de um chat
 */
router.get("/:chatId", verificaToken, async (req, res) => {
  const { chatId } = req.params;
  log("📥 GET /mensagem/", chatId);

  try {
    const mensagens = await prisma.mensagem.findMany({
      where: { chatId },
      orderBy: { dataEnvio: "asc" }
    });

    log(`📤 ${mensagens.length} mensagens retornadas do chat ${chatId}`);

    return res.status(200).json(mensagens);
  } catch (error) {
    errorLog("❌ Erro ao buscar mensagens:", error);
    return res.status(500).json({ erro: "Erro ao buscar mensagens." });
  }
});


/**
 * 📌 DELETE /mensagens/chat/:chatId
 * Deleta um chat e todas as suas mensagens
 */
router.delete("/chat/:chatId", verificaToken, async (req: any, res) => {
  const { chatId } = req.params;
  const userId = req.userLogadoId;

  try {
    
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) return res.status(404).json({ erro: "Chat não encontrado." });

    if (chat.participante1Id !== String(userId) && chat.participante2Id !== String(userId)) {
      return res.status(403).json({ erro: "Sem permissão para deletar este chat." });
    }

    await prisma.$transaction([
      prisma.mensagem.deleteMany({
        where: { chatId: chatId },
      }),
      prisma.chat.delete({
        where: { id: chatId },
      }),
    ]);

    res.status(200).json({ mensagem: "Chat e mensagens excluídos com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao deletar chat." });
  }
});
router.post("/", verificaToken, async (req: any, res) => {
  try {
    const remetenteId = String(req.userLogadoId);
    const { animalId, destinatarioId, conteudo } = req.body;

    log("📥 POST /mensagem");
    log("🟦 Remetente:", remetenteId);
    log("🟪 Destinatário:", destinatarioId);
    log("🐾 Animal ID:", animalId);
    log("💬 Conteúdo:", conteudo);

    if (!conteudo || !animalId || !destinatarioId) {
      warn("⚠ Dados faltando no body:", req.body);
      return res
        .status(400)
        .json({ erro: "Informe chatId, destinatarioId e conteudo." });
    }

    log("🔎 Buscando chat existente...");

    let chat = await prisma.chat.findFirst({
      where: {
        animalId,
        OR: [
          { participante1Id: remetenteId, participante2Id: destinatarioId },
          { participante1Id: destinatarioId, participante2Id: remetenteId }
        ]
      }
    });

    if (!chat) {
      log("🆕 Nenhum chat encontrado. Criando um novo...");

      chat = await prisma.chat.create({
        data: {
          animalId,
          participante1Id: remetenteId,
          participante2Id: destinatarioId
        }
      });

      log("📌 Chat criado:", chat.id);
    } else {
      log("📌 Chat já existente:", chat.id);
    }

    log("💬 Criando mensagem...");

    const mensagem = await prisma.mensagem.create({
      data: {
        conteudo,
        remetenteId,
        destinatarioId,
        animalId,
        chatId: chat.id
      },
    });

    log("📤 Mensagem criada com id:", mensagem.id);

    res.status(201).json({ mensagem, chat });
  } catch (error) {
    errorLog("❌ Erro ao criar mensagem:", error);
    res.status(400).json({ erro: "Erro ao criar mensagem" });
  }
});



/**
 * 📌 PATCH /mensagem/chat/:chatId/lida
 * Marca TODAS as mensagens como lidas nesse chat
 */
router.patch("/chat/:chatId/lida", verificaToken, async (req: any, res) => {
  const userId = String(req.userLogadoId);
  const { chatId } = req.params;

  log(`📥 PATCH /mensagem/chat/${chatId}/lida — ID do usuário:`, userId);

  try {
    const result = await prisma.mensagem.updateMany({
      where: {
        chatId,
        destinatarioId: userId,
        lida: false
      },
      data: { lida: true },
    });

    log("📤 Mensagens marcadas como lidas:", result.count);

    res.status(200).json({ mensagensAtualizadas: result.count });
  } catch (error) {
    errorLog("❌ Erro ao marcar como lida:", error);
    res.status(400).json({ erro: "Erro ao marcar como lida" });
  }
});


/**
 * 📌 GET /mensagem/nao-lidas
 * Retorna número total de mensagens não lidas
 */
router.get("/nao-lidas", verificaToken, async (req: any, res) => {
  const userId = String(req.userLogadoId);

  try {
    const count = await prisma.mensagem.count({
      where: {
        destinatarioId: userId,
        lida: false
      }
    });

    res.status(200).json({ naoLidas: count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ erro: "Erro ao buscar mensagens não lidas." });
  }
});

export default router;
