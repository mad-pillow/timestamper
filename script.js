const canvasContainer = document.querySelector(".view__canvas-block");
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const picture = new Image();
const saveBtn = document.querySelector("#save-btn");
const photos = document.querySelector("#photos-input");
const timestampInput = document.querySelector("#timestamp-input");
const widthInput = document.querySelector("#width-input");
const heightInput = document.querySelector("#height-input");

const canvasContainerSize = {
  width: getComputedStyle(canvasContainer).width,
  height: getComputedStyle(canvasContainer).height,
};

const options = {
  maxHeight: 650,
  fontSizeFactor: 0.033,
  timestampPaddingFactor: 0.087,
  fontFamily: "Arial Black",
  timestamp: {},
  defaultTimestamp: "format-1",
};

//=== loads pictures

function loadPicture(source) {
  picture.src = source;
  picture.setAttribute("crossOrigin", "anonymous");

  picture.addEventListener("load", () => {
    loadCanvas();
  });
}

function loadCanvas() {
  canvasContainer.style.width = canvasContainerSize.width;

  canvas.width = parseInt(window.getComputedStyle(canvasContainer).width);

  const pictureWidth = picture.naturalWidth;
  const pictureHeight = picture.naturalHeight;
  const aspect = pictureWidth / pictureHeight;

  let height = (canvas.height = canvas.width / aspect);
  let width = canvas.width;

  if (height >= options.maxHeight) {
    height = canvas.height = options.maxHeight;
    width = canvas.width = height * aspect;
  }

  ctx.drawImage(picture, 0, 0, width, height);

  widthInput.value = pictureWidth;
  heightInput.value = pictureHeight;

  placeTimestamp(aspect, options.defaultTimestamp);
  enableElements();
}

function enableElements() {
  timestampInput.removeAttribute("disabled");
  timestampFormatInputs.forEach((input) => input.removeAttribute("disabled"));
  widthInput.removeAttribute("disabled");
  heightInput.removeAttribute("disabled");
}

function getFontSize(aspect = 1) {
  return aspect >= 1
    ? canvas.height * options.fontSizeFactor
    : canvas.width * options.fontSizeFactor;
}

//=== places timestamp
function placeTimestamp(aspect, stampFormat = "format-1") {
  const timestamp = options.timestamp[stampFormat] || "13/08/2021 18:16";
  const timeStampPadding =
    aspect > 1
      ? options.timestampPaddingFactor * canvas.height
      : options.timestampPaddingFactor * canvas.width;

  ctx.font = `${getFontSize(aspect)}px ${options.fontFamily}`;
  ctx.fillStyle = "yellow";
  const textSize = ctx.measureText(timestamp);
  const rightMargin = canvas.width - textSize.width - timeStampPadding;
  const bottomMargin = canvas.height - timeStampPadding;
  ctx.fillText(timestamp, rightMargin, bottomMargin);
  ctx.strokeText(timestamp, rightMargin, bottomMargin);
}

//=== gets pictures
photos.addEventListener("input", () => {
  const file = photos.files[0];
  const reader = new FileReader();

  reader.addEventListener(
    "load",
    () => {
      loadPicture(reader.result);
    },
    false
  );
  if (file) {
    reader.readAsDataURL(file);
  }
});

//=== saves pictures
function saveImage(
  saveWidth = picture.naturalWidth,
  saveHeight = picture.naturalHeight
) {
  if (saveWidth <= 100 || saveHeight <= 100) {
    return;
  }
  const virtualLink = document.createElement("a");
  const aspect = saveWidth / saveHeight;

  canvas.width = saveWidth;
  canvas.height = saveHeight;

  ctx.drawImage(picture, 0, 0, saveWidth, saveHeight);

  placeTimestamp(aspect, options.defaultTimestamp);

  virtualLink.download = "download.jpg";
  virtualLink.href = canvas.toDataURL("image/jpeg");
  virtualLink.click();
  virtualLink.remove();

  loadCanvas();
}

saveBtn.addEventListener("click", (e) => {
  e.preventDefault();
  saveImage(widthInput.value, heightInput.value);
});

//=== prepares timestamps
function prepareTimestamps(date = new Date()) {
  const twoDigits = Intl.NumberFormat(undefined, { minimumIntegerDigits: 2 });
  const day = twoDigits.format(date.getDate());
  const month = twoDigits.format(date.getMonth() + 1);
  const year = date.getFullYear();
  const hour = twoDigits.format(date.getHours());
  const min = twoDigits.format(date.getMinutes());

  return {
    "format-1": `${day}/${month}/${year} ${hour}:${min}`,
    "format-2": `${year}/${month}/${day} ${hour}:${min}`,
    "format-3": `${day}/${month}/${year}`,
  };
}

timestampInput.addEventListener("input", () => {
  options.timestamp = prepareTimestamps(new Date(timestampInput.value));
  loadCanvas();
  makeTimestampList(options.timestamp);
});

options.timestamp = prepareTimestamps();

//=== setup default value for datetime input
function getDateInputValue(date = new Date()) {
  const twoDigits = Intl.NumberFormat(undefined, { minimumIntegerDigits: 2 });
  const day = twoDigits.format(date.getDate());
  const month = twoDigits.format(date.getMonth() + 1);
  const year = date.getFullYear();
  const hour = twoDigits.format(date.getHours());
  const min = twoDigits.format(date.getMinutes());

  return `${year}-${month}-${day}T${hour}:${min}`;
}

timestampInput.setAttribute("value", getDateInputValue());

//=== creates timestamp formats list
const timestampForm = document.querySelector(".datetime__format-list-form");
const timestampItem = document.querySelectorAll(".datetime__format-item");

function makeTimestampList(formats) {
  timestampForm.innerHTML = "";

  for (const [name, value] of Object.entries(formats)) {
    const newTimestampItem = document.createElement("li");
    newTimestampItem.className = "datetime__format-item";
    newTimestampItem.innerHTML = `
      <label for="${name}">
        <input
          type="radio"
          name="datetime-format"
          id="${name}"
          disabled
        />
        ${value}
      </label>
    `;

    timestampForm.append(newTimestampItem);
  }
}

makeTimestampList(options.timestamp);
const timestampFormatInputs = document.querySelectorAll(
  "input[name='datetime-format']"
);
timestampFormatInputs[0].setAttribute("checked", true);

//=== watches datetime stamp format changing
timestampForm.addEventListener("input", (e) => {
  options.defaultTimestamp = e.target.id;
  loadCanvas();
});

//=== watches width/height inputs changing
function adjustPictureSize(width, height) {
  if (width) {
    heightInput.value = Math.round(
      (width * picture.naturalHeight) / picture.naturalWidth
    );
  } else if (height) {
    widthInput.value = Math.round(
      (height * picture.naturalWidth) / picture.naturalHeight
    );
  }
}

widthInput.addEventListener("input", () => {
  adjustPictureSize(widthInput.value, undefined);
});

heightInput.addEventListener("input", () => {
  adjustPictureSize(undefined, heightInput.value);
});
