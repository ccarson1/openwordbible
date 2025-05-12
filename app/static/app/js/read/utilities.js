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

let sideMenuOpen = true

document.getElementById("side-menu-btn").addEventListener("click", function () {
  console.log("collapse");
  let sideMenu = document.getElementById("side-menu");

  if (sideMenuOpen == true) {
    document.getElementById("side-menu").style.transition = ".6s"
    document.getElementById("side-menu").style.border = "none";
    document.getElementById("side-menu").style.width = "0px";
    
    document.getElementById("side-menu").style.position = "absolute"


    console.log(document.getElementById("side-menu").style.width)
    sideMenuOpen = false;
  }
  else {
    document.getElementById("side-menu").style.width = "380px";
    document.getElementById("side-menu").style.position = "relative"
    document.getElementById("side-menu").style.borderRight = "1px solid black";
    sideMenuOpen = true;
  }
  toggle_children();

});


function toggle_children() {
  const sideMenu = document.getElementById("side-menu");
  const children = sideMenu.children;

  for (let i = 0; i < children.length; i++) {
    if (children[i].hidden == true) {
      children[i].hidden = false;
    }
    else {
      children[i].hidden = true;
    }


  }

}


