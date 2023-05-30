import { renderAppMsg } from "./displayAppMsg";
import { getCoordsAPI } from "./getAddrCoords";
import { createClientAcc } from "./createAccount";
import "@babel/polyfill";

export const clientSignupState = {
  name: undefined,
  surname: undefined,
  email: undefined,
  password: undefined,
  passwordRepeat: undefined,
  proximity: undefined,
  //   user_role: "client",
  location: {
    coordinates: [],
    address: undefined,
  },
  //   formalAddress: {},
};

let signup_form0 = document.querySelector(".form-0");
let signup_form1 = document.querySelector(".form-1");
let signup_form2 = document.querySelector(".form-2");
let signup_bar = document.querySelector(".step-progress-bar");
let form2_Left = "60rem";
let form1_Left = "7rem";
let barWidth = "55rem";
let barMid = "36.6rem";
// let barLeft = "27.5rem";
let barLeft = "18.33rem";

const initialiseVars = () => {
  signup_form0 = document.querySelector(".form-0");
  signup_form1 = document.querySelector(".form-1");
  signup_form2 = document.querySelector(".form-2");
  signup_bar = document.querySelector(".step-progress-bar");
  form2_Left = "7rem";
  barWidth = "55rem";
  barMid = "36.6rem";
  barLeft = "27.5rem";
};

export const manageClientSignup = () => {
  initialiseVars();
  myFunc(viewWitdhChange);

  signup_form0.addEventListener("submit", (e) => {
    e.preventDefault();

    clientSignupState.name = document.getElementById("firstName").value;
    clientSignupState.surname = document.getElementById("surname").value;

    e.target.style.left = "-60rem";
    document.querySelector(".form-1").style.left = form2_Left;
    signup_bar.style.width = barMid;
  });

  signup_form1.addEventListener("submit", (e) => {
    e.preventDefault();

    const inputPass = document.getElementById("password").value;
    const inputPassConfirm = document.getElementById("confirm-password").value;

    if (inputPass !== inputPassConfirm)
      return renderAppMsg(
        "failure",
        "Passwords don't match, please try again!"
      );

    // Checking Lower Case letter exists
    // const lower = /[a-z]/g;
    // if (inputPass.match(lower))
    //   return renderAppMsg(
    //     "failure",
    //     "Password requires a lower case letter, please try again!"
    //   );

    clientSignupState.email = document.getElementById("email").value;
    clientSignupState.password = inputPass;
    clientSignupState.passwordRepeat = inputPassConfirm;

    e.target.style.left = "-60rem";
    document.querySelector(".form-2").style.left = form2_Left;
    signup_bar.style.width = barWidth;
  });

  const backBtn0 = document.querySelector(".signup-back-0");
  backBtn0.addEventListener("click", () => {
    signup_form1.style.left = "60rem";
    signup_form0.style.left = form2_Left;
    signup_bar.style.width = barLeft;
  });

  const backBtn = document.querySelector(".signup-back");
  backBtn.addEventListener("click", () => {
    signup_form2.style.left = "60rem";
    signup_form1.style.left = form2_Left;
    signup_bar.style.width = barMid;
  });

  signup_form2.addEventListener("submit", async (e) => {
    e.preventDefault();
    let streetName = document.getElementById("street").value;
    const doorNum = document.getElementById("door-num").value;
    const town = document.getElementById("city").value;
    const postcode = document.getElementById("postcode").value;
    const proximity = document.getElementById("proximity-dis").value;

    clientSignupState.proximity = proximity;

    streetName = streetName.trim().split(" ").join("+");
    const address = `${doorNum}+${streetName},+${town}+${postcode}`;

    const submitBtnlst = document.querySelector(".signup-submit");
    submitBtnlst.textContent = "Submitting...";
    submitBtnlst.disabled = true;
    submitBtnlst.classList.add("logging-in--btn");

    // console.log(address);
    await getCoordsAPI(address);
    // console.log(clientSignupState);
    await createClientAcc(clientSignupState);
  });
};

const myFunc = (viewChange) => {
  if (viewChange.matches) {
    form2_Left = "2rem";
    document.querySelector(".spec-location").textContent =
      "Default Proximity (m)";
    barWidth = "28rem";
    barMid = "18.6rem";
    // barLeft = "14rem";
    barLeft = "9.33rem";
  } else {
    form2_Left = "7rem";
    document.querySelector(".spec-location").textContent =
      "Default Proximity (mile)";
    barWidth = "55rem";
    barMid = "36.6rem";
    // barLeft = "27.5rem";
    barLeft = "18.33rem";
  }
};

// const myFunc = (viewChange) => {
//   if (viewChange.matches) {
//     form2_Left = "2rem";
//     document.querySelector(".spec-location").textContent =
//       "Default Proximity (m)";
//     barWidth = "28rem";
//     barLeft = "14rem";
//   } else {
//     form2_Left = "7rem";
//     document.querySelector(".spec-location").textContent =
//       "Default Proximity (mile)";
//     barWidth = "55rem";
//     barLeft = "27.5rem";
//   }
// };

const viewWitdhChange = window.matchMedia("(max-width: 33.5em)");
viewWitdhChange.addEventListener("change", myFunc);
