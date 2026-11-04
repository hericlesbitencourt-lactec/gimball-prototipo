# Gimball — protótipo navegável

React estático com três perfis: **Morador** em `index.html`, **Administrador** em `admin.html` e **Engenheiro** em `admin.html?perfil=engenheiro`. Sem backend, banco de dados ou build obrigatório.

## Executar

```sh
npm start
```

Abra http://localhost:4173, escolha o perfil (Administrador, Morador ou Engenheiro), preencha e-mail e senha e toque em **Entrar**. A escolha do perfil preenche os dados de exemplo; a senha inicial de exemplo é `demo1234`. O acesso confere os dados fictícios localmente, apresenta erros de credenciais e conta desativada e utiliza o cadastro correspondente ao e-mail informado. A recuperação de senha altera somente a senha fictícia dessa conta na sessão. O cadastro de usuários é exclusivo do Administrador.

A sessão de acesso expira após 30 minutos e também é encerrada se a conta for desativada, removida ou tiver o perfil alterado durante o uso. O retorno ao login explica o motivo e preserva os cadastros. Os endereços diretos dos perfis técnicos continuam disponíveis para apresentação, usando a conta de exemplo quando se alterna de perfil pela URL; isso não representa autorização segura.

Cadastros, vínculos, marcadores e permissões ficam no **sessionStorage da aba**, inclusive ao alternar perfis e recarregar. Uma nova sessão começa com os dados fictícios. Para reiniciar na mesma aba, remova as chaves `gimball-demo-v2`, `gimball-session-v1`, `gimball-access-notice` e `gimball-camera-permission` do sessionStorage e recarregue.

A tela **Meus dados** é acessível pelo avatar do Morador e em **Mais → Meus dados** no Administrador e Engenheiro. O cadastro é apenas para consulta, sem status da conta. A ação **Solicitar alteração** envia novos dados para análise, preservando o cadastro atual.

O Administrador analisa pedidos em **Solicitações cadastrais**, acessível em Início ou Mais. A tela compara dados atuais e solicitados e permite aprovar ou recusar, com motivo obrigatório na recusa. Mudanças de e-mail aguardam uma confirmação adicional em Meus dados antes da aplicação. A confirmação é uma etapa local de apresentação do fluxo; nenhum e-mail real é enviado. Solicitações persistem na sessão e alterações concorrentes no cadastro bloqueiam a aprovação para evitar sobrescritas.

A página inicial destaca pedidos pendentes para o Administrador e mostra ao solicitante o andamento, a aprovação ou o motivo da recusa. Confirmações usam modais centrais dentro do aparelho. Seleções com busca permanecem em painéis inferiores. Antes de abrir a prévia AR, a tela informa localização, ID e tamanho do marcador vinculado à planta.

Em **Plantas**, o filtro de situação permite encontrar os modelos pendentes. Carregar ou substituir um modelo exige uma nova liberação. O Administrador pode liberar e retirar a disponibilidade, com confirmação central; a liberação exige modelo, versão e marcador com localização. O Engenheiro pode preparar esses dados. A restrição de liberação ao Administrador é a regra adotada nesta versão, sujeita à validação do cliente.

A entrada na **Prévia AR** apresenta a solicitação de permissão da câmera. Recusar permite revisar a permissão ou voltar às plantas. A ação **A câmera não abre**, disponível antes da permissão e na ajuda, apresenta indisponibilidade e permite uma nova tentativa. A escolha da permissão é guardada na sessão da aba. Todo esse fluxo é ilustrativo: não solicita permissão ao navegador nem acessa a câmera do aparelho.

A **Política de privacidade** está disponível no login, em Meus dados e no menu Mais dos perfis técnicos. Conforme solicitado para a apresentação, utiliza lorem ipsum e está identificada como conteúdo ilustrativo. O texto oficial ainda depende da Gimball. Botões primários e ícones de ação usam branco sobre laranja mais escuro, mantendo o laranja original da marca nos demais destaques.

Os **Termos de uso** estão disponíveis nos mesmos locais e também usam conteúdo ilustrativo. No primeiro acesso, o aceite da Política de privacidade e dos Termos de uso é obrigatório e começa desmarcado. Abrir os documentos preserva as senhas digitadas e a escolha do usuário. A ativação registra, na sessão, a data e a versão ilustrativa de cada documento aceito. Sem os dois aceites, a conta permanece pendente e o convite continua disponível. Os campos de senha possuem botões de olho independentes no login, na recuperação e no primeiro acesso.

Novos usuários são cadastrados internamente com situação **Aguardando ativação**. O aviso **Convite enviado** oferece **Simular clique no e-mail**, que abre o primeiro acesso pelo endereço `index.html?convite=...`, sem opção de cadastro público ou entrada no menu. A tela exibe nome e e-mail para consulta, definição e confirmação da senha e acesso à política. Concluir confirma o e-mail, ativa a conta e invalida o convite; o usuário segue para o login com o próprio e-mail e perfil, digitando a senha escolhida.

Convites têm validade de 24 horas. O Administrador pode reenviá-los para contas pendentes; o novo link invalida o anterior. Editar o e-mail de uma conta pendente também gera outro convite. Desativar a conta impede a ativação e reativá-la preserva a necessidade de definir a senha. Contas ativas oferecem **Enviar recuperação de senha**. Convites inválidos, expirados e já utilizados têm estados próprios. Toda a entrega de e-mails e a validação do link são locais nesta etapa.

**Empreendimentos** utiliza uma lista contínua com nome, construtora, endereço, cidade e situação. Cada item permite editar o cadastro e consultar a contagem real de imóveis vinculados. A busca também encontra construtora, cidade e endereço.

React, ReactDOM, Babel e fontes usam CDN: é necessário acesso à internet. Sirva via HTTP; `file://` não é suportado pelo carregamento de JSX.

`npm start` e `npm test` versionam automaticamente os scripts e estilos locais para evitar mistura de arquivos antigos em cache. Ao usar outro servidor estático, execute `npm run assets:version` depois de alterar o código e antes de publicar.

## Validação

```sh
npm ci
npx playwright install chromium
npm test
```

A suíte abre um servidor estático, testa os três perfis, validações, persistência, exclusões, permissões e AR simulado. Verifica erros de JavaScript, console e requisições em cinco resoluções (320×568 a 1440×1000, incluindo paisagem). Capturas ficam em `test-results/`.

## Identidade e recursos

- Logo original, sem redesenho: [PNG local](assets/gimball-logo.png), obtido do [arquivo publicado pela Gimball](https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=crop/A1aPXGKMozfEzDyx/marca-semtag-AoPWK3DpbwuaRlE1.png).
- Favicon e ícone de atalho: cópias locais dos arquivos publicados no [site institucional](https://gimball.com.br/), usando o símbolo oficial em vez da logo horizontal.
- [Site oficial](https://gimball.com.br/): Montserrat, superfícies claras, grafite, laranja da marca e azul de apoio `#457B9D`. Cores de status e disciplinas são convenções do protótipo, sem representar um manual oficial.
- Foto ilustrativa local: [Unsplash](https://images.unsplash.com/photo-1497366811353-6870744d04b2), sem representar um imóvel cadastrado.

## Limites e decisões para a versão integrada

Para a versão integrada, está previsto consultar cidades pela API externa gratuita de Localidades do IBGE. Neste protótipo, o campo permanece manual.

Câmera, reconhecimento AprilTag, sobreposição espacial, envio de modelos, recuperação de senha e e-mails continuam **simulados**, com apresentação sem avisos repetitivos. Nenhuma credencial real é alterada e nenhum e-mail é enviado. As telas de AR permanecem identificadas como prévia; os desenhos dos marcadores não codificam IDs e não servem para impressão ou leitura técnica. A opacidade altera uma ilustração SVG, sem renderizador BIM/AR. Downloads e exportações indisponíveis não geram arquivos reais.

Permissões persistem na demonstração; vínculos, status do morador e acesso ao as-built filtram o app do morador. O acesso de exemplo do Engenheiro utiliza o cadastro de Rafael Nogueira. O perfil gerencia imóveis, plantas e marcadores, visualiza Projetado e As-built conforme a matriz e não acessa usuários, construtoras, empreendimentos ou permissões administrativas. Contas ativadas por convite utilizam a identidade do usuário cadastrado. Plantas restritas ao Administrador são filtradas. Essa separação no cliente é apenas navegacional, sem autenticação ou autorização segura.

Dependem do cliente: política final de acesso e aprovação de as-built; modelos BIM de referência e formatos aceitos; família, dimensões e posicionamento dos marcadores; precisão e calibração de AR. Integração com identidade, armazenamento e processamento de modelos fica para outra etapa.
