"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/fotos.ts
const client_1 = require("@prisma/client");
const express_1 = require("express");
const verificaToken_1 = require("../middewares/verificaToken");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// GET /fotos
router.get("/", async (req, res) => {
    try {
        const fotos = await prisma.foto.findMany({
            include: {
                animalNormal: true,
                animalPerdido: true
            },
            orderBy: { id: "desc" }
        });
        res.status(200).json(fotos);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
// GET /fotos/:id
router.get("/:id", async (req, res) => {
    try {
        const foto = await prisma.foto.findUnique({
            where: { id: Number(req.params.id) },
            include: { animalNormal: true, animalPerdido: true }
        });
        res.status(200).json(foto);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
// POST /fotos (protected)
router.post("/", verificaToken_1.verificaToken, async (req, res) => {
    const { descricao, codigoFoto, animalId, animalPerdidoId } = req.body;
    if (!codigoFoto)
        return res.status(400).json({ erro: "Informe codigoFoto" });
    if (!animalId && !animalPerdidoId) {
        return res.status(400).json({ erro: "Informe animalId ou animalPerdidoId" });
    }
    try {
        const foto = await prisma.foto.create({
            data: {
                descricao: descricao !== null && descricao !== void 0 ? descricao : "",
                codigoFoto,
                animalId: animalId ? Number(animalId) : undefined,
                animalPerdidoId: animalPerdidoId ? Number(animalPerdidoId) : undefined
            }
        });
        res.status(201).json(foto);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
// PATCH /fotos/:id - atualiza descricao ou vinculo
router.patch("/:id", verificaToken_1.verificaToken, async (req, res) => {
    const { descricao, animalId, animalPerdidoId } = req.body;
    try {
        const fotoAtualizada = await prisma.foto.update({
            where: { id: Number(req.params.id) },
            data: {
                ...(descricao !== undefined ? { descricao } : {}),
                ...(animalId !== undefined ? { animalId: Number(animalId) } : {}),
                ...(animalPerdidoId !== undefined ? { animalPerdidoId: Number(animalPerdidoId) } : {})
            }
        });
        res.status(200).json(fotoAtualizada);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
router.put("/:id", verificaToken_1.verificaToken, async (req, res) => {
    const { descricao, codigoFoto, animalId, animalPerdidoId } = req.body;
    if (!codigoFoto)
        return res.status(400).json({ erro: "Informe codigoFoto" });
    try {
        const fotoAtualizada = await prisma.foto.update({
            where: { id: Number(req.params.id) },
            data: {
                descricao: descricao !== null && descricao !== void 0 ? descricao : "",
                codigoFoto,
                ...(animalId !== undefined ? { animalId: Number(animalId) } : {}),
                ...(animalPerdidoId !== undefined ? { animalPerdidoId: Number(animalPerdidoId) } : {})
            }
        });
        res.status(200).json(fotoAtualizada);
    }
    catch (error) {
        res.status(400).json({ erro: "Não foi possível atualizar a foto.", detalhes: error });
    }
});
// DELETE /fotos/:id
router.delete("/:id", verificaToken_1.verificaToken, async (req, res) => {
    try {
        const foto = await prisma.foto.delete({ where: { id: Number(req.params.id) } });
        res.status(200).json(foto);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
exports.default = router;
