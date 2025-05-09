function showSpinner() {
    document.getElementById('spinner-overlay').style.display = 'flex';
    document.getElementById('spinner-container').style.display = 'inline-block';
}

function hideSpinner() {
    document.getElementById('spinner-overlay').style.display = 'none';
    document.getElementById('spinner-container').style.display = 'none';
}


document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function () {
      // Remove 'active' class from all nav links
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
  
      // Hide all tab panes
      ['#index-container', '#note-container', '#search-container', '#layout-container'].forEach(id => {
        const el = document.querySelector(id);
        if (el) {
          el.classList.remove('show', 'active');
        }
      });
  
      // Show the selected tab pane
      const targetId = link.getAttribute('data-target');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        targetEl.classList.add('show', 'active');
      } else {
        console.warn('No element found for', targetId);
      }
    });
  });
  

