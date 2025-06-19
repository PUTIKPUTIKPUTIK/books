let db;
let request = indexedDB.open("store");

request.onerror = (e) => {
  console.log("Something went wrong with database");
};

request.onsuccess = (e) => {
  db = e.target.result;
  showLoader();
  renderList();
  hideLoader();
};

request.onupgradeneeded = (e) => {
  db = e.target.result;
  db.createObjectStore("books", { keyPath: "id", autoIncrement: true });
};

document.getElementById("add-book-btn").addEventListener("click", () => {
  showForm();
});

document.getElementById("list-container").addEventListener("click", (e) => {
  if (e.target.dataset.id !== undefined) {
    showBook(e.target.dataset.id);
  }
});

let form = document.forms.addBookForm;

form.addEventListener("submit", (e) => {
  e.preventDefault();
  showLoader();

  let formData = new FormData(form);

  let reader = new FileReader();
  reader.readAsDataURL(formData.get("image"));
  let book;

  reader.onload = (e) => {
    let image = e.target.result;

    book = {
      id: uuidv4(),
      name: formData.get("name"),
      description: formData.get("description"),
      rate: formData.get("rate"),
      image: image,
    };

    let transaction = db.transaction(["books"], "readwrite");
    let addRequest = transaction.objectStore("books").add(book);

    addRequest.onerror = (e) => {
      console.log("Error while adding a book");
      console.log(e);
    };

    addRequest.onsuccess = (e) => {
      form.reset();
      renderList();
      showList();
      hideLoader();
    };
  };
});

function showBook(id) {
  let transaction = db.transaction(["books"]);
  let getRequest = transaction.objectStore("books").get(id);

  getRequest.onsuccess = (e) => {
    let book = e.target.result;
    document.getElementById("preview-container").innerHTML =
      renderPreviewBook(book);
  };
}

function renderPreviewBook(book) {
  return `<div class="preview-image-box">
            <img
              class="preview-image"
              src="${book.image}"
            />
          </div>
          <div class="preview-info-box">
            <span class="preview-book-name">${book.name}</span>
            <span class="preview-book-description">${book.description}</span>
            <div class="preview-rate-box">
              <span>RATE:</span>
              <span>${book.rate}</span>
            </div>
          </div>`;
}

function renderList() {
  let transaction = db.transaction(["books"]);
  let getRequest = transaction.objectStore("books").getAll();

  getRequest.onsuccess = (e) => {
    let books = e.target.result;
    document.getElementById("list").innerHTML = books
      .map((book) => renderListItem(book))
      .join("");
  };
}

function renderListItem(book) {
  return `<li key=${book.id} class="book">
            <div class="book-img-box">
              <img class="book-img" src="${book.image}"/>
            </div>
            <div class="book-info-box">
              <span class="book-name">${book.name}</span>
              <span class="book-description">${book.description}</span>
              <div class="book-rate-box">
                <span>RATE:</span>
                <span>${book.rate}</span>
              </div>
            </div>
            <btn data-id="${book.id}" class="open-book-btn">OPEN</btn>
          </li>`;
}

function showList() {
  document.getElementById("list-container").style.display = "flex";
  document.getElementById("add-book-container").style.display = "none";
}

function showForm() {
  document.getElementById("list-container").style.display = "none";
  document.getElementById("add-book-container").style.display = "flex";
}

function showLoader() {
  document.getElementById("loader").style.display = "block";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16)
  );
}
