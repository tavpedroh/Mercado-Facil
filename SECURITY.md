# Política de Segurança

## Boas práticas adotadas

- Variáveis sensíveis (`MONGODB_URI`, chaves de API) devem permanecer apenas em arquivos `.env` locais (ignorados pelo Git) ou no gerenciador de segredos do ambiente de deploy.
- Restrinja a chave do Google Maps (`VITE_GOOGLE_MAPS_API_KEY`) por domínio (HTTP referrer) e APIs permitidas no Google Cloud Console.

## Como reportar uma vulnerabilidade

Caso encontre uma falha de segurança neste projeto:

1. **Não** abra uma issue pública expondo detalhes da vulnerabilidade.
2. Reporte diretamente ao mantenedor pelo canal privado do repositório (GitHub Security Advisories) descrevendo os passos para reprodução e o impacto estimado.
3. Assim que confirmada, a correção será priorizada e publicada na branch principal.
