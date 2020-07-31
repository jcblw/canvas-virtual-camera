// looping
const draw = () => {
  const video = document.querySelector("#hack-cam-video");
  const canvas = document.querySelector("#hack-cam");

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

  ctx.beginPath();
  ctx.font = "30px Google Sans,Roboto,Arial,sans-serif";
  ctx.fillStyle = "#fff";
  ctx.fillText(`Hi ${participants.join(",")}! 👋`, 200, 200);
  ctx.fill();

  requestAnimationFrame(draw);
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
      label: "My hack cam.",
    });
    return res;
  };

  MediaDevices.prototype.getUserMedia = async function () {
    const args = arguments;
    const options = args[0];
    console.log(options);
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

        const minHeight = (options.video.advanced ?? []).reduce((min, opt) => {
          if (opt.height && opt.height.min) {
            return opt.height.min;
          }
          return min;
        }, 0);
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
        canvas.id = "hack-cam";

        const video = document.createElement("video");
        video.id = "hack-cam-video";
        // inject into head

        if (width && height) {
          video.width = width;
          video.height = height;
          video.style = `opacity:0;position:absolute;top:-1000%;left:-1000%;width:${width}px;height:${height}px;`;

          canvas.width = width;
          canvas.height = height;
          canvas.style = `opacity:0;position:absolute;top:-1000%;left:-1000%;width:${width}px;height:${height}px;`;
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
    const res = await getUserMediaFn.call(navigator.mediaDevices, ...arguments);
    return res;
  };
}

export { monkeyPatchMediaDevices };
