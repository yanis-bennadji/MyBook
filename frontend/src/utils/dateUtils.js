const months = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
];

export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();

  // Si c'est cette année, on n'affiche pas l'année
  if (year === currentYear) {
    return `${day} ${month}`;
  }
  
  return `${day} ${month} ${year}`;
}; 