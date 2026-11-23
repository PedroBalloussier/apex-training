# Apex

App de treino: plano montado pela triagem, troca de exercícios por equivalentes, registro de séries, progresso, Hall da Fama e Party entre amigos.

Nome de trabalho. Versão atual: **v0.5 (etapa 5: progresso, corpo, ciclo e relatório)**.

## Estrutura

```
index.html          ponto de entrada
manifest.json       instalação como app (PWA)
sw.js               cache offline
css/                tokens de tema (Emerald e Sunset, dark e light), layout e componentes
js/app.js           inicialização, navegação e estrutura (topbar, menu lateral, abas)
js/i18n/            textos em português (padrão) e inglês
js/data/store.js    dados locais (configurações)
js/data/supabase.js cliente Supabase (login e banco)
js/data/account.js  conta, perfil, triagens e planos
js/data/catalog.js  catálogo de exercícios
js/engine/          motor que gera os planos a partir da triagem
data/exercises.json catálogo (166 exercícios com etiquetas de equivalência)
supabase/schema.sql tabelas e regras de acesso do banco (etapa 2)
supabase/schema_etapa3.sql treinos e séries (etapa 3)
supabase/schema_etapa5.sql medidas corporais (etapa 5)
tools/              script que gera o catálogo
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
2. Cadastro, triagem, catálogo de exercícios e geração de planos (feito)
3. Hoje, Plano e Sessão (feito)
4. Exercício e Calendário (feito)
5. Dashboard, corpo, ciclo, relatório e nova triagem (feito)
6. Hall da Fama e banco de frases
7. Party
8. Verificação completa
