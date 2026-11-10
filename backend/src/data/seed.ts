import type { Article, Editoria, Highlight } from '@uol/shared';

/**
 * Seed em memória do Mini Portal UOL (§2.1 / §3.1).
 *
 * Derivado dos protótipos e carregado no boot da API — sem banco externo.
 * A forma segue os tipos de `shared/` (contrato único, somente leitura).
 */

/** As cinco editorias canônicas da sprint (§5.2). */
export const editorias: Editoria[] = [
  { id: 'geral', name: 'Notícias', slug: 'noticias', color: '#CB0003' },
  { id: 'esporte', name: 'Esportes', slug: 'esportes', color: '#005FFF' },
  { id: 'economia', name: 'Economia', slug: 'economia', color: '#1F7A1F' },
  { id: 'entretenimento', name: 'Entretenimento', slug: 'entretenimento', color: '#ED5709' },
  { id: 'tecnologia', name: 'Tecnologia', slug: 'tecnologia', color: '#6A1B9A' },
];

const img = (seed: string): string => `https://picsum.photos/seed/${seed}/800/450`;

interface Draft {
  title: string;
  summary: string;
  editoria: Article['editoria'];
  publishedAt: string;
}

const drafts: Draft[] = [
  // Notícias / Geral
  {
    title: 'Governo anuncia pacote de investimentos em infraestrutura urbana',
    summary: 'Recursos para mobilidade, saneamento e iluminação pública nas capitais ao longo de 2026.',
    editoria: 'noticias',
    publishedAt: '2026-11-10T09:00:00.000Z',
  },
  {
    title: 'Chuvas de novembro deixam cidades em alerta no Sudeste',
    summary: 'Defesa Civil orienta moradores de áreas de risco e monitora rios após frente fria.',
    editoria: 'noticias',
    publishedAt: '2026-11-10T07:30:00.000Z',
  },
  {
    title: 'Congresso retoma votação da reforma administrativa',
    summary: 'Relator apresenta parecer nesta semana; líderes negociam ajustes de última hora.',
    editoria: 'noticias',
    publishedAt: '2026-11-09T18:45:00.000Z',
  },
  {
    title: 'Capitais ampliam faixas exclusivas de ônibus',
    summary: 'Medida busca reduzir tempo de deslocamento e incentivar o transporte coletivo.',
    editoria: 'noticias',
    publishedAt: '2026-11-09T14:10:00.000Z',
  },
  {
    title: 'Sistema único de saúde amplia atendimento digital',
    summary: 'Novo aplicativo concentra agendamentos, exames e histórico do paciente.',
    editoria: 'noticias',
    publishedAt: '2026-11-08T11:20:00.000Z',
  },
  // Esportes
  {
    title: 'Brasileirão: rodada define confrontos diretos na briga pelo título',
    summary: 'Times de cima da tabela se enfrentam e podem mudar o rumo da competição.',
    editoria: 'esportes',
    publishedAt: '2026-11-10T08:15:00.000Z',
  },
  {
    title: 'Seleção convoca reforços para as próximas eliminatórias',
    summary: 'Treinador aposta em jovens para dar velocidade ao setor ofensivo.',
    editoria: 'esportes',
    publishedAt: '2026-11-09T20:00:00.000Z',
  },
  {
    title: 'Natação brasileira bate recorde sul-americano no revezamento',
    summary: 'Equipe melhora marca histórica e garante índice para o mundial.',
    editoria: 'esportes',
    publishedAt: '2026-11-09T16:30:00.000Z',
  },
  {
    title: 'Surfe: brasileiros avançam às semifinais em etapa decisiva',
    summary: 'Ondas consistentes favorecem o estilo ofensivo dos atletas do país.',
    editoria: 'esportes',
    publishedAt: '2026-11-08T19:05:00.000Z',
  },
  // Economia
  {
    title: 'Inflação desacelera e mercado revisa projeções para o trimestre',
    summary: 'Terceira queda consecutiva é puxada por alimentos e combustíveis, aliviando a economia doméstica.',
    editoria: 'economia',
    publishedAt: '2026-11-10T07:15:00.000Z',
  },
  {
    title: 'Bolsa opera em alta com expectativa sobre juros',
    summary: 'Investidores acompanham sinais do banco central e o cenário externo.',
    editoria: 'economia',
    publishedAt: '2026-11-10T06:50:00.000Z',
  },
  {
    title: 'Varejo registra crescimento nas vendas online',
    summary: 'Datas promocionais e entregas mais rápidas impulsionam o comércio digital.',
    editoria: 'economia',
    publishedAt: '2026-11-09T13:40:00.000Z',
  },
  {
    title: 'Dólar recua frente ao real após dados de emprego',
    summary: 'Mercado de trabalho aquecido melhora a percepção de risco do país.',
    editoria: 'economia',
    publishedAt: '2026-11-08T17:25:00.000Z',
  },
  {
    title: 'Setor de serviços cresce pelo quarto mês seguido',
    summary: 'Bares, restaurantes e turismo lideram a recuperação da atividade.',
    editoria: 'economia',
    publishedAt: '2026-11-08T10:00:00.000Z',
  },
  // Entretenimento
  {
    title: 'Festival de música anuncia line-up com atrações nacionais',
    summary: 'Evento ocupa três palcos e deve reunir público recorde no fim de semana.',
    editoria: 'entretenimento',
    publishedAt: '2026-11-10T10:00:00.000Z',
  },
  {
    title: 'Cinema brasileiro ganha destaque em mostra internacional',
    summary: 'Longas premiados representam o país em disputa por reconhecimento.',
    editoria: 'entretenimento',
    publishedAt: '2026-11-09T21:10:00.000Z',
  },
  {
    title: 'Séries nacionais dominam as mais assistidas do streaming',
    summary: 'Produções originais de suspense lideram audiência entre assinantes.',
    editoria: 'entretenimento',
    publishedAt: '2026-11-09T12:00:00.000Z',
  },
  {
    title: 'Musical inspirado em clássicos lota teatros do país',
    summary: 'Montagem tem trilha ao vivo e cenografia que recria cenários históricos.',
    editoria: 'entretenimento',
    publishedAt: '2026-11-08T21:30:00.000Z',
  },
  // Tecnologia
  {
    title: 'Empresas aceleram adoção de inteligência artificial no atendimento',
    summary: 'Assistentes virtuais reduzem filas e melhoram a resolução de chamados.',
    editoria: 'tecnologia',
    publishedAt: '2026-11-10T08:40:00.000Z',
  },
  {
    title: 'Nova geração de chips promete maior eficiência energética',
    summary: 'Fabricantes apostam em desempenho por watt para data centers.',
    editoria: 'tecnologia',
    publishedAt: '2026-11-09T15:00:00.000Z',
  },
  {
    title: 'Segurança digital vira prioridade para pequenas empresas',
    summary: 'Adoção de autenticação em dois fatores cresce entre negócios locais.',
    editoria: 'tecnologia',
    publishedAt: '2026-11-09T09:30:00.000Z',
  },
  {
    title: 'Conectividade rural avança com novas antenas',
    summary: 'Cobertura chega a regiões produtoras e amplia acesso a serviços digitais.',
    editoria: 'tecnologia',
    publishedAt: '2026-11-08T13:15:00.000Z',
  },
  {
    title: 'Carros elétricos ganham rede de recarga nas rodovias',
    summary: 'Postos de alta potência reduzem o tempo de abastecimento em viagens.',
    editoria: 'tecnologia',
    publishedAt: '2026-11-08T08:45:00.000Z',
  },
];

/** Artigos do portal, com `id` estável e `url` de leitura derivada. */
export const articles: Article[] = drafts.map((d, i) => {
  const id = `art-${i + 1}`;
  return {
    id,
    title: d.title,
    summary: d.summary,
    editoria: d.editoria,
    publishedAt: d.publishedAt,
    imageUrl: img(id),
    url: `/leitura/${id}`,
  };
});

/** Destaques da home, em ordem de posição; o `article` é resolvido em runtime. */
export const highlights: Highlight[] = [
  { articleId: 'art-1', position: 1, label: 'Destaque' },
  { articleId: 'art-10', position: 2, label: 'Economia' },
  { articleId: 'art-6', position: 3, label: 'Esportes' },
  { articleId: 'art-15', position: 4, label: 'Entretenimento' },
  { articleId: 'art-19', position: 5, label: 'Tecnologia' },
];

const byId = new Map(articles.map((a) => [a.id, a]));

/** Busca um artigo por `id` na base em memória. */
export function findArticle(id: string): Article | undefined {
  return byId.get(id);
}

/** Filtra artigos por slug de editoria; sem slug, devolve todos. */
export function listArticles(editoria?: string): Article[] {
  if (!editoria) return articles;
  return articles.filter((a) => a.editoria === editoria);
}
