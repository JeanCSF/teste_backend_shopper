# Instruções
### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/JeanCSF/teste_backend_shopper.git
```

2. Utilize o docker para instalar os pacotes e subir o projeto:
```bash
docker-compose up -d
```
Feito isto basta testar os endpoints, a API estará disponível na porta 3000

3. Esta API conta com alguns testes unitários nos controllers. Para executá-los utilize o seguinte comando: 
```bash
npm run test
```

# Endpoints

#### POST /upload
Responsável por receber uma imagem em base 64, consultar o Gemini e retornar a medida lida pela API
#### Requisição

Enviar no corpo da requisição os seguintes dados no formato JSON:
- `image` (string): Imagem em base 64.
- `customer_code` (string): Código do cliente.
- `measure_datetime` (string): Data e hora da medida (ISO 8601).
- `measure_type` (string): Tipo de medida('WATER' ou 'GAS').


##### Exemplo de Corpo da Requisição:
```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "customer_code": "123456789",
  "measure_datetime": "2022-01-01T00:00:00.000Z",
  "measure_type": "WATER"
}
```

## Códigos de status e descricão das respostas

### 200 - Operação realizada com sucesso

```json
{
  "image_url": "/images/customer-customerCode_month-year_type.png",
  "measure_value": 123,
  "measure_uuid": "a0d5cf04-04e0-4833-b270-fcb210db27ec"
}
```

### 400 - Os dados fornecidos no corpo da requisição são inválidos
```json
{
  "error_code": "INVALID_DATA",
  "error_description": "<descrição do erro>"
}
```

### 409 - Já existe uma leitura para este tipo no mês atual
```json
{
  "error_code": "DOUBLE_REPORT",
  "error_description": "Leitura do mês já realizada"
}
```

#### PATCH /confirm
Responsável por confirmar ou corrigir o valor lido pelo LLM
#### Requisição

Enviar no corpo da requisição os seguintes dados no formato JSON:
- `measure_uuid` (string): Código da leitura.
- `confirmed_value` (integer): Valor da leitura confirmado.


##### Exemplo de Corpo da Requisição:
```json
{
"measure_uuid": "a0d5cf04-04e0-4833-b270-fcb210db27ec",
"confirmed_value": 404188
}
```

## Códigos de status e descricão das respostas

### 200 - Operação realizada com sucesso

```json
{
"success": true
}
```

### 400 - Os dados fornecidos no corpo da requisição são inválidos
```json
{
  "error_code": "INVALID_DATA",
  "error_description": "<descrição do erro>"
}
```

### 404 - Leitura não encontrada
```json
{
  "error_code": "MEASURE_NOT_FOUND",
  "error_description": "<descrição do erro>"
}
```

### 409 - Leitura já confirmada 
```json
{
  "error_code": "CONFIRMATION_DUPLICATE",
  "error_description": "Leitura do mês já confirmada"
}
```

#### GET /:customerCode/list
Responsável por listar as medidas realizadas por um determinado cliente
#### Requisição

Enviar na URL da requisição os seguintes dados:
- `customerCode` (string): Código do cliente.
- `measure_type` (string): Tipo de medida('WATER' ou 'GAS') *opcional.

## Códigos de status e descricão das respostas

### 200 - Operação realizada com sucesso

```json
{
  "customer_code": "123456789",
  "measures": [
    {
      "measure_uuid": "a0d5cf04-04e0-4833-b270-fcb210db27ec",
      "measure_datetime": "2022-01-01T00:00:00.000Z",
      "measure_type": "WATER",
      "has_confirmed": true,
      "image_url": "/images/customer-customerCode_month-year_type.png"
    },
    {
      "measure_uuid": "a0d5cf04-04e0-4444-b270-fcb211db27bc",
      "measure_datetime": "2022-01-01T00:00:00.000Z",
      "measure_type": "GAS",
      "has_confirmed": false,
      "image_url": "/images/customer-customerCode_month-year_type.png"
    },
  ]
}
```

### 400 - Parâmetro measure type diferente de WATER ou GAS
```json
{
  "error_code": "INVALID_DATA",
  "error_description": "Tipo de medição não permitida"
}
```

### 404 - Leitura não encontrada
```json
{
  "error_code": "MEASURES_NOT_FOUND",
  "error_description": "Nenhuma leitura encontrada"
}
```