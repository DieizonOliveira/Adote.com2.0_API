"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
// const prisma = new PrismaClient()
const prisma = new client_1.PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'stdout',
            level: 'error',
        },
        {
            emit: 'stdout',
            level: 'info',
        },
        {
            emit: 'stdout',
            level: 'warn',
        },
    ],
});
prisma.$on('query', (e) => {
    console.log('Query: ' + e.query);
    console.log('Params: ' + e.params);
    console.log('Duration: ' + e.duration + 'ms');
});
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    try {
        const especies = await prisma.especie.findMany();
        res.status(200).json(especies);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
router.post("/", async (req, res) => {
    const { nome } = req.body;
    if (!nome) {
        res.status(400).json({ "erro": "Informe a espécie!" });
        return;
    }
    try {
        const especies = await prisma.especie.create({
            data: { nome }
        });
        res.status(201).json(especies);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const especies = await prisma.especie.delete({
            where: { id: Number(id) }
        });
        res.status(200).json(especies);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;
    if (!nome) {
        res.status(400).json({ "erro": "Informe a espécie!" });
        return;
    }
    try {
        const especie = await prisma.especie.update({
            where: { id: Number(id) },
            data: { nome }
        });
        res.status(200).json(especie);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
router.get("/lista/animais", async (req, res) => {
    try {
        const especies = await prisma.especie.findMany({
            include: {
                animais: true
            }
        });
        res.status(200).json(especies);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
exports.default = router;
