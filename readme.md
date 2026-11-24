# Mercado Fácil

Aplicação full-stack para consulta de ofertas de supermercados (folheto digital), busca e ordenação, comparador de preços entre mercados, lista de compras inteligente com simulador de economia, mapa interativo com geolocalização e cadastro de produtos.

## Funcionalidades

- **Folheto interativo:** busca por nome/marca/descrição, filtros por categoria, mercado e *"Só promoções"*, além de ordenação por mais recentes, menor preço, maior preço e maior desconto.
- **Comparador de preços:** identifica automaticamente produtos equivalentes em mercados diferentes, destaca o selo *"Melhor preço"* e mostra a economia obtida.
- **Lista de compras inteligente (`/lista`):** persistida em `localStorage`, permite ajustar quantidades e simula tanto o custo da compra completa em um único mercado quanto o **Plano Econômico** (menor preço item a item).
- **Mapa com múltiplos mercados e geolocalização:** exibe todos os mercados simultaneamente com `InfoWindow` detalhado, calcula distâncias em km usando a localização do usuário e filtra ofertas ao clicar em um mercado.
- **Cadastro de produtos (`/cadastro`):** validação de preço/desconto, prévia do preço final e vínculo automático com mercados da API.

## Tecnologias

- **Frontend:** React 19, TypeScript, Vite, React Router v7, Google Maps JS API
- **Backend:** Node.js, Express 5, TypeScript, Mongoose (MongoDB), Zod v4, Helmet

## Estrutura do Projeto

```text
mercadofacil/
├── backend/                # API REST (Express + MongoDB)
│   ├── src/
│   │   ├── controllers/    # Regras de negócio (mercados e produtos)
│   │   ├── middlewares/    # Validação Zod e tratamento global de erros
│   │   ├── models/         # Schemas Mongoose (Mercado GeoJSON 2dsphere, Produto)
│   │   ├── routes/         # Rotas REST
│   │   ├── scripts/        # Seed inicial (seed.ts)
│   │   ├── validators/     # Schemas de entrada Zod
│   │   └── server.ts       # Ponto de entrada
│   └── .env.example
├── frontend/               # SPA React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── .env.example
└── package.json            # Scripts auxiliares da raiz
```

## Configuração

### 1. Instalar dependências

```bash
npm run install:all
```

### 2. Variáveis de ambiente

Copie os arquivos de exemplo e preencha suas credenciais:

- **Backend:** copie `backend/.env.example` para `backend/.env`
  ```env
  PORT=3000
  MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/mercadofacil
  CORS_ORIGIN=http://localhost:5173
  ```
- **Frontend:** copie `frontend/.env.example` para `frontend/.env`
  ```env
  VITE_API_URL=http://localhost:3000
  VITE_GOOGLE_MAPS_API_KEY=sua_chave_google_maps_aqui
  VITE_GOOGLE_MAPS_MAP_ID=
  ```

### 3. (Opcional) Popular dados iniciais

Com o `backend/.env` configurado, você pode criar os mercados e ofertas de exemplo com:

```bash
npm run seed:backend
```

## Executando localmente

Em dois terminais separados:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

## Scripts úteis

- `npm run build` — compila backend (`tsc`) e frontend (`tsc -b && vite build`)
- `npm run lint` — executa o ESLint no frontend
- `npm run seed:backend` — popula mercados e ofertas iniciais no MongoDB

## Endpoints da API

### Status
- `GET /` — informações básicas da API
- `GET /health` — status da API e conexão com o MongoDB

### Mercados
- `GET /mercados` — lista mercados (suporta `?busca=`, `?lat=&lng=&raioKm=10` por proximidade)
- `GET /mercados/:id` — busca um mercado por ID
- `POST /mercados` — cadastra um novo mercado (`nome`, `coordenadas: { lat, lng }`, `endereco`, `telefone`, `horarioFuncionamento`, `logoUrl`)
- `PUT /mercados/:id` e `PATCH /mercados/:id` — atualiza dados do mercado (sincroniza `nome` nos produtos vinculados)
- `DELETE /mercados/:id` — remove um mercado (retorna `409` se houver produtos vinculados)

### Produtos
- `GET /produtos` — lista paginada `{ dados, paginacao }` com suporte a:
  - `?busca=` (nome, descrição ou marca)
  - `?categoria=`
  - `?mercado=` ou `?mercadoId=`
  - `?apenasComDesconto=true`
  - `?ativos=true` (oculta ofertas vencidas)
  - `?ordenar=recentes|menor_preco|maior_preco|maior_desconto`
  - `?page=1&limit=50`
- `GET /produtos/:id` — detalhes de um produto (com dados do mercado vinculado)
- `POST /produtos` — cadastra um produto validado com Zod
- `PUT /produtos/:id` e `PATCH /produtos/:id` — atualiza um produto
- `DELETE /produtos/:id` — remove um produto
