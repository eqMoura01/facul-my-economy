# My Economy - Frontend

Este é o frontend da aplicação My Economy, um aplicativo móvel para controle de despesas pessoais desenvolvido com React Native e Expo.

## 📱 Funcionalidades

- Login e Registro de usuários
- Visualização de despesas diárias
- Controle de limites mensais
- Gerenciamento de perfil
- Histórico de despesas
- Tema escuro com acentos em verde

## 🚀 Como Iniciar

### Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn
- Expo CLI
- Um dispositivo móvel com Expo Go instalado ou um emulador

### Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd [NOME_DO_REPOSITORIO]/front
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Inicie o servidor de desenvolvimento:
```bash
npx expo start
# ou
yarn expo start
```

4. Para rodar o aplicativo:
   - Escaneie o QR code com o Expo Go (Android) ou Câmera (iOS)
   - Pressione 'a' no terminal para abrir no emulador Android
   - Pressione 'i' no terminal para abrir no emulador iOS

## 📦 Principais Dependências

- React Native
- Expo
- React Navigation
- @react-native-picker/picker
- Axios

## 🔧 Configuração do Ambiente

1. Certifique-se de que o backend está rodando
2. Verifique se o arquivo de configuração da API está apontando para o endereço correto do backend

## 📱 Telas

- **Login**: Autenticação do usuário
- **Registro**: Cadastro de novos usuários
- **Home**: Visualização das despesas diárias
- **Despesas**: Gerenciamento de despesas
- **Limites**: Controle de limites mensais
- **Perfil**: Informações do usuário

## 🎨 Tema

O aplicativo utiliza um tema escuro com as seguintes cores principais:
- Fundo: `#1C1C1C`
- Destaque: `#4CAF50` (Verde)
- Texto: `#FFFFFF`

## 🤝 Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Notas

- Certifique-se de que o backend está rodando antes de iniciar o frontend
- Para desenvolvimento, recomenda-se usar um dispositivo físico para melhor experiência
- Em caso de problemas com o Expo, tente limpar o cache: `expo start -c` 