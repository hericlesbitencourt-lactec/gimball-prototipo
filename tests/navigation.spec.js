const { test, expect } = require('@playwright/test');
const top = p => p.locator('.layer[aria-hidden="false"]');
const back = async p => { await top(p).getByRole('button', { name: 'Voltar', exact: true }).click(); await p.waitForTimeout(500); };
async function admin(p) { await p.goto('/admin.html'); await expect(top(p).getByText('Gestão', { exact: true })).toBeVisible(); }
async function login(p) { await p.goto('/'); await p.getByRole('button', { name: 'Entrar', exact: true }).click(); await expect(p.getByText('Meus imóveis', { exact: true })).toBeVisible(); await expect(p.locator('.stagger')).toBeVisible(); }
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
  await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill('invalido');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByText('Verifique seu e-mail e senha.')).toBeVisible();
  await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill('marina.alves@email.com');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.getByRole('button').filter({ hasText: 'Residencial Aurora' }).click();
  await top(page).getByRole('button').filter({ hasText: 'Hidrossanitário' }).click();
  await top(page).getByRole('button', { name: 'Visualizar planta', exact: true }).click();
  await top(page).getByRole('button', { name: 'Simular falha de leitura' }).click();
  await expect(top(page).getByText('Não encontramos o marcador')).toBeVisible();
  await top(page).getByRole('button', { name: 'Tentar novamente' }).click();
  await top(page).getByRole('button', { name: 'Ajuda', exact: true }).click();
  await expect(top(page).getByText('O que é o AprilTag?')).toBeVisible();
  await top(page).getByRole('button', { name: 'Entendi' }).click();
  await top(page).getByRole('button', { name: 'Simular reconhecimento' }).click();
  await expect(top(page).getByText('Demonstração · sobreposição ilustrativa')).toBeVisible();
  await top(page).getByRole('slider').fill('0.4');
  await top(page).getByRole('button', { name: 'Ocultar modelo' }).click();
  await expect(top(page).getByRole('button', { name: 'Mostrar modelo' })).toBeVisible();
  await page.screenshot({ path: 'test-results/morador-ar.png' });
  await top(page).getByRole('button', { name: 'Sair', exact: true }).click();
  await expect(top(page).getByText('Plantas disponíveis')).toBeVisible();
});

test('usuários: validação, criar, editar, recarregar e remover com confirmação', async ({ page }) => {
  await admin(page);
  await top(page).getByRole('button').filter({ hasText: 'Usuários' }).click();
  await top(page).getByRole('button', { name: 'Novo', exact: true }).click();
  await top(page).getByRole('button', { name: 'Criar', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Informe nome');
  await top(page).getByLabel('Nome', { exact: true }).fill('Ana Teste');
  await top(page).getByLabel('E-mail', { exact: true }).fill('ana@example.com');
  await top(page).getByRole('button', { name: 'Criar', exact: true }).click();
  await expect(top(page).getByRole('heading', { name: 'E-mail de confirmação enviado' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(top(page).getByText('ana@example.com', { exact: true })).toBeVisible();
  await expect(top(page).getByText('Demonstração: nenhum e-mail real foi enviado.')).toBeVisible();
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
  await page.getByRole('dialog').getByText('Residencial Demo', { exact: true }).click();
  await top(page).getByLabel('Identificação', { exact: true }).fill('Unidade 101');
  await top(page).getByLabel('Área (m²)', { exact: true }).fill('80');
  await top(page).getByLabel('Tipologia', { exact: true }).fill('2 dorm');
  await top(page).getByRole('button', { name: 'Criar', exact: true }).click();
  await expect(top(page).getByText('Unidade 101', { exact: true })).toBeVisible();
});

test('planta: upload simulado, marcador, edição, AR do admin', async ({ page }) => {
  await admin(page);
  await page.getByRole('button', { name: 'Plantas', exact: true }).click();
  await top(page).getByRole('button', { name: 'Enviar', exact: true }).click();
  await page.getByText('Usar arquivo de demonstração').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Enviar', exact: true }).click();
  await top(page).getByText('Hidrossanitário · Modelo de demonstração', { exact: true }).click();
  await top(page).getByRole('button', { name: 'Visualizar em AR', exact: false }).click();
  await expect(page.getByRole('status')).toContainText('gere um marcador');
  await top(page).getByRole('button', { name: 'Gerar marcador', exact: true }).click();
  await top(page).getByLabel('Localização', { exact: true }).fill('Hall norte');
  await top(page).getByRole('button', { name: 'Salvar', exact: true }).click();
  await top(page).getByText('Hidrossanitário · Modelo de demonstração', { exact: true }).click();
  await expect(top(page).getByLabel('Localização', { exact: true })).toHaveValue('Hall norte');
  await top(page).getByRole('button', { name: 'Visualizar em AR', exact: false }).click();
  await top(page).getByRole('button', { name: 'Simular reconhecimento' }).click();
  await expect(top(page).getByText('Demonstração · sobreposição ilustrativa')).toBeVisible();
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
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByText('Nenhum imóvel vinculado')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Falar com o suporte' })).toHaveAttribute('href', 'mailto:contato@gimball.com.br');
});

test('ações da conta: reenvio simulado, desativação e reativação persistem', async ({ page }) => {
  await admin(page);
  await top(page).getByRole('button').filter({ hasText: 'Usuários' }).click();
  await top(page).getByText('Marina Alves', { exact: true }).click();
  await top(page).getByRole('button', { name: /^Reenviar e-mail de confirmação/ }).click();
  await expect(page.getByRole('dialog')).toContainText('marina.alves@email.com');
  await page.getByRole('dialog').getByRole('button', { name: 'Simular reenvio' }).click();
  await expect(page.getByRole('status')).toContainText('Nenhum e-mail foi enviado');
  expect(await page.evaluate(() => !!window.ADM_USERS.find(u => u.id === 'u1').confirmationResentAt)).toBe(true);
  await top(page).getByRole('button', { name: 'Desativar usuário', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Desativar', exact: true }).click();
  await expect(top(page).getByRole('button', { name: 'Reativar usuário', exact: true })).toBeVisible();
  await page.reload();
  await top(page).getByRole('button').filter({ hasText: 'Usuários' }).click();
  await top(page).getByText('Marina Alves', { exact: true }).click();
  await top(page).getByRole('button', { name: 'Reativar usuário', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reativar', exact: true }).click();
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
    await page.getByRole('button', { name: 'Simular abertura do link' }).click();
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
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page.getByText('Meus imóveis', { exact: true })).toBeVisible();
  });
}

test('recuperação permite voltar ao login sem enviar', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Esqueci minha senha' }).click();
  await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill('outro@example.com');
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'E-mail', exact: true })).toHaveValue('marina.alves@email.com');
});
