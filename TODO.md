# TODO - Refactorización Bar Castelló

## Fase 1: Estructura EJS ✅ COMPLETADO
- [x] 1.1 Crear carpeta views/partials/
- [x] 1.2 Crear partial header.ejs
- [x] 1.3 Crear partial navbar.ejs
- [x] 1.4 Crear partial footer.ejs
- [x] 1.5 Crear layout principal layout.ejs

## Fase 2: Migración de páginas ✅ COMPLETADO
- [x] 2.1 Migrar inicio.html → inicio.ejs
- [x] 2.2 Migrar carta.html → carta.ejs
- [x] 2.3 Migrar cartaDinamica_FINAL.html → cartaDinamica.ejs
- [x] 2.4 Migrar admin.html → admin.ejs

## Fase 3: CSS Organizado ✅ COMPLETADO
- [x] 3.1 Crear styles/main.css (variables y reset)
- [x] 3.2 Crear styles/components.css
- [x] 3.3 Crear styles/traditional.css (estilo taberna española)
- [x] 3.4 Crear styles/responsive.css

## Fase 4: Refactorizar Backend ✅ COMPLETADO
- [x] 4.1 Crear server.js limpio con EJS
- [x] 4.2 Rutas API organizadas con funciones CRUD reutilizables
- [x] 4.3 Sistema de plantillas EJS configurado

## Fase 5: Nuevo diseño tradicional ✅ COMPLETADO
- [x] 5.1 Estética de taberna española implementada
- [x] 5.2 Paleta de colores original mantenida (#5a2d07, #7b4f2c, #d4af37)
- [x] 5.3 Elementos decorativos tradicionales (ornamentos ❧, divisores)

---

## ESTRUCTURA FINAL DEL PROYECTO

```
BarCastello/
├── views/
│   ├── partials/
│   │   ├── header.ejs      # Header con logo y diseño tradicional
│   │   ├── navbar.ejs      # Navegación
│   │   └── footer.ejs      # Footer con información de contacto
│   ├── inicio.ejs         # Página de inicio
│   ├── carta.ejs           # Carta estática
│   ├── cartaDinamica.ejs   # Carta dinámica con API
│   ├── admin.ejs           # Panel de administración
│   └── layout.ejs          # Layout base
├── public/
│   ├── styles/
│   │   ├── main.css        # Variables CSS y estilos base
│   │   ├── components.css  # Componentes reutilizables
│   │   ├── traditional.css # Estilo taberna española
│   │   └── responsive.css  # Estilos responsive
│   └── js/
│       └── main.js         # JavaScript principal
├── server.js               # Servidor Express con EJS
├── package.json            # Dependencias
└── README.md              # Documentación
```

## DISEÑO TRADICIONAL ESPAÑOL IMPLEMENTADO

### Elementos visuales:
- **Colores**: Marrones cálidos (#5a2d07, #7b4f2c) y dorado (#d4af37)
- **Tipografías**: Playfair Display (títulos), Crimson Text (texto), Montserrat (UI)
- **Decoraciones**: Ornamentos tradicionales (❧), divisoresdorados
- **Texturas**: Efecto papel antiguo sutil

### Componentes:
- Header con efecto de imagen de fondo
- Navegación sticky con hover dorado
- Tarjetas de menú con imágenes
- Secciones con bordes decorativos
- Footer con forma de onda tradicional

