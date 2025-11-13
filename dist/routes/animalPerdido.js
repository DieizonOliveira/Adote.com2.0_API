"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/animalPerdido.ts
const client_1 = require("@prisma/client");
const express_1 = require("express");
const verificaToken_1 = require("../middewares/verificaToken");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// GET /animalPerdido
router.get("/", async (req, res) => {
    try {
        const perdidos = await prisma.animalPerdido.findMany({
            include: {
                fotos: true,
                adotante: { select: { nome: true, email: true, fone: true } },
                especie: { select: { nome: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(perdidos);
    }
    catch (error) {
        res.status(400).json({ erro: "Erro ao listar animais perdidos", detalhes: error });
    }
});
// GET /animalPerdido/:id
router.get("/:id", async (req, res) => {
    try {
        const per = await prisma.animalPerdido.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                fotos: true,
                adotante: { select: { nome: true, email: true, fone: true } },
                especie: { select: { nome: true } },
            },
        });
        if (!per)
            return res.status(404).json({ erro: "Animal não encontrado" });
        res.status(200).json(per);
    }
    catch (error) {
        res.status(400).json({ erro: "Erro ao buscar animal", detalhes: error });
    }
});
// POST /animalPerdido
router.post("/", verificaToken_1.verificaToken, async (req, res) => {
    var _a;
    const { nome, descricao, tipoAnuncio, localizacao, contato, especieId, fotos, } = req.body;
    const adotanteId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // assumindo que o token adiciona req.user.id
    if (!nome || !tipoAnuncio) {
        return res.status(400).json({ erro: "Nome e tipoAnuncio são obrigatórios" });
    }
    try {
        const novo = await prisma.animalPerdido.create({
            data: {
                nome,
                descricao,
                tipoAnuncio,
                localizacao,
                contato,
                adotanteId,
                especieId: especieId ? Number(especieId) : null,
            },
        });
        // Cadastrar fotos se houver
        if (Array.isArray(fotos) && fotos.length > 0) {
            const fotosData = fotos.map((f) => {
                var _a;
                return ({
                    descricao: (_a = f.descricao) !== null && _a !== void 0 ? _a : "",
                    codigoFoto: f.codigoFoto,
                    animalPerdidoId: novo.id,
                });
            });
            await prisma.foto.createMany({ data: fotosData });
        }
        const novoComFotos = await prisma.animalPerdido.findUnique({
            where: { id: novo.id },
            include: { fotos: true, adotante: true, especie: true },
        });
        res.status(201).json(novoComFotos);
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ erro: "Erro ao criar anúncio", detalhes: error });
    }
});
// PATCH /animalPerdido/:id - atualizar (ex: marcar encontrado)
router.patch("/:id", verificaToken_1.verificaToken, async (req, res) => {
    const { id } = req.params;
    const { nome, descricao, tipoAnuncio, localizacao, contato, encontrado, especieId, } = req.body;
    try {
        const atualizado = await prisma.animalPerdido.update({
            where: { id: Number(id) },
            data: {
                ...(nome && { nome }),
                ...(descricao && { descricao }),
                ...(tipoAnuncio && { tipoAnuncio }),
                ...(localizacao && { localizacao }),
                ...(contato && { contato }),
                ...(especieId && { especieId: Number(especieId) }),
                ...(encontrado !== undefined
                    ? {
                        encontrado,
                        dataEncontrado: encontrado ? new Date() : null,
                    }
                    : {}),
            },
            include: { fotos: true, adotante: true, especie: true },
        });
        res.status(200).json(atualizado);
    }
    catch (error) {
        res.status(400).json({ erro: "Erro ao atualizar anúncio", detalhes: error });
    }
});
// DELETE /animalPerdido/:id
router.delete("/:id", verificaToken_1.verificaToken, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.foto.deleteMany({ where: { animalPerdidoId: Number(id) } });
        const excluido = await prisma.animalPerdido.delete({ where: { id: Number(id) } });
        res.status(200).json(excluido);
    }
    catch (error) {
        res.status(400).json({ erro: "Erro ao excluir anúncio", detalhes: error });
    }
});
exports.default = router;
