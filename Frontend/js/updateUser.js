import axios from "axios";
// import sharp from "sharp";
// import sharp from "sharp";
import { updateCoordsAPI } from "./getAddrCoords";
import "@babel/polyfill";
import { renderAppMsg } from "./displayAppMsg";

export const updateCurImg = () => {
  const curImg = document.querySelector(".profile--img-pic");
  const profileImg = document.getElementById("profileImage");

  const listenToImg = (e) => {
    // console.log(e.target.files);
    if (e.target.files.length < 0) return;
    const photo = e.target.files?.[0];

    if (!photo?.type.startsWith("image/")) return;
    // Returns if file is not of image type
    const curFile = new FileReader();

    curFile.addEventListener("load", () => {
      curImg.setAttribute("src", curFile.result);
    });

    curFile.readAsDataURL(photo);
  };

  profileImg.addEventListener("change", listenToImg);
};

const updateUserEmailPass = async (data, updateType) => {
  try {
    const APIURL =
      updateType === "userNameEmail"
        ? "http://127.0.0.1:8000/api/users/updateNameEmail"
        : "http://127.0.0.1:8000/api/users/updateUserPassword";
    const sendReq = await axios({
      method: "PATCH",
      url: APIURL,
      data,
    });

    if (sendReq.data.status === "success") {
      if (updateType === "userNameEmail") {
        renderAppMsg("successful", "Updated User Successfully!");
      } else if (updateType === "changePass") {
        renderAppMsg("successful", "Password updated Successfully!");
      }
    }
  } catch (error) {
    renderAppMsg("failure", error.response.data.message);
  }
};

export const profileSettings = () => {
  const nameEmailForm = document.querySelector(".nameEmailForm");
  if (nameEmailForm) {
    nameEmailForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const profileForm = new FormData();
      profileForm.append("name", document.getElementById("first-name").value);
      profileForm.append("surname", document.getElementById("surname").value);
      profileForm.append("email", document.getElementById("user-email").value);
      //   const name = document.getElementById("first-name").value;
      //   const surname = document.getElementById("surname").value;
      //   const email = document.getElementById("user-email").value;

      const profileImg = document.getElementById("profileImage").files;
      if (profileImg.length > 0) {
        profileForm.append("profileImg", profileImg[0]);
      }
      //   console.log(profileForm);

      //   console.log(firstName, surname, email);
      updateUserEmailPass(profileForm, "userNameEmail");
      //   updateUserEmailPass({ name, surname, email }, "userNameEmail");
    });
  }

  const newPassForm = document.querySelector(".update-pass--form");
  if (newPassForm) {
    newPassForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const saveNewPass = document.querySelector(".save-new-pass");
      saveNewPass.textContent = "SAVING...";

      const curPassword = document.getElementById("cur-password").value;
      const newPassword = document.getElementById("new-password").value;
      const newPasswordRepeat =
        document.getElementById("confirm-password").value;

      await updateUserEmailPass(
        { curPassword, newPassword, newPasswordRepeat },
        "changePass"
      );
      //   console.log(existingPass, newPassword, newPassRepeat);

      saveNewPass.textContent = "SAVE NEW PASSWORD";
      document.getElementById("cur-password").value = "";
      document.getElementById("new-password").value = "";
      document.getElementById("confirm-password").value = "";
    });
  }
};

export const updateAddressForm = () => {
  const addressForm = document.querySelector(".address-form");
  addressForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let streetName = document.getElementById("street").value;
    const doorNum = document.getElementById("door-num").value;
    const town = document.getElementById("city").value;
    const postcode = document.getElementById("postcode").value;
    // const proximity = document.getElementById("proximity-dis").value;

    streetName = streetName.trim().split(" ").join("+");
    const address = `${doorNum}+${streetName},+${town}+${postcode}`;

    // console.log(address);

    const saveBtn = document.querySelector(".btn--update-profile");
    saveBtn.textContent = "Saving...";
    saveBtn.style.backgroundColor = "rgb(3, 96, 119)";

    if (document.querySelector(".client-user")) {
      await updateCoordsAPI(address, "client");
    } else if (document.querySelector(".hairdresser-user")) {
      await updateCoordsAPI(address, "hairdresser");
    }
  });
};

const userProximity = async (proximity, userFor) => {
  try {
    const sendReq = await axios({
      method: "PATCH",
      url: `http://127.0.0.1:8000/api/${
        userFor === "client"
          ? "clients/updateProximity"
          : "hairdressers/updateProximity"
      }`,
      data: { proximity },
    });
    if (sendReq.data.status === "success") {
      renderAppMsg("successful", "Updated Proximity!");
      const updateBtn = document.querySelector(".save--proximity");
      updateBtn.textContent = "Update Changes";
      updateBtn.style.backgroundColor = "rgba(0, 136, 170)";
      //   document.getElementById("proximity-dis").value = proximity;

      const savedProximity = document.querySelector(".saved-proximity");
      savedProximity.textContent = `${proximity} miles`;
    }
  } catch (error) {
    renderAppMsg("failure", error.response.data.message);
  }
};

export const updateProximityForm = () => {
  const proximityForm = document.querySelector(".proximity-form");
  proximityForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const proximity = document.getElementById("proximity-dis").value;
    // userProximity
    const updateBtn = document.querySelector(".save--proximity");
    updateBtn.textContent = "Updating...";
    updateBtn.style.backgroundColor = "rgb(3, 96, 119)";

    if (document.querySelector(".client-user")) {
      await userProximity(proximity, "client");
    } else if (document.querySelector(".hairdresser-user")) {
      await userProximity(proximity, "hairdresser");
    }
  });
};
