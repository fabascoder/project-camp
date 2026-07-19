# 🔧 TROUBLESHOOTING

## Problema: "Dados não persistem"

**Possível Causa**: AsyncStorage não inicializou a tempo

**Solução**:
1. Esperar a app carregar completamente
2. Verificar console para erros
3. Tentar limpar AsyncStorage (DataManager.clearData())
4. Reiniciar a app

---

## Problema: "Alimentos adicionados não aparecem para outro usuário"

**Possível Causa**: Outro usuário não fez login novamente

**Solução**:
- O outro usuário PRECISA fazer logout e login novamente para sincronizar
- Na função handleLogin, recarregamos os dados atualizados

---

## Problema: "Erro ao adicionar alimento"

**Possível Causa**: 
- AlertBox apareceu mas dados não salvaram
- Verificar estado do allData

**Debug**:
```javascript
// Adicione no Horarios.jsx temporariamente
console.log("allData:", allData);
console.log("escola.id:", data.escola?.id);
console.log("horario.id:", horario?.id);
```

---

## Problema: "AsyncStorage não encontrado"

**Possível Causa**: Dependência não instalada

**Solução**:
```bash
npm install @react-native-async-storage/async-storage
# ou
yarn add @react-native-async-storage/async-storage
```

---

## Problema: "Quer limpar todos os dados"

**Solução**: 
```javascript
import DataManager from "../services/DataManager";

// Em algum botão ou função
await DataManager.clearData();
console.log("Dados limpos!");
// Depois recarregar a app
```

---

## Problema: "Testar localmente sem vários usuários"

**Solução 1**: Usar dois navegadores / dois emuladores
```bash
# Terminal 1
npm start
expo start --web

# Terminal 2
npm start
expo start --android
# ou
expo start --ios
```

**Solução 2**: Simular com console
```javascript
// No app.js ou console
const { allData, setAllData } = useContext(GlobalContext);

// Adicionar um alimento manualmente
const novosDados = {
  ...allData,
  escolas: allData.escolas.map(esc =>
    esc.id === 1 ? {
      ...esc,
      horarios: esc.horarios.map(h =>
        h.id === 1 ? {
          ...h,
          alimentos: [...(h.alimentos || []), { alimentoId: 1, temperatura: 65 }]
        } : h
      )
    } : esc
  )
};

// Salvar
import DataManager from "./services/DataManager";
await DataManager.saveData(novosDados);
setAllData(novosDados);
```

---

## Problema: "Qual é a estrutura dos dados?"

```javascript
allData.escolas[0] = {
  id: 1,
  nome: "EMEF Monte Verde",
  codAcesso: 1234,
  horarios: [
    {
      id: 1,
      nome: "Café da Manhã",
      inicio: "07:30",
      fim: "08:30",
      alimentos: [
        { alimentoId: 1, temperatura: 65 },
        { alimentoId: 2, temperatura: 30 }
      ]
    }
  ]
}
```

---

## Problema: "Quero ver o que está sendo salvo"

**Solução**: Usar React DevTools ou console

```javascript
// No DataManager.js, adicione logging:
async saveData(data) {
  try {
    console.log("📝 Salvando dados:", JSON.stringify(data, null, 2));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    return false;
  }
}
```

---

## Problema: "Adicionar método customizado"

**Passo 1**: Adicionar no DataManager.js
```javascript
async meuMetodo(escolaId, params, allData) {
  const dataCopy = JSON.parse(JSON.stringify(allData));
  // ... modificar dataCopy ...
  await this.saveData(dataCopy);
  return dataCopy;
}
```

**Passo 2**: Adicionar no GlobalContext.jsx
```javascript
async function meuMetodo(escolaId, params) {
  if (!allData) return false;
  
  const dadosAtualizados = await DataManager.meuMetodo(
    escolaId,
    params,
    allData
  );
  
  if (dadosAtualizados) {
    setAllData(dadosAtualizados);
    return true;
  }
  return false;
}
```

**Passo 3**: Usar no componente
```javascript
const { meuMetodo } = useContext(GlobalContext);
await meuMetodo(data.escola.id, params);
```

---

## Problema: "Performance - muitos dados"

**Solução**: Deep copy é custoso

Para otimizar, você pode implementar caching:
```javascript
// Não refaz deep copy a cada operação
// Manter referência em memória e salvar ao final

let cachedData = null;

async function carregarDados() {
  cachedData = await loadData();
  return cachedData;
}

async function atualizarEm(funcao) {
  funcao(cachedData); // Modifica em memória
  await saveData(cachedData); // Salva depois
}
```

---

## Checklist de Teste

- [ ] Adicionar alimento
- [ ] Remover alimento  
- [ ] Logout e login
- [ ] Verificar persistência
- [ ] Dois usuários (mesma escola)
- [ ] Verificar compartilhamento
- [ ] Fechar app completamente
- [ ] Abrir e verificar dados
- [ ] Testar com Android/iOS/Web

---

## Contato/Dúvidas

Se encontrar algum bug:
1. Descrever o fluxo exato
2. Verificar console para erros
3. Tentar limpar dados
4. Testar em outro dispositivo/browser
