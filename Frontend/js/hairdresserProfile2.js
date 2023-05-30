// import { renderLoadingSpinner } from "./renderSpinner";
let timeSlots = document.querySelectorAll(".appointment-slot");
const availableDates = document.querySelectorAll(".specific-date");

availableDates.forEach((date) => {
  date.addEventListener("click", function () {
    if (date.classList.contains("specific-date--active")) return;
    availableDates.forEach((date) => {
      date.classList.remove("specific-date--active");
    });
    date.classList.add("specific-date--active");
    const day = date.children[0].textContent;
    // console.log(day);
    if (day == "Tue") {
      const parentElement = document.querySelector(".appointments");
      parentElement.innerHTML = "";
      const markup = `<div class="appointment-slot slot--taken">09:00 - 10:00</div>
        <div class="appointment-slot">10:30 - 11:30</div>
        <div class="appointment-slot slot--active">12:00 - 13:00</div>
        <div class="appointment-slot">13:30 - 14:30</div>
        <div class="appointment-slot">15:00 - 16:00</div>
        <div class="appointment-slot">16:30 - 17:30</div>`;
      parentElement.insertAdjacentHTML("afterbegin", markup);
      timeSlots = document.querySelectorAll(".appointment-slot");
      activateSlots();
    } else {
      const parentElement = document.querySelector(".appointments");
      parentElement.innerHTML = "";
    }
  });
});

// console.log(timeSlots);
const activateSlots = () => {
  timeSlots.forEach((slot) => {
    if (slot.classList.contains("slot--taken")) return;
    slot.addEventListener("click", function (e) {
      // console.log(slot);
      // console.log(e.target);
      // if(slot.classList.contains('slot'))
      if (slot.classList.contains("slot--active")) {
        slot.classList.remove("slot--active");
      } else {
        removeFromClasslist();
        slot.classList.add("slot--active");
      }
    });
  });
};

const removeFromClasslist = () => {
  timeSlots.forEach((slot) => {
    if (slot.classList.contains("slot--taken")) return;
    // slot.classList.toggle("slot--active");
    slot.classList.remove("slot--active");
  });
};

activateSlots();

const renderLoadingSpinner = (fatherElement) => {
  fatherElement.innerHTML = "";
  const spinnerMarkup =
    '<div></div> <div class="render-spinner--bookmark container"></div>';

  fatherElement.insertAdjacentHTML("afterbegin", spinnerMarkup);
};

const bookmarkBtn = document.querySelector(".bookmark-btn--circle");
bookmarkBtn.addEventListener("click", function (e) {
  bookmarkBtn.disabled = true;
  if (document.querySelector(".bookmark-hairdresser")) {
    document.querySelector(".bookmark-icon").remove();
    renderLoadingSpinner(bookmarkBtn);
    setTimeout(function () {
      bookmarkBtn.innerHTML = "";
      const bookmarkMarkup =
        '<ion-icon class="bookmark-icon bookmarked" name="bookmark"></ion-icon>';
      bookmarkBtn.insertAdjacentHTML("afterbegin", bookmarkMarkup);
    }, 1000);
    bookmarkBtn.disabled = false;
  } else {
    bookmarkBtn.disabled = true;
    document.querySelector(".bookmarked").remove();
    renderLoadingSpinner(bookmarkBtn);
    setTimeout(function () {
      bookmarkBtn.innerHTML = "";
      const bookmarkMarkup =
        '<ion-icon class="bookmark-icon bookmark-hairdresser" name="bookmark-outline"></ion-icon>';
      bookmarkBtn.insertAdjacentHTML("afterbegin", bookmarkMarkup);
    }, 1000);
    bookmarkBtn.disabled = false;
  }
});
