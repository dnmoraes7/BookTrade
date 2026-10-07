USE master
GO

IF EXISTS (SELECT * FROM sys.databases WHERE name = 'book_trade')
	DROP DATABASE book_trade
GO

CREATE DATABASE book_trade
GO

USE book_trade
GO


CREATE TABLE Usuario (
    id_usuario      INT           IDENTITY,
    nome            VARCHAR(100),
    email           VARCHAR(100)  UNIQUE,
    senha           VARCHAR(100),
    telefone        VARCHAR(20),
    data_cadastro   DATETIME2     DEFAULT SYSDATETIME(),
    status          VARCHAR(20)   DEFAULT 'Ativo',
    tipo_usuario    VARCHAR(20)   DEFAULT 'Comum',
    PRIMARY KEY (id_usuario)
);

CREATE TABLE Livro (
    id_livro        INT           IDENTITY,
    titulo          VARCHAR(150),
    autor           VARCHAR(100),
    editora         VARCHAR(100),
    ano_publicacao  INT,
    isbn            VARCHAR(20),
    genero          VARCHAR(50),
    descricao       VARCHAR(500),
    PRIMARY KEY (id_livro)
);


CREATE TABLE Divulgacao (
    id_divulgacao    INT          IDENTITY,
    id_livro         INT          NOT NULL,
    titulo           VARCHAR(150),
    descricao        VARCHAR(500),
    preco            DECIMAL(8,2) NULL,
    data_publicacao  DATETIME2    DEFAULT SYSDATETIME(),
    status           VARCHAR(20)  DEFAULT 'Ativo',
    id_usuario       INT          NOT NULL,
    PRIMARY KEY (id_divulgacao),
    FOREIGN KEY (id_livro) REFERENCES Livro(id_livro),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Vendas (
    id_venda          INT           IDENTITY,
    id_divulgacao     INT           NOT NULL,
    id_vendedor       INT           NOT NULL,
    id_comprador      INT           NOT NULL,
    data_venda        DATETIME2     DEFAULT SYSDATETIME(),
    valor_total       DECIMAL(8,2),
    metodo_pagamento  VARCHAR(30),
    localizacao      GEOGRAPHY     NULL,
    status            VARCHAR(20)   DEFAULT 'Aguardando',
    PRIMARY KEY (id_venda),
    FOREIGN KEY (id_divulgacao) REFERENCES Divulgacao(id_divulgacao),
    FOREIGN KEY (id_vendedor) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_comprador) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Trocas (
    id_troca            INT           IDENTITY,
    id_divulgacao       INT           NOT NULL,
    id_livro_oferecido  INT           NOT NULL,
    id_proponente       INT           NOT NULL,
    id_dono             INT           NOT NULL,
    data_troca          DATETIME2     DEFAULT SYSDATETIME(),
    localizacao      GEOGRAPHY     NULL,
    status              VARCHAR(20)   DEFAULT 'Aguardando',
    PRIMARY KEY (id_troca),
    FOREIGN KEY (id_divulgacao) REFERENCES Divulgacao(id_divulgacao),
    FOREIGN KEY (id_livro_oferecido) REFERENCES Livro(id_livro),
    FOREIGN KEY (id_proponente) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_dono) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Avaliacao (
    id_avaliacao          INT           IDENTITY,
    nota                  TINYINT,
    comentario             VARCHAR(300),
    data_avaliacao         DATETIME2     DEFAULT SYSDATETIME(),
    id_usuario_avaliador   INT           NOT NULL,
    id_usuario_avaliado    INT           NOT NULL,
    id_venda               INT           NULL,
    id_troca               INT           NULL,
    PRIMARY KEY (id_avaliacao),
    FOREIGN KEY (id_usuario_avaliador) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_usuario_avaliado) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_venda) REFERENCES Vendas(id_venda),
    FOREIGN KEY (id_troca) REFERENCES Trocas(id_troca),
    CHECK (nota BETWEEN 1 AND 5),
    CHECK ((id_venda IS NOT NULL AND id_troca IS NULL) OR (id_venda IS NULL AND id_troca IS NOT NULL))
);

CREATE TABLE Mensagem (
    id_mensagem       INT           IDENTITY,
    conteudo          VARCHAR(500),
    data_envio        DATETIME2     DEFAULT SYSDATETIME(),
    lida              BIT           DEFAULT 0,
    id_venda          INT           NULL,
    id_troca          INT           NULL,
    id_remetente      INT           NOT NULL,
    id_destinatario   INT           NOT NULL,
    PRIMARY KEY (id_mensagem),
    FOREIGN KEY (id_venda) REFERENCES Vendas(id_venda),
    FOREIGN KEY (id_troca) REFERENCES Trocas(id_troca),
    FOREIGN KEY (id_remetente) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_destinatario) REFERENCES Usuario(id_usuario),
    CHECK ((id_venda IS NOT NULL AND id_troca IS NULL) OR (id_venda IS NULL AND id_troca IS NOT NULL))
);


CREATE TABLE Notificacao (
    id_notificacao   INT           IDENTITY,
    id_usuario       INT           NOT NULL,
    titulo           VARCHAR(100),
    conteudo         VARCHAR(300),
    tipo             VARCHAR(30),
    data_envio       DATETIME2     DEFAULT SYSDATETIME(),
    lida             BIT           DEFAULT 0,
    id_venda         INT           NULL,
    id_troca         INT           NULL,
    id_mensagem      INT           NULL,
    PRIMARY KEY (id_notificacao),
    FOREIGN KEY (id_usuario)  REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_venda)    REFERENCES Vendas(id_venda),
    FOREIGN KEY (id_troca)    REFERENCES Trocas(id_troca),
    FOREIGN KEY (id_mensagem) REFERENCES Mensagem(id_mensagem)
);


CREATE TABLE Fale_Conosco (
    id_fale_conosco   INT           IDENTITY,
    id_usuario        INT           NULL,
    nome              VARCHAR(100),
    email             VARCHAR(100),
    assunto           VARCHAR(100),
    mensagem          VARCHAR(500),
    data_envio        DATETIME2     DEFAULT SYSDATETIME(),
    status            VARCHAR(20)   DEFAULT 'Aberto',
    resposta          VARCHAR(500)  NULL,
    data_resposta     DATETIME2     NULL,
    id_admin          INT           NULL,
    PRIMARY KEY (id_fale_conosco),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_admin)   REFERENCES Usuario(id_usuario)
);

CREATE TABLE RecuperarSenha(
    id              INT             IDENTITY,
    email           VARCHAR(254)    NOT NULL,
    codigo          CHAR(6)         NOT NULL,
    geradoEm        SMALLDATETIME   NOT NULL DEFAULT GETDATE(),
    exepiraEm       SMALLDATETIME   NOT NULL,
    statusCodigo    BIT             NOT NULL DEFAULT 1,

    PRIMARY KEY (id)
);


INSERT INTO Usuario (nome, email, senha, telefone, tipo_usuario)
VALUES
('Joao Silva', 'joao.silva@email.com', 'senha123', '11999990001', 'Comum'),
('Maria Souza', 'maria.souza@email.com', 'senha123', '11999990002', 'Comum'),
('Carlos Lima', 'carlos.lima@email.com', 'senha123', '11999990003', 'Comum'),
('Ana Costa', 'ana.costa@email.com', 'senha123', '11999990004', 'Comum'),
('Pedro Alves', 'pedro.alves@email.com', 'senha123', '11999990005', 'Comum'),
('Juliana Martins', 'juliana.martins@email.com', 'senha123', '11999990006', 'Comum'),
('Fernanda Rocha', 'fernanda.rocha@email.com', 'senha123', '11999990007', 'Comum'),
('Ricardo Gomes', 'ricardo.gomes@email.com', 'senha123', '11999990008', 'Comum'),
('Patricia Lopes', 'patricia.lopes@email.com', 'senha123', '11999990009', 'Comum'),
('Rafael Santos', 'rafael.santos@email.com', 'senha123', '11999990010', 'Administrador');


INSERT INTO Livro (titulo, autor, editora, ano_publicacao, isbn, genero, descricao)
VALUES
('Dom Casmurro', 'Machado de Assis', 'Editora Globo', 1899, '9788525406958', 'Romance', 'Classico da literatura brasileira'),
('O Hobbit', 'J.R.R. Tolkien', 'HarperCollins', 1937, '9788595084742', 'Fantasia', 'A aventura de Bilbo Bolseiro'),
('1984', 'George Orwell', 'Companhia das Letras', 1949, '9788535914849', 'Ficcao Cientifica', 'Distopia sobre vigilancia e controle'),
('Harry Potter e a Pedra Filosofal', 'J.K. Rowling', 'Rocco', 1997, '9788532511010', 'Fantasia', 'O inicio da saga do bruxo Harry Potter'),
('A Menina que Roubava Livros', 'Markus Zusak', 'Intrinseca', 2005, '9788598078279', 'Drama', 'Historia narrada pela Morte na Alemanha nazista'),
('O Pequeno Principe', 'Antoine de Saint-Exupery', 'Agir', 1943, '9788522005160', 'Infantil', 'Fabula sobre amizade e amor'),
('Capitaes da Areia', 'Jorge Amado', 'Companhia das Letras', 1937, '9788535912784', 'Romance', 'Meninos de rua em Salvador'),
('Sapiens', 'Yuval Noah Harari', 'L&PM', 2011, '9788525432186', 'Nao-ficcao', 'Uma breve historia da humanidade'),
('O Alquimista', 'Paulo Coelho', 'Paralela', 1988, '9788576653679', 'Ficcao', 'A jornada de Santiago em busca de seu tesouro'),
('Memorias Postumas de Bras Cubas', 'Machado de Assis', 'Editora Globo', 1881, '9788508170335', 'Romance', 'Narrado por um defunto autor');


INSERT INTO Divulgacao (id_livro, titulo, descricao, preco, status, id_usuario)
VALUES
(1, 'Dom Casmurro - bom estado', 'Livro usado, poucas marcas', 25.00, 'Ativo', 1),
(2, 'O Hobbit - capa dura', 'Edicao especial capa dura', 45.00, 'Ativo', 2),
(3, '1984 - aceito troca', 'Somente para troca por outro classico', NULL, 'Ativo', 3),
(4, 'Harry Potter - primeira edicao', 'Muito bem conservado', 60.00, 'Reservado', 4),
(5, 'A Menina que Roubava Livros', 'Levemente amassado na capa', 30.00, 'Ativo', 5),
(6, 'O Pequeno Principe - ilustrado', 'Edicao ilustrada colorida', 20.00, 'Ativo', 6),
(7, 'Capitaes da Areia - aceito troca', 'Prefiro trocar por ficcao cientifica', NULL, 'Ativo', 7),
(8, 'Sapiens - seminovo', 'Comprado e pouco lido', 55.00, 'Concluido', 8),
(9, 'O Alquimista - varias edicoes', 'Tenho duas copias, vendo uma', 18.00, 'Ativo', 9),
(10, 'Memorias Postumas - raro', 'Edicao antiga de colecionador', 80.00, 'Ativo', 10);


INSERT INTO Vendas (id_divulgacao, id_vendedor, id_comprador, valor_total, metodo_pagamento, status, localizacao)
VALUES
(1, 1, 2, 25.00, 'Pix', 'Concluida', geography::STPointFromText('POINT(-46.6333 -23.5505)', 4326)),
(2, 2, 3, 45.00, 'Cartao', 'Aceita', geography::STPointFromText('POINT(-46.6388 -23.5613)', 4326)),
(4, 4, 5, 60.00, 'Dinheiro', 'Aguardando', NULL),
(5, 5, 6, 30.00, 'Pix', 'Concluida', geography::STPointFromText('POINT(-46.5906 -23.5629)', 4326)),
(8, 8, 9, 55.00, 'Cartao', 'Concluida', NULL),
(9, 9, 10, 18.00, 'Pix', 'Aceita', NULL);


INSERT INTO Trocas (id_divulgacao, id_livro_oferecido, id_proponente, id_dono, status, localizacao)
VALUES
(3, 7, 4, 3, 'Aguardando', NULL),
(7, 3, 8, 7, 'Recusada', NULL),
(6, 9, 1, 6, 'Concluida', geography::STPointFromText('POINT(-46.6396 -23.5558)', 4326));


INSERT INTO Avaliacao (nota, comentario, id_usuario_avaliador, id_usuario_avaliado, id_venda, id_troca)
VALUES
(5, 'Otimo vendedor, livro chegou rapido', 2, 1, 1, NULL),
(4, 'Livro em bom estado, recomendo', 3, 2, 2, NULL),
(5, 'Entrega tranquila, tudo certo', 6, 5, 4, NULL),
(3, 'Demorou um pouco para responder', 8, 7, NULL, 2),
(5, 'Troca justa, recomendo', 6, 1, NULL, 3);


INSERT INTO Mensagem (conteudo, lida, id_venda, id_troca, id_remetente, id_destinatario)
VALUES
('Oi, ainda esta disponivel?', 1, 1, NULL, 2, 1),
('Sim, esta sim!', 1, 1, NULL, 1, 2),
('Posso pagar amanha?', 1, 2, NULL, 3, 2),
('Topa trocar pelo Capitaes da Areia?', 0, NULL, 1, 4, 3),
('Prefiro outro titulo, obrigado', 0, NULL, 1, 3, 4),
('Livro enviado hoje', 1, 4, NULL, 5, 6),
('Recebido, obrigado!', 1, 4, NULL, 6, 5),
('Fechado, combinamos a entrega amanha', 0, NULL, 3, 6, 1);


INSERT INTO Notificacao (id_usuario, titulo, conteudo, tipo, lida, id_venda, id_troca, id_mensagem)
VALUES
(1, 'Venda concluida', 'Sua venda de Dom Casmurro foi concluida', 'Venda', 1, 1, NULL, NULL),
(3, 'Nova proposta de troca', 'Ana Costa propôs uma troca pelo seu livro 1984', 'Troca', 0, NULL, 1, NULL),
(4, 'Troca em andamento', 'Carlos Lima respondeu sua proposta de troca', 'Mensagem', 0, NULL, NULL, 5),
(5, 'Pedido aguardando', 'Voce tem uma venda aguardando confirmacao', 'Venda', 0, 3, NULL, NULL),
(6, 'Troca concluida', 'Sua troca foi concluida com sucesso', 'Troca', 1, NULL, 3, NULL),
(10, 'Venda aceita', 'Sua compra de O Alquimista foi aceita', 'Venda', 0, 6, NULL, NULL);

INSERT INTO Fale_Conosco (id_usuario, nome, email, assunto, mensagem, status, resposta, data_resposta, id_admin)
VALUES
(2, 'Maria Souza', 'maria.souza@email.com', 'Duvida', 'Como altero meu telefone cadastrado?', 'Respondido', 'Acesse seu perfil e edite o campo telefone.', SYSDATETIME(), 10),
(5, 'Pedro Alves', 'pedro.alves@email.com', 'Problema', 'Meu anuncio nao aparece na busca.', 'Em andamento', NULL, NULL, NULL),
(NULL, 'Visitante', 'visitante@email.com', 'Sugestao', 'Seria bom ter filtro por genero.', 'Aberto', NULL, NULL, NULL);


INSERT INTO RecuperarSenha (email, codigo, exepiraEm, statusCodigo)
VALUES
('joao.silva@email.com', '482915', DATEADD(MINUTE, 15, GETDATE()), 1),
('maria.souza@email.com', '730154', DATEADD(MINUTE, 15, GETDATE()), 1),
('carlos.lima@email.com', '916327', DATEADD(MINUTE, -30, GETDATE()), 0),
('ana.costa@email.com', '558201', DATEADD(MINUTE, 15, GETDATE()), 0);


SELECT * FROM INFORMATION_SCHEMA.TABLES;

SELECT * FROM Usuario;
SELECT * FROM Livro;
SELECT * FROM Divulgacao;
SELECT * FROM Vendas;
SELECT * FROM Trocas;
SELECT * FROM Avaliacao;
SELECT * FROM Mensagem;


SELECT *
FROM Usuario;


SELECT *
FROM Usuario
WHERE status = 'Ativo';


SELECT *
FROM Usuario
WHERE tipo_usuario = 'Administrador';


SELECT *
FROM Usuario
WHERE tipo_usuario <> 'Administrador';


SELECT *
FROM Livro;


SELECT *
FROM Livro
WHERE genero = 'Romance';


SELECT *
FROM Divulgacao
WHERE preco > 50;


SELECT *
FROM Divulgacao
WHERE preco BETWEEN 20 AND 50;


SELECT *
FROM Livro
WHERE titulo LIKE '%o%';


SELECT *
FROM Divulgacao
WHERE preco > 25
AND status = 'Ativo';


SELECT *
FROM Livro
WHERE genero = 'Romance'
OR genero = 'Fantasia';


SELECT
    id_venda, id_divulgacao, id_vendedor, id_comprador,
    data_venda, valor_total, metodo_pagamento, status,
    localizacao.ToString() AS localizacao_texto
FROM Vendas
WHERE NOT status = 'Concluida';


SELECT
    id_troca, id_divulgacao, id_livro_oferecido, id_proponente, id_dono,
    data_troca, status,
    localizacao.ToString() AS localizacao_texto
FROM Trocas
WHERE NOT status = 'Concluida';


SELECT *
FROM Usuario
ORDER BY nome;


SELECT *
FROM Divulgacao
ORDER BY preco DESC;


SELECT
    id_venda, id_divulgacao, id_vendedor, id_comprador,
    data_venda, valor_total, metodo_pagamento, status,
    localizacao.ToString() AS localizacao_texto
FROM Vendas
ORDER BY valor_total DESC;


SELECT
    genero,
    COUNT(*) AS total_livros
FROM Livro
GROUP BY genero;


SELECT
    status,
    COUNT(*) AS total_vendas
FROM Vendas
GROUP BY status;


SELECT
    status,
    COUNT(*) AS total_trocas
FROM Trocas
GROUP BY status;


SELECT
    status,
    SUM(valor_total) AS total_valor
FROM Vendas
GROUP BY status;


SELECT
    status,
    AVG(valor_total) AS media_valor
FROM Vendas
GROUP BY status;


SELECT MAX(valor_total) AS maior_venda
FROM Vendas;


SELECT MIN(valor_total) AS menor_venda
FROM Vendas;


SELECT SUM(valor_total) AS total_negociado
FROM Vendas;


SELECT AVG(valor_total) AS media_negociada
FROM Vendas;


UPDATE Usuario
SET telefone = '11991112222'
WHERE id_usuario = 3;


UPDATE Divulgacao
SET preco = 22.00
WHERE id_divulgacao = 1;


UPDATE Vendas
SET status = 'Concluida'
WHERE id_venda = 3;


UPDATE Trocas
SET status = 'Aceita'
WHERE id_troca = 1;


UPDATE Mensagem
SET lida = 1
WHERE id_venda = 3;


UPDATE Vendas
SET localizacao = geography::STPointFromText('POINT(-46.889781 -23.5123429)', 4326)
WHERE id_venda = 2;

UPDATE Vendas
SET localizacao = geography::STPointFromText('POINT(-46.889781 -23.5123429)', 4326)
WHERE id_venda = 3;

UPDATE Vendas
SET localizacao = geography::STPointFromText('POINT(-46.889781 -23.5123429)', 4326)
WHERE id_venda = 6;

UPDATE Trocas
SET localizacao = geography::STPointFromText('POINT(-46.889781 -23.5123429)', 4326)
WHERE id_troca = 1;

UPDATE Trocas
SET localizacao = geography::STPointFromText('POINT(-46.889781 -23.5123429)', 4326)
WHERE id_troca = 2;


SELECT * FROM Notificacao;
SELECT * FROM Fale_Conosco;


SELECT *
FROM Notificacao
WHERE lida = 0
ORDER BY data_envio DESC;


SELECT
    n.id_notificacao, u.nome, n.titulo, n.conteudo, n.tipo, n.data_envio, n.lida
FROM Notificacao n
INNER JOIN Usuario u ON u.id_usuario = n.id_usuario
ORDER BY n.data_envio DESC;


SELECT
    n.id_notificacao, u.nome, n.titulo,
    v.id_venda, v.status AS status_venda, v.valor_total,
    v.localizacao.Lat  AS latitude,
    v.localizacao.Long AS longitude
FROM Notificacao n
INNER JOIN Usuario u ON u.id_usuario = n.id_usuario
INNER JOIN Vendas  v ON v.id_venda   = n.id_venda;


SELECT
    n.id_notificacao, u.nome, n.titulo,
    t.id_troca, t.status AS status_troca,
    t.localizacao.Lat  AS latitude,
    t.localizacao.Long AS longitude
FROM Notificacao n
INNER JOIN Usuario u ON u.id_usuario = n.id_usuario
INNER JOIN Trocas  t ON t.id_troca   = n.id_troca;


SELECT
    n.id_notificacao, u.nome AS destinatario, m.conteudo AS mensagem, m.data_envio
FROM Notificacao n
INNER JOIN Usuario  u ON u.id_usuario  = n.id_usuario
INNER JOIN Mensagem m ON m.id_mensagem = n.id_mensagem;


SELECT
    tipo,
    COUNT(*) AS total
FROM Notificacao
GROUP BY tipo;


SELECT
    u.nome,
    COUNT(*) AS nao_lidas
FROM Notificacao n
INNER JOIN Usuario u ON u.id_usuario = n.id_usuario
WHERE n.lida = 0
GROUP BY u.nome;


SELECT *
FROM Fale_Conosco
WHERE status <> 'Respondido'
ORDER BY data_envio;


SELECT
    f.id_fale_conosco,
    COALESCE(u.nome, f.nome) AS remetente,
    f.assunto, f.mensagem, f.status, f.resposta,
    a.nome AS administrador
FROM Fale_Conosco f
LEFT JOIN Usuario u ON u.id_usuario = f.id_usuario
LEFT JOIN Usuario a ON a.id_usuario = f.id_admin;


SELECT
    status,
    COUNT(*) AS total_chamados
FROM Fale_Conosco
GROUP BY status;


UPDATE Notificacao
SET lida = 1
WHERE id_usuario = 3;


UPDATE Fale_Conosco
SET status = 'Respondido',
    resposta = 'Ja corrigimos o problema, tente novamente.',
    data_resposta = SYSDATETIME(),
    id_admin = 10
WHERE id_fale_conosco = 2;


SELECT * FROM RecuperarSenha;


SELECT *
FROM RecuperarSenha
WHERE statusCodigo = 1
AND exepiraEm > GETDATE();


SELECT *
FROM RecuperarSenha
WHERE exepiraEm <= GETDATE()
OR statusCodigo = 0;


SELECT
    r.id, r.email, u.nome, r.codigo, r.geradoEm, r.exepiraEm, r.statusCodigo
FROM RecuperarSenha r
INNER JOIN Usuario u ON u.email = r.email
ORDER BY r.geradoEm DESC;


SELECT
    statusCodigo,
    COUNT(*) AS total_codigos
FROM RecuperarSenha
GROUP BY statusCodigo;


SELECT
    email,
    COUNT(*) AS total_solicitacoes
FROM RecuperarSenha
GROUP BY email;


SELECT TOP 1 *
FROM RecuperarSenha
WHERE email = 'joao.silva@email.com'
AND codigo = '482915'
AND statusCodigo = 1
AND exepiraEm > GETDATE()
ORDER BY geradoEm DESC;


UPDATE RecuperarSenha
SET statusCodigo = 0
WHERE id = 1;


UPDATE RecuperarSenha
SET statusCodigo = 0
WHERE exepiraEm <= GETDATE()
AND statusCodigo = 1;