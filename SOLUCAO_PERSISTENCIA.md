# Solução de Persistência de Dados

## Como Funciona

A solução implementada garante que os dados cadastrados nos horários persistem entre logins e são compartilhados entre usuários da mesma escola.

### Componentes Principais

1. **DataManager.js** (`src/services/DataManager.js`)
   - Gerencia todos os dados com persistência via AsyncStorage
   - Carrega dados salvos ao iniciar a app
   - Salva modificações automaticamente
   - Fornece métodos simples para adicionar/remover alimentos

2. **GlobalContext.jsx** (atualizado)
   - Carrega dados do DataManager ao iniciar
   - Recarrega dados atualizados no login (importante para compartilhamento)
   - Disponibiliza funções `adicionarAlimento` e `removerAlimento` que salvam automaticamente

3. **Horarios.jsx** (atualizado)
   - Usa as novas funções do context que persistem dados
   - Mostra feedback de sucesso/erro ao usuário
   - Botão para remover alimentos

### Fluxo de Dados

```
1. Usuário abre a app
   └─> DataManager carrega dados salvos do AsyncStorage
   └─> Se não houver dados salvos, carrega do escola.json

2. Usuário faz login
   └─> GlobalContext recarrega dados atualizados do AsyncStorage
   └─> Isso garante que dados de outros usuários sejam sincronizados

3. Usuário adiciona alimento
   └─> Função adicionarAlimento do context é chamada
   └─> DataManager atualiza os dados
   └─> AsyncStorage salva os dados
   └─> Estado local é atualizado
   └─> Outros usuários verão os dados no próximo login

4. Usuário faz logout e login novamente
   └─> Dados persistidos são carregados
   └─> Todos os alimentos cadastrados ainda estão lá
```

### Como Usar

Para adicionar um novo método ou modificação de dados:

```javascript
// No context, adicionar algo como:
async function minhaFuncao(escolaId, params) {
  if (!allData) return false;

  const dadosAtualizados = await DataManager.meuMetodo(
    escolaId,
    params,
    allData
  );

  if (dadosAtualizados) {
    setAllData(dadosAtualizados);
    // Atualizar estado local conforme necessário
    return true;
  }
  return false;
}

// Depois, adicionar o método no DataManager:
async meuMetodo(escolaId, params, allData) {
  const dataCopy = JSON.parse(JSON.stringify(allData)); // Deep copy
  
  // Modificar dados...
  
  await this.saveData(dataCopy); // Salvar
  return dataCopy;
}
```

### Limitações Atuais

- Os dados são salvos localmente no dispositivo (AsyncStorage)
- Se você quiser sincronizar com múltiplos dispositivos, precisará de um backend
- Cada usuário/dispositivo tem sua própria cópia dos dados

### Para Implementar com Backend

Se no futuro quiser usar um servidor Node.js/Express:

1. Criar endpoints POST `/api/escola/:id/horario/:horarioId/alimento` (adicionar)
2. Criar endpoints DELETE `/api/escola/:id/horario/:horarioId/alimento/:index` (remover)
3. Substituir as chamadas do DataManager por chamadas fetch para o backend
4. Manter o AsyncStorage como cache local

## Exemplo de Uso no Componente

```javascript
// No Horarios.jsx ou qualquer outro componente
const { data, adicionarAlimento, removerAlimento } = React.useContext(GlobalContext);

// Adicionar alimento (já está implementado)
await adicionarAlimento(
  data.escola.id,
  horario.id,
  alimentoId,
  temperatura
);

// Remover alimento
await removerAlimento(
  data.escola.id,
  horario.id,
  index
);
```
