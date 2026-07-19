# 🗺️ MAPA VISUAL DA SOLUÇÃO

## Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                      APP (React Native)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐                ┌──────────────────────┐   │
│  │  Login.jsx   │───────────────→│  GlobalContext       │   │
│  └──────────────┘    handleLogin │  (StorageGlobal)     │   │
│                                   └──────────────────────┘   │
│                                    ↑           ↓             │
│                           loadData │           │ allData    │
│                                    │           ↓             │
│  ┌──────────────────┐   ┌─────────────────────────────┐    │
│  │  Horarios.jsx    │   │   DataManager.js            │    │
│  │ (adicionar/rem)  │──→│   (métodos de persistência) │    │
│  └──────────────────┘   └─────────────────────────────┘    │
│         ↑                            ↓                       │
│         │                      saveData                      │
│         └────────────────────────────────────────────────┐   │
│                                                          ↓   │
│         ┌──────────────────────────────────────────────────┐ │
│         │   AsyncStorage (persistência local)              │ │
│         │   storage_key: 'escola_data'                     │ │
│         └──────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         ↓
    📱 Dispositivo do Usuário
```

---

## Fluxo de Dados

### 1️⃣ Inicialização

```
App inicia
  ↓
StorageGlobal monta
  ↓
useEffect em GlobalContext
  ↓
DataManager.loadData()
  ↓
Busca em AsyncStorage
  ├─ Se encontrar: retorna dados salvos
  └─ Se não: retorna dados de escola.json
  ↓
setAllData com dados carregados
  ↓
App pronta ✅
```

### 2️⃣ Login

```
Usuário entra código + matrícula
  ↓
clica "Enviar"
  ↓
handleLogin(codigo, matricula)
  ↓
DataManager.loadData() ← Recarrega (importante!)
  ↓
Busca escola pelo código
Busca funcionário pela matrícula
  ↓
setData com dados da escola do usuário
  ↓
Navigate para Home
  ↓
Outros usuários logam depois sincronizam ✅
```

### 3️⃣ Adicionar Alimento

```
Horarios.jsx
  ↓
Usuário seleciona alimento + temperatura
  ↓
clica "Enviar"
  ↓
adicionarAlimentoHandler()
  ↓
adicionarAlimento(escolaId, horarioId, alimentoId, temp)
    ├─ Vem do GlobalContext
    ├─ Chama DataManager.adicionarAlimentoAHorario()
    │   ├─ Deep copy de allData
    │   ├─ Encontra escola pelo ID
    │   ├─ Encontra horário pelo ID
    │   ├─ Cria novo alimento
    │   ├─ Push na array alimentos
    │   └─ Salva via DataManager.saveData()
    └─ Atualiza allData
      ├─ Atualiza data.escola
      └─ Renderiza novamente
  ↓
Alert "Sucesso"
  ↓
Alimento aparece na lista ✅
```

### 4️⃣ Persistência (O Mágico!)

```
DataManager.saveData(data)
  ↓
AsyncStorage.setItem('escola_data', JSON.stringify(data))
  ↓
Dados salvos no dispositivo 💾
  ↓
[Usuário faz logout / fecha app]
  ↓
[Usuário abre app]
  ↓
App inicia
  ↓
useEffect em GlobalContext
  ↓
DataManager.loadData()
  ↓
AsyncStorage.getItem('escola_data')
  ↓
Encontra dados salvos
  ↓
Retorna os dados
  ↓
setAllData com dados persistidos
  ↓
Alimentos ainda estão lá! ✅
```

### 5️⃣ Sincronização entre Usuários

```
Usuário A
├─ Loga
├─ Adiciona alimento
├─ Dados salvos em AsyncStorage
└─ Faz logout

Usuário B (mesma escola)
├─ Loga
├─ handleLogin chama DataManager.loadData()
├─ Busca em AsyncStorage
├─ Encontra dados que Usuário A adicionou
├─ setData com todos os alimentos
└─ ✅ Vê o alimento de A na lista!
```

---

## Componentes e Responsabilidades

### GlobalContext.jsx
```
┌─ handleLogin(codigo, matricula)
│  └─ Recarrega dados do storage
│  └─ Encontra escola
│  └─ Encontra funcionário
│  └─ Atualiza data e allData
│
├─ adicionarAlimento(escolaId, horarioId, alimentoId, temp)
│  └─ Chama DataManager
│  └─ Atualiza allData
│  └─ Atualiza data
│  └─ Retorna true/false
│
├─ removerAlimento(escolaId, horarioId, alimentoIndex)
│  └─ Chama DataManager
│  └─ Atualiza allData
│  └─ Atualiza data
│  └─ Retorna true/false
│
└─ Provider values:
   ├─ data (escola do usuário)
   ├─ setData
   ├─ allData (todas as escolas)
   ├─ setAllData
   ├─ adicionarAlimento (função)
   ├─ removerAlimento (função)
   └─ ... outras
```

### DataManager.js
```
┌─ loadData()
│  └─ AsyncStorage.getItem('escola_data')
│  └─ Se encontrar JSON.parse
│  └─ Se não, retorna escola.json
│
├─ saveData(data)
│  └─ JSON.stringify(data)
│  └─ AsyncStorage.setItem('escola_data', ...)
│  └─ Retorna true/false
│
├─ adicionarAlimentoAHorario(escolaId, horarioId, ...)
│  ├─ Deep copy de allData
│  ├─ Encontra escola
│  ├─ Encontra horário
│  ├─ Cria novo alimento
│  ├─ Push na array
│  ├─ Salva com saveData()
│  └─ Retorna dataCopy
│
├─ removerAlimentoDeHorario(escolaId, horarioId, index)
│  ├─ Deep copy de allData
│  ├─ Encontra escola
│  ├─ Encontra horário
│  ├─ Splice do índice
│  ├─ Salva com saveData()
│  └─ Retorna dataCopy
│
└─ clearData()
   └─ Remove tudo de AsyncStorage
```

### Horarios.jsx
```
┌─ Usa GlobalContext (data, adicionarAlimento, removerAlimento)
│
├─ adicionarAlimentoHandler()
│  ├─ Valida inputs
│  ├─ Chama adicionarAlimento do context
│  ├─ Mostra Alert
│  └─ Limpa inputs
│
├─ removerAlimentoHandler(index)
│  ├─ Chama removerAlimento do context
│  ├─ Mostra Alert
│  └─ Lista atualiza
│
└─ Renderiza:
   ├─ Nome do horário
   ├─ Horários (início/fim)
   ├─ Dropdown de alimentos
   ├─ Input de temperatura
   ├─ Botão "Enviar"
   └─ Lista de alimentos com botão remover
```

---

## Estados

### data (específico do usuário logado)
```
{
  escola: {
    id: 1,
    nome: "EMEF Monte Verde",
    horarios: [
      {
        id: 1,
        nome: "Café da Manhã",
        alimentos: [
          { alimentoId: 1, temperatura: 65 }
        ]
      }
    ]
  },
  funcionario: { id, nome, matricula },
  alimentosGlobais: [...]
}
```

### allData (todas as escolas, sincronizado)
```
{
  alimentosGlobais: [...],
  escolas: [
    {
      id: 1,
      horarios: [
        {
          id: 1,
          alimentos: [
            { alimentoId: 1, temperatura: 65 }
          ]
        }
      ]
    },
    {
      id: 2,
      ...
    }
  ]
}
```

---

## Array Methods Utilizados

```javascript
// find() - encontrar um item
escolas.find(esc => esc.id === 1)
horarios.find(h => h.id === 1)

// map() - transformar array
escolas.map(esc => esc.id === escolaId ? {..., horarios: [...]} : esc)

// push() - adicionar item
alimentos.push(novoAlimento)

// splice() - remover item por índice
alimentos.splice(index, 1)

// findIndex() - encontrar índice
alimentos.findIndex(a => a.alimentoId === 1)
```

---

## De Memória para Persistência

```
ANTES                          DEPOIS
────────────────────────────────────────────

State em                       State +
memória                        AsyncStorage
   ↓                              ↓
   ├─ Dados ao                  ├─ Dados ao
   │  computador                │  computador
   │                            │
   ├─ Outros                    ├─ SALVOS
   │  usuários                  │  no disco
   │  não veem                  │
   │                            ├─ Outros
   └─ Logout                    │  usuários
      =                         │  veem ao
      perdido                   │  fazer login
                                │
                                └─ Logout
                                   =
                                   PERSISTE
```

---

## Sincronização Timeline

```
Timeline de 2 usuários mesma escola:

Usuário A               Usuário B
─────────────          ──────────
Login                  
Adiciona Leite         
Dados em               
AsyncStorage           
                       
                       Logout (anterior)
                       
Logout                 
                       Login ← Recarrega AsyncStorage
                       Vê Leite de A! ✅
```

---

## Fluxo de Erro

```
Erro ao salvar?
  ↓
DataManager.saveData() retorna false
  ↓
adicionarAlimento() retorna false
  ↓
Alert "Erro, não foi possível adicionar"
  ↓
Usuário tenta novamente
```

---

## Resumo Visual Rápido

```
┌────────┐
│  User  │
└───┬────┘
    │ login
    ↓
┌─────────────┐
│ GlobalCtx   │ ← Carrega dados do AsyncStorage
└─────────────┘
    ↑     ↓
    │     adicionarAlimento()
    │     │
    │     ↓
    │  ┌──────────────┐
    │  │ DataManager  │
    │  └──────────────┘
    │         │
    └─────────┤ saveData()
              ↓
      ┌───────────────┐
      │ AsyncStorage  │ ← Persiste dados
      └───────────────┘
```

---

**Entendeu o fluxo?** 🎉 Agora veja os exemplos em [EXEMPLOS_USO.js](EXEMPLOS_USO.js)!
