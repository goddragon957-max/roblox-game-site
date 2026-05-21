const cards = document.querySelectorAll('.feature-card');
const reveal = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.animate([
        { opacity: 0, transform: 'translateY(18px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 520, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
      reveal.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

cards.forEach((card) => reveal.observe(card));
