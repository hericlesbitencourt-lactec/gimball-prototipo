# Gimball — protótipo navegável

React estático com dois perfis: **Morador** em `index.html` e **Administrador** em `admin.html`. Sem backend, banco de dados ou build obrigatório.

## Executar

```sh
python3 -m http.server 4173
```

Abra http://localhost:4173. Use os campos preenchidos (senha `demo1234`) ou o acesso Administrador. A autenticação é simulada; não use credenciais reais.

Cadastros, vínculos, marcadores e permissões ficam no **sessionStorage da aba**, inclusive ao alternar perfis e recarregar. Uma nova sessão começa com os dados fictícios. Para reiniciar na mesma aba, remova apenas a chave `gimball-demo-v2` do sessionStorage e recarregue.

React, ReactDOM, Babel e fontes usam CDN: é necessário acesso à internet. Sirva via HTTP; `file://` não é suportado pelo carregamento de JSX.

## Validação

```sh
npm ci
npx playwright install chromium
npm test
```

A suíte abre um servidor estático, testa os dois perfis, validações, persistência, exclusões, permissões e AR simulado. Verifica erros de JavaScript, console e requisições em cinco resoluções (320×568 a 1440×1000, incluindo paisagem). Capturas ficam em `test-results/`.

## Identidade e recursos

- Logo original, sem redesenho: [PNG local](assets/gimball-logo.png), obtido do [arquivo publicado pela Gimball](https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=crop/A1aPXGKMozfEzDyx/marca-semtag-AoPWK3DpbwuaRlE1.png).
- [Site oficial](https://gimball.com.br/): Montserrat, superfícies claras, grafite, laranja da marca e azul de apoio `#457B9D`. Cores de status e disciplinas são convenções do protótipo, sem representar um manual oficial.
- Foto ilustrativa local: [Unsplash](https://images.unsplash.com/photo-1497366811353-6870744d04b2), sem representar um imóvel cadastrado.

## Limites e decisões para a versão integrada

Para a versão integrada, está previsto consultar cidades pela API externa gratuita de Localidades do IBGE. Neste protótipo, o campo permanece manual.

Câmera, reconhecimento AprilTag, sobreposição espacial, envio de modelos, recuperação de senha e downloads são **simulações identificadas na interface**. A recuperação inclui solicitação, aviso de envio, abertura simulada do link, nova senha e conclusão; nenhuma credencial real é alterada. Criar um usuário exibe o aviso de e-mail de confirmação enviado, também simulado. Os desenhos dos marcadores não codificam IDs e não servem para impressão ou leitura técnica. A opacidade altera uma ilustração SVG, sem renderizador BIM/AR.

Permissões persistem na demonstração; vínculos, status do morador e acesso ao as-built filtram o app do morador. Não há autorização segura no cliente. Os demais módulos permitem demonstrar a configuração da matriz, sem autenticação real por papel.

Dependem do cliente: política final de acesso e aprovação de as-built; modelos BIM de referência e formatos aceitos; família, dimensões e posicionamento dos marcadores; precisão e calibração de AR. Integração com identidade, armazenamento e processamento de modelos fica para outra etapa.
