import { renderAppMsg } from "./displayAppMsg";
import axios from "axios";

const workSchedule_form = document.querySelector(".hairdresser-workSchedule");
const curWorkScheduleState = {};

const dayFlowArr = [
  document.querySelector("#dayFlowDirection-mon"),
  document.getElementById("dayFlowDirection-tue"),
  document.getElementById("dayFlowDirection-wed"),
  document.getElementById("dayFlowDirection-thu"),
  document.getElementById("dayFlowDirection-fri"),
  document.getElementById("dayFlowDirection-sat"),
  document.getElementById("dayFlowDirection-sun"),
];

const startEndTimes = [
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

const updateMyWorkSchedule = async () => {
  try {
    const sendReq = await axios({
      method: "PATCH",
      url: "http://127.0.0.1:8000/api/hairdressers/myWorkSchedule",
      data: curWorkScheduleState,
    });

    if (sendReq.data.status === "success") {
      renderAppMsg("successful", "Updated Work Schedule!");
    }
  } catch (error) {
    renderAppMsg("failure", error.response.data.message);
    // console.log(error);
  }
};

export const manageWorkSchedule = () => {
  workSchedule_form.addEventListener("submit", async (e) => {
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
        renderAppMsg("failure", `End time must be after start time`);
        return;
      }
    });
    if (!continueFlag) return;
    renewWorkSchedule();

    // console.log(hairdresserSignupState.workSchedule);
    curWorkScheduleState.workFlowDirection =
      document.getElementById("workFlowDirection").value;

    if (document.getElementById("home-appoint-price")) {
      const homeAppointCost =
        document.getElementById("home-appoint-price").value;

      if (!(homeAppointCost == "")) {
        curWorkScheduleState.homeAppointCost = homeAppointCost;
        // console.log(homeAppointCost);
      }
    }

    // console.log(curWorkScheduleState);
    const updateBtn = document.querySelector(".work-schedule--save");
    updateBtn.style.backgroundColor = "rgb(3, 96, 119)";
    updateBtn.textContent = "UPDATING...";
    await updateMyWorkSchedule();
    updateBtn.textContent = "UPDATE CHANGES";
    updateBtn.style.backgroundColor = "rgba(0, 136, 170)";
  });

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
};

const renewWorkSchedule = () => {
  curWorkScheduleState.workSchedule = {
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
  const parentEl = document.querySelector(".schedule-day--space");
  const homeAppointPrice = document.querySelector(".profile-settings--heading")
    .dataset.homecost;

  let appointOption;

  if (homeAppointPrice) {
    appointOption = `<div class="signup--form-section schedule-signup--form-sec manage-schedule full_width schedule-day--space homeCostOption">
  <label class="title-form" for="home-appoint-price">Home Appointment Cost (extra cost for you to travel to clients - optional)</label>
  <input type="number" class="input-form home-appointments--price service--input-price" id="home-appoint-price" step="0.01" min=0 value=${homeAppointPrice}>
</div>`;
  } else {
    appointOption = `<div class="signup--form-section schedule-signup--form-sec manage-schedule full_width schedule-day--space homeCostOption">
    <label class="title-form" for="home-appoint-price">Home Appointment Cost (extra cost for you to travel to clients - optional)</label>
    <input type="number" class="input-form home-appointments--price service--input-price" id="home-appoint-price" step="0.01" min=0>
  </div>`;
  }
  parentEl.insertAdjacentHTML("afterend", appointOption);
};

const removeHomeCostOption = () => {
  const appointHomeSelect = document.querySelector(".homeCostOption");
  appointHomeSelect.remove();
};
