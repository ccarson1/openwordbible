document.addEventListener('DOMContentLoaded', () => {
    const tagInput = document.getElementById('note-tags');
    const suggestionsList = document.getElementById('tag-suggestions');

    tagInput.addEventListener('input', async () => {
        console.log("start")
        const query = tagInput.value.trim();

        // Clear old suggestions
        suggestionsList.innerHTML = '';
        if (query.length === 0) return;

        try {
            const response = await fetch(`/api/tags/?search=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Failed to fetch tags');
            const tags = await response.json();

            tags.forEach(tag => {
                const item = document.createElement('li');
                item.textContent = tag.name; // adjust if response shape is different
                item.classList.add('list-group-item', 'list-group-item-action');
                item.addEventListener('click', () => {
                    tagInput.value = tag.name;
                    suggestionsList.innerHTML = ''; // hide suggestions
                });
                suggestionsList.appendChild(item);
            });
        } catch (err) {
            console.error('Tag fetch error:', err);
        }
    });

    // Hide dropdown on blur
    tagInput.addEventListener('blur', () => {
        setTimeout(() => suggestionsList.innerHTML = '', 200);
    });
});