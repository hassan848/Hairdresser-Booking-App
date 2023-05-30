import { renderAppMsg } from "./displayAppMsg";
import { getCoordsAPIHairdresser } from "./getAddrCoords";
import { createHairdresserAcc } from "./createAccount";
import { createHairdresserService } from "./createAccount";
import "@babel/polyfill";

export const hairdresserSignupState = {
  name: undefined,
  surname: undefined,
  email: undefined,
  password: undefined,
  passwordRepeat: undefined,
  user_role: "hairdresser",
  genderMarket: undefined,
  workFlowDirection: undefined,
  profileImg: "original",
  proximity: undefined,
  description: undefined,
  homeAppointCost: undefined,
  location: {
    coordinates: [],
    address: undefined,
  },
  workSchedule: {},
};

let signup_H_form0 = document.querySelector(".hairdresser-form-0");
let signup_H_form1 = document.querySelector(".hairdresser-form-1");
let signup_H_form2 = document.querySelector(".hairdresser-form-2");
let signup_H_form3 = document.querySelector(".hairdresser-form-3");
let signup_H_form4 = document.querySelector(".hairdresser-form-4");
let signup_H_form5 = document.querySelector(".hairdresser-form-5");

let signup_bar = document.querySelector(".hairdresser-progress-bar");

// let form1_Left = "7rem";
// let form3_left = "5rem";
// // let form2_Left = "60rem";
// let barLeft = "11rem";
// let barLeftMid = "22rem";
// let barMid = "33rem";
// let barRightMid = "44rem";
// let barWidth = "55rem";

let form1_Left = "7rem";
let form3_Left = "5rem";
// let form2_Left = "60rem";
let barLeft = "9.16rem";
let barLeftMid = "18.32rem";
let barMid = "27.48rem";
let barRightMid = "36.64rem";
let barRightRight = "45.8rem";
let barWidth = "55rem";

const dayFlowArr = [
  document.querySelector("#dayFlowDirection-mon"),
  document.getElementById("dayFlowDirection-tue"),
  document.getElementById("dayFlowDirection-wed"),
  document.getElementById("dayFlowDirection-thu"),
  document.getElementById("dayFlowDirection-fri"),
  document.getElementById("dayFlowDirection-sat"),
  document.getElementById("dayFlowDirection-sun"),
];

let startEndTimes = [];

const initialiseVars = () => {
  signup_H_form0 = document.querySelector(".hairdresser-form-0");
  signup_H_form1 = document.querySelector(".hairdresser-form-1");
  signup_H_form2 = document.querySelector(".hairdresser-form-2");
  signup_H_form3 = document.querySelector(".hairdresser-form-3");
  signup_H_form4 = document.querySelector(".hairdresser-form-4");
  signup_H_form5 = document.querySelector(".hairdresser-form-5");

  signup_bar = document.querySelector(".hairdresser-progress-bar");

  form1_Left = "7rem";
  form3_Left = "5rem";
  // let form2_Left = "60rem";
  barLeft = "9.16rem";
  barLeftMid = "18.32rem";
  barMid = "27.48rem";
  barRightMid = "36.64rem";
  barRightRight = "45.8rem";
  barWidth = "55rem";

  startEndTimes = [
    [
      document.getElementById("startTime-mon"),
      document.getElementById("endTime-mon"),
    ],

    [
      document.getElementById("startTime-tue"),
      document.getElementById("endTime-tue"),
    ],
    [
      document.getElementById("startTime-wed"),
      document.getElementById("endTime-wed"),
    ],
    [
      document.getElementById("startTime-thu"),
      document.getElementById("endTime-thu"),
    ],
    [
      document.getElementById("startTime-fri"),
      document.getElementById("endTime-fri"),
    ],
    [
      document.getElementById("startTime-sat"),
      document.getElementById("endTime-sat"),
    ],
    [
      document.getElementById("startTime-sun"),
      document.getElementById("endTime-sun"),
    ],
  ];
};

export const manageHairdresserSignup = () => {
  initialiseVars();

  signup_H_form0.addEventListener("submit", (e) => {
    e.preventDefault();

    hairdresserSignupState.name = document.getElementById("firstName").value;
    hairdresserSignupState.surname = document.getElementById("surname").value;

    e.target.style.left = "-60rem";
    document.querySelector(".hairdresser-form-1").style.left = form1_Left;
    signup_bar.style.width = barLeftMid;
  });

  signup_H_form1.addEventListener("submit", (e) => {
    e.preventDefault();

    const inputPass = document.getElementById("password").value;
    const inputPassConfirm = document.getElementById("confirm-password").value;

    if (inputPass !== inputPassConfirm)
      return renderAppMsg(
        "failure",
        "Passwords don't match, please try again!"
      );

    hairdresserSignupState.email = document.getElementById("email").value;
    hairdresserSignupState.password = inputPass;
    hairdresserSignupState.passwordRepeat = inputPassConfirm;

    e.target.style.left = "-60rem";
    document.querySelector(".hairdresser-form-2").style.left = form1_Left;
    signup_bar.style.width = barMid;
  });

  signup_H_form2.addEventListener("submit", async (e) => {
    e.preventDefault();
    let streetName = document.getElementById("street").value;
    const doorNum = document.getElementById("door-num").value;
    const town = document.getElementById("city").value;
    const postcode = document.getElementById("postcode").value;
    const proximity = document.getElementById("proximity-dis").value;

    hairdresserSignupState.proximity = proximity;

    streetName = streetName.trim().split(" ").join("+");
    const address = `${doorNum}+${streetName},+${town}+${postcode}`;

    const addressResult = await getCoordsAPIHairdresser(address);
    if (addressResult === "successful") {
      e.target.style.left = "-60rem";
      document.querySelector(".hairdresser-form-3").style.left = form3_Left;
      signup_bar.style.width = barRightMid;
    }
  });

  signup_H_form3.addEventListener("submit", (e) => {
    e.preventDefault();
    let continueFlag = true;
    startEndTimes.forEach((day) => {
      const startTimeArr = day[0].value.split(":");
      const endTimeArr = day[1].value.split(":");

      const date1 = new Date(
        0,
        0,
        0,
        `${startTimeArr[0]}`,
        `${startTimeArr[1]}`,
        0
      );
      const date2 = new Date(
        0,
        0,
        0,
        `${endTimeArr[0]}`,
        `${endTimeArr[1]}`,
        0
      );

      if (!(date1 < date2)) {
        continueFlag = false;
        renderAppMsg("failure", `End time has to be after start time`);
        return;
      }
    });
    if (!continueFlag) return;
    defineWorkSchedule();

    // console.log(hairdresserSignupState.workSchedule);
    hairdresserSignupState.workFlowDirection =
      document.getElementById("workFlowDirection").value;

    if (document.getElementById("home-appoint-price")) {
      const homeAppointCost =
        document.getElementById("home-appoint-price").value;

      if (!(homeAppointCost == "")) {
        hairdresserSignupState.homeAppointCost = homeAppointCost;
      }
    }

    e.target.style.left = "-60rem";
    document.querySelector(".hairdresser-form-4").style.left = form1_Left;
    signup_bar.style.width = barRightRight;
  });

  signup_H_form4.addEventListener("submit", (e) => {
    e.preventDefault();

    const description = document.getElementById(
      "hairdresser-description--input"
    ).value;
    hairdresserSignupState.description = description;

    e.target.style.left = "-60rem";
    document.querySelector(".hairdresser-form-5").style.left = form1_Left;
    signup_bar.style.width = barWidth;
  });

  signup_H_form5.addEventListener("submit", async (e) => {
    e.preventDefault();

    hairdresserSignupState.genderMarket =
      document.getElementById("genderMarket").value;

    console.log(hairdresserSignupState.genderMarket);

    const service1 = {
      title: document.getElementById("service-name-1").value,
      serviceDescription: document.getElementById("service-description-1")
        .value,
      servicePrice: document.getElementById("service-price-1").value,
    };
    const service2 = {
      title: document.getElementById("service-name-2").value,
      serviceDescription: document.getElementById("service-description-2")
        .value,
      servicePrice: document.getElementById("service-price-2").value,
    };
    const service3 = {
      title: document.getElementById("service-name-3").value,
      serviceDescription: document.getElementById("service-description-3")
        .value,
      servicePrice: document.getElementById("service-price-3").value,
    };

    // console.log(service1, service2, service3);

    const submitBtnlst = document.querySelector(".signup-submit");
    submitBtnlst.textContent = "SUBMITTING...";
    submitBtnlst.disabled = true;
    submitBtnlst.classList.add("logging-in--btn");

    const acc = await createHairdresserAcc(hairdresserSignupState);
    if (acc === "success") {
      const addedService1 = await createHairdresserService(service1);
      if (addedService1 === "success") {
        const addedService2 = await createHairdresserService(service2);
        if (addedService2 === "success") {
          const addedService3 = await createHairdresserService(service3);
          if (addedService3 === "success") {
            renderAppMsg(
              "successful",
              `Welcome ${hairdresserSignupState.name}!`
            );
            location.assign("/");
          } else {
            reShowSubmitBtn();
          }
        } else {
          reShowSubmitBtn();
        }
      } else {
        reShowSubmitBtn();
      }
    } else {
      reShowSubmitBtn();
    }
  });

  const reShowSubmitBtn = () => {
    const submitBtnlst = document.querySelector(".signup-submit");
    submitBtnlst.textContent = "SUBMIT";
    submitBtnlst.disabled = false;
    submitBtnlst.classList.remove("logging-in--btn");
  };

  const workOrientation = document.getElementById("workFlowDirection");
  workOrientation.addEventListener("change", () => {
    // console.log("You selected this value: ", workOrientation.value);

    if (workOrientation.value == "unidirectional") {
      removeHomeCostOption();
      dayFlowArr.forEach((sel) => sel.remove(1));
      // dayFlowArr.forEach((sel) => (sel.children[0].disabled = true));
    } else {
      const dayFlowDirection = document.querySelector("#dayFlowDirection-mon");
      if (dayFlowDirection.length != 3) {
        // console.log("need to add");

        dayFlowArr.forEach((sel) => {
          const option = new Option(
            "You travel to clients on this day!",
            "home"
          );
          const option2 = new Option("Take Dayoff", "dayoff");
          sel.remove(1);
          sel.add(option, undefined);
          sel.add(option2, undefined);
        });
      }
      addHomeCostOption();
    }
  });

  dayFlowArr.forEach((sel) => {
    sel.addEventListener("change", (e) => {
      const parentElement = e.target.parentElement;
      const syblingChildren1 = parentElement.nextElementSibling.children;
      const syblingChildren2 =
        parentElement.nextElementSibling.nextElementSibling.children;
      if (sel.value == "dayoff") {
        syblingChildren1[0].children[1].disabled = true;
        syblingChildren1[1].children[1].disabled = true;

        syblingChildren2[0].children[1].disabled = true;
        syblingChildren2[1].children[1].disabled = true;
      } else {
        if (syblingChildren1[0].children[1].disabled) {
          syblingChildren1[0].children[1].disabled = false;
          syblingChildren1[1].children[1].disabled = false;

          syblingChildren2[0].children[1].disabled = false;
          syblingChildren2[1].children[1].disabled = false;
        }
      }
    });
  });

  const backBtn0 = document.querySelector(".signup-back-0");
  backBtn0.addEventListener("click", () => {
    signup_H_form1.style.left = "60rem";
    signup_H_form0.style.left = form1_Left;
    signup_bar.style.width = barLeft;
  });

  const backBtn1 = document.querySelector(".signup-back-1");
  backBtn1.addEventListener("click", () => {
    signup_H_form2.style.left = "60rem";
    signup_H_form1.style.left = form1_Left;
    signup_bar.style.width = barLeftMid;
  });

  const backBtn2 = document.querySelector(".signup-back-2");
  backBtn2.addEventListener("click", () => {
    signup_H_form3.style.left = "60rem";
    signup_H_form2.style.left = form1_Left;
    signup_bar.style.width = barMid;
  });

  const backBtn3 = document.querySelector(".signup-back-3");
  backBtn3.addEventListener("click", () => {
    signup_H_form4.style.left = "60rem";
    signup_H_form3.style.left = form3_Left;
    signup_bar.style.width = barRightMid;
  });

  const backBtn4 = document.querySelector(".signup-back-4");
  backBtn4.addEventListener("click", () => {
    signup_H_form5.style.left = "60rem";
    signup_H_form4.style.left = form1_Left;
    signup_bar.style.width = barRightRight;
  });
};

const defineWorkSchedule = () => {
  hairdresserSignupState.workSchedule = {
    mon: {
      work_type: document.getElementById("dayFlowDirection-mon").value,
      work_hours: `${document.getElementById("startTime-mon").value}-${
        document.getElementById("endTime-mon").value
      }`,
      slot_length: document.getElementById("slotLength-mon").value,
      slot_gap: document.getElementById("slotBreak-mon").value,
    },
    tue: {
      work_type: document.getElementById("dayFlowDirection-tue").value,
      work_hours: `${document.getElementById("startTime-tue").value}-${
        document.getElementById("endTime-tue").value
      }`,
      slot_length: document.getElementById("slotLength-tue").value,
      slot_gap: document.getElementById("slotBreak-tue").value,
    },
    wed: {
      work_type: document.getElementById("dayFlowDirection-wed").value,
      work_hours: `${document.getElementById("startTime-wed").value}-${
        document.getElementById("endTime-wed").value
      }`,
      slot_length: document.getElementById("slotLength-wed").value,
      slot_gap: document.getElementById("slotBreak-wed").value,
    },
    thu: {
      work_type: document.getElementById("dayFlowDirection-thu").value,
      work_hours: `${document.getElementById("startTime-thu").value}-${
        document.getElementById("endTime-thu").value
      }`,
      slot_length: document.getElementById("slotLength-thu").value,
      slot_gap: document.getElementById("slotBreak-thu").value,
    },
    fri: {
      work_type: document.getElementById("dayFlowDirection-fri").value,
      work_hours: `${document.getElementById("startTime-fri").value}-${
        document.getElementById("endTime-fri").value
      }`,
      slot_length: document.getElementById("slotLength-fri").value,
      slot_gap: document.getElementById("slotBreak-fri").value,
    },
    sat: {
      work_type: document.getElementById("dayFlowDirection-sat").value,
      work_hours: `${document.getElementById("startTime-sat").value}-${
        document.getElementById("endTime-sat").value
      }`,
      slot_length: document.getElementById("slotLength-sat").value,
      slot_gap: document.getElementById("slotBreak-sat").value,
    },
    sun: {
      work_type: document.getElementById("dayFlowDirection-sun").value,
      work_hours: `${document.getElementById("startTime-sun").value}-${
        document.getElementById("endTime-sun").value
      }`,
      slot_length: document.getElementById("slotLength-sun").value,
      slot_gap: document.getElementById("slotBreak-sun").value,
    },
  };
};

const addHomeCostOption = () => {
  const parentEl = document.querySelector(".schedule-scroll");
  const appointOption = `<div class="signup--form-section schedule-signup--form-sec home-appoint--space homeCostOption">
  <label class="title-form" for="home-appoint-price">Home Appointment Cost (extra cost for you to travel to clients - optional)</label>
  <input type="number" class="input-form home-appointments--price service--input-price" id="home-appoint-price" step="0.01"  min=0>
</div>`;
  parentEl.insertAdjacentHTML("afterbegin", appointOption);
};

const removeHomeCostOption = () => {
  const appointHomeSelect = document.querySelector(".homeCostOption");
  appointHomeSelect.remove();
};
