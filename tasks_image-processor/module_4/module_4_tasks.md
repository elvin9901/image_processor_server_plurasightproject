# Creating the parent thread

## Create the image processor
TASK 1:
In `api/src/imageProcessor.js`, let's require `path` from the `path` module.
Next, require `Worker` and `isMainThread` from the `worker_threads` module.
Let's define a function called `imageProcessor()`. Export it using 
`module.exports`.

## Instantiate a new promise
TASK 2:
Next, return a `new Promise()` from `imageProcessor()`. Let's pass an anonymous 
function to our promise. It should take `resolve` and `reject` as parameters.
Inside of our function body, let's check if we are on the main thread using 
`isMainThread`. If we aren't on the main thread, make a call to `reject()` 
within an `else` block. Pass in `new Error()` with the message `'not on main 
thread'` to the call to `reject()` we made prior. After the `else` block, call
`resolve()`. 

## Resolve the path to the resize worker
TASK 3:
Define a constant before the `imageProcessor()` function called 
`pathToResizeWorker`. Assign a call to `path.resolve()` to it. Pass in 
`__dirname` as the first argument, and `'resizeWorker.js'` as the second. 

## Resolve the path to the monochrome worker
TASK 4:
Define a constant before the `imageProcessor()` function called 
`pathToMonochromeWorker`. Assign a call to `path.resolve()` to it. Pass in 
`__dirname` as the first parameter, and `'monochromeWorker.js'` as the second. 

## Create the upload path resolver function
TASK 5:
Define a function called `uploadPathResolver()`. Pass in the parameter `filename`.
 It should return a call to `path.resolve()` passing in `__dirname`,
`'../uploads'`, and `filename`.

## Define the source path
TASK 6:
Let's head back to the `imageProcessor()` function. Pass a parameter called `filename` to `imageProcessor()`. 
Define a constant called `sourcePath` within the `imageProcessor()` function. Assign a call to 
`uploadPathResolver()` to `sourcePath`, pass in the `filename` argument.

## Define the resized photo's destination
TASK 7:
After the line we just wrote, define a constant `resizedDestination`. Assign to it a call to `uploadPathResolver()`, 
passing in `'resized-'` concatenated with the `filename`.


## Define the monochrome photo's destination
TASK 8:
After the line we just wrote, define a constant `monochromeDestination`. Assign to it a call to `uploadPathResolver()`,
passing in `'monochrome-'` concatenated with the `filename`.

## Instantiate the resizeWorker
TASK 9:
Inside the `if` block within our promise, let's create a try/catch statement.
Inside the `try`, assign to a constant called `resizeWorker` a new instantiation 
of the `Worker()` class. Pass in `pathToResizeWorker` as the first argument. The 
second argument should be an object literal, with a key of `workerData` and a 
value that is another object literal. Within the `workerData` object, define a 
key called `source` with our `sourcePath` constant as the value. Define another 
key in `workerData` called `destination`, and assign to it our `resizedDestination` 
constant. Inside the catch, call `reject()` passing in the error.

## Instantiate the monochromeWorker
TASK 10:
Inside the `if` block within our promise, inside the `try` statement, assign a new 
instantiation of the `Worker()` class to a constant called `monochromeWorker`. 
Pass in `pathToMonochromeWorker` as the first argument. The second argument 
should be an object literal, with a key of `workerData` and a value that is 
another object literal. Within the `workerData` object, define a key called 
`source` with our `sourcePath` constant as the value. Define another key in 
`workerData` called `destination`, and assign to it our `monochromeDestination` 
constant.

## Register the on message event listener for the resize worker
Task 11:
Before our promise, assign to a variable called `resizeWorkerFinished` the boolean 
value `false`. Within our `try` block, call the `on()` method of `resizeWorker`. 
Let's pass the string `'message'` as the first argument. The second argument 
should be an anonymous function with a `message` parameter. Inside 
the body of the function, set the `resizeWorkerFinished` variable to `true`.
Call `resolve()` with the string `'resizeWorker finished processing'`. Delete the
`resolve()` that is outside the `try/catch` block, after the `else` block. We made this call in task 2.

## Register the on error event listener for the resize worker
TASK 12:
After the previous event listener, let's call the `on()` method of `resizeWorker` again. 
This time, let's register the `'error'` event. Pass an anonymous function that has an `error` parameter.
 In the body of the callback function, make a call to `reject()`, passing it `new Error()`.
 Pass `error.message` to the `Error()` constructor.

## Register the on exit event listener for the resize worker
TASK 13:
After the event listener we just wrote, let's register another event to the `resizeWorker`. Call the `on()` method again, and this time pass in the event name `'exit'` as the first argument. The anonymous callback function should have a `code` parameter. Next, check to see if `code` is not strictly equal to `0`. If it doesn't equal `0`, call `reject()`, passing in `new Error()`. The `Error()` constructor should take the string `'Exited with status code '` concatenated with `code`.


## Register the on message event listener for the monochrome worker
TASK 14:
Just above our promise, assign to a variable called `monochromeWorkerFinished` the  
value `false`. Let's register some events on the `monochromeWorker`. Call its 
`on()` method, and pass the string `'message'` as the first argument. The second 
argument should be an anonymous function that has a parameter called 
`message`. Inside the body of the function, set the `monochromeWorkerFinished` 
variable to `true`. Check if `resizeWorkerFinished` is `true`. If so, call 
`resolve()` with the string `'monochromeWorker finished processing'`. Go back up 
to the `resizeWorker`'s message event listener. Wrap the `resolve()` in an `if` 
statement that runs if `monochromeWorkerFinished` is true.

## Register the on error event listener for the monochrome worker
TASK 15:
Next, let's call the `on()` method of `monochromeWorker` again. This time, let's 
register the `'error'` event. Pass an anonymous function that has an `error` parameter.
In the body of the callback function, make a call to `reject()`, 
passing a `new Error()`. Pass in `error.message` to the `Error()` constructor.

## Register the on exit event listener for the monochrome worker
TASK 16:
Let's register another event to the `monochromeWorker`. Call the `on()` method 
again, and this time pass in the event name `'exit'` as the first argument. The 
anonymous callback function should have a `code` parameter. Next, check to 
see if `code` is not strictly equal to `0`. If it doesn't equal `0`, call `reject()`, passing in 
`new Error()`. The `Error()` constructor should take the string `'Exited with status code '` 
concatenated with `code`. 

## Invoke the image processor in the post route
TASK 17:
Let's head back to the `router.js` file. Require the `./imageProcessor`. Then, mark 
our callback function as `async` in our `post()` method on the `'/upload'` route. 
After our file validation check, in the body of our `async` callback, open up a `try`/`catch` block. Inside the `try` block, `await` a call to the `imageProcessor()` passing in `request.file.filename` as it's only 
argument.

## Add the monochrome image to the photo viewer
TASK 18:
In the `photo-viewer.html` file, inside the `client` directory, let's add another `<img>` tag after our first one. Add a `src` attribute equal to `'monochrome-ullr.png'`.

## Add the resized image to the photo viewer
TASK 19:
Add another `<img>` tag with a `src` attribute of `'resized-ullr.png'` after 
our monochrome image.
