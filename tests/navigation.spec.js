const { test, expect } = require('@playwright/test');
const top = p => p.locator('.layer[aria-hidden="false"]');
const back = async p => { await top(p).getByRole('button', { name: 'Voltar', exact: true }).click(); await p.waitForTimeout(500); };
async function admin(p) { await p.goto('/admin.html'); await expect(top(p).getByText('Gestão', { exact: true })).toBeVisible(); }
async function login(p) { await p.goto('/'); await p.getByRole('button', { name: 'Morador', exact: true }).click(); await p.getByRole('button', { name: 'Entrar', exact: true }).click(); await expect(p.getByText('Meus imóveis', { exact: true })).toBeVisible(); await expect(p.locator('.stagger')).toBeVisible(); }
test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  page.on('requestfailed', r => errors.push(r.url() + ' ' + r.failure()?.errorText));
  page.on('dialog', d => { errors.push('Diálogo nativo inesperado: ' + d.message()); d.dismiss(); });
  page._errors = errors;
});
test.afterEach(async ({ page }) => { expect(page._errors).toEqual([]); });

test('morador: login validado, falha de leitura, ajuda, AR e retorno', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Administrador', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Engenheiro', exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'E-mail', exact: true })).toBeVisible();
  await expect(page.getByLabel('Senha', { exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill('invalido');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Informe um e-mail válido.');
  await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill('marina.alves@email.com');
  await page.getByLabel('Senha', { exact: true }).fill('curta');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('pelo menos 8 caracteres');
  await page.getByRole('button', { name: 'Mostrar senha', exact: true }).click();
  await expect(page.getByLabel('Senha', { exact: true })).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Ocultar senha', exact: true }).click();
  await page.getByLabel('Senha', { exact: true }).fill('demo1234');
  await page.getByRole('button', { name: 'Morador', exact: true }).click();
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.getByRole('button').filter({ hasText: 'Residencial Aurora' }).click();
  await top(page).getByRole('button').filter({ hasText: 'Hidrossanitário' }).click();
  await top(page).getByRole('button', { name: 'Visualizar planta', exact: true }).click();
  await expect(top(page).getByText('Hall hidráulico, parede norte', { exact: true })).toBeVisible();
  await expect(top(page).getByText('tag36h11 · id 21 · 16,0 cm', { exact: true })).toBeVisible();
  await top(page).getByRole('button', { name: 'Não consigo ler o marcador' }).click();
  await expect(top(page).getByText('Não encontramos o marcador')).toBeVisible();
  await top(page).getByRole('button', { name: 'Tentar novamente' }).click();
  await top(page).getByRole('button', { name: 'Ajuda', exact: true }).click();
  await expect(top(page).getByText('O que é o AprilTag?')).toBeVisible();
  await top(page).getByRole('button', { name: 'Entendi' }).click();
  await top(page).getByRole('button', { name: 'Abrir prévia' }).click();
  await expect(top(page).getByText('Prévia AR · Modelo ilustrativo')).toBeVisible();
  await top(page).getByRole('slider').fill('0.4');
  await top(page).getByRole('button', { name: 'Ocultar modelo' }).click();
  await expect(top(page).getByRole('button', { name: 'Mostrar modelo' })).toBeVisible();
  await page.screenshot({ path: 'test-results/morador-ar.png' });
  await top(page).getByRole('button', { name: 'Fechar AR', exact: true }).click();
  await expect(top(page).getByText('Plantas disponíveis')).toBeVisible();
});

test('usuários: validação, criar, editar, recarregar e remover com confirmação', async ({ page }) => {
  await admin(page);
  await top(page).getByRole('button').filter({ hasText: 'Usuários' }).click();
  await top(page).getByRole('button', { name: 'Novo', exact: true }).click();
  await top(page).getByRole('button', { name: 'Criar', exact: true }).click();
  await expect(top(page).getByRole('alert')).toHaveText(['Informe o nome completo.', 'Informe um e-mail válido.']);
  await expect(top(page).getByLabel('Nome', { exact: true })).toBeFocused();
  await expect(top(page).getByLabel('Nome', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await top(page).getByLabel('Nome', { exact: true }).fill('Ana Teste');
  await top(page).getByLabel('E-mail', { exact: true }).fill('ana@example.com');
  await top(page).getByRole('button', { name: 'Criar', exact: true }).click();
  await expect(top(page).getByRole('heading', { name: 'E-mail de confirmação enviado' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(top(page).getByText('ana@example.com', { exact: true })).toBeVisible();
  await expect(top(page).getByText(/demonstração|dados fictícios/i)).toHaveCount(0);
  await page.screenshot({ path: 'test-results/usuario-confirmacao-enviada.png' });
  await top(page).getByRole('button', { name: 'Concluir', exact: true }).click();
  await expect(top(page).getByText('Ana Teste', { exact: true })).toBeVisible();
  await top(page).getByText('Ana Teste', { exact: true }).click();
  await top(page).getByLabel('Nome', { exact: true }).fill('Ana Revisada');
  await top(page).getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(top(page).getByText('Ana Revisada', { exact: true })).toBeVisible();
  await page.reload();
  await top(page).getByRole('button').filter({ hasText: 'Usuários' }).click();
  await top(page).getByText('Ana Revisada', { exact: true }).click();
  await top(page).getByRole('button', { name: 'Remover usuário' }).click();
  await expect(page.getByRole('dialog', { name: 'Remover usuário?' })).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(top(page).getByLabel('Nome', { exact: true })).toHaveValue('Ana Revisada');
  await top(page).getByRole('button', { name: 'Remover usuário' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Remover', exact: true }).click();
  await expect(top(page).getByText('Ana Revisada', { exact: true })).toHaveCount(0);
});

test('cadastros de construtora, empreendimento e imóvel mantêm vínculos', async ({ page }) => {
  await admin(page);
  await page.getByRole('button', { name: 'Mais', exact: true }).click();
  await top(page).getByRole('button', { name: 'Construtoras', exact: true }).click();
  await top(page).getByRole('button', { name: 'Nova', exact: true }).click();
  await top(page).getByLabel('Nome', { exact: true }).fill('Construtora Demo');
  await top(page).getByLabel('CNPJ', { exact: true }).fill('11222333000144');
  await top(page).getByLabel('Cidade', { exact: true }).fill('Curitiba');
  await top(page).getByRole('button', { name: 'Criar', exact: true }).click();
  await expect(top(page).getByText('Construtora Demo', { exact: true })).toBeVisible();
  await back(page);
  await top(page).getByRole('button', { name: 'Empreendimentos', exact: true }).click();
  await top(page).getByRole('button', { name: 'Novo', exact: true }).click();
  await top(page).getByLabel('Nome', { exact: true }).fill('Residencial Demo');
  await top(page).getByRole('button', { name: 'Construtora', exact: true }).click();
  await page.getByRole('dialog').getByText('Construtora Demo', { exact: true }).click();
  await top(page).getByLabel('Endereço', { exact: true }).fill('Rua das Flores, 100');
  await top(page).getByLabel('Cidade', { exact: true }).fill('Curitiba');
  await top(page).getByRole('button', { name: 'Criar', exact: true }).click();
  await expect(top(page).getByText('Residencial Demo', { exact: true })).toBeVisible();
  await back(page);
  await page.getByRole('button', { name: 'Imóveis', exact: true }).click();
  await top(page).getByRole('button', { name: 'Novo', exact: true }).click();
  await top(page).getByRole('button', { name: 'Empreendimento', exact: true }).click();
  await page.getByRole('dialog').getByRole('textbox', { name: 'Buscar empreendimento', exact: true }).fill('Residencial Demo');
  await page.getByRole('dialog').getByText('Residencial Demo', { exact: true }).click();
  await top(page).getByLabel('Identificação', { exact: true }).fill('Unidade 101');
  await top(page).getByLabel('Área (m²)', { exact: true }).fill('80');
  await top(page).getByLabel('Tipologia', { exact: true }).fill('2 dorm');
  await top(page).getByRole('button', { name: 'Criar', exact: true }).click();
  await expect(top(page).getByText('Unidade 101', { exact: true })).toBeVisible();
  await top(page).getByText('Unidade 101', { exact: true }).click();
  await top(page).getByRole('button', { name: 'Editar', exact: true }).click();
  await top(page).getByRole('button', { name: 'Empreendimento', exact: true }).click();
  const picker = page.getByRole('dialog', { name: 'Empreendimento', exact: true });
  const search = picker.getByRole('textbox', { name: 'Buscar empreendimento', exact: true });
  await expect(search).toHaveValue('');
  await search.fill('inexistente');
  await expect(picker.getByText('Nenhum resultado', { exact: true })).toBeVisible();
  await search.fill('patio');
  await picker.getByText('Edifício Pátio Cabral', { exact: true }).click();
  await expect(top(page).getByRole('button', { name: 'Empreendimento', exact: true })).toContainText('Edifício Pátio Cabral');
  await top(page).getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(top(page).getByText('Edifício Pátio Cabral', { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Imóveis', exact: true }).click();
  await top(page).getByText('Unidade 101', { exact: true }).click();
  await top(page).getByRole('button', { name: 'Editar', exact: true }).click();
  await expect(top(page).getByRole('button', { name: 'Empreendimento', exact: true })).toContainText('Edifício Pátio Cabral');
});

test('planta: upload simulado, marcador, edição, AR do admin', async ({ page }) => {
  await admin(page);
  await page.getByRole('button', { name: 'Plantas', exact: true }).click();
  await top(page).getByRole('button', { name: 'Enviar', exact: true }).click();
  await page.getByText('Usar modelo de exemplo').click();
  const upload = page.getByRole('dialog', { name: 'Enviar planta', exact: true });
  await upload.getByRole('button', { name: 'Imóvel', exact: true }).click();
  const picker = page.getByRole('dialog', { name: 'Imóvel', exact: true });
  const search = picker.getByRole('textbox', { name: 'Buscar imóvel ou empreendimento', exact: true });
  await search.fill('inexistente');
  await expect(picker.getByText('Nenhum resultado', { exact: true })).toBeVisible();
  await search.fill('0703');
  await expect(picker.getByText('Torre A · Apto 0703', { exact: true })).toBeVisible();
  await search.fill('vista verde');
  await picker.getByText('Casa 14', { exact: true }).click();
  await expect(upload.getByRole('button', { name: 'Imóvel', exact: true })).toContainText('Casa 14');
  await upload.getByRole('button', { name: 'Imóvel', exact: true }).click();
  await expect(search).toHaveValue('');
  await picker.getByRole('button', { name: 'Fechar', exact: true }).click();
  await upload.getByRole('button', { name: 'Enviar', exact: true }).click();
  await top(page).getByText('Hidrossanitário · Modelo técnico', { exact: true }).click();
  await expect(top(page).getByText('Casa 14', { exact: true })).toBeVisible();
  await top(page).getByRole('button', { name: 'Visualizar em AR', exact: false }).click();
  await expect(page.getByRole('status')).toContainText('gere um marcador');
  await top(page).getByRole('button', { name: 'Gerar marcador', exact: true }).click();
  await top(page).getByLabel('Localização', { exact: true }).fill('Hall norte');
  await top(page).getByRole('button', { name: 'Salvar', exact: true }).click();
  await top(page).getByText('Hidrossanitário · Modelo técnico', { exact: true }).click();
  await expect(top(page).getByLabel('Localização', { exact: true })).toHaveValue('Hall norte');
  await top(page).getByRole('button', { name: 'Visualizar em AR', exact: false }).click();
  await top(page).getByRole('button', { name: 'Abrir prévia' }).click();
  await expect(top(page).getByText('Prévia AR · Modelo ilustrativo')).toBeVisible();
  await back(page);
  await expect(top(page).getByLabel('Localização', { exact: true })).toHaveValue('Hall norte');
});

test('permissões persistem entre telas e limitam plantas do morador', async ({ page }) => {
  await admin(page);
  await page.getByRole('button', { name: 'Mais', exact: true }).click();
  await top(page).getByRole('button', { name: 'Permissões', exact: false }).click();
  await top(page).getByRole('button', { name: /^Morador/ }).click();
  await top(page).getByRole('switch', { name: 'Visualizar “Como foi construído”' }).click();
  await back(page);
  await top(page).getByRole('button', { name: /^Morador/ }).click();
  await expect(top(page).getByRole('switch', { name: 'Visualizar “Como foi construído”' })).toHaveAttribute('aria-checked', 'false');
  await login(page);
  await page.getByRole('button').filter({ hasText: 'Residencial Aurora' }).click();
  await top(page).getByRole('button').filter({ hasText: 'Hidrossanitário' }).click();
  await expect(top(page).getByText('Nenhuma planta liberada')).toBeVisible();
});

for (const size of [{width:320,height:568},{width:390,height:844},{width:430,height:932},{width:844,height:390},{width:1440,height:1000}]) {
  test(`layout ${size.width}x${size.height}: logo local e conteúdo sem overflow horizontal`, async ({ page }) => {
    await page.setViewportSize(size);
    await login(page);
    await expect(page.getByRole('img', { name: 'Gimball', exact: true })).toBeVisible();
    expect(await page.getByRole('img', { name: 'Gimball', exact: true }).evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/morador-${size.width}.png` });
    await admin(page);
    await page.getByRole('button', { name: 'Mais', exact: true }).click();
    await top(page).getByRole('button', { name: 'Construtoras', exact: true }).click();
    await top(page).getByRole('button', { name: 'Nova', exact: true }).click();
    await expect(top(page).getByLabel('Nome', { exact: true })).toBeVisible();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `test-results/admin-form-${size.width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test('vínculos entre perfis, planta pendente, busca vazia e exclusão bloqueada', async ({ page }) => {
  await admin(page);
  await top(page).getByRole('button').filter({ hasText: 'Usuários' }).click();
  await top(page).getByText('Marina Alves', { exact: true }).click();
  await top(page).getByRole('button', { name: 'Desvincular', exact: true }).first().click();
  await top(page).getByRole('button', { name: 'Salvar', exact: true }).click();
  await login(page);
  await expect(page.getByText('Residencial Aurora', { exact: true })).toHaveCount(0);
  await page.getByRole('button').filter({ hasText: 'Edifício Pátio Cabral' }).click();
  await top(page).getByRole('button').filter({ hasText: 'Estrutural' }).click();
  await expect(top(page).getByRole('button', { name: 'Aguardando liberação' })).toBeDisabled();
  await expect(top(page).getByRole('button', { name: 'Baixar modelo' })).toBeDisabled();
  await admin(page);
  await page.getByRole('button', { name: 'Mais', exact: true }).click();
  await top(page).getByRole('button', { name: 'Construtoras', exact: true }).click();
  await top(page).getByRole('textbox').fill('inexistente');
  await expect(top(page).getByText('Nenhuma construtora', { exact: true })).toBeVisible();
  await top(page).getByRole('button', { name: 'Limpar busca' }).click();
  await top(page).getByText('Construtora Teste', { exact: true }).click();
  await top(page).getByRole('button', { name: 'Remover construtora' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Remover', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Remova os vínculos');
  await expect(top(page).getByLabel('Nome', { exact: true })).toHaveValue('Construtora Teste');
});

test('morador sem vínculos apresenta estado vazio', async ({ page }) => {
  await admin(page);
  await page.evaluate(() => {
    const user = window.ADM_USERS.find(u => u.id === 'u1');
    window.Demo.save('ADM_USERS', user, { linked: [], units: 0 });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Morador', exact: true }).click();
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByText('Nenhum imóvel vinculado')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Falar com o suporte' })).toHaveAttribute('href', 'mailto:contato@gimball.com.br');
});

test('ações da conta: reenvio simulado, desativação e reativação persistem', async ({ page }) => {
  await admin(page);
  await top(page).getByRole('button').filter({ hasText: 'Usuários' }).click();
  await top(page).getByText('Marina Alves', { exact: true }).click();
  await expect(top(page).getByRole('button', { name: 'Status', exact: true })).toHaveCount(0);
  await expect(top(page).getByText('Ativo', { exact: true })).toBeVisible();
  await top(page).getByRole('button', { name: /^Reenviar e-mail de confirmação/ }).click();
  await expect(page.getByRole('dialog')).toContainText('marina.alves@email.com');
  await page.getByRole('dialog').getByRole('button', { name: 'Reenviar confirmação' }).click();
  await expect(page.getByRole('status')).toContainText('Instruções de confirmação reenviadas.');
  expect(await page.evaluate(() => !!window.ADM_USERS.find(u => u.id === 'u1').confirmationResentAt)).toBe(true);
  await top(page).getByRole('button', { name: 'Desativar usuário', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Desativar', exact: true }).click();
  await expect(top(page).getByText('Inativo', { exact: true })).toBeVisible();
  await expect(top(page).getByRole('button', { name: 'Reativar usuário', exact: true })).toBeVisible();
  await page.reload();
  await top(page).getByRole('button').filter({ hasText: 'Usuários' }).click();
  await top(page).getByText('Marina Alves', { exact: true }).click();
  await top(page).getByRole('button', { name: 'Reativar usuário', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reativar', exact: true }).click();
  await expect(top(page).getByText('Ativo', { exact: true })).toBeVisible();
  await expect(top(page).getByRole('button', { name: 'Desativar usuário', exact: true })).toBeVisible();
});

test('confirmação de exclusão fica dentro da moldura do iPhone', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await admin(page);
  await top(page).getByRole('button').filter({ hasText: 'Usuários' }).click();
  await top(page).getByText('Diego Prestes', { exact: true }).click();
  await top(page).getByRole('button', { name: 'Remover usuário', exact: true }).click();
  const modal = page.getByRole('dialog', { name: 'Remover usuário?' });
  await expect(modal).toBeVisible();
  const phone = await page.locator('.ios-device').boundingBox();
  const box = await modal.boundingBox();
  expect(Math.abs(box.y + box.height / 2 - phone.y - phone.height / 2)).toBeLessThan(2);
  await expect(modal.getByRole('button', { name: 'Cancelar', exact: true })).toBeFocused();
  expect(box.x).toBeGreaterThanOrEqual(phone.x);
  expect(box.x + box.width).toBeLessThanOrEqual(phone.x + phone.width + 1);
  expect(box.y + box.height).toBeLessThanOrEqual(phone.y + phone.height + 1);
  await page.screenshot({ path: 'test-results/confirmacao-iphone.png' });
  await page.keyboard.press('Escape');
  await expect(modal).toHaveCount(0);
  await expect(top(page).getByLabel('Nome', { exact: true })).toHaveValue('Diego Prestes');
});

for (const width of [320, 390]) {
  test(`recuperação de senha completa em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 320 ? 568 : 844 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Esqueci minha senha' }).click();
    await expect(page.getByRole('heading', { name: 'Esqueceu sua senha?' })).toBeVisible();
    await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill('invalido');
    await page.getByRole('button', { name: 'Enviar instruções' }).click();
    await expect(page.getByRole('alert')).toHaveText('Informe um e-mail válido.');
    await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill('teste@example.com');
    await page.getByRole('button', { name: 'Enviar instruções' }).click();
    await expect(page.getByRole('heading', { name: 'Confira seu e-mail' })).toBeVisible();
    await expect(page.getByText('teste@example.com', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Reenviar em/ })).toBeDisabled();
    await page.screenshot({ path: `test-results/recuperacao-enviada-${width}.png` });
    await page.getByRole('button', { name: 'Corrigir e-mail' }).click();
    await expect(page.getByRole('textbox', { name: 'E-mail', exact: true })).toHaveValue('teste@example.com');
    await page.getByRole('button', { name: 'Enviar instruções' }).click();
    await page.getByRole('button', { name: 'Continuar para nova senha' }).click();
    await page.getByLabel('Nova senha', { exact: true }).fill('curta');
    await page.getByRole('button', { name: 'Salvar nova senha' }).click();
    await expect(page.getByRole('alert')).toContainText('pelo menos 8');
    await page.getByLabel('Nova senha', { exact: true }).fill('nova12345');
    await page.getByLabel('Confirmar nova senha', { exact: true }).fill('diferente');
    await page.getByRole('button', { name: 'Salvar nova senha' }).click();
    await expect(page.getByRole('alert')).toHaveText('As senhas não coincidem.');
    await page.getByLabel('Confirmar nova senha', { exact: true }).fill('nova12345');
    await page.getByRole('button', { name: 'Salvar nova senha' }).click();
    await expect(page.getByRole('heading', { name: 'Senha redefinida' })).toBeVisible();
    await page.getByRole('button', { name: 'Voltar ao login' }).click();
    await expect(page.getByRole('textbox', { name: 'E-mail', exact: true })).toHaveValue('teste@example.com');
    await expect(page.getByLabel('Senha', { exact: true })).toHaveValue('nova12345');
    await page.getByRole('button', { name: 'Morador', exact: true }).click();
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page.getByText('Meus imóveis', { exact: true })).toBeVisible();
  });
}

test('recuperação permite voltar ao login sem enviar', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Esqueci minha senha' }).click();
  await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill('outro@example.com');
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Morador', exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'E-mail', exact: true })).toBeVisible();
  await expect(page.getByLabel('Senha', { exact: true })).toBeVisible();
});

test('construtoras podem ser pesquisadas ao adicionar e editar empreendimentos', async ({ page }) => {
  await admin(page);
  await page.evaluate(() => {
    for (let i = 0; i < 40; i++) window.ADM_CONSTRUTORAS.push({ id: 'busca-' + i, name: 'Construtora Horizonte ' + i, cnpj: '', city: 'Curitiba', state: 'PR' });
    window.ADM_CONSTRUTORAS.push({ id: 'apice', name: 'Construtora Ápice', cnpj: '11.222.333/0001-44', city: 'Curitiba', state: 'PR' });
    window.Demo.notify();
  });
  await page.getByRole('button', { name: 'Mais', exact: true }).click();
  await top(page).getByRole('button', { name: 'Empreendimentos', exact: true }).click();
  await top(page).getByRole('button', { name: 'Novo', exact: true }).click();
  await top(page).getByRole('button', { name: 'Construtora', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Construtora', exact: true });
  const search = dialog.getByRole('textbox', { name: 'Buscar construtora por nome ou CNPJ' });
  await search.fill('inexistente');
  await expect(dialog.getByText('Nenhum resultado', { exact: true })).toBeVisible();
  await search.fill('apice');
  await expect(dialog.getByText('Construtora Ápice', { exact: true })).toBeVisible();
  await search.fill('11222333000144');
  await dialog.getByText('Construtora Ápice', { exact: true }).click();
  await expect(top(page).getByRole('button', { name: 'Construtora', exact: true })).toContainText('Construtora Ápice');
  await top(page).getByRole('button', { name: 'Construtora', exact: true }).click();
  await expect(search).toHaveValue('');
  await dialog.getByRole('button', { name: 'Fechar', exact: true }).click();
  await top(page).getByLabel('Nome', { exact: true }).fill('Residencial Busca');
  await top(page).getByLabel('Endereço', { exact: true }).fill('Rua do Teste, 10');
  await top(page).getByLabel('Cidade', { exact: true }).fill('Curitiba');
  await top(page).getByRole('button', { name: 'Criar', exact: true }).click();
  await top(page).getByRole('button', { name: 'Ver imóveis de Residencial Busca', exact: true }).click();
  await expect(top(page).getByText('Este empreendimento ainda não tem imóveis cadastrados.')).toBeVisible();
  await top(page).getByRole('button', { name: 'Cadastrar imóvel', exact: true }).click();
  await expect(top(page).getByRole('button', { name: 'Empreendimento', exact: true })).toContainText('Residencial Busca');
  await back(page);
  await back(page);
  await top(page).getByRole('button', { name: 'Editar Residencial Busca', exact: true }).click();
  await top(page).getByRole('button', { name: 'Construtora', exact: true }).click();
  await search.fill('lume');
  await dialog.getByText('Incorporadora Lume', { exact: true }).click();
  await top(page).getByRole('button', { name: 'Salvar', exact: true }).click();
  await top(page).getByRole('button', { name: 'Editar Residencial Busca', exact: true }).click();
  await expect(top(page).getByRole('button', { name: 'Construtora', exact: true })).toContainText('Incorporadora Lume');
});

test('unidades dos cards refletem os cadastros e permitem abrir e cadastrar', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await admin(page);
  await page.getByRole('button', { name: 'Mais', exact: true }).click();
  await top(page).getByRole('button', { name: 'Empreendimentos', exact: true }).click();
  await expect(top(page).getByRole('button', { name: 'Ver imóveis de Residencial Aurora', exact: true })).toContainText('2');
  await top(page).getByRole('button', { name: 'Ver imóveis de Residencial Aurora', exact: true }).click();
  await expect(top(page).getByText('Torre B · Apto 1204', { exact: true })).toBeVisible();
  await expect(top(page).getByText('Unidade 802', { exact: true })).toHaveCount(0);
  await top(page).getByRole('button', { name: 'Novo', exact: true }).click();
  await expect(top(page).getByRole('button', { name: 'Empreendimento', exact: true })).toContainText('Residencial Aurora');
  await top(page).getByLabel('Identificação', { exact: true }).fill('Torre C · Apto 101');
  await top(page).getByLabel('Área (m²)', { exact: true }).fill('82');
  await top(page).getByLabel('Tipologia', { exact: true }).fill('2 dorm');
  await top(page).getByRole('button', { name: 'Criar', exact: true }).click();
  await expect(top(page).getByText('Torre C · Apto 101', { exact: true })).toBeVisible();
  await back(page);
  await expect(top(page).getByRole('button', { name: 'Ver imóveis de Residencial Aurora', exact: true })).toContainText('3');
  await page.screenshot({ path: 'test-results/empreendimentos-unidades-320.png' });
  await top(page).getByRole('button', { name: 'Editar Residencial Aurora', exact: true }).click();
  await top(page).getByRole('button', { name: /^Imóveis cadastrados/ }).click();
  await expect(top(page).getByText('Torre C · Apto 101', { exact: true })).toBeVisible();
});

test('meus dados: consulta, solicitação, aprovação e cancelamento da edição', async ({ page }) => {
  await admin(page);
  await page.getByRole('button', { name: 'Mais', exact: true }).click();
  await top(page).getByRole('button', { name: /Meus dados/ }).click();
  await expect(top(page).getByRole('textbox')).toHaveCount(0);
  await expect(top(page).getByText('Status da conta', { exact: true })).toHaveCount(0);
  await top(page).getByRole('button', { name: 'Solicitar alteração', exact: true }).click();
  await top(page).getByLabel('Nome', { exact: true }).fill('');
  await top(page).getByRole('button', { name: 'Enviar solicitação', exact: true }).click();
  await expect(top(page).getByRole('alert')).toHaveText('Informe o nome completo.');
  await expect(top(page).getByLabel('Nome', { exact: true })).toBeFocused();
  await back(page);
  await top(page).getByRole('button', { name: 'Solicitar alteração', exact: true }).click();
  await expect(top(page).getByLabel('Nome', { exact: true })).toHaveValue('Carla Bittencourt');
  await expect(top(page).locator('[aria-invalid="true"]')).toHaveCount(0);
  await expect(top(page).getByRole('alert')).toHaveCount(0);
  await top(page).getByLabel('Nome', { exact: true }).fill('Carla Revisada');
  await top(page).getByLabel('E-mail', { exact: true }).fill('marina.alves@email.com');
  await top(page).getByRole('button', { name: 'Enviar solicitação', exact: true }).click();
  await expect(top(page).getByRole('alert')).toContainText('Este e-mail já está cadastrado');
  await top(page).getByLabel('E-mail', { exact: true }).fill('carla.admin@gimball.com.br');
  await top(page).getByLabel('Telefone', { exact: true }).fill('(41) 99999-2222');
  await top(page).getByRole('button', { name: 'Enviar solicitação', exact: true }).click();
  await expect(top(page).getByText('Carla Bittencourt', { exact: true })).toBeVisible();
  await expect(top(page).getByText('Pendente de análise', { exact: true })).toBeVisible();
  await expect(top(page).getByRole('button', { name: 'Solicitar alteração', exact: true })).toHaveCount(0);
  await back(page);
  await top(page).getByRole('button', { name: /^Solicitações cadastrais/ }).click();
  await top(page).getByText('Carla Bittencourt', { exact: true }).click();
  await expect(top(page).getByText('Carla Revisada', { exact: true })).toBeVisible();
  await top(page).getByRole('button', { name: 'Aprovar alteração', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Aprovar', exact: true }).click();
  await expect(top(page).getByText('Nenhuma solicitação pendente')).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Mais', exact: true }).click();
  await top(page).getByRole('button', { name: /Meus dados/ }).click();
  await expect(top(page).getByText('(41) 99999-2222', { exact: true })).toBeVisible();
  await expect(top(page).getByText('Carla Revisada', { exact: true })).toBeVisible();
  await top(page).getByRole('button', { name: 'Solicitar alteração', exact: true }).click();
  await top(page).getByLabel('Nome', { exact: true }).fill('Não salvar');
  await back(page);
  await top(page).getByRole('button', { name: 'Solicitar alteração', exact: true }).click();
  await expect(top(page).getByLabel('Nome', { exact: true })).toHaveValue('Carla Revisada');
});

test('solicitação do morador exige aprovação e confirmação do novo e-mail', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await login(page);
  await top(page).getByRole('button', { name: 'Meus dados', exact: true }).click();
  await expect(top(page).getByRole('textbox')).toHaveCount(0);
  await expect(top(page).getByText('Status da conta', { exact: true })).toHaveCount(0);
  await top(page).getByRole('button', { name: 'Solicitar alteração', exact: true }).click();
  await top(page).getByLabel('Nome', { exact: true }).fill('Ana Residente');
  await top(page).getByLabel('E-mail', { exact: true }).fill('ana.residente@example.com');
  await top(page).getByLabel('Telefone', { exact: true }).fill('(41) 99999-3333');
  await top(page).getByRole('button', { name: 'Enviar solicitação', exact: true }).click();
  await expect(top(page).getByText('Pendente de análise', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/meus-dados-pendente-320.png' });
  expect(await page.evaluate(() => window.ADM_USERS.find(u => u.id === 'u1').email)).toBe('marina.alves@email.com');
  await back(page);
  await expect(top(page).getByRole('button', { name: /Alteração em análise/ })).toBeVisible();
  await admin(page);
  await expect(top(page).getByText('Aguardando sua análise', { exact: true })).toBeVisible();
  await top(page).getByRole('button', { name: /^Solicitações cadastrais/ }).click();
  await top(page).getByText('Marina Alves', { exact: true }).click();
  await expect(top(page).getByText('ana.residente@example.com', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/revisar-solicitacao-320.png' });
  await top(page).getByRole('button', { name: 'Aprovar alteração', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Aprovar', exact: true }).click();
  expect(await page.evaluate(() => window.ADM_USERS.find(u => u.id === 'u1').email)).toBe('marina.alves@email.com');
  await login(page);
  await expect(top(page).getByRole('button', { name: /Confirme seu novo e-mail/ })).toBeVisible();
  await top(page).getByRole('button', { name: 'Meus dados', exact: true }).click();
  await top(page).getByRole('button', { name: 'Confirmar novo e-mail', exact: true }).click();
  await expect(top(page).getByText('ana.residente@example.com', { exact: true })).toBeVisible();
  await top(page).getByRole('button', { name: 'Confirmar e-mail', exact: true }).click();
  await expect(top(page).getByText('Olá, Ana', { exact: true })).toBeVisible();
  await expect(top(page).getByRole('button', { name: /Alteração cadastral aprovada/ })).toBeVisible();
  expect(await page.evaluate(() => {
    const u = window.ADM_USERS.find(u => u.id === 'u1');
    return { role: u.role, status: u.status, linked: u.linked };
  })).toEqual({ role: 'morador', status: 'active', linked: ['i1', 'i3', 'i5'] });
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'E-mail', exact: true })).toHaveValue('ana.residente@example.com');
});

test('entrada apresenta os três acessos sem avisos repetitivos', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Administrador', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Morador', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Engenheiro', exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'E-mail', exact: true })).toBeVisible();
  await expect(page.getByLabel('Senha', { exact: true })).toBeVisible();
  await expect(page.getByText(/demonstração|dados fictícios|simulado/i)).toHaveCount(0);
  await page.screenshot({ path: 'test-results/acessos-320.png' });
  await page.getByRole('button', { name: 'Administrador', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'E-mail', exact: true })).toHaveValue('carla.admin@gimball.com.br');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(top(page).getByText('Gestão', { exact: true })).toBeVisible();
});

test('engenheiro: projetos, marcadores, AR e meus dados sem gestão administrativa', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Engenheiro', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'E-mail', exact: true })).toHaveValue('rafael.eng@gimball.com.br');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.waitForURL('**/admin.html?perfil=engenheiro', { waitUntil: 'domcontentloaded' });
  await expect(top(page).getByText('Área técnica', { exact: true })).toBeVisible();
  await expect(top(page).getByRole('button', { name: /^Usuários/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Mais', exact: true }).click();
  await expect(top(page).getByRole('button', { name: /Usuários|Construtoras|Empreendimentos|Permissões/ })).toHaveCount(0);
  await top(page).getByRole('button', { name: /Meus dados/ }).click();
  await expect(top(page).getByText('Rafael Nogueira', { exact: true })).toBeVisible();
  await expect(top(page).getByText('Engenheiro', { exact: true })).toBeVisible();
  await back(page);
  await page.getByRole('button', { name: 'Plantas', exact: true }).last().click();
  await top(page).getByText('Hidrossanitário · Projeto executivo', { exact: true }).first().click();
  await top(page).getByLabel('Nome', { exact: true }).fill('Projeto executivo revisado');
  await top(page).getByLabel('Localização', { exact: true }).fill('Hall de entrada');
  await top(page).getByRole('button', { name: 'Salvar', exact: true }).click();
  await top(page).getByText('Projeto executivo revisado', { exact: true }).click();
  await expect(top(page).getByLabel('Localização', { exact: true })).toHaveValue('Hall de entrada');
  await top(page).getByRole('button', { name: /^Visualizar em AR/ }).click();
  await top(page).getByRole('button', { name: 'Abrir prévia' }).click();
  await expect(top(page).getByText('Prévia AR · Modelo ilustrativo')).toBeVisible();
  await back(page);
  await back(page);
  await expect(top(page).getByText('Hidrossanitário · Pavimento tipo', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/engenheiro-plantas.png' });
});

test('engenheiro não vê plantas privativas nem projetos sem permissão', async ({ page }) => {
  await page.goto('/admin.html?perfil=engenheiro');
  await expect(top(page).getByText('Área técnica', { exact: true })).toBeVisible();
  await page.evaluate(() => {
    window.ADM_PLANTAS.find(p => p.id === 'p1').minRole = 'admin';
    window.Demo.notify();
  });
  await page.getByRole('button', { name: 'Plantas', exact: true }).click();
  await expect(top(page).getByText('Hidrossanitário · Pavimento tipo', { exact: true })).toHaveCount(0);
  await expect(top(page).getByText('Hidrossanitário · Projeto executivo', { exact: true }).first()).toBeVisible();
  await page.evaluate(() => {
    window.PERM_MATRIX['plantas.view_projeto'] = ['admin'];
    window.Demo.notify();
  });
  await expect(top(page).getByText('Hidrossanitário · Projeto executivo', { exact: true })).toHaveCount(0);
  await expect(top(page).getByText('Elétrico · Pavimento tipo', { exact: true })).toBeVisible();
});

for (const role of ['admin', 'engenheiro']) {
  test(`carregamento ${role} evita o estado antigo sem technicalPlants`, async ({ page }) => {
    const fs = require('node:fs');
    const path = require('node:path');
    const oldState = fs.readFileSync(path.join(__dirname, '..', 'demo-state.js'), 'utf8')
      .replace(/  window.canViewPlant[\s\S]*?  const status/, '  const status');
    let staleRequests = 0;
    // An obsolete response remains available at the old, unversioned URL.
    await page.route('**/demo-state.js', route => {
      staleRequests++;
      return route.fulfill({ status: 200, contentType: 'text/javascript', body: oldState });
    });
    const url = role === 'admin' ? '/admin.html' : '/admin.html?perfil=engenheiro';
    const heading = role === 'admin' ? 'Gestão' : 'Área técnica';
    await page.goto(url);
    await expect(top(page).getByText(heading, { exact: true })).toBeVisible();
    const versions = await page.locator('script[type="text/babel"][src]').evaluateAll(nodes =>
      nodes.map(node => new URL(node.src).searchParams.get('v')));
    expect(versions.every(v => /^[a-f0-9]{12}$/.test(v || ''))).toBe(true);
    expect(new Set(versions).size).toBe(1);
    expect(await page.evaluate(() => [typeof window.technicalPlants, typeof window.canViewPlant])).toEqual(['function', 'function']);
    await page.reload();
    await expect(top(page).getByText(heading, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Plantas', exact: true }).click();
    await expect(top(page).getByText('Hidrossanitário · Pavimento tipo', { exact: true })).toBeVisible();
    expect(staleRequests).toBe(0);
  });
}

test('recusa exige motivo e preserva o cadastro do engenheiro', async ({ page }) => {
  await page.goto('/admin.html?perfil=engenheiro');
  await page.getByRole('button', { name: 'Mais', exact: true }).click();
  await expect(top(page).getByRole('button', { name: /Solicitações cadastrais/ })).toHaveCount(0);
  await top(page).getByRole('button', { name: /Meus dados/ }).click();
  await top(page).getByRole('button', { name: 'Solicitar alteração', exact: true }).click();
  await top(page).getByLabel('Telefone', { exact: true }).fill('(41) 99999-0000');
  await top(page).getByRole('button', { name: 'Enviar solicitação', exact: true }).click();
  await admin(page);
  await top(page).getByRole('button', { name: /^Solicitações cadastrais/ }).click();
  await top(page).getByText('Rafael Nogueira', { exact: true }).click();
  await top(page).getByRole('button', { name: 'Recusar', exact: true }).click();
  await expect(top(page).getByRole('alert')).toHaveText('Informe o motivo da recusa.');
  await expect(top(page).getByLabel('Motivo da recusa', { exact: true })).toBeFocused();
  await top(page).getByLabel('Motivo da recusa', { exact: true }).fill('Confirme o DDD do telefone.');
  await top(page).getByRole('button', { name: 'Recusar', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Recusar', exact: true }).click();
  await expect(top(page).getByText('Nenhuma solicitação pendente')).toBeVisible();
  await page.goto('/admin.html?perfil=engenheiro');
  await expect(top(page).getByRole('button', { name: /Alteração cadastral recusada/ })).toContainText('Confirme o DDD do telefone.');
  await page.getByRole('button', { name: 'Mais', exact: true }).click();
  await top(page).getByRole('button', { name: /Meus dados/ }).click();
  await expect(top(page).getByText('(41) 99654-1180', { exact: true })).toBeVisible();
  await expect(top(page).getByText(/Confirme o DDD do telefone/)).toBeVisible();
  await expect(top(page).getByRole('button', { name: 'Solicitar alteração', exact: true })).toBeVisible();
});

test('aprovação não sobrescreve um cadastro que mudou durante a análise', async ({ page }) => {
  await admin(page);
  await page.evaluate(() => {
    window.Demo.requestProfileChange('u1', { name: 'Marina Nova', email: 'marina.alves@email.com', phone: '(41) 99812-4477' });
    const duplicate = window.Demo.requestProfileChange('u1', { name: 'Outra Marina', email: 'marina.alves@email.com', phone: '' });
    if (!duplicate.error) throw new Error('Solicitação duplicada aceita');
    window.Demo.save('ADM_USERS', window.ADM_USERS.find(u => u.id === 'u1'), { name: 'Marina Corrigida' });
  });
  await top(page).getByRole('button', { name: /^Solicitações cadastrais/ }).click();
  await top(page).getByText('Marina Corrigida', { exact: true }).click();
  await top(page).getByRole('button', { name: 'Aprovar alteração', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Aprovar', exact: true }).click();
  await expect(top(page).getByRole('alert')).toContainText('O cadastro mudou após a solicitação');
  expect(await page.evaluate(() => window.ADM_USERS.find(u => u.id === 'u1').name)).toBe('Marina Corrigida');
});

for (const config of [
  { role: 'morador', id: 'u1', width: 320, height: 568 },
  { role: 'admin', id: 'u3', width: 1440, height: 1000 },
  { role: 'engenheiro', id: 'u2', width: 390, height: 844 },
]) {
  test(`saída ${config.role}: modal centralizada, cancelamento e confirmação`, async ({ page }) => {
    await page.setViewportSize({ width: config.width, height: config.height });
    if (config.role === 'morador') await login(page);
    else {
      await page.goto(config.role === 'admin' ? '/admin.html' : '/admin.html?perfil=engenheiro');
      await page.getByRole('button', { name: 'Mais', exact: true }).click();
    }
    await page.evaluate(id => window.Demo.save('ADM_USERS', window.ADM_USERS.find(u => u.id === id), { phone: '(41) 99999-1234' }), config.id);
    const trigger = top(page).getByRole('button', { name: 'Sair', exact: true });
    await trigger.click();
    const modal = page.getByRole('dialog', { name: 'Sair do aplicativo?', exact: true });
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancelar', exact: true })).toBeFocused();
    const phone = await page.locator('.ios-device').boundingBox();
    const box = await modal.boundingBox();
    expect(Math.abs(box.x + box.width / 2 - phone.x - phone.width / 2)).toBeLessThan(2);
    expect(Math.abs(box.y + box.height / 2 - phone.y - phone.height / 2)).toBeLessThan(2);
    expect(box.x).toBeGreaterThan(phone.x);
    expect(box.y + box.height).toBeLessThan(phone.y + phone.height - 24);
    await modal.getByRole('heading').click();
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(modal).toHaveCount(0);
    await expect(trigger).toBeFocused();
    if (config.role === 'morador') {
      await trigger.click();
      await page.keyboard.press('Escape');
      await expect(modal).toHaveCount(0);
      await trigger.click();
      await modal.locator('..').click({ position: { x: 8, y: 8 } });
      await expect(modal).toHaveCount(0);
      await expect(top(page).getByText('Meus imóveis', { exact: true })).toBeVisible();
    }
    await trigger.click();
    await page.keyboard.press('Tab');
    await expect(modal.getByRole('button', { name: 'Sair', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(modal.getByRole('button', { name: 'Cancelar', exact: true })).toBeFocused();
    await page.screenshot({ path: `test-results/saida-modal-${config.role}.png` });
    await modal.getByRole('button', { name: 'Sair', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible();
    expect(await page.evaluate(id => window.ADM_USERS.find(u => u.id === id).phone, config.id)).toBe('(41) 99999-1234');
  });
}
