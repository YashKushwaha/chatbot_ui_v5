
function showMarkdownOverlay(markdownText) {
  const overlay = document.createElement('div');
  overlay.className = 'markdown-overlay';

  const content = document.createElement('div');
  content.className = 'markdown-content';
  content.innerHTML = marked.parse(markdownText); // ← Use Marked.js here

  overlay.appendChild(content);
  document.body.appendChild(overlay);

  // Dismiss on click outside content
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });

  // Dismiss on Escape key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      document.body.removeChild(overlay);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

export {showMarkdownOverlay};