// EXEMPLOS DE USO DA NOVA SOLUÇÃO

// ============================================
// 1. EM QUALQUER COMPONENTE - Acessar dados persistidos
// ============================================

import React from "react";
import { GlobalContext } from "../context/GlobalContext";

export const MeuComponente = () => {
  const { data, allData } = React.useContext(GlobalContext);

  return (
    <>
      {/* data.escola - dados da escola do usuário logado */}
      <Text>Escola: {data.escola?.nome}</Text>

      {/* allData - todos os dados de todas as escolas (sincronizados) */}
      <Text>Total de escolas: {allData?.escolas?.length}</Text>
    </>
  );
};

// ============================================
// 2. ADICIONAR ALIMENTO (já implementado em Horarios.jsx)
// ============================================

const { adicionarAlimento } = React.useContext(GlobalContext);

// Chamar a função (ela salva automaticamente no AsyncStorage)
const sucesso = await adicionarAlimento(
  data.escola.id,        // ID da escola
  horario.id,            // ID do horário
  alimentoId,            // ID do alimento
  temperatura            // Temperatura do alimento
);

if (sucesso) {
  // Alimento foi adicionado e persistido
  // Outros usuários da mesma escola verão isso no próximo login
}

// ============================================
// 3. REMOVER ALIMENTO (já implementado em Horarios.jsx)
// ============================================

const { removerAlimento } = React.useContext(GlobalContext);

const sucesso = await removerAlimento(
  data.escola.id,        // ID da escola
  horario.id,            // ID do horário
  alimentoIndex          // Index do alimento na array
);

// ============================================
// 4. ADICIONAR NOVO MÉTODO CUSTOMIZADO
// ============================================

// Passo 1: Adicionar método no DataManager (src/services/DataManager.js)
/*
  async atualizarTemperaturaAlimento(escolaId, horarioId, alimentoIndex, novaTemperatura, allData) {
    const dataCopy = JSON.parse(JSON.stringify(allData));
    
    const escola = dataCopy.escolas.find((esc) => esc.id === escolaId);
    if (!escola) return null;

    const horario = escola.horarios.find((h) => h.id === horarioId);
    if (!horario || !horario.alimentos || !horario.alimentos[alimentoIndex]) return null;

    // Atualizar temperatura usando array method
    horario.alimentos[alimentoIndex].temperatura = novaTemperatura;

    await this.saveData(dataCopy);
    return dataCopy;
  }
*/

// Passo 2: Adicionar função no GlobalContext (src/context/GlobalContext.jsx)
/*
  async function atualizarTemperatura(escolaId, horarioId, alimentoIndex, novaTemperatura) {
    if (!allData) return false;

    const dadosAtualizados = await DataManager.atualizarTemperaturaAlimento(
      escolaId,
      horarioId,
      alimentoIndex,
      novaTemperatura,
      allData
    );

    if (dadosAtualizados) {
      setAllData(dadosAtualizados);
      const escolaAtualizada = dadosAtualizados.escolas.find(
        (esc) => esc.id === escolaId
      );
      setData((prev) => ({
        ...prev,
        escola: escolaAtualizada,
      }));
      return true;
    }
    return false;
  }
*/

// ============================================
// 5. COMO TESTAR
// ============================================

/*
TESTE 1: Persistência de dados
1. Abrir app
2. Logar
3. Adicionar alimento
4. Fechar app completamente
5. Abrir app e logar novamente
6. Verificar se alimento ainda está lá ✓

TESTE 2: Compartilhamento entre usuários
1. Usuário A logar e adicionar alimento
2. Usuário A fazer logout
3. Usuário B (mesma escola) fazer login
4. Verificar se alimento de A está visível para B ✓

TESTE 3: Sincronização ao logar
1. Dados podem ser adicionados offline
2. Ao fazer login, dados são sincronizados
3. Todos veem a mesma versão ✓
*/

// ============================================
// 6. ESTRUTURA DE DADOS
// ============================================

/*
allData = {
  alimentosGlobais: [
    { id: 1, nome: "Leite" },
    { id: 2, nome: "Pão" },
    ...
  ],
  escolas: [
    {
      id: 1,
      nome: "EMEF Monte Verde",
      codAcesso: 1234,
      funcionarios: [...],
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
  ]
}
*/

// ============================================
// 7. MÉTODOS DISPONÍVEIS NO DATAMANAGER
// ============================================

/*
DataManager.loadData()                    // Carrega dados salvos
DataManager.saveData(data)                // Salva dados
DataManager.adicionarAlimentoAHorario()   // Adiciona alimento
DataManager.removerAlimentoDeHorario()    // Remove alimento
DataManager.clearData()                   // Limpa tudo (para testes/logout completo)
*/

// ============================================
// 8. FLUXO COMPLETO DE LOGIN
// ============================================

/*
1. Usuário entra com código da escola + matrícula
2. GlobalContext.handleLogin é chamada
3. handleLogin:
   - Recarrega dados atualizados do AsyncStorage (importante!)
   - Busca a escola pelo código de acesso
   - Busca o funcionário pela matrícula
   - Atualiza o state com os dados específicos da escola
4. Componentes renderizam com dados atualizados
5. Se outro usuário adicionou alimentos, eles aparecem aqui!
*/

// ============================================
// 9. DICA: USAR array.find() e array.map() CORRETAMENTE
// ============================================

/*
// ENCONTRAR um item
const horario = horarios.find(h => h.id === 2);

// ENCONTRAR index
const index = horarios.findIndex(h => h.id === 2);

// MAPEAR/TRANSFORMAR
const horarioAtualizado = horarios.map(h =>
  h.id === 2 ? { ...h, nome: "Novo Nome" } : h
);

// FILTRAR/REMOVER
const semOAlimento = alimentos.filter((_, i) => i !== indexARemover);

// ADICIONAR
const comNovoAlimento = [...alimentos, novoAlimento];
*/
