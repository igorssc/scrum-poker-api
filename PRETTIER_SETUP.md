# Configuração do Prettier

Este projeto está configurado com **Prettier** para formatação automática de código, garantindo consistência de estilo em toda a base de código.

## 📋 Configuração

### Prettier
- **Arquivo de configuração**: `.prettierrc`
- **Arquivo de ignore**: `.prettierignore`
- **Plugin do Prisma**: `prettier-plugin-prisma`

### ESLint
- **Arquivo de configuração**: `eslint.config.js` (ESLint v9 flat config)
- **Integração com Prettier**: Configurado para trabalhar em conjunto

### Git Hooks (Husky + lint-staged)
- **Pre-commit hook**: Formata automaticamente arquivos staged antes do commit
- **Configuração**: `.husky/pre-commit` + `lint-staged` no `package.json`

## 🚀 Scripts Disponíveis

### Formatação
```bash
# Formatar todos os arquivos
npm run format

# Verificar se arquivos estão formatados
npm run format:check

# Formatar apenas arquivos staged (preparados para commit)
npm run format:staged

# Executar lint e format juntos
npm run lint:fix
```

### Lint
```bash
# Executar ESLint com correção automática
npm run lint
```

## 🔧 Regras de Formatação

### Configuração Atual (.prettierrc)
```json
{
  "semi": true,                    # Ponto e vírgula obrigatório
  "trailingComma": "all",         # Vírgula final em objetos/arrays
  "singleQuote": true,            # Aspas simples
  "printWidth": 80,               # Largura máxima da linha
  "tabWidth": 2,                  # Tamanho da indentação
  "useTabs": false,               # Usar espaços ao invés de tabs
  "bracketSpacing": true,         # Espaços dentro de chaves
  "bracketSameLine": false,       # Chave de fechamento em nova linha
  "arrowParens": "always",        # Parênteses sempre em arrow functions
  "endOfLine": "lf",              # Terminação de linha Unix
  "quoteProps": "as-needed",      # Aspas em propriedades apenas quando necessário
  "jsxSingleQuote": true,         # Aspas simples em JSX
  "proseWrap": "preserve"         # Não quebrar linhas em texto
}
```

### Arquivos Ignorados (.prettierignore)
- `node_modules/`
- `dist/`
- `*.log`
- `package-lock.json`
- Arquivos de configuração (tsconfig, eslint, etc.)
- Migrations do Prisma
- Arquivos do Docker
- E outros...

## 🔄 Automação

### Git Hooks
O projeto está configurado com **Husky** e **lint-staged** para:

1. **Pre-commit**: Antes de cada commit, automaticamente:
   - Executa ESLint com correção automática
   - Formata arquivos com Prettier
   - Apenas nos arquivos que estão sendo commitados (staged)

### Configuração do lint-staged
```json
{
  "src/**/*.ts": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.prisma": [
    "prettier --write"
  ]
}
```

## 💡 Dicas de Uso

### IDE Integration
Para melhor experiência, configure seu editor:

#### VS Code
Instale as extensões:
- **Prettier - Code formatter**
- **ESLint**

Configuração recomendada (settings.json):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Comandos Úteis
```bash
# Formatar um arquivo específico
npx prettier --write src/path/to/file.ts

# Verificar formatação sem alterar
npx prettier --check src/**/*.ts

# Executar ESLint em arquivo específico
npx eslint src/path/to/file.ts --fix
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Conflitos entre ESLint e Prettier**
   - A configuração já resolve conflitos automaticamente
   - Use `npm run lint:fix` para aplicar ambos

2. **Arquivos não sendo formatados**
   - Verifique se não estão no `.prettierignore`
   - Execute `npm run format` manualmente

3. **Hook de pre-commit não funcionando**
   - Reinstale hooks: `npx husky install`
   - Verifique permissões: `chmod +x .husky/pre-commit`

4. **Erro do ESLint v9**
   - O projeto usa a nova configuração flat config
   - Não use `.eslintrc.js`, use `eslint.config.js`