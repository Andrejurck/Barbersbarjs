//menu
const hamburger = document.getElementById('hamburger');
const nav = document.querySelector('.list');
//klik
hamburger.addEventListener('click', () => {
  nav.classList.toggle('open');
});

//modl okno  
const rezervaceModal = document.getElementById("modal");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.querySelector(".close");
//formular open
openModalBtn.addEventListener("click", () => {
  rezervaceModal.classList.add("show");
  document.body.classList.add("modal-open");
});
//folmular close
closeModalBtn.addEventListener("click", () => {
  rezervaceModal.classList.remove("show");
  document.body.classList.remove("modal-open"); 
});

//pix vyhledavani
const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const gallery = document.getElementById('image-gallery');
const imageModal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-img');
const modalInfo = document.getElementById('modal-info');
const closeImageModalBtn = document.getElementById('close-modal');
const spinner = document.getElementById('spinner');
const pagination = document.getElementById('pagination');
const pageInfo = document.getElementById('page-info');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const favoritesBtn = document.getElementById('show-favorites');

const API_KEY = '51290003-b36ce61794ca91522055ae78f'; 
const PER_PAGE = 12;
let currentPage = 1;
let currentQuery = '';
let showingFavorites = false;
//vyhledani
form.addEventListener('submit', (e) => {
  e.preventDefault();
  currentPage = 1;
  currentQuery = input.value.trim();
  showingFavorites = false;
  if (currentQuery) fetchImages();
});
//prechozi
prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchImages();
  }
});
//dalsi
nextBtn.addEventListener('click', () => {
  currentPage++;
  fetchImages();
});
//oblibene
favoritesBtn.addEventListener('click', () => {
  showingFavorites = true;
  displayImages(getFavorites());
  pagination.style.display = 'none';
});
//nacist obrazky
function fetchImages() {
  gallery.innerHTML = '';
  spinner.style.display = 'block';
  pagination.style.display = 'none';

  fetch(`https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(currentQuery)}&image_type=photo&page=${currentPage}&per_page=${PER_PAGE}`)
    .then(res => res.json())
    .then(data => {
      spinner.style.display = 'none';
      displayImages(data.hits);
      updatePagination(data.totalHits);
    })
    .catch(err => {
      spinner.style.display = 'none';
      gallery.innerHTML = '<p>Chyba při načítání obrázků.</p>';
      console.error(err);
    });
}
//zobrazeni obrazku v gal
function displayImages(images) {
  gallery.innerHTML = '';
  images.forEach(img => {
    const div = document.createElement('div');
    div.className = 'image-card';
    const isFavorite = isInFavorites(img.id);
    div.innerHTML = `
      <img src="${img.webformatURL}" alt="${img.tags}" data-id="${img.id}" data-author="${img.user}" data-tags="${img.tags}" data-downloads="${img.downloads}" data-likes="${img.likes}" />
      <button class="favorite-btn" data-id="${img.id}">${isFavorite ? '★' : '☆'}</button>
    `;
    gallery.appendChild(div);
  });
}
// klik obrazek = detaily
gallery.addEventListener('click', (e) => {
  if (e.target.tagName === 'IMG') {
    const img = e.target;
    modalImg.src = img.src;
    modalInfo.innerHTML = `
      <p><strong>Autor:</strong> ${img.dataset.author}</p>
      <p><strong>Tagy:</strong> ${img.dataset.tags}</p>
      <p><strong>Stažení:</strong> ${img.dataset.downloads}</p>
      <p><strong>Lajky:</strong> ${img.dataset.likes}</p>
    `;
    imageModal.style.display = 'flex';
  }
  //pridani do oblibenych
   if (e.target.classList.contains('favorite-btn')) {
   const id = e.target.dataset.id;
   toggleFavorite(id);
     if (showingFavorites) {
      displayImages(getFavorites());
     } else {
       fetchImages();
    }
   }
 });
// krizek
closeImageModalBtn.addEventListener('click', () => {
  imageModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === imageModal) imageModal.style.display = 'none';
});
//zavrit
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') imageModal.style.display = 'none';
});

function updatePagination(totalHits) {
  const totalPages = Math.ceil(totalHits / PER_PAGE);
  pagination.style.display = 'flex';
  pageInfo.textContent = `Strana ${currentPage} z ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}
//oblibene
function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites') || '[]');
}

function saveFavorites(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function toggleFavorite(id) {
  const favorites = getFavorites();
  const index = favorites.findIndex(img => img.id == id);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    const imgEl = document.querySelector(`img[data-id='${id}']`);
    favorites.push({
      id,
      webformatURL: imgEl.src,
      user: imgEl.dataset.author,
      tags: imgEl.dataset.tags,
      downloads: imgEl.dataset.downloads,
      likes: imgEl.dataset.likes
    });
  }
  saveFavorites(favorites);
}

function isInFavorites(id) {
  return getFavorites().some(img => img.id == id);
}

