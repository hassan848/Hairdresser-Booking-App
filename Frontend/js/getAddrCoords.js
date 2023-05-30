import axios from "axios";
import { renderAppMsg } from "./displayAppMsg";
import { clientSignupState } from "./clientSignup";
import { hairdresserSignupState } from "./hairdresserSignup";
import "@babel/polyfill";

export const updateCoordsAPI = async (address, userFor) => {
  try {
    const sendReq = await axios({
      method: "GET",
      //   url: "https://maps.googleapis.com/maps/api/geocode/json?address=96+cowley+road+IG13JJ&key=AIzaSyDryOOU4afKXjn4TMu_E8NJ-pBrWwusH-E",
      url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyDryOOU4afKXjn4TMu_E8NJ-pBrWwusH-E`,
    });
    if (sendReq.data.status === "OK") {
      // console.log(sendReq);
      const coords = sendReq.data.results[0].geometry.location;
      const addrStr = sendReq.data.results[0].formatted_address;

      // console.log(coords);
      // console.log(addrStr);

      await updateClientAddress(
        {
          coords: [coords.lng, coords.lat],
          address: addrStr,
        },
        userFor
      );
      // clientSignupState.location.coordinates[0] = coords.lng;
      // clientSignupState.location.coordinates[1] = coords.lat;
      // clientSignupState.location.address = addrStr;
    }
  } catch (err) {
    renderAppMsg(
      "failure",
      "Please enter your address again, Something went wrong!"
    );
  }
};

export const getCoordsAPI = async (address) => {
  try {
    const sendReq = await axios({
      method: "GET",
      //   url: "https://maps.googleapis.com/maps/api/geocode/json?address=96+cowley+road+IG13JJ&key=AIzaSyDryOOU4afKXjn4TMu_E8NJ-pBrWwusH-E",
      url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyDryOOU4afKXjn4TMu_E8NJ-pBrWwusH-E`,
    });
    if (sendReq.data.status === "OK") {
      console.log(sendReq);
      const coords = sendReq.data.results[0].geometry.location;
      const addrStr = sendReq.data.results[0].formatted_address;

      clientSignupState.location.coordinates[0] = coords.lng;
      clientSignupState.location.coordinates[1] = coords.lat;
      clientSignupState.location.address = addrStr;
    }
  } catch (err) {
    renderAppMsg(
      "failure",
      "Please enter your address again, Something went wrong!"
    );
  }
};

export const getCoordsAPIHairdresser = async (address) => {
  try {
    const sendReq = await axios({
      method: "GET",
      //   url: "https://maps.googleapis.com/maps/api/geocode/json?address=96+cowley+road+IG13JJ&key=AIzaSyDryOOU4afKXjn4TMu_E8NJ-pBrWwusH-E",
      url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyDryOOU4afKXjn4TMu_E8NJ-pBrWwusH-E`,
    });
    if (sendReq.data.status === "OK") {
      console.log(sendReq);
      const coords = sendReq.data.results[0].geometry.location;
      const addrStr = sendReq.data.results[0].formatted_address;

      hairdresserSignupState.location.coordinates[0] = coords.lng;
      hairdresserSignupState.location.coordinates[1] = coords.lat;
      hairdresserSignupState.location.address = addrStr;
      return "successful";
    } else {
      renderAppMsg(
        "failure",
        "No address could be found with that input, please try again!"
      );
      return "failure";
    }
  } catch (err) {
    renderAppMsg(
      "failure",
      "Please enter your address again, Something went wrong!"
    );
    return "failure";
  }
};

const updateClientAddress = async (data, userFor) => {
  try {
    const sendReq = await axios({
      method: "PATCH",
      url: `http://127.0.0.1:8000/api/${
        userFor === "client"
          ? "clients/updateAddress"
          : "hairdressers/updateAddress"
      }`,
      data,
    });

    if (sendReq.data.status === "success") {
      renderAppMsg("successful", "Updated address Successfully!");
      const saveBtn = document.querySelector(".btn--update-profile");
      saveBtn.textContent = "Save Changes";
      saveBtn.style.backgroundColor = "rgba(0, 136, 170)";

      const savedAddress = document.querySelector(".saved-address");
      savedAddress.textContent = data.address;

      document.getElementById("street").value = "";
      document.getElementById("door-num").value = "";
      document.getElementById("city").value = "";
      document.getElementById("postcode").value = "";
    }
  } catch (error) {
    renderAppMsg("failure", error.response.data.message);
  }
};
