export const renderAppMsg = (classification, appNote) => {
  removeAppMsg();
  const bodyEL = document.querySelector("body");
  const appMsgHTML = `<div class="app-msg app-msg--${classification}">${appNote}</div>`;
  bodyEL.insertAdjacentHTML("afterbegin", appMsgHTML);
  window.setTimeout(removeAppMsg, 4000);
};

export const removeAppMsg = () => {
  const existingAppMsg = document.querySelector(".app-msg");
  if (existingAppMsg) {
    existingAppMsg.parentElement.removeChild(existingAppMsg);
  }
};
