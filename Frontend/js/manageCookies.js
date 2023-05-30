export const retrieveCookie = (cookieN) => {
  let name = cookieN + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let cookiesArr = decodedCookie.split(";");
  for (let i = 0; i < cookiesArr.length; i++) {
    let c = cookiesArr[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
};

export const addUserQueryCookie = (cookieN, data) => {
  hairdresserIDs = data.hairdresserResults.map((hairdresser) => {
    return {
      _id: hairdresser._id,
      distance: hairdresser.distance,
      coordinates: hairdresser.location.coordinates,
    };
  });
  // console.log(hairdresserIDs);
  const dataToSend = JSON.stringify({
    hairdresserResults: hairdresserIDs,
    userCords: data.userCords,
  });
  document.cookie = `${cookieN}=${dataToSend}`;
  // console.log("after the managecookie func", JSON.parse(dataToSend));
};
