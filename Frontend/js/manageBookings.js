import axios from "axios";
// import "@babel/polyfill";
import { renderAppMsg } from "./displayAppMsg";

export const manageMyBookings = () => {
  const acceptBookingBtn = document.querySelector(".accept-booking--btn");
  const cancelBookingBtn = document.querySelector(".cancel-booking--btn");
  const completeBookingBtn = document.querySelector(".complete-booking--btn");
  if (acceptBookingBtn) initialiseAcceptBtn(acceptBookingBtn, cancelBookingBtn);
  if (cancelBookingBtn) initialiseCancelBtn(acceptBookingBtn, cancelBookingBtn);
  if (completeBookingBtn) initialiseCompleteBtn(completeBookingBtn);
};

export const manageMyBookingsClient = () => {
  const cancelBookingBtn = document.querySelector(".cancel-booking--btn");
  const addReviewBtn = document.querySelector(".leave-review--btn");
  const shadedBackground = document.querySelector(".shaded-background");
  const cancelFormBtn = document.querySelector(".btn-cancel");
  const closeFormBtn = document.querySelector(".close-services-form");

  if (addReviewBtn) {
    initialiseAddReviewBtn(addReviewBtn);
  }

  if (shadedBackground) {
    shadedBackground.addEventListener("click", (e) => {
      removeServiceForm();
    });
  }

  if (cancelFormBtn) {
    cancelFormBtn.addEventListener("click", removeServiceForm);
  }

  if (closeFormBtn) {
    closeFormBtn.addEventListener("click", removeServiceForm);
  }

  if (cancelBookingBtn) {
    cancelBookingBtn.addEventListener("click", async () => {
      cancelBookingBtn.textContent = "Cancelling...";
      cancelBookingBtn.disabled = true;
      cancelBookingBtn.classList.add("cancelling--btn");

      await updateBookingStatusClient(
        document.querySelector(".booking-detail").dataset.bookingid,
        "Cancelled"
      );
    });
  }
};

const initialiseAddReviewBtn = (addReviewBtn) => {
  addReviewBtn.addEventListener("click", (e) => {
    displayServiceForm();
  });

  const reviewRating = document.querySelector(".review-rating-options");
  reviewRating.addEventListener("change", () => {
    // console.log("changed", reviewRating.selectedIndex);
    // console.log(reviewRating.options[reviewRating.selectedIndex].value);
    const starsElement = document.querySelector(".review-stars");
    if (reviewRating.selectedIndex == 0) {
      starsElement.style = "--star-rating: 0";
    } else {
      starsElement.style = `--star-rating: ${
        reviewRating.options[reviewRating.selectedIndex].value
      }`;
    }
  });

  const btnSubmitForm = document.querySelector(".services-form--edit-add");
  btnSubmitForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const reviewDescription =
      document.getElementById("review-description").value;
    const starRating = document.getElementById("review-rating-options").value;

    // console.log(reviewDescription, starRating);
    const btnSubmit = document.querySelector(".btn-submit");
    btnSubmit.textContent = "Submitting...";
    btnSubmit.disabled = true;
    btnSubmit.style.background = "#2b8a3e";

    const cancelBtn = document.querySelector(".btn-cancel");
    cancelBtn.removeEventListener("click", removeServiceForm);

    const closeFormBtn = document.querySelector(".close-services-form");
    closeFormBtn.disabled = true;

    const shadedBackground = document.querySelector(".shaded-background");
    shadedBackground.removeEventListener("click", removeServiceForm);
    // shadedBackground.disabled = true;

    await createNewReview({
      hairdresser: document.querySelector(".hairdresser-card-header").dataset
        .hairdresserid,
      booking: document.querySelector(".booking-detail").dataset.bookingid,
      review: reviewDescription,
      starRating: starRating,
    });
  });
};

const displayServiceForm = () => {
  const windowForm = document.querySelector(".services-form--window");
  const shadedBackground = document.querySelector(".shaded-background");
  windowForm.classList.remove("hide");
  shadedBackground.classList.remove("hide");
};

const removeServiceForm = () => {
  const windowForm = document.querySelector(".services-form--window");
  const shadedBackground = document.querySelector(".shaded-background");
  windowForm.classList.add("hide");
  shadedBackground.classList.add("hide");
};

const initialiseCompleteBtn = (completeBtn) => {
  completeBtn.addEventListener("click", async () => {
    completeBtn.textContent = "Completing...";
    completeBtn.disabled = true;
    completeBtn.classList.add("accepting--btn");
    // changeBookingPage_Complete();

    await updateBookingStatus(
      document.querySelector(".booking-detail").dataset.bookingid,
      "Completed"
    );
  });
};

const initialiseCancelBtn = (acceptBookingBtn, cancelBookingBtn) => {
  cancelBookingBtn.addEventListener("click", async () => {
    cancelBookingBtn.textContent = "Cancelling...";
    acceptBookingBtn.disabled = true;
    cancelBookingBtn.disabled = true;
    cancelBookingBtn.classList.add("cancelling--btn");

    await updateBookingStatus(
      document.querySelector(".booking-detail").dataset.bookingid,
      "Cancelled"
    );
  });
};

const initialiseAcceptBtn = (acceptBookingBtn, cancelBookingBtn) => {
  acceptBookingBtn.addEventListener("click", async () => {
    // console.log("ACCEPTED");
    acceptBookingBtn.textContent = "Accepting...";
    acceptBookingBtn.disabled = true;
    cancelBookingBtn.disabled = true;
    acceptBookingBtn.classList.add("accepting--btn");

    // console.log(document.querySelector(".booking-detail").dataset.bookingid);
    await updateBookingStatus(
      document.querySelector(".booking-detail").dataset.bookingid,
      "Accepted"
    );
    // cancelBookingBtn.remove();
    // acceptBookingBtn.remove();
  });
};

const updateBookingStatusClient = async (bookingId, status) => {
  try {
    const sendReq = await axios({
      method: "PATCH",
      url: `http://127.0.0.1:8000/api/bookings/editBooking/${bookingId}`,
      data: {
        bookingStatus: status,
      },
    });

    if (sendReq.data.status === "success") {
      const cancelBookingBtn = document.querySelector(".cancel-booking--btn");
      cancelBookingBtn.remove();

      const bookingStatus = document.querySelector(
        ".booking-status-color-Placed"
      );
      bookingStatus.classList.remove("booking-status-color-Placed");
      bookingStatus.classList.add("booking-status-color-Cancelled");
      bookingStatus.textContent = "Cancelled";

      const goBackBtn = document.querySelector(".go-back--btn");
      goBackBtn.remove();

      const parentBtnsDiv = document.querySelector(".reset-confirmation--btns");
      const btnsMarkup =
        '<a class="btn btn--cta margin-right-sm go-back--btn" href="/my-booking-history">View your bookings</a>';
      parentBtnsDiv.insertAdjacentHTML("afterbegin", btnsMarkup);

      renderAppMsg("successful", "Updated Booking Status!");
    }
  } catch (error) {
    const cancelBookingBtn = document.querySelector(".cancel-booking--btn");

    cancelBookingBtn.textContent = "Cancel this Request";
    cancelBookingBtn.classList.remove("cancelling--btn");
    cancelBookingBtn.disabled = false;
    renderAppMsg("failure", error.response.data.message);
  }
};

const updateBookingStatus = async (bookingId, status) => {
  try {
    const sendReq = await axios({
      method: "PATCH",
      url: `http://127.0.0.1:8000/api/bookings/editBooking/${bookingId}`,
      data: {
        bookingStatus: status,
      },
    });

    if (sendReq.data.status === "success") {
      //   console.log(sendReq.data.data.data.bookingStatus);
      if (sendReq.data.data.data.bookingStatus === "Accepted") {
        const acceptBookingBtn = document.querySelector(".accept-booking--btn");
        acceptBookingBtn.remove();
        changeBookingPage();
      } else if (sendReq.data.data.data.bookingStatus === "Cancelled") {
        const cancelBookingBtn = document.querySelector(".cancel-booking--btn");
        cancelBookingBtn.remove();
        changeBookingPage_Cancel();
      } else if (sendReq.data.data.data.bookingStatus === "Completed") {
        const completeBookingBtn = document.querySelector(
          ".complete-booking--btn"
        );
        completeBookingBtn.remove();
        changeBookingPage_Complete();
      }

      renderAppMsg("successful", "Updated Booking Status!");
    }
  } catch (error) {
    const acceptBookingBtn = document.querySelector(".accept-booking--btn");
    const cancelBookingBtn = document.querySelector(".cancel-booking--btn");
    const completeBookingBtn = document.querySelector(".complete-booking--btn");

    if (cancelBookingBtn) {
      cancelBookingBtn.textContent = "Cancel this Request";
      cancelBookingBtn.classList.remove("cancelling--btn");
      cancelBookingBtn.disabled = false;
    }

    if (acceptBookingBtn) {
      acceptBookingBtn.textContent = "Accept this Booking";
      acceptBookingBtn.disabled = false;
      acceptBookingBtn.classList.remove("accepting--btn");
    }

    if (completeBookingBtn) {
      completeBookingBtn.textContent = "Complete Appointment";
      completeBookingBtn.disabled = false;
      completeBookingBtn.classList.remove("accepting--btn");
    }

    renderAppMsg("failure", error.response.data.message);
  }
};

const changeBookingPage_Complete = () => {
  const bookingStatus = document.querySelector(
    ".booking-status-color-Accepted"
  );
  bookingStatus.classList.remove("booking-status-color-Placed");
  bookingStatus.classList.add("booking-status-color-completed");
  bookingStatus.textContent = "Completed";

  //
  const cardPartition = document.querySelector(
    ".card-profile--partition-Accepted"
  );
  cardPartition.classList.remove("card-profile--partition-Accepted");
  // cardPartition.classList.add("card-profile--partition-Cancelled");

  const cardNameHeading = document.querySelector(
    ".hairdresser-name--heading-Accepted"
  );
  cardNameHeading.classList.remove("hairdresser-name--heading-Accepted");
  // cardNameHeading.classList.add("hairdresser-name--heading-Cancelled");

  const cardBookingStatus = document.querySelector(".booking-status");
  cardBookingStatus.textContent = "COMPLETED";

  const cardStatusColour = document.querySelector(".Accepted-status");
  cardStatusColour.classList.remove("Accepted-status");
  cardStatusColour.classList.add("completed-status");
};

const changeBookingPage_Cancel = () => {
  const bookingStatus = document.querySelector(".booking-status-color-Placed");
  bookingStatus.classList.remove("booking-status-color-Placed");
  bookingStatus.classList.add("booking-status-color-Cancelled");
  bookingStatus.textContent = "Cancelled";

  const goBackBtn = document.querySelector(".go-back--btn");
  goBackBtn.remove();

  const parentBtnsDiv = document.querySelector(".reset-confirmation--btns");
  const btnsMarkup =
    '<a class="btn btn--cta margin-right-sm go-back--btn" href="/my-appointments">View your bookings</a>';
  parentBtnsDiv.insertAdjacentHTML("afterbegin", btnsMarkup);

  const cardPartition = document.querySelector(
    ".card-profile--partition-Placed"
  );
  cardPartition.classList.remove("card-profile--partition-Placed");
  cardPartition.classList.add("card-profile--partition-Cancelled");

  const cardNameHeading = document.querySelector(
    ".hairdresser-name--heading-Placed"
  );
  cardNameHeading.classList.remove("hairdresser-name--heading-Placed");
  cardNameHeading.classList.add("hairdresser-name--heading-Cancelled");

  const cardBookingStatus = document.querySelector(".booking-status");
  cardBookingStatus.textContent = "CANCELLED";

  const cardStatusColour = document.querySelector(".Placed-status");
  cardStatusColour.classList.remove("Placed-status");
  cardStatusColour.classList.add("Cancelled-status");
};

const changeBookingPage = () => {
  const bookingStatus = document.querySelector(".booking-status-color-Placed");
  bookingStatus.classList.remove("booking-status-color-Placed");
  bookingStatus.classList.add("booking-status-color-Accepted");
  bookingStatus.textContent = "Accepted";

  const goBackBtn = document.querySelector(".go-back--btn");
  if (goBackBtn) {
    goBackBtn.remove();
  }

  const parentBtnsDiv = document.querySelector(".reset-confirmation--btns");
  const btnsMarkup =
    '<a class="btn btn--cta margin-right-sm go-back--btn" href="/my-appointments">View your bookings</a> <button class="btn complete-booking--btn">Complete Appointment</button>';
  parentBtnsDiv.insertAdjacentHTML("afterbegin", btnsMarkup);
  const cancelBookingBtn = document.querySelector(".cancel-booking--btn");
  cancelBookingBtn.remove();

  const cardPartition = document.querySelector(
    ".card-profile--partition-Placed"
  );
  cardPartition.classList.remove("card-profile--partition-Placed");
  cardPartition.classList.add("card-profile--partition-Accepted");

  const cardNameHeading = document.querySelector(
    ".hairdresser-name--heading-Placed"
  );
  cardNameHeading.classList.remove("hairdresser-name--heading-Placed");
  cardNameHeading.classList.add("hairdresser-name--heading-Accepted");

  const cardBookingStatus = document.querySelector(".booking-status");
  cardBookingStatus.textContent = "ACCEPTED";

  const cardStatusColour = document.querySelector(".Placed-status");
  cardStatusColour.classList.remove("Placed-status");
  cardStatusColour.classList.add("Accepted-status");

  const completeBookingBtn = document.querySelector(".complete-booking--btn");
  initialiseCompleteBtn(completeBookingBtn);
};

const createNewReview = async (data) => {
  try {
    const sendReq = await axios({
      method: "POST",
      url: "http://127.0.0.1:8000/api/reviews",
      data,
    });

    if (sendReq.data.status === "success") {
      renderAppMsg("successful", "Review submitted!");
      removeServiceForm();
      // console.log(sendReq.data.data.review);
      // console.log(document.getElementsByTagName("main"));
      manageNewReview(
        sendReq.data.data.review,
        sendReq.data.data.hairdresserData,
        sendReq.data.data.clientImg
      );
    }
  } catch (error) {
    renderAppMsg("failure", "Something went wrong, please try again");
    location.reload();
  }
};

const manageNewReview = (review, hairdresserData, clientImg) => {
  const addReviewBtn = document.querySelector(".leave-review--btn");
  addReviewBtn.remove();

  const profileStarRating = document.querySelector(".profile-star-rating");
  profileStarRating.style = `--star-rating: ${hairdresserData.starRating}`;

  document.querySelector(".star-rating-num").textContent =
    hairdresserData.starRating;
  const numOfRatings = document.querySelector(".num-of-ratings");
  numOfRatings.textContent = `ratings (${hairdresserData.numOfReviews})`;

  const name = document.querySelector(".detail-part").dataset.client;
  const profileImg = document.querySelector(".review--booking-details-section")
    .dataset.clientimg;
  // console.log(name);
  const parentEl = document.querySelector(".main");
  const reviewSectionHTML = `<section class="booking-detail--review-section">
  <div class="container review--container">
    <div class="div-review--container">
      <img class="review-profile-photo" src="/Frontend/img/customers/${clientImg}" alt="review profile Img">
      <div class="review--second-part">
        <div class="review-name-part">
          <p class="review-name">${name}</p>
        </div>
        <p class="review-description">
          "${review.review}"
        </p>
        <div class="profile-rating review-star-rating">
          <div class="profile-stars">
            <div class="star-rating-num">${review.starRating}</div>
            <div class="profile-star-rating" style="--star-rating: ${review.starRating}"></div>
          </div>
        </div>
        <div class="review-id-info">
          <div>
            <div class="star-rating-num sm-label">Client No</div>
            <span class="num-of-ratings clientId-num-of-ratings">${review.client}</span>
          </div>
          <div>
            <div class="star-rating-num sm-label">Booking No</div>
            <span class="num-of-ratings clientId-num-of-ratings">${review.booking}</span>
          </div>
        </div>
      </div>
    </div>
</div></section>`;
  // console.log(reviewSectionHTML);
  parentEl.insertAdjacentHTML("afterbegin", reviewSectionHTML);
};
