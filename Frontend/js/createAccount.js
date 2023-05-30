import axios from "axios";
import "@babel/polyfill";
import { renderAppMsg } from "./displayAppMsg";

export const createClientAcc = async (clientData) => {
  try {
    const sendReq = await axios({
      method: "POST",
      url: "http://127.0.0.1:8000/api/users/signup",
      data: clientData,
    });

    if (sendReq.data.status === "success") {
      renderAppMsg("successful", `Welcome ${clientData.name}!`);
      location.assign("/");
    }
  } catch (error) {
    const submitBtnlst = document.querySelector(".signup-submit");
    submitBtnlst.textContent = "SUBMIT";
    submitBtnlst.disabled = false;
    submitBtnlst.classList.remove("logging-in--btn");
    renderAppMsg("failure", error.response.data.message);
  }
};

export const createHairdresserAcc = async (hairdresserData) => {
  try {
    const sendReq = await axios({
      method: "POST",
      url: "http://127.0.0.1:8000/api/users/signup",
      data: hairdresserData,
    });

    if (sendReq.data.status === "success") {
      return "success";
      // renderAppMsg("successful", `Welcome ${clientData.name}!`);
      // location.assign("/");
    }
  } catch (error) {
    renderAppMsg("failure", error.response.data.message);
    return "failure";
  }
};

export const createHairdresserService = async (serviceData) => {
  try {
    const sendRequest = await axios({
      method: "POST",
      url: `http://127.0.0.1:8000/api/services`,
      data: serviceData,
    });

    if (sendRequest.data.status === "success") {
      return "success";
    }
    // if (sendRequest.data.status === "success") {
    //   renderAppMsg("successful", "Service Successfully Added!");
    // }
  } catch (error) {
    renderAppMsg("failure", error.response.data.message);
    return "failure";
  }
};
