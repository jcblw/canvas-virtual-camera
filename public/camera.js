;(function iif() {
  const enumerateDevicesFn = MediaDevices.prototype.enumerateDevices
  const getUserMediaFn = MediaDevices.prototype.getUserMedia

  MediaDevices.prototype.enumerateDevices = async function enumerateDevices() {
    const res = await enumerateDevicesFn.call(navigator.mediaDevices)
    res.push({
      deviceId: 'canvas-camera',
      groupID: 'canvas',
      kind: 'videoinput',
      label: 'Canvas Camera.',
    })
    return res
  }

  MediaDevices.prototype.getUserMedia = async function getUserMedia(
    ...args
  ) {
    const options = args[0]
    if (args.length && options.video && options.video.deviceId) {
      if (
        options.video.deviceId === 'canvas-camera' ||
        options.video.deviceId.exact === 'canvas-camera'
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
        }

        const minHeight = (options.video.advanced ?? []).reduce(
          (min, opt) => {
            if (opt.height && opt.height.min) {
              return opt.height.min
            }
            return min
          },
          0
        )
        const minWidth = (options.video.advanced ?? []).reduce(
          (min, opt) => {
            if (opt.width && opt.width.min) {
              return opt.width.min
            }
            return min
          },
          0
        )

        const width = options.video.width || minWidth
        const height = options.video.height || minHeight

        // create canvas
        const canvas =
          document.querySelector('#canvas-camera') ||
          document.createElement('canvas')
        canvas.id = 'canvas-camera'
        const video =
          document.querySelector('#canvas-camera-video') ||
          document.createElement('video')
        video.id = 'canvas-camera-video'

        if (width && height) {
          video.width = width
          video.height = height
          video.style = [
            'opacity:0',
            'position:absolute',
            'top:-1000%',
            'left:-1000%',
            `width:${width}px`,
            `height:${height}px`,
          ].join(';')

          canvas.width = width
          canvas.height = height
          canvas.style = [
            'opacity:0',
            'position:absolute',
            'top:-1000%',
            'left:-1000%',
            `width:${width}px`,
            `height:${height}px`,
          ].join(';')
        }

        const res = await getUserMediaFn.call(
          navigator.mediaDevices,
          constraints
        )

        if (res) {
          const body =
            document.body || document.getElementsByTagName('body')[0]
          body.appendChild(canvas)
          body.appendChild(video)

          video.srcObject = res
          video.onloadedmetadata = function onloadedmetadata(e) {
            console.log({ video, event: 'loaded' })
            video.play()
          }

          return canvas.captureStream(25)
        }
      }
    }
    const res = await getUserMediaFn.call(
      navigator.mediaDevices,
      ...args
    )
    return res
  }
})()
