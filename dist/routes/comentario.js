"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/comentario.ts
const client_1 = require("@prisma/client");
const express_1 = require("express");
const verificaToken_1 = require("../middewares/verificaToken");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// POST /comentario
router.post("/", verificaToken_1.verificaToken, async (req, res) => {
    const { texto, curtida, adotanteId, postComunidadeId } = req.body;
    if (!texto || !adotanteId)
        return res.status(400).json({ erro: "Informe texto e adotanteId" });
    try {
        const comentario = await prisma.comentario.create({
            data: {
                texto,
                curtida: curtida ? Number(curtida) : 0,
                adotanteId,
                postComunidadeId: postComunidadeId ? Number(postComunidadeId) : undefined
            },
            include: { adotante: true, postComunidade: true }
        });
        res.status(201).json(comentario);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
// PATCH /comentario/:id
router.patch("/:id", verificaToken_1.verificaToken, async (req, res) => {
    const { texto, curtida } = req.body;
    try {
        const atualizado = await prisma.comentario.update({
            where: { id: Number(req.params.id) },
            data: {
                ...(texto !== undefined ? { texto } : {}),
                ...(curtida !== undefined ? { curtida: Number(curtida) } : {})
            }
        });
        res.status(200).json(atualizado);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
// DELETE /comentario/:id
router.delete("/:id", verificaToken_1.verificaToken, async (req, res) => {
    try {
        const excluido = await prisma.comentario.delete({ where: { id: Number(req.params.id) } });
        res.status(200).json(excluido);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
exports.default = router;
