import "@babel/polyfill";
import axios from "axios";
import { renderAppMsg } from "./displayAppMsg";

export const hairdresserState = {
  services: [],
};

export const manageMyServices = (serviceCards) => {
  initialiseCardPanel(serviceCards);
  retrieveServices();
  const serviceSearchBar = document.querySelector(".search-services-input");

  serviceSearchBar.addEventListener("keyup", (e) => {
    const searchValue = e.target.value.toLowerCase();
    const filteredServices = hairdresserState.services.filter((serviceObj) => {
      return !serviceObj.children[0].textContent
        .toLowerCase()
        .includes(searchValue);
    });

    // console.log(filteredServices);
    displayServices(filteredServices);
  });
};

const displayServices = (searchServices) => {
  hairdresserState.services.forEach((service) => {
    service.style.display = "";
  });

  if (searchServices.length > 0) {
    searchServices.forEach((service) => {
      // console.log(service);
      service.style.display = "none";
    });
  }
};

const retrieveServices = () => {
  const allServiceCards = document.querySelectorAll(".service-card");
  // const hairdresserServices = {
  //   id: allServiceCards[0].dataset.serviceid,
  //   name: allServiceCards[0].children[0].textContent,
  //   price: allServiceCards[0].children[1].textContent,
  //   description: allServiceCards[0].children[2].textContent,
  // };
  hairdresserState.services = [...allServiceCards];
  // selectedState.allServices = [...allServiceCards].map((service) => {
  //   return {
  //     id: service.dataset.serviceid,
  //     name: service.children[0].textContent,
  //     price: service.children[1].textContent,
  //     description: service.children[2].textContent,
  //   };
  // });
};

const initialiseCardPanel = (serviceCards) => {
  initialiseAddBtn();

  const formElement = document.querySelector(".services-form--window");
  const deleteBtns = document.querySelectorAll(".service--delete-btn");
  [...deleteBtns].forEach((deleteBtn) => {
    deleteBtn.addEventListener("click", (e) => {
      displayServiceForm();
      const deleteFormMarkup = renderDeleteConfirmation();

      formElement.innerHTML = "";
      formElement.insertAdjacentHTML("afterbegin", deleteFormMarkup);

      const closeFormBtn = document.querySelector(".close-services-form");
      closeFormBtn.addEventListener("click", (e) => {
        removeServiceForm();
      });

      document
        .querySelector(".btn--cancel-delete")
        .addEventListener("click", removeServiceForm);

      document
        .querySelector(".btn-delete")
        .addEventListener("click", async () => {
          await deleteServiceAPI(
            deleteBtn.parentElement.parentElement.dataset.serviceid
          );
          deleteBtn.parentElement.parentElement.remove();
          removeServiceForm();
          initialiseCardPanel();
          retrieveServices();
        });
    });
  });
  // console.log(serviceCards);
  // [...serviceCards].forEach((service) => {
  //   console.log(service.children[3].children);
  // });
  // const windowForm = document.querySelector(".services-form--window");
  const shadedBackground = document.querySelector(".shaded-background");
  // const btnsOpenModal = document.querySelectorAll('.btn--show-modal');

  const editBtns = document.querySelectorAll(".service--edit-btn");
  [...editBtns].forEach((editBtn) => {
    editBtn.addEventListener("click", (e) => {
      // console.log(editBtn.parentElement.parentElement);
      displayServiceForm();
      presetServiceData(editBtn.parentElement.parentElement);
    });
  });

  shadedBackground.addEventListener("click", (e) => {
    removeServiceForm();
  });
};

// const displayDeleteConfirmation = () => {};

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

const presetServiceData = (serviceEL) => {
  const formElement = document.querySelector(".services-form--window");
  const serviceData = serviceEL.children;
  // console.log(serviceEL.children);
  const formDataMarkup = renderFormLabels(serviceData);

  formElement.innerHTML = "";
  formElement.insertAdjacentHTML("afterbegin", formDataMarkup);

  const closeFormBtn = document.querySelector(".close-services-form");
  closeFormBtn.addEventListener("click", removeServiceForm);

  const cancelBtn = document.querySelector(".btn-cancel");
  cancelBtn.addEventListener("click", removeServiceForm);

  document
    .querySelector(".services-form--edit-add")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const title = document.getElementById("service-name").value;
      const price = document.getElementById("service-price").value;
      const description = document.getElementById("service-description").value;
      const serviceId = serviceEL.dataset.serviceid;

      const btnSubmit = document.querySelector(".btn-submit");
      btnSubmit.textContent = "Submitting...";
      btnSubmit.disabled = true;
      btnSubmit.style.background = "#2b8a3e";

      cancelBtn.disabled = true;
      closeFormBtn.removeEventListener("click", removeServiceForm);

      await updateServiceData({ title, price, description }, serviceId);
      serviceEL.children[0].innerHTML = title;
      serviceEL.children[1].innerHTML = `£${price}`;
      serviceEL.children[2].innerHTML = description;
      removeServiceForm();
    });
};

const updateServiceData = async (serviceData, serviceId) => {
  try {
    const sendRequest = await axios({
      method: "PATCH",
      url: `http://127.0.0.1:8000/api/services/${serviceId}`,
      data: serviceData,
    });

    if (sendRequest.data.status === "success") {
      renderAppMsg("successful", "Service Successfully Updated!");
    }
  } catch (err) {
    renderAppMsg("failure", err.response.data.message);
  }
};

const deleteServiceAPI = async (serviceId) => {
  try {
    const sendRequest = await axios({
      method: "DELETE",
      url: `http://127.0.0.1:8000/api/services/${serviceId}`,
    });

    renderAppMsg("successful", "Service Successfully Deleted!");
  } catch (err) {
    renderAppMsg("failure", err.response.data.message);
  }
};

const addServiceCard = async (serviceData) => {
  try {
    const sendRequest = await axios({
      method: "POST",
      url: `http://127.0.0.1:8000/api/services`,
      data: serviceData,
    });

    if (sendRequest.data.status === "success") {
      renderAppMsg("successful", "Service Successfully Added!");
      addNewServiceCard(sendRequest.data.data.service);
    }
  } catch (err) {
    renderAppMsg("failure", err.response.data.message);
  }
};

const initialiseAddBtn = () => {
  const addServiceBtn = document.querySelector(".new-service--btn");
  addServiceBtn.addEventListener("click", (e) => {
    displayServiceForm();
    const formElement = document.querySelector(".services-form--window");
    // const serviceData = serviceEL.children;
    // console.log(serviceEL.children);
    const formDataMarkup = renderFormLabels();

    formElement.innerHTML = "";
    formElement.insertAdjacentHTML("afterbegin", formDataMarkup);

    const closeFormBtn = document.querySelector(".close-services-form");
    closeFormBtn.addEventListener("click", removeServiceForm);

    const cancelBtn = document.querySelector(".btn-cancel");
    cancelBtn.addEventListener("click", removeServiceForm);

    document
      .querySelector(".services-form--edit-add")
      .addEventListener("submit", async function (e) {
        e.preventDefault();

        const title = document.getElementById("service-name").value;
        const servicePrice = document.getElementById("service-price").value;
        const serviceDescription = document.getElementById(
          "service-description"
        ).value;

        const btnSubmit = document.querySelector(".btn-submit");
        btnSubmit.textContent = "Submitting...";
        btnSubmit.disabled = true;
        btnSubmit.style.background = "#2b8a3e";

        cancelBtn.disabled = true;
        closeFormBtn.removeEventListener("click", removeServiceForm);

        await addServiceCard({ title, servicePrice, serviceDescription });
        removeServiceForm();
        initialiseCardPanel();
        retrieveServices();
      });
  });
};

const renderDeleteConfirmation = () => {
  return `<button class="close-services-form">×</button>
  <h2 class="services-window--title delete-confirmation--text">
    Are you sure you want to Delete this Service?
  </h2>
  <div class="confirmation-btns">
    <button class="service-form--btn btn-delete">Delete</button>
    <button class="service-form--btn btn-submit btn--cancel-delete">
      Cancel
    </button>
  </div>`;
};

const renderFormLabels = (serviceData) => {
  return `<button class="close-services-form">×</button>
  <h2 class="services-window--title">Specify Service Details</h2>
  <form class="services-form--edit-add">
    <div class="form-section">
      <label for="service-name" class="title-form service--title-form"
        >Service Name</label
      >
      <input
        type="text"
        id="service-name"
        class="input-form service--input-form"
        ${serviceData ? `value="${serviceData[0].textContent}"` : ""}
        required
      />
    </div>
    <div class="form-section form-service--space">
      <label
        for="service-description"
        class="title-form service--title-form"
        >Service Description</label
      >
      <textarea
        class="service-description--input-form"
        name="service-description"
        id="service-description"
        maxlength="150"
        cols="30"
        rows="10"
        required
      >${serviceData ? `${serviceData[2].textContent}` : ""}</textarea>
    </div>
    <div class="form-section">
      <label for="service-price" class="title-form service--title-form"
        >Service Price (£)</label
      >
      <input
        type="number"
        id="service-price"
        min="0.01"
        step="0.01"
        class="input-form service--input-form service--input-price"
        ${
          serviceData
            ? `value="${serviceData[1].textContent.substring(1)}"`
            : ""
        }
        required
      />
    </div>
    <div class="form-section--btns">
      <a class="service-form--btn btn-cancel">Cancel</a>
      <button class="service-form--btn btn-submit">Submit</button>
    </div>
  </form>`;
};

const addNewServiceCard = (service) => {
  const parentElement = document.querySelector(
    ".logged-in--services-container"
  );
  const serviceCardMarkup = `<div class="service-card my-service-cards" data-serviceId="${service._id}">
    <h3 class="service-title">${service.title}</h3>
    <p class="service-price">£${service.price}</p>
    <p class="service-description">${service.description}</p>
    <div class="service-update-div">
      <button class="edit-service--btn-icon service--delete-btn">
        <span class="material-icons"> delete </span>
      </button>
      <button class="edit-service--btn-icon service--edit-btn">
        <span class="material-icons service--update-icon">
          edit
        </span>
      </button>
    </div>
  </div>`;

  parentElement.insertAdjacentHTML("beforeend", serviceCardMarkup);
};
