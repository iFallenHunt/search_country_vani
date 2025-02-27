# Search Countries

Uma aplicação web elegante e minimalista para explorar informações sobre países usando a API Rest Countries.

## 🌟 Funcionalidades

- 🔍 Busca de países por nome
- 🌍 Filtros por região, idioma e continente
- 📱 Design responsivo
- 🌓 Modo escuro
- 🌐 Suporte para múltiplos idiomas (Português e Inglês)
- 💖 Sistema de favoritos
- 📋 Visualização em grade e lista
- ⚡ Interface rápida e otimizada

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (jQuery)
- Bootstrap 5
- Font Awesome
- Rest Countries API

## 🚀 Como Executar

1. Clone o repositório:
```bash
git clone https://seu-repositorio/search-countries.git
cd search-countries
```

2. Abra o arquivo `index.html` em seu navegador web preferido.

## 📦 Estrutura do Projeto

```
search-countries/
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── main.js
│       └── translations.js
└── README.md
```

## 🎨 Interface

### Modo Claro
- Design limpo e minimalista
- Alta legibilidade
- Cores suaves e agradáveis

### Modo Escuro
- Redução da fadiga visual
- Contraste otimizado
- Experiência noturna confortável

## 🔄 API

O projeto utiliza a [Rest Countries API](https://restcountries.com/) para obter informações detalhadas sobre os países. A API é consumida através de requisições AJAX usando jQuery.

### Endpoints Utilizados

- `GET https://restcountries.com/v3.1/all` - Obtém todos os países
- `GET https://restcountries.com/v3.1/name/{name}` - Busca países por nome

## 💾 Armazenamento Local

O aplicativo utiliza o localStorage para persistir:
- Países favoritos
- Preferência de tema (claro/escuro)
- Idioma selecionado

## 🌐 Internacionalização

Suporte completo para:
- Português (Brasil)
- Inglês

## 🔍 Funcionalidades de Busca e Filtro

- Busca em tempo real
- Filtros combinados
- Paginação dinâmica
- Alternância entre visualizações (grade/lista)

## 📱 Responsividade

O aplicativo é totalmente responsivo e se adapta a diferentes tamanhos de tela:
- Desktop (1200px+)
- Laptop (992px-1199px)
- Tablet (768px-991px)
- Mobile (< 768px)

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🎯 Próximos Passos

- [ ] Adicionar mais idiomas
- [ ] Implementar testes automatizados
- [ ] Adicionar mais informações sobre os países
- [ ] Implementar comparação entre países
- [ ] Adicionar gráficos e estatísticas

## 📞 Contato

Para questões e sugestões, por favor abra uma issue no repositório. 