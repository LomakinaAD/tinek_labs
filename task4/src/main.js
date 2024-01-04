const BASE_URL = "http://localhost:3000";

let books = [];

let selectedId = null;

const bookKeys = ["title", "author", "thumbnail", "description"];

const submitButton = document.querySelector("[data-submit-button]");

const form = document.forms.create;

const container = document.querySelector("#root");

const loader = document.querySelector("#loader");

const startLoading = () => {
	loader.style.display = "flex";
};

const stopLoading = () => {
	loader.style.display = "none";
};

const renderBooks = () => {
	container.innerHTML = books
		.map(
			({ id, title, author, description, thumbnail }) => `
	<div	tabindex="0"
					class="card p-10 focus-visible:ring outline-none min-h-24 shadow rounded-lg flex gap-6"
				>
					<img
						alt=${title}
						src=${thumbnail}
						class="w-36 thumbnail"
					/>
					<div class="flex flex-col justify-between flex-grow gap-4">
						<div>
							<h2 class="font-bold text-xl">${title}</h2>
							<p class="text-sm text-gray-600">${author}</p>
							<p class="mt-4 text-sm text-gray-600 line-clamp-6">
								${description}
							</p>
						</div>
						<div class="flex items-center justify-end gap-4">
							<button
								type="button"
								data-id=${id}
								data-edit-button
								class="py-2 px-4 rounded-lg transition bg-blue-100/50 hover:bg-blue-100/80 active:bg-blue-100 focus-visible:ring outline-none"
							>
								Изменить
							</button>
							<button
								type="button"
								data-id=${id}
								data-remove-button
								class="py-2 px-4 rounded-lg transition bg-red-100/60 hover:bg-red-100/80 active:bg-red-100 focus-visible:ring outline-none"
							>
								Удалить
							</button>
						</div>
					</div>
				</div>`
		)
		.join("");

	document
		.querySelectorAll("[data-remove-button]")
		.forEach((btn) => btn.addEventListener("click", deleteBook));

	document
		.querySelectorAll("[data-edit-button]")
		.forEach((btn) => btn.addEventListener("click", editBook));
};

const fetchInitial = async () => {
	try {
		startLoading();

		let booksRequest = fetch(`${BASE_URL}/books`);
		let authorRequest = fetch(`${BASE_URL}/author`);

		const result = await Promise.all([booksRequest, authorRequest]);

		if (result.some((res) => !res.ok)) {
			console.log("error fetching initial data");
		} else {
			[booksRequest, authorRequest] = result;

			const booksJSON = await booksRequest.json();
			const { name, group } = await authorRequest.json();

			const authorContainer = document.querySelector("#author");
			authorContainer.innerHTML = `${name} ${group}`;

			books = booksJSON;

			renderBooks();
		}
	} catch (err) {
		console.log(err);
	} finally {
		stopLoading();
	}
};

fetchInitial();

const deleteBook = async (event) => {
	const id = +event.target.dataset.id;

	try {
		startLoading();

		const res = await fetch(`${BASE_URL}/books/${id}`, {
			method: "DELETE",
		});

		if (res.ok) {
			books = books.filter((book) => book.id !== id);

			renderBooks();

			id === selectedId && reset();
		} else {
			console.log("error deleting book");
		}
	} catch (error) {
		console.log(error);
	} finally {
		stopLoading();
	}
};

const reset = () => {
	selectedId = null;

	bookKeys.forEach((key) => (form.elements[key].value = ""));

	submitButton.innerHTML = "Добавить";
};

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	submitButton.disabled = true;
	submitButton.innerHTML = "Загрузка...";

	let newBook = bookKeys.reduce(
		(acc, key) => ({ ...acc, [key]: form.elements[key].value }),
		{}
	);

	if (selectedId) {
		try {
			startLoading();

			const res = await fetch(`${BASE_URL}/books/${selectedId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newBook),
			});

			if (res.ok) {
				books = books.map((book) =>
					book.id === selectedId ? { ...newBook, id: selectedId } : book
				);

				renderBooks();
			} else {
				console.log("Error adding book");
			}
		} catch (error) {
			console.log(error);
		} finally {
			submitButton.disabled = false;

			submitButton.innerHTML = "Добавить";

			reset();

			stopLoading();
		}
	} else {
		newBook.id = Math.floor(Math.random() * 100000);

		try {
			startLoading();

			const res = await fetch(`${BASE_URL}/books`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newBook),
			});

			if (res.ok) {
				const book = await res.json();

				books.push(book);

				renderBooks();
			} else {
				console.log("Error adding book");
			}
		} catch (error) {
			console.log(error);
		} finally {
			submitButton.disabled = false;

			submitButton.innerHTML = "Добавить";

			reset();

			stopLoading();
		}
	}
});

const editBook = (event) => {
	const id = +event.target.dataset.id;

	if (selectedId === id) {
		reset();

		event.target.innerHTML = "Изменить";

		return;
	}

	if (selectedId) {
		document.querySelector(
			`[data-edit-button][data-id="${selectedId}"]`
		).innerHTML = "Изменить";
	}

	selectedId = id;

	const book = books.find(({ id }) => id === selectedId);

	if (book) {
		event.target.innerHTML = "Отмена";

		bookKeys.map((key) => (form.elements[key].value = book[key]));

		submitButton.innerHTML = "Изменить";
	}
};
