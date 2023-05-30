import axios from "axios";
import { renderAppMsg } from "./displayAppMsg";
import "@babel/polyfill";

export const inputPassword = () => {
  const form = document.querySelector(".enter_email_form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputEmail = document.getElementById("email").value;
    // console.log(inputEmail);
    const continueBtn = document.querySelector(".button--blue");
    continueBtn.textContent = "Sending...";
    continueBtn.disabled = true;
    continueBtn.classList.add("logging-in--btn");
    sendForgotPassReq(inputEmail);
  });
};

const sendForgotPassReq = async (email) => {
  try {
    const sendReq = await axios({
      method: "POST",
      url: "http://127.0.0.1:8000/api/users/forgotPass",
      data: {
        email,
      },
    });

    if (sendReq.data.status === "success") {
      renderAppMsg("successful", "Token sent to email Successfully");
      location.assign(`/emailSentConfirmation/${email}`);
    }
  } catch (error) {
    const continueBtn = document.querySelector(".button--blue");
    continueBtn.textContent = "Continue";
    continueBtn.disabled = false;
    continueBtn.classList.remove("logging-in--btn");
    renderAppMsg("failure", error.response.data.message);
  }
};

export const getNewPassword = () => {
  const signupToken = document.querySelector(".forgot-pass--btn").dataset.token;
  //   console.log(signupToken);
  const newPassForm = document.querySelector(".newPassForm");
  newPassForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newPass = document.getElementById("password").value;
    const newPassRepeat = document.getElementById("confirm-password").value;

    if (newPass !== newPassRepeat)
      return renderAppMsg(
        "failure",
        "Passwords don't match, please try again!"
      );

    const resetBtn = document.querySelector(".button--blue");
    resetBtn.textContent = "Resetting...";
    resetBtn.disabled = true;
    resetBtn.classList.add("logging-in--btn");
    resetPassAPI(signupToken, newPass, newPassRepeat);
  });
};

const resetPassAPI = async (token, password, passwordRepeat) => {
  try {
    const sendReq = await axios({
      method: "PATCH",
      url: `http://127.0.0.1:8000/api/users/resetPass/${token}`,
      data: {
        password,
        passwordRepeat,
      },
    });
    if (sendReq.data.status === "success") {
      renderAppMsg("successful", "Password Reset Successfully");
      location.assign("/");
    }
  } catch (error) {
    const resetBtn = document.querySelector(".button--blue");
    resetBtn.textContent = "Continue";
    resetBtn.disabled = false;
    resetBtn.classList.remove("logging-in--btn");
    renderAppMsg("failure", error.response.data.message);
  }
};
