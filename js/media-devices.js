// looping
let ts = 0;
const draw = () => {
  const video = document.querySelector("#party-cam-video");
  const canvas = document.querySelector("#party-cam");
  const input = document.querySelector("#party-cam-input");

  const participants = Array.from(document.querySelectorAll("[data-self-name]"))
    .map((el) => el.textContent)
    .reduce((accum, txt) => {
      if (!accum.some((t) => txt === t) && txt !== "You") {
        accum.push(txt);
      }
      return accum;
    }, []);

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const date = new Date();
  const hours = date.getHours();
  const formatedHours = hours > 12 ? hours - 12 : hours;
  const minutes = date.getMinutes();

  ctx.beginPath();
  ctx.font = "100px Google Sans,Roboto,Arial,sans-serif";
  ctx.fillStyle = "#fff";
  ctx.fillText(
    `⏰ ${formatedHours}:${minutes}. ${(input && input.value) || ""}`,
    200,
    200
  );
  ctx.fill();

  clearTimeout(ts);
  ts = setTimeout(draw, 0);
};

function monkeyPatchMediaDevices() {
  const enumerateDevicesFn = MediaDevices.prototype.enumerateDevices;
  const getUserMediaFn = MediaDevices.prototype.getUserMedia;

  MediaDevices.prototype.enumerateDevices = async function () {
    const res = await enumerateDevicesFn.call(navigator.mediaDevices);
    // We could add "Virtual VHS" or "Virtual Median Filter" and map devices with filters.
    res.push({
      deviceId: "virtual",
      groupID: "cool",
      kind: "videoinput",
      label: "Party Cam.",
    });
    return res;
  };

  MediaDevices.prototype.getUserMedia = async function () {
    const args = arguments;
    const options = args[0];
    try {
      if (args.length && options.video && options.video.deviceId) {
        if (
          options.video.deviceId === "virtual" ||
          options.video.deviceId.exact === "virtual"
        ) {
          // This constraints could mimick closely the request.
          // Also, there could be a preferred webcam on the options.
          // Right now it defaults to the predefined input.
          const constraints = {
            video: {
              facingMode: options.facingMode,
              advanced: options.video.advanced,
              width: options.video.width,
              height: options.video.height,
            },
            audio: false,
          };

          const minHeight = (options.video.advanced ?? []).reduce(
            (min, opt) => {
              if (opt.height && opt.height.min) {
                return opt.height.min;
              }
              return min;
            },
            0
          );
          const minWidth = (options.video.advanced ?? []).reduce((min, opt) => {
            if (opt.width && opt.width.min) {
              return opt.width.min;
            }
            return min;
          }, 0);

          const width = options.video.width || minWidth;
          const height = options.video.height || minHeight;

          // create canvas
          const canvas = document.createElement("canvas");
          canvas.id = "party-cam";
          const video = document.createElement("video");
          video.id = "party-cam-video";
          const input = document.createElement("input");
          input.id = "party-cam-input";

          if (width && height) {
            video.width = width;
            video.height = height;
            video.style = `opacity:0;position:absolute;top:-1000%;left:-1000%;width:${width}px;height:${height}px;`;

            canvas.width = width;
            canvas.height = height;
            canvas.style = `opacity:0;position:absolute;top:-1000%;left:-1000%;width:${width}px;height:${height}px;`;

            input.style = `position:fixed;top:0;left:0;z-index:9999;`;
          }

          const res = await getUserMediaFn.call(
            navigator.mediaDevices,
            constraints
          );

          if (res) {
            const body =
              document.body || document.getElementsByTagName("body")[0];
            body.appendChild(canvas);
            body.appendChild(video);
            body.appendChild(input);

            video.srcObject = res;
            video.onloadedmetadata = function (e) {
              console.log({ video, event: "loaded" });
              video.play();
              draw();
            };

            const stream = canvas.captureStream(25);
            // write to canvas
            // stream from canvas
            // output return stream
            return stream;
          }
        }
      }
      const res = await getUserMediaFn.call(
        navigator.mediaDevices,
        ...arguments
      );
      return res;
    } catch (e) {
      console.error(e);
    }
  };
}

export { monkeyPatchMediaDevices };
