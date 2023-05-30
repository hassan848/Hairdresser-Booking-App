export const renderLoadingSpinner = (fatherElement) => {
  fatherElement.innerHTML = "";
  const spinnerMarkup =
    '<div></div> <div class="rendering-spinner container"></div>';

  fatherElement.insertAdjacentHTML("afterbegin", spinnerMarkup);
};

export const renderSidebarSpinner = (fatherElement) => {
  fatherElement.innerHTML = "";
  const spinnerMarkup =
    '<div></div> <div class="rendering-spinner container"></div>';

  fatherElement.insertAdjacentHTML("afterbegin", spinnerMarkup);
};

export const renderBookmarkingSpinner = (fatherElement) => {
  fatherElement.innerHTML = "";
  const spinnerMarkup =
    '<div></div> <div class="render-spinner--bookmark container"></div>';

  fatherElement.insertAdjacentHTML("afterbegin", spinnerMarkup);
};
