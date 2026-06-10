# Gimball AR - Protótipo

Protótipo navegável (mobile iOS) do app **Gimball** de visualização de plantas técnicas em AR via marcadores AprilTag.

## Páginas

| Arquivo | O que é |
|---|---|
| `index.html` | Login único + app do **Morador** (imóveis → plantas → câmera AprilTag → visualização AR) |
| `admin.html` | App do **Administrador** (CRUDs de usuários, construtoras, empreendimentos, imóveis, plantas + marcador, permissões) |

No login, use os botões **Morador** / **Administrador** para alternar entre os perfis.

## Rodando

É um site estático - não precisa de build nem servidor especial:

- **Local:** abra a pasta com qualquer servidor estático (ex.: `npx serve` ou a extensão Live Server do VS Code). Abrir o `index.html` direto pelo navegador (file://) também funciona na maioria dos casos.
- **GitHub Pages:** publique a raiz do repositório; o `index.html` vira a página inicial automaticamente e o admin fica em `/admin.html`.

> Dependências (React, Babel, Google Fonts) são carregadas via CDN - o site precisa de internet para renderizar.

## Estrutura

- `data.jsx`, `admin-data.jsx` - dados mockados (imóveis, plantas, usuários, permissões)
- `ui.jsx`, `admin-m-ui.jsx`, `icons.jsx` - componentes e ícones do design system
- `screens-*.jsx` - telas do morador (fluxo AR)
- `admin-m-*.jsx` - telas do admin
- `ios-frame.jsx` - moldura do iPhone
- `export/` - versões autônomas (arquivo único) para importar no Figma - pode ser removida do deploy

Protótipo: os dados são fictícios e as ações (salvar, remover, upload) são simuladas.
