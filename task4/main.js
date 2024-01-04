import setupData from "./setup.js";

let cards = JSON.parse(localStorage.getItem("cards")) ?? [];

let selectedId = null;

const cardKeys = ["title", "author", "thumbnail", "description"];

const submitButton = document.querySelector("[data-submit-button]");

const form = document.forms.create;

const reset = () => {
	selectedId = null;

	cardKeys.forEach((key) => (form.elements[key].value = ""));

	submitButton.innerHTML = "Добавить";
};

const sync = () => {
	localStorage.setItem("cards", JSON.stringify(cards));

	renderCards();
};

form.addEventListener("submit", (event) => {
	event.preventDefault();

	if (selectedId) {
		cards = cards.map((card) =>
			card.id === selectedId
				? {
						...card,
						...cardKeys.reduce(
							(acc, key) => ({ ...acc, [key]: form.elements[key].value }),
							{}
						),
				  }
				: card
		);

		sync();

		reset();
	} else {
		const newCard = cardKeys.reduce(
			(acc, key) => ({ ...acc, [key]: form.elements[key].value }),
			{}
		);

		newCard.id = Math.floor(Math.random() * 100000);

		cards.push(newCard);

		sync();
	}
});

const setupButton = document.querySelector("#setup");

setupButton.addEventListener("click", () => {
	cards = setupData;

	sync();

	reset();
});

const removeCard = (event) => {
	const id = +event.target.dataset.id;

	cards = cards.filter((card) => card.id !== id);

	sync();

	id === selectedId && reset();
};

const editCard = (event) => {
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

	const card = cards.find(({ id }) => id === selectedId);

	if (card) {
		event.target.innerHTML = "Отмена";

		cardKeys.map((key) => (form.elements[key].value = card[key]));

		submitButton.innerHTML = "Изменить";
	}
};

const container = document.querySelector("#root");

const renderCards = () => {
	container.innerHTML = cards
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
								data-id=${id}
								data-edit-button
								class="py-2 px-4 rounded-lg transition bg-blue-100/50 hover:bg-blue-100/80 active:bg-blue-100 focus-visible:ring outline-none"
							>
								Изменить
							</button>
							<button
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
		.forEach((btn) => btn.addEventListener("click", removeCard));

	document
		.querySelectorAll("[data-edit-button]")
		.forEach((btn) => btn.addEventListener("click", editCard));
};

renderCards();
