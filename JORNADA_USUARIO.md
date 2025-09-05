1- Consulta Protestos
Cliente
Sem cadastro
Entra no site
- clica na opção “Protestos”
- depois clica na opção “Consulta Protesto” 
- insere o CPF/CNPJ clica em “Avançar”
- Preenche todos os campos do cadastro informados no final desse fluxo clica em “Avançar” 
- Preenche o CPF/CNPJ e Nome/Razão Social que deseja que saia na NF clica em “Avançar 
- escolhe a forma de pagamento entre PIX, Cartão de Credito ou Boleto
- Recebe um email que o pagamento do pedido foi concluído com sucesso e que o prazo é de ate 24 horas

Com cadastro
Entra no site e faz o login
-clica na opção “Protestos”
- depois clica na opção “Consulta Protesto” 
- insere o CPF/CNPJ clica em “Avançar”
- o site mostra os dados do cadastro e pergunta se deseja manter as informações ou alterar
- Clica em alterar ou ok depois clica em “Avançar 
- Preenche o CPF/CNPJ e Nome/Razão Social que deseja que saia na NF clica em “Avançar 
- escolhe a forma de pagamento entre PIX, Cartão de Credito ou Boleto 
- Recebe um email que o pagamento do pedido foi concluído com sucesso e que o prazo é de ate 24 horas

Backoffice
Na minha área de trabalho preciso que seja apresentado a lista dos pedidos e que eu possa filtrar pelo status
Quando entrar no pedido preciso visualizar apenas o CPF o restante dos dados do cadastro não preciso visualizar nesse tipo de pedido
Recebo o pedido com o status “Pagamento Confirmado” entro no site do “Cenprot” (site do governo) coloco as informações do cliente e recebo um retorno se existem ou não protestos.
Informo no pedido:
- Não constam protestos nos cartórios participantes do Brasil
Ou
- Segue abaixo a lista de processos encontrados, junto com sua cidade de origem:
1
2	
3....etc
Clico em finalizar e as informações acima são enviadas ao cliente por email 
O status do pedido muda para finalizado 


2- Certidão de Protesto – CND
A opção de com cadastro ou sem cadastro vai funcionar exatamente como no processo de “Consulta Protestos” então vou escrever o fluxo apenas com cadastro
Entra no site e faz o login
-clica na opção “Protestos”
- depois clica na opção “Certidão de Protesto” 
- Seleciona o estado depois a cidade e o cartório de onde deseja a certidão clica em “Avançar” ( ele precisa poder selecionar um ou mais e também a opção todos os cartórios )
- o site mostra os dados do cadastro e pergunta se deseja manter as informações ou alterar
- Clica em alterar ou ok depois clica em “Avançar 
- Preenche o CPF/CNPJ e Nome/Razão Social que deseja que saia na NF clica em “Avançar 
- é informado valor de tabela da certidão e que dependendo do cartório e da quantidade de protestos o valor pode ser alterado, escolhe a forma de pagamento entre PIX, Cartão de Credito ou Boleto 
- Visualiza um tela agradecendo a compra e que será informado em ate 3 dias uteis do valor da certidão para pagamento.
- O cliente recebe o email com o valor da Certidão e já incluído a forma de pagamento que ele escolheu e faz o pagamento em ate 3 dias uteis
- Apos o pagamento ele recebe outro email informando que o pagamento foi feito com sucesso e que o prazo para o recebimento da certidão é de ate 5 dias uteis (essa informação pode constar em todos os e-mails antes, que apos o pagamento o prazo para o recebimento da certidão é de ate 5 dias uteis)
- Cliente recebe a Certidão em PDF no email
Backoffice
Quando entrar no pedido preciso visualizar todos os dados do cadastro na tela do pedido
Recebo o pedido com o status “Pedido Confirmado” entro no site do CENPROT (site do governo) coloco as informações do cliente e é gerado um numero de protocolo
Na tela do pedido no campo “Documento” incluo o numero do protocolo gerado no CENPROT
O status do pedido é alterado para “Aguardando orçamento”
Apos receber do CENPROT o valor entro no pedido e informo o valor da certidão, clico no botão enviar orçamento é enviado um email para o cliente com o valor e o status muda para “Aguardando pagamento”
Recebo o pedido com o status “Pagamento confirmado” entro no site do CENPROT  efetuo o pagamento da certidão e altero o status do pedido para “Documento solicitado”
Apos receber a certidão do CENPROT entro no pedido anexo a certidão na opção “Anexar Documento”
Clico no botão “Finalizar ou concluído” e é enviado um email para o cliente com a Certidão.

Importante
- Quando o pedido criado antes do cliente efetuar o pagamento o Status dele é “ Aguardando Pagamento”
- Apos o ter efetuado o pagamento e compensado “automaticamente no site” o status muda para “Pagamento confirmado”
- Se o banco emissor do cartão de credito recusar a cobrança o status deve ser “Pagamento recusado”
- Vamos precisar de um relatou ou visualização dos erros de pagamento para tentar solicitar novamente no caso do cartão que as vezes quando tenta compensar novamente o banco aceita
- Precisamos também na parte administrativa da tela de usuários para podermos alterar os dados quando solicitado pelo cliente e também alterar e/ou resetar a senha
- Devemos informar em algum lugar que as certidões ficam disponíveis por ate 3 meses, apos esse período são excluídas
- no site do meu filho todo pedido gerado era enviado um email para nosso email administrativo com todos os dados do pedido e do cliente, porque alguns clientes fazem o pedido e depois não lembram o numero ou perdem os email enfim, usávamos esses dados para fazer busca pelos dados informados no pedido e encontrar o pedido do cliente precisamos ter essa busca ( Podemos fazer da mesma forma que meu filho ou voce pode criar outra forma)
- Falamos da parte de banco de dados de CEP poem acredito que será melhor validar com o site dos correios e trazer as informações voce não acha?

TABELAS:  
Cadastro de clientes
-Nome Completo
-RG
-CPF
-Email
-CEP
-Endereço 
-UF
-Cidade
-Bairro
-Senha

Lista de Status: (estão fora de ordem, pode organizar por gentileza)
Aguardando Pagamento
Pagamento Confirmado
Pagamento recusado
Cancelado
Finalizado
Aguardando retorno
Aguardando orçamento
Pedido Confirmado

Pedidos de Certidão:
Numero do pedido
Status
Observação
Data
Documento
Valor

Documentos Anexados: ( é interessante mantermos os arquivos separados dos pedidos pois faremos uma rotina para apagar os arquivos com mais de 3 meses assim não excedemos nosso banco de dados)
Numero do pedido
Documento anexo








Tela inicial - Entre ou cadastra-se
Dados para o cadastro:
Nome Completo
RG
CPF
Email
CEP
Endereço 
UF
Cidade
Bairro

Emitiremos 2 tipos de documentos:
Consulta de Protestos por CNPJ ou CPF- não gera nenhum documento apenas informa por email se possui ou não protestos 
Apos o pedido é gerado a cobrança
Envio em  ate 24 horas uteis
Necessário estar cadastrado no site para solicitar
Campos no pedido:
CPF
Modelo: https://www.pesquisaprotesto.com.br/servico/consulta-documento

2 -Certidão de protesto
Apos feito o pedido, receberá um email em ate 3 dias uteis com o valor da certidão que pode ser alterado de acordo com o cartório, terá mais 3 dias uteis para fazer o pagamento, depois de confirmado o pagamento a certidão é enviada em ate 5 dias uteis.
Necessário estar cadastrado no site para solicitar
Campos do pedido:
Estado
Municipio
Cartorio
Motivo da solicitação
Modelo: https://www.pesquisaprotesto.com.br/certidaoNegativa

