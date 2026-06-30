document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/menu');
        const { tapas, hamburguesas, bebidas } = await response.json();
        
        renderCategory('tapas', tapas, 'TAPAS', 'd4af37');
        renderCategory('hamburguesas', hamburguesas, 'HAMBURGUESAS', 'cd5c5c');
        renderCategory('bebidas', bebidas, 'BEBIDAS', 'f0e68c');
    } catch (err) {
        console.error('Error:', err);
    }
});

function renderCategory(containerId, items, title, color) {
    const container = document.getElementById(`${containerId}-container`);
    if (!items.length) return;

    let html = `
        <h2>${title}</h2>
        <img src="https://via.placeholder.com/800x200/${color}/FFFFFF?text=${encodeURIComponent(title)}" 
             alt="${title}" class="category-image">
    `;

    items.forEach(item => {
        html += `
            <div class="menu-item">
                <span class="item-name">${item.name}</span>
                <span class="item-price">${item.price.toFixed(2)}€</span>
                ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
            </div>
        `;
    });

    container.innerHTML = html;
}