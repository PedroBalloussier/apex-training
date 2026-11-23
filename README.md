# Apex

App de treino: plano montado pela triagem, troca de exercícios por equivalentes, registro de séries, progresso, Hall da Fama e Party entre amigos.

Nome de trabalho. Versão atual: **v0.1 (etapa 1, fundação)**.

## Estrutura

```
index.html          ponto de entrada
manifest.json       instalação como app (PWA)
sw.js               cache offline
css/                tokens de tema (Emerald e Sunset, dark e light), layout e componentes
js/app.js           inicialização, navegação e estrutura (topbar, menu lateral, abas)
js/i18n/            textos em português (padrão) e inglês
js/data/store.js    camada de dados (local hoje, Supabase na etapa 2)
js/data/settings.js configurações do usuário
js/utils/units.js   conversão kg/lb e cm/in (armazenamento interno em kg e cm)
js/ui/              ícones, toasts e sheets
js/screens/         uma tela por arquivo
```

Sem frameworks e sem build: JavaScript puro em módulos, servido direto pelo GitHub Pages.

## Rodar localmente

```
python3 -m http.server 8000
```

Abra http://localhost:8000.

## Etapas

0. Conceito (feito)
1. Fundação (feito)
2. Cadastro, triagem, catálogo de exercícios e geração de planos
3. Hoje, Plano e Sessão
4. Exercício e Calendário
5. Dashboard, corpo, ciclo, relatório e nova triagem
6. Hall da Fama e banco de frases
7. Party
8. Verificação completa
