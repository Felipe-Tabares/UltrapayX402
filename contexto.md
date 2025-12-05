# Contexto del Proyecto - UltraPayx402

## Resumen General

**Nombre:** UltraPayx402
**Tipo:** Frontend para plataforma de generacion de contenido IA con micropagos
**Stack:** React 18 + TypeScript + Vite + Tailwind CSS v4
**Puerto de desarrollo:** 4000 (localhost:127.0.0.1)

---

## Descripcion del Proyecto

UltraPayx402 es una plataforma de micropagos para generacion profesional de imagenes y videos mediante IA. Reemplaza el modelo tradicional de suscripciones con un sistema de pago por prompt usando el protocolo x402.

### Problema que Resuelve
- Elimina suscripciones costosas e infrautilizadas
- Permite pagar solo por lo que se genera
- Democratiza el acceso a modelos IA de alta calidad

### Equipo
F3l1p3, ByParcero, AlejolR420, Daveit, Roypi

---

## Estructura del Proyecto

```
UltrapayX402/
├── src/
│   ├── App.tsx                    # Componente principal con gestion de estado
│   ├── main.tsx                   # Punto de entrada
│   ├── index.css                  # Estilos globales compilados
│   ├── components/
│   │   ├── Landing.tsx            # Pagina de inicio/bienvenida
│   │   ├── Dashboard.tsx          # Panel principal del usuario
│   │   ├── Generate.tsx           # Formulario de generacion de contenido
│   │   ├── Result.tsx             # Vista de resultado generado
│   │   ├── History.tsx            # Historial de generaciones
│   │   ├── Settings.tsx           # Configuracion de la cuenta
│   │   ├── Sidebar.tsx            # Menu lateral de navegacion
│   │   ├── Header.tsx             # Cabecera con saldo
│   │   ├── figma/                 # Componentes de Figma
│   │   └── ui/                    # Componentes UI (Radix UI/shadcn)
│   ├── shared/
│   │   └── types.ts               # Tipos compartidos
│   ├── utils/
│   │   └── index.ts               # Utilidades (formatDate, debounce)
│   └── styles/
│       └── globals.css            # Variables CSS y estilos base
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── to-do-frontend.md              # Especificaciones del backend
```

---

## Vistas de la Aplicacion (Views)

### 1. Landing (`/landing`)
- Pagina de bienvenida
- Muestra beneficios del servicio
- Boton "Conectar Wallet x402"
- Explicacion del flujo de uso

### 2. Dashboard (`/dashboard`)
- Panel principal despues de conectar wallet
- Muestra saldo disponible
- Accesos rapidos para crear imagen/video
- Estadisticas de gasto mensual
- Historial reciente (ultimas 5 generaciones)

### 3. Generate (`/generate`)
- Formulario para generar contenido
- Campos:
  - Prompt (textarea)
  - Modelo de IA (select)
  - Resolucion (select)
  - Duracion (solo para videos)
  - Estilo (select)
- Card con costo estimado
- Boton "Generar con micropago x402"

### 4. Result (`/result`)
- Muestra el contenido generado
- Acciones: Descargar, Regenerar, Compartir, Favoritos
- Sugerencias de re-prompts
- Detalles del contenido generado

### 5. History (`/history`)
- Tabla con todas las generaciones
- Filtros por tipo y modelo
- Resumen de estadisticas totales

### 6. Settings (`/settings`)
- Configuracion de cuenta
- Desconectar wallet
- Notificaciones y preferencias

---

## Modelos de IA Disponibles

| ID | Nombre | Tipo | Costo (x402) |
|---|---|---|---|
| sd35 | SD3.5 | image | 0.15 |
| veo3 | Veo 3 | video | 0.85 |
| runway | Runway Gen-3 | video | 1.20 |
| nanobanana | NanoBanana | image | 0.10 |
| midjourney | Midjourney | image | 0.20 |

---

## Tipos de Datos Principales

### GeneratedContent
```typescript
interface GeneratedContent {
  id: string;
  prompt: string;
  type: 'image' | 'video';
  model: string;
  date: string;
  cost: number;
  url: string;
}
```

### View Types
```typescript
type View = 'landing' | 'dashboard' | 'generate' | 'result' | 'history' | 'settings';
```

---

## API Backend (Endpoints a Integrar)

### Base URL
Se obtiene de Terraform output despues del deploy

### Endpoints

#### 1. GET /health
```json
Response: { "status": "ok", "service": "ultrapay-backend", "timestamp": "..." }
```

#### 2. GET /providers
```json
Response: { "providers": [{ "id": "nanobanana", "types": ["image"] }, ...] }
```

#### 3. GET /pricing
```json
Response: { "image": 0.05, "video": 0.25, "currency": "USD" }
```

#### 4. POST /generate
**Headers requeridos:**
- Content-Type: application/json
- X-Payment: <token de pago x402>

**Body:**
```json
{
  "prompt": "descripcion de la imagen/video",
  "type": "image" | "video",
  "provider": "nanobanana" | "veo3" | "sd35" | "runway" | "midjourney"
}
```

**Response exitosa (200):**
```json
{
  "success": true,
  "transactionId": "uuid",
  "mediaUrl": "https://s3...",
  "type": "image",
  "provider": "nanobanana"
}
```

**Response 402 (pago requerido):**
```json
{
  "error": "Payment required",
  "price": 0.05,
  "currency": "USD",
  "x402": {
    "X-Payment-Required": "true",
    "X-Payment-Amount": "0.05",
    "X-Payment-Recipient": "0x34033041a5944B8F10f8E4D8496Bfb84f1A293A8",
    "X-Facilitator-URL": "https://facilitator.ultravioletadao.xyz/"
  }
}
```

---

## Flujo de Pago x402

1. Frontend envia POST /generate sin header X-Payment
2. Backend responde 402 con datos de pago
3. Frontend usa SDK x402 buyer para procesar pago con wallet del usuario
4. Frontend reenvia POST /generate con header X-Payment conteniendo el token
5. Backend verifica, genera contenido y devuelve URL del resultado

### Recursos x402
- **Seller SDK:** https://x402.gitbook.io/x402/getting-started/quickstart-for-sellers
- **Buyer SDK:** https://x402.gitbook.io/x402/getting-started/quickstart-for-buyers
- **Facilitador:** https://facilitator.ultravioletadao.xyz/

### Wallets EVM
- **Mainnet:** 0x103040545AC5031A11E8C03dd11324C7333a13C7
- **Testnet:** 0x34033041a5944B8F10f8E4D8496Bfb84f1A293A8

---

## Dependencias Principales

### Core
- react: 18.3.1
- react-dom: 18.3.1
- typescript: 5.9.3

### UI Components (Radix UI)
- @radix-ui/react-* (multiples componentes)
- class-variance-authority
- clsx
- tailwind-merge
- lucide-react (iconos)

### Forms y Data
- react-hook-form
- recharts (graficos)

### Otros
- sonner (notificaciones)
- vaul (drawer)
- embla-carousel-react
- react-day-picker
- next-themes

---

## Configuracion de Desarrollo

### Scripts NPM
```bash
npm run dev      # Servidor de desarrollo (puerto 4000)
npm run build    # Build para produccion
npm run preview  # Preview del build
npm run lint     # Linting con ESLint
```

### Path Aliases
- `@modules` -> src/modules/
- `@utils` -> src/utils/
- `@shared` -> src/shared/
- `@infra` -> src/infrastructure/

### Variables CSS Principales (Tema Violeta)
```css
--primary: #7c3aed (violet-600)
--primary-foreground: #ffffff
--background: #faf8ff (violet muy claro)
--foreground: #1a1625 (oscuro con tinte violeta)
--secondary: #ede9fe (violet-100)
--secondary-foreground: #5b21b6 (violet-800)
--muted: #f3f0ff
--muted-foreground: #6b7280
--accent: #ddd6fe (violet-200)
--accent-foreground: #4c1d95 (violet-900)
--border: rgba(139, 92, 246, 0.15)
--ring: #8b5cf6 (violet-500)
--destructive: #dc2626
--radius: 0.625rem
```

---

## Estado Actual del Proyecto

### Completado
- [x] Estructura basica del proyecto
- [x] Componentes UI con Radix/shadcn
- [x] Vistas principales (Landing, Dashboard, Generate, Result, History, Settings)
- [x] Navegacion entre vistas
- [x] Diseño responsive
- [x] Sistema de colores y tipografia

### Pendiente (por integrar)
- [ ] Conexion real con wallet x402
- [ ] Integracion con API backend
- [ ] Flujo de pago real con x402
- [ ] Persistencia de datos (actualmente usa estado local con datos mock)
- [ ] Autenticacion real
- [ ] Manejo de errores de API
- [ ] Loading states reales para generacion

---

## Registro de Acciones

### 2025-12-05
- **Analisis inicial del proyecto:** Se leyo toda la estructura, componentes y configuracion
- **Creacion de contexto.md:** Documentacion completa del proyecto
- **Cambio de paleta de colores a tonos violetas:**
  - Actualizado `src/styles/globals.css` con nuevas variables CSS violetas
  - Primary: Negro (#030213) -> Violeta (#7c3aed)
  - Secondary: Gris -> Violeta claro (#ede9fe)
  - Background: Blanco -> Violeta muy claro (#faf8ff)
  - Componentes actualizados: Landing, Dashboard, Generate, Result, History, Sidebar, Header
  - Soporte para tema oscuro con tonos violetas

---

## Notas para Desarrollo Futuro

1. **Integracion x402:** Implementar el SDK buyer de x402 para manejar pagos reales
2. **Estado global:** Considerar usar Context o Zustand para manejo de estado mas complejo
3. **Routing:** El proyecto usa navegacion manual con useState; considerar React Router si crece
4. **Testing:** No hay tests implementados actualmente
5. **CI/CD:** No hay configuracion de deploy automatizado

---

*Este archivo se actualiza con cada sesion de desarrollo para mantener el contexto del proyecto.*
