# GuestList - App de RSVP 🎈

Aplicativo focado em permitir a contagem precisa de confirmações de presença para eventos (como festas infantis), separando o número de adultos e crianças para cálculos de buffet e lembrancinhas.

## Como rodar o projeto localmente

Para visualizar o aplicativo em sua máquina, siga os passos abaixo:

### Pré-requisitos
- Node.js instalado (versão 18+ recomendada)

### Passos Principais

1. **Abra o terminal** na raiz do projeto (`c:\projects\mguedes\guestlist`).
2. Caso ainda não tenha instalado as dependências, execute:
   ```bash
   npm install
   ```
3. **Inicie o servidor de desenvolvimento** rodando o comando:
   ```bash
   npm run dev
   ```
4. O terminal exibirá um link local (geralmente `http://localhost:5173`). Segure `Ctrl` e clique no link para abrir o app no seu navegador.

---

### Configurando o Banco de Dados (Firebase)

Por padrão, a aplicação roda com **Dados Mockados (Simulados)** para facilitar a validação visual do layout sem precisar de configurações complexas.

Se você já aprovou o layout e deseja plugar o app no **Firebase** real, siga os passos abaixo:

1. Crie um arquivo chamado `.env.local` na raiz do projeto (`c:\projects\mguedes\guestlist\.env.local`).
2. Cole o conteúdo abaixo preenchendo com as chaves do seu projeto Firebase:
   ```env
   VITE_USE_FIREBASE=true
   VITE_FIREBASE_API_KEY=sua_api_key
   VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
   VITE_FIREBASE_PROJECT_ID=seu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
   VITE_FIREBASE_APP_ID=seu_app_id
   ```
3. Reinicie o servidor (`npm run dev`) e o app passará a buscar e salvar os dados diretamente do Firestore (coleções `events`, `groups` e `guests`).
