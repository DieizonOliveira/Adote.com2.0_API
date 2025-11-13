"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Rotas
const especies_1 = __importDefault(require("./routes/especies"));
const animais_1 = __importDefault(require("./routes/animais"));
const fotos_1 = __importDefault(require("./routes/fotos"));
const adotantes_1 = __importDefault(require("./routes/adotantes"));
const pedidos_1 = __importDefault(require("./routes/pedidos"));
const admins_1 = __importDefault(require("./routes/admins"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const adocoes_1 = __importDefault(require("./routes/adocoes"));
const acompanhamento_1 = __importDefault(require("./routes/acompanhamento"));
const vacinasAplicadas_1 = __importDefault(require("./routes/vacinasAplicadas"));
const comentario_1 = __importDefault(require("./routes/comentario"));
const mensagem_1 = __importDefault(require("./routes/mensagem"));
const postComunidade_1 = __importDefault(require("./routes/postComunidade"));
const animalPerdido_1 = __importDefault(require("./routes/animalPerdido"));
const app = (0, express_1.default)();
const port = 3004;
// Middlewares
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Rotas principais
app.use('/especies', especies_1.default);
app.use('/animais', animais_1.default);
app.use('/fotos', fotos_1.default);
app.use('/adotantes', adotantes_1.default);
app.use('/pedidos', pedidos_1.default);
app.use('/admins', admins_1.default);
app.use('/dashboard', dashboard_1.default);
app.use('/adocoes', adocoes_1.default);
app.use('/acompanhamento', acompanhamento_1.default);
app.use('/vacinas-aplicadas', vacinasAplicadas_1.default);
app.use('/comentarios', comentario_1.default);
app.use('/mensagens', mensagem_1.default);
app.use('/posts-comunidade', postComunidade_1.default);
app.use('/animais-perdidos', animalPerdido_1.default);
// Rota raiz
app.get('/', (req, res) => {
    res.send('🐾 API do Sistema de Canil rodando com sucesso!');
});
// Inicialização
app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta: ${port}`);
});
