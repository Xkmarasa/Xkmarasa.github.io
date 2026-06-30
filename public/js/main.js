// ========================================
// BAR CASTELLÓ - JavaScript Principal
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes
    initNavigation();
    initScrollEffects();
    initAnimations();
});

// Navegación móvil
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('collapsed');
            navMenu.classList.toggle('expanded');
        });
    }
    
    // Resaltar página actual
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.parentElement.classList.add('active');
        }
    });
}

// Efectos de scroll
function initScrollEffects() {
    const header = document.querySelector('.main-header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Animaciones
function initAnimations() {
    // Animación de elementos al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.menu-card, .category, .section').forEach(el => {
        observer.observe(el);
    });
}

// Funciones globales para el menú
window.loadMenuSimple = async function(endpoint, containerId) {
    try {
        const response = await fetch(`/api/${endpoint}`);
        const items = await response.json();
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'simple-menu-item';
            li.innerHTML = `
                <span class="simple-menu-name">${item.name}</span>
                <span class="simple-menu-price">${item.price}€</span>
            `;
            container.appendChild(li);
        });
    } catch (error) {
        console.error('Error cargando el menú simple:', error);
    }
};

window.loadMenu = async function(endpoint, containerId, defaultImage) {
    try {
        const response = await fetch(`/api/${endpoint}`);
        const items = await response.json();
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'menu-card';
            div.innerHTML = `
                <img src="${item.image || defaultImage}" alt="${item.name}" class="menu-card-image">
                <div class="menu-card-body">
                    <h3 class="menu-card-title">${item.name} <span class="menu-card-price">${item.price}€</span></h3>
                    ${item.description ? `<p class="menu-card-description">${item.description}</p>` : ''}
                </div>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Error cargando el menú:', error);
    }
};

// Utilidades
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Exportar funciones utilities
window.BarCastello = {
    showNotification,
    loadMenuSimple: window.loadMenuSimple,
    loadMenu: window.loadMenu
};

