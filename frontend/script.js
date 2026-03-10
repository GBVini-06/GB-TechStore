const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const usuario = document.getElementById('usuario').value;
        const senha = document.getElementById('senha').value;
        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, senha })
            });
            if (response.ok) window.location.href = 'produtos.html';
            else alert('Usuário ou senha incorretos!');
        } catch (error) { alert('Erro no servidor.'); }
    });
}

const listaProdutos = document.getElementById('lista-produtos');
if (listaProdutos) {
    async function carregarProdutos() {
        try {
            const response = await fetch('http://localhost:3001/api/produtos');
            const produtos = await response.json();
            listaProdutos.innerHTML = ''; 

            produtos.forEach(produto => {
                const prodString = encodeURIComponent(JSON.stringify(produto));
                listaProdutos.innerHTML += `
                    <div class="produto-card">
                        <img src="http://localhost:3001${produto.imagem}" class="produto-img">
                        <h3>${produto.nome}</h3>
                        <h2 class="preco">R$ ${Number(produto.preco).toFixed(2)}</h2>
                        <div class="acoes-produto">
                            <button onclick="window.location.href='detalhes.html?id=${produto.id}'" class="btn btn-detalhes">Detalhes</button>
                            <button onclick="adicionarAoCarrinho('${prodString}')" class="btn btn-comprar">Comprar 🛒</button>
                        </div>
                    </div>
                `;
            });
        } catch (error) { listaProdutos.innerHTML = '<p class="msg-carregando">Erro de conexão.</p>'; }
    }
    carregarProdutos();
}

const detalhesContainer = document.getElementById('detalhes-container');
if (detalhesContainer) {
    async function carregarDetalhes() {
        const urlParams = new URLSearchParams(window.location.search);
        const idProduto = urlParams.get('id');

        if (!idProduto) {
            detalhesContainer.innerHTML = '<h2 class="msg-carregando">Volte e clique em um produto!</h2>'; return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/produtos/${idProduto}`);
            
            if (!response.ok) {
                detalhesContainer.innerHTML = `<h2 class="msg-carregando">Erro 404: Produto ID ${idProduto} não encontrado.</h2>`; return;
            }

            const produto = await response.json();
            const prodString = encodeURIComponent(JSON.stringify(produto));

            detalhesContainer.innerHTML = `
                <div class="detalhes-img-container">
                    <img src="http://localhost:3001${produto.imagem}" class="detalhes-img">
                </div>
                <div class="detalhes-info">
                    <h1 class="detalhes-titulo">${produto.nome}</h1>
                    <p class="detalhes-desc">${produto.descricao}</p>
                    <h2 class="detalhes-preco">R$ ${Number(produto.preco).toFixed(2)}</h2>
                    <button onclick="adicionarAoCarrinho('${prodString}')" class="btn btn-adicionar-grande">Adicionar ao Carrinho</button>
                </div>
            `;
        } catch (error) {
            detalhesContainer.innerHTML = '<h2 class="msg-carregando">Erro de conexão com servidor.</h2>';
        }
    }
    carregarDetalhes();
}
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

function atualizarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    const contador = document.getElementById('contador-carrinho');
    if (contador) contador.innerText = carrinho.length;

    const itensContainer = document.getElementById('itens-carrinho');
    const totalContainer = document.getElementById('total-carrinho');
    
    if (itensContainer && totalContainer) {
        itensContainer.innerHTML = '';
        let total = 0;

        if (carrinho.length === 0) {
            itensContainer.innerHTML = '<p class="carrinho-vazio">Carrinho vazio.</p>';
        } else {
            carrinho.forEach((prod, index) => {
                total += Number(prod.preco);
                itensContainer.innerHTML += `
                    <div class="item-carrinho">
                        <img src="http://localhost:3001${prod.imagem}">
                        <div class="item-info">
                            <strong class="item-titulo">${prod.nome}</strong><br>
                            <span class="preco">R$ ${Number(prod.preco).toFixed(2)}</span>
                        </div>
                        <button onclick="removerDoCarrinho(${index})" class="btn btn-remover">X</button>
                    </div>
                `;
            });
        }
        totalContainer.innerText = `Total: R$ ${total.toFixed(2)}`;
    }
}

window.adicionarAoCarrinho = function(produtoString) {
    const produto = JSON.parse(decodeURIComponent(produtoString));
    carrinho.push(produto);
    atualizarCarrinho();
    document.getElementById('carrinho-lateral').classList.add('aberto');
    document.getElementById('overlay').style.display = 'block';
}

window.removerDoCarrinho = function(index) {
    carrinho.splice(index, 1);
    atualizarCarrinho();
}

window.finalizarCompra = function() {
    if (carrinho.length === 0) {
        alert("Adicione alguns produtos antes de finalizar!");
        return;
    }

    carrinho = [];
    atualizarCarrinho();

    alert("Compra finalizada com sucesso! Muito obrigado!");

    document.getElementById('carrinho-lateral').classList.remove('aberto');
    document.getElementById('overlay').style.display = 'none';
}

const btnAbrir = document.getElementById('abrir-carrinho');
const btnFechar = document.getElementById('fechar-carrinho');
const overlay = document.getElementById('overlay');
const gaveta = document.getElementById('carrinho-lateral');

if (btnAbrir && btnFechar && overlay && gaveta) {
    btnAbrir.addEventListener('click', () => { gaveta.classList.add('aberto'); overlay.style.display = 'block'; });
    const fechar = () => { gaveta.classList.remove('aberto'); overlay.style.display = 'none'; };
    btnFechar.addEventListener('click', fechar);
    overlay.addEventListener('click', fechar);
}

atualizarCarrinho();