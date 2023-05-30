import axios from "axios";
// import "@babel/polyfill";
import { renderAppMsg } from "./displayAppMsg";

export const loginAccount = async (emailInput, passwordInput) => {
  try {
    const sendReq = await axios({
      method: "POST",
      url: "http://127.0.0.1:8000/api/users/login",
      data: {
        email: emailInput,
        password: passwordInput,
      },
    });

    if (sendReq.data.status === "success") {
      if (sendReq.data.data.user.user_role == "client") {
        renderAppMsg("successful", "Logged in Successfully!");
        location.assign("/findHairdressers");
      } else {
        location.assign("/my-appointments");
      }
    }

    // console.log(sendReq.data.data.user.user_role);
  } catch (error) {
    const loginBtn = document.querySelector(".login--btn");
    loginBtn.textContent = "login";
    loginBtn.disabled = false;
    loginBtn.classList.remove("logging-in--btn");
    renderAppMsg("failure", error.response.data.message);
    // console.log(error.response.data.message);
  }
};

export const signOutUser = async () => {
  try {
    const sendReq = await axios({
      method: "GET",
      url: "http://127.0.0.1:8000/api/users/signout",
    });
    if (sendReq.data.status === "success") {
      location.assign("/");
      // Important! reloads from SERVER not from CACHE -> gives fresh page coming from server
      //location.reload(true);
    }
  } catch (err) {
    renderAppMsg("failure", "An Unexpected ERROR occured!");
  }
};
