# 🚀 QUICK START - Primeiros Passos

## 1️⃣ Verificar Instalação (2 min)

```bash
# Verificar se tudo foi instalado
npm list @react-native-async-storage/async-storage

# Deve mostrar algo como:
# @react-native-async-storage/async-storage@1.x.x
```

## 2️⃣ Iniciar App (2 min)

```bash
# Terminal 1: Iniciar Expo
npm start

# Depois escolher:
# - Android: press 'a'
# - iOS: press 'i'
# - Web: press 'w'
```

## 3️⃣ Testar Fluxo Básico (5 min)

### Passo 1: Login
```
1. Abrir app
2. Entrar Matrícula: 1001
3. Entrar Código Escola: 1234
4. Clicar "Enviar"
```

### Passo 2: Adicionar Alimento
```
1. Ir para "Café da Manhã" (ou qualquer horário)
2. Clicar no dropdown "Selecione um alimento"
3. Escolher "Leite" (ou qualquer alimento)
4. Entrar temperatura: 65
5. Clicar "Enviar"
6. ✅ Ver mensagem "Sucesso"
```

### Passo 3: Testar Persistência
```
1. Fazer logout (ou fechar app)
2. Fazer login novamente (mesma matrícula + código)
3. Ir para "Café da Manhã"
4. ✅ Ver "Leite - 65°C" ainda lá!
```

### Passo 4: Testar Compartilhamento
```
1. Logout (Usuário A)
2. Login com matrícula diferente: 1002
3. Código escola: 1234 (MESMA ESCOLA)
4. Ir para "Café da Manhã"
5. ✅ Ver "Leite - 65°C" do Usuário A!
```

## 4️⃣ Ver Arquivos Criados (1 min)

```
src/services/DataManager.js ← Novo arquivo
src/context/GlobalContext.jsx ← Modificado
src/pages/Horarios.jsx ← Modificado
```

## 5️⃣ Se Tiver Problema (2 min)

### Erro: "AsyncStorage not found"
```bash
npm install @react-native-async-storage/async-storage
npm start # Reiniciar
```

### Alimento não salva
```
1. Verificar console (F12 ou Shake device)
2. Ver se tem erro em vermelho
3. Consultar TROUBLESHOOTING.md
```

### Alimento não persiste
```
1. Fazer logout E fechar app completamente
2. Abrir app e fazer login novamente
3. Se ainda não funcionar, limpar cache:
   npm start -- -c
```

## 6️⃣ Próximas Etapas

### Leitura Recomendada
```
□ COMECE_AQUI.md (1 min) ← Você está aqui
□ RESUMO_SOLUCAO.md (5 min)
□ EXEMPLOS_USO.js (10 min)
```

### Testes Recomendados
```
□ Teste Persistência (5 min)
□ Teste Compartilhamento (10 min)
□ Teste Remover Alimento (3 min)
□ CHECKLIST completo (30 min)
```

### Adicionar Funcionalidades
```
□ Ver EXEMPLOS_USO.js seção "4"
□ Criar novo método no DataManager
□ Adicionar função no GlobalContext
```

## 7️⃣ Fluxo Completo em 2 Minutos

```
npm start
  ↓
Login (1001 / 1234)
  ↓
Selecionar Café da Manhã
  ↓
Adicionar Leite - 65°C
  ↓
✅ Sucesso!
  ↓
Logout
  ↓
Login novamente
  ↓
✅ Leite ainda está lá!
```

## 8️⃣ Dúvidas Frequentes

**P: Preciso fazer mais alguma coisa?**
A: Não! Está tudo pronto. Basta testar.

**P: Funciona com Web?**
A: Sim, mas AsyncStorage pode ter limitações. Testar antes.

**P: E com Android/iOS?**
A: Sim! Melhor experiência, sem limitações.

**P: Como editar alimento já cadastrado?**
A: Veja EXEMPLOS_USO.js seção "4" para criar o método.

**P: Posso usar isso com Backend?**
A: Sim! Veja SOLUCAO_PERSISTENCIA.md - "Para Implementar com Backend"

## 9️⃣ Validar Tudo Funcionando

```javascript
// No app.js ou um componente qualquer, você pode adicionar:

import DataManager from "./services/DataManager";

const testPersistence = async () => {
  // Carregar dados
  const data = await DataManager.loadData();
  console.log("✅ Dados carregados:", data);
  
  // Verificar estrutura
  console.log("Escolas:", data.escolas.length);
  console.log("Alimentos Globais:", data.alimentosGlobais.length);
};

// Chamar ao iniciar app
useEffect(() => {
  testPersistence();
}, []);
```

Se ver os console.logs, está funcionando! ✅

## 🎯 Checklist Rápido

```
□ App inicia sem erro
□ Login funciona
□ Adicionar alimento funciona
□ Alimento aparece na lista
□ Persistência funciona (logout/login)
□ Compartilhamento funciona (outro usuário)
□ Remover alimento funciona
□ Tudo pronto para usar!
```

---

## 📞 Próximo Passo

**Pronto para começar?** 👉 Abra a app e siga os passos acima!

**Quer aprender mais?** 👉 Leia [README_DOCUMENTACAO.md](README_DOCUMENTACAO.md)

**Algo não funciona?** 👉 Consulte [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

**Tempo total**: ~20 minutos para entender e testar tudo ✅
