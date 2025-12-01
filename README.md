# Hackaton 402 - Frontend

Proyecto frontend desarrollado con React + TypeScript + Vite + Tailwind CSS.

## Tecnologías

- **React 19** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework CSS utility-first
- **ESLint** - Linting y formateo de código

## Características

- ⚡ **Vite** - Desarrollo rápido con HMR
- 🎨 **Tailwind CSS** - Estilos modernos y responsivos
- 📱 **Responsive** - Diseño adaptativo
- 🔧 **TypeScript** - Tipado fuerte
- 🛠️ **Path Aliases** - Imports organizados (@modules, @utils, @shared, @infra)

## Estructura del Proyecto

```
src/
├── modules/          # Módulos de la aplicación
├── utils/            # Utilidades y helpers
├── shared/           # Tipos y componentes compartidos
├── infrastructure/   # Configuración de infraestructura
├── assets/           # Recursos estáticos
└── main.tsx         # Punto de entrada
```

## Instalación

```bash
npm install
```

## Uso

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## Path Aliases

El proyecto utiliza aliases de path para mantener el código organizado:

- `@modules/*` → `src/modules/*`
- `@utils/*` → `src/utils/*`
- `@shared/*` → `src/shared/*`
- `@infra/*` → `src/infrastructure/*`

### Ejemplo de uso:

```typescript
import { formatDate } from '@utils';
import { User } from '@shared/types';
```

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
