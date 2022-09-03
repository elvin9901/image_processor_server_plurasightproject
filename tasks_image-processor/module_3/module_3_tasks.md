# Serving the photo-viewer and creating the workers

## Resolve the path to the photo viewer
TASK 1:
In `router.js`, let's import `path`. Declare a constant called `photoPath`. 
Assign to it a call to the `resolve()` method of `path`. Pass `__dirname` and 
`../../client/photo-viewer.html.

## Create the photo-viewer get route
TASK 2:
Let's call the `get()` method of our `router` object. Pass the route
 `'/photo-viewer'` as the first argument. Pass an anonymous callback function
 that takes `request` and `response` as parameters. In the body of the function let's call 
 the `sendFile()` method of `response`, passing in the `photoPath` constant as its
only argument.

## Add an image 
TASK 3:
Let's open up `photo-viewer.html` inside the `client` directory. Inside the `<body>` tag,
 let's add an `<img>` tag with a `src` attribute with the value `'ullr.png'` and a `class` of `photo`.

## Create the resize worker
TASK 4:
Inside the `resizeWorker.js` file, within the `api/src` directory, require `gm`. 
Require `workerData` and `parentPort` from the `worker_threads` module. Make a 
call to `gm()`, passing in `workerData.source`.

## Resize the photo to be 100px by 100px 
TASK 5:
Chain a call to `resize()` off of the call to `gm()` we made prior, passing in 
`100` as both the first and second argument.

## Write the resized image to disk
TASK 6:
Chain a call to `write()` off of the call to `resize()` we made before, pass in 
`workerData.destination` as the first argument. The second argument should be an 
anonymous function.

## Handle resize errors gracefully
TASK 7: 
Give our anonymous function a parameter of `error`. Inside the function body,
 check if `error` is a truthy value. If it is, `throw` the `error`.

## Send a message to the parent thread
TASK 8:
Also inside the function body, let's make a call to `parentPort.postMessage()`. 
Pass in an object literal with a key of `resized` and the boolean value `true`.

## Create the monochrome worker
TASK 9:
Inside the `monochromeWorker.js` file, within the `api/src` directory, require 
`gm`. Require `workerData` and `parentPort` from the `worker_threads` module.
Make a call to `gm()`, passing in `workerData.source`.

## Convert the image to monochrome
TASK 10:
Chain a call to `monochrome()` off of the call to `gm()` we made previously.

## Write the monochrome image to disk
TASK 11:
Chain a call to `write()` off of the previous call to `monochrome()`. Pass in 
`workerData.destination` as the first argument. The second argument should be an 
anonymous function.

## Handle monochrome errors gracefully
TASK 12: 
Give our anonymous function a parameter of `error`. Inside the function body,
 check if `error` is a truthy value. If it is `throw` the error.

## Send a message to the parent thread
TASK 13:
Also inside the function body, let's make a call to `parentPort.postMessage()`. 
Pass in an object literal with a key of `monochrome` and the boolean value 
`true`.

