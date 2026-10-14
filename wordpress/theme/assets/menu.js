const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.store-navigation');
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  navigation.classList.toggle('mobile-open', open);
});
document.querySelectorAll('.nav-group').forEach(group => {
  group.addEventListener('toggle', () => {
    if (group.open) document.querySelectorAll('.nav-group').forEach(other => { if (other !== group) other.open = false; });
  });
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    document.querySelectorAll('.nav-group').forEach(group => { group.open = false; });
    navigation.classList.remove('mobile-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  }
});
