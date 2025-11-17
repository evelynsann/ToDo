// -----------------------------------------------------------------
// 1. VARIÁVEIS GLOBAIS
// São acessiveis à partir de qulaquer função JavaScript.
// -----------------------------------------------------------------

// Procura pelo elemento com o ID "txt-nova-tarefa" no documento HTML
const txt_nova_tarefa = document.querySelector("#txt-nova-tarefa");
// Procura pelo elemento com o ID "btn-nova-tarefa" no documento HTML
const btn_nova_tarefa = document.querySelector("#btn-nova-tarefa");
// Procura pelo elemento com o ID "lista-tarefas" no documento HTML
const lista_tarefas = document.querySelector("#lista-tarefas");

// Carrega o áudio reproduzido ao Concluir uma tarefa
const audioConcluir = new Audio('sound/gmae.wav');
// Força o navegador a pré-carregar o áudio para evitar atrasos na reprodução
audioConcluir.preload = "auto";

// Variável global que controla a exibição da modal "Exclui tarefa"
const modalExcluir = new bootstrap.Modal(document.getElementById('exampleModal'));

// Variável global que armazena a tarefa que será excluída 
let id_tarefa_excluir;

// -----------------------------------------------------------------
// 2. FUNÇÕES DE LÓGICA
// -----------------------------------------------------------------

function iniciaToDo() {
    // alert("Olá mundo!");
    
    // Associa funçãom ao evento de clicar no botão  de "Adicionar" nova tarefa
    btn_nova_tarefa.addEventListener("click", adicionarTarefa);
    // Associa função "adicionarTarefaEnter()" ao evento de pressionar a tecla "Enter"
    //  no campo de "Adicionar" nova tarefa
    txt_nova_tarefa.addEventListener("keypress", adicionarTarefaEnter) 

    const arrayTarefas = obterTarefasDoNavegador();

    salvarCookieTarefas([]);
    arrayTarefas.forEach(strTarefa => {
        adicionarTarefa(strTarefa);
    });

    lista_tarefas.querySelectorAll("li").forEach(li => makeDraggable(li));
}

function adicionarTarefa(strTarefa) {
    if (typeof strTarefa !== 'string' || strTarefa == null) {
        strTarefa = txt_nova_tarefa.value;
    }

    // Se a caixa de texto de "Adicionar nova tarefa" não está vazia
    // .trim() remove espaços em branco do começo e fim do valor do campo
    if (strTarefa.trim() !== "") {
        const btn_item = `
        <div>
        <button class="btn btn-success btn-sm me-2 btn-concluir" onclick="concluirTarefa(this)">Concluir</button>
        <button class="btn btn-danger btn-sm btn-excluir" onclick="obterIDTarefaExcluir(this);modalExcluir.show()">Excluir</button>
        </div>
    `;
        
        // Cria um novo item de lista 
        const item = document.createElement("li");
        item.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        // Adiciona o texto digitado na caixa de texto e os botões para cocluir e excluir a tarefa.
        // "span" permite aolicar formatações em linha
        // "w-75" limita o nome da tarefaa 75% do tamanho da linha, deixando 25% da largura restante reservado para os botões 
        // "text-truncate" corta e adiciona reticências (três pontos ...) em nomes de tarefas que excedem 75% da largura da linha
        item.innerHTML = "<span class='w-75 text-truncate'>" + strTarefa + "</span>" + btn_item;
        
        makeDraggable(item);
        item.addEventListener("dragend", () => {
            let arrayTarefas = [];
            Array.from(lista_tarefas.children).forEach(i => {
                i.classList.remove('over')
                arrayTarefas.push(i.querySelector("span").textContent);
            });
            salvarCookieTarefas(arrayTarefas);
        });

        adicionarTarefaAoCookie(strTarefa);

        // Adiciona o item a lista de tarefas
        lista_tarefas.append(item);
    }
    // Limpa o campo de texto de "Adicionar nova tarefa" após adicionar a tarefa a lista
    txt_nova_tarefa.value = "";
    // Seleciona o campo "Adicionar nova tarefa" após adicionar a tarefa a lista
    txt_nova_tarefa.focus();
}

function adicionarTarefaEnter(evento) {
    // Se a tecla pressionada for igual a "Enter"
    if (evento.key == "Enter") {
        // Chama a função JavaScript "adicionarTarefa()"
        adicionarTarefa();
    }
}

function concluirTarefa(btn_concluir) {
    // Reproduz o áudio ao clicar no botão de "Concluir"
    audioConcluir.play();
    
    // Joga 50 confettis na tela
    for (let i = 0; i <= 50; i++) {
        confetti();
        
    }

    // Atualiza o ID da tarefa a ser excluída e
    // passa como parâmetro o botão de "Concluir" clickado.
    obterIDTarefaExcluir(btn_concluir);

    // Chama a função JS "excluirTarefa()".
    excluirTarefa();
}

function excluirTarefa() { 
    const arrayTarefas =  obterTarefasDoNavegador();
    arrayTarefas.splice(id_tarefa_excluir, 1);
    salvarCookieTarefas(arrayTarefas);

    // Remove o item da lista de tarefas
    lista_tarefas.removeChild(lista_tarefas.children[id_tarefa_excluir]);
    // Fecha a modal de "Excluir tarefa"
    modalExcluir.hide();
}

function obterIDTarefaExcluir(btn) {
    // Encontra o elemnto HTML "li" (item) pai mais próximo do 
    // botão de "Cocluir" ou "Excluir" clickado.
    // Perceba que na função JS "obterIDTarefaExclui()", o botão clickado é
    //  recebido como parâmetro da função (btn).
    const item = btn.closest("li");
    const tarefas = Array.from(lista_tarefas.children);
    // Por exemplo, se temos 3 tarefas e excluimos a última tarefa,
    // id_tarefa_excluir será definido para "3" que é o ID da tarefa excluída.
    id_tarefa_excluir = tarefas.indexOf(item);
}

// -----------------------------------------------------------------
// 3. COOKIES
// Adiciona funcionalidade de cookies (persistência) das tarefas adicionadas
// (mantém as tarefas adicionadas mesmo ao fechar ou atualizar a página)
// -----------------------------------------------------------------

const CHAVE_TAREFAS_TODO = 'tarefas_todo';

function obterTarefasDoNavegador() {
    // Tenta ler o cookie do navegador
    try {
        const cookie = localStorage.getItem(CHAVE_TAREFAS_TODO);
        if (cookie) {
            // Se o cookie existir, retorna o cookie
            return JSON.parse(cookie);
        }
    } catch (e) {
        console.error("Falha ao ler o cookie do armazenamento local.");
    }
    // Retorna um vetor vazio em caso de falha
    return [];
}

function salvarCookieTarefas(arrayTarefas) {
    try {
        localStorage.setItem(CHAVE_TAREFAS_TODO, JSON.stringify(arrayTarefas));
    } catch (e) {
        console.error("ERRO: Falha ao salvar as tarefas no navegador. Erro:", e);
    }
}

function adicionarTarefaAoCookie(strTarefa) {
    const arrayTarefas = obterTarefasDoNavegador(); // Obtém as tarefas atuais do cookie do navegador Web em formato de vetor.
    arrayTarefas.push(strTarefa); // Adiciona a tarefa recebida como parâmetro da função ao cookie do navegador Web.
    salvarCookieTarefas(arrayTarefas); // Salva o cookie com a tarefa adicionada no navegador Web.
}
// -----------------------------------------------------------------
// 4. ESCUTADORES DE EVENTOS E INÍCIO
// -----------------------------------------------------------------

iniciaToDo();