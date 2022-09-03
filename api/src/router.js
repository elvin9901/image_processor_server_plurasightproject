//declare Router in deconstructor
const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const imageProcessor = require('./imageProcessor');
const photoPath = path.resolve(__dirname, '../../client/photo-viewer.html');
const router = Router();




const filename = (request, file, callback) => {
    callback(null, file.originalname);
};



//Next after the express require, let's require multer.
// Declare a constant called storage. Assign to it a call to the diskStorage() method of multer. 
//Pass an object literal as the only argument. The object literal should have two properties:
// the first with a key of destination and a value of 'api/uploads/'; the second with a key of filename and a value of filename. 
//Note: the 2nd property is referring to the filename function we made earlier.
const storage = multer.diskStorage({
    destination: 'api/uploads/',
    filename,
});


/**
 * Create the MIME type file filter
Declare a function called fileFilter. It should take request, file, and callback as parameters. 
Inside the function body declare an if statement that runs its code block if file.mimetype does not strictly equal 'image/png',
Inside the if block, let's assign to request.fileValidationError the string 'Wrong 
file type'. Then, make a call to the callback() parameter, passing in null, false, and 
a new Error object with the message 'Wrong file type'. Next, in an else block, let's call callback(), 
passing in null as the first argument, and true as the second.
 */
const fileFilter = (request, file, callback) => {
    if (file.mimetype !== 'image/png') {
        request.fileValidationError = 'Wrong file type';
        callback(null, false, new Error('Wrong file type'));
    } else {
        callback(null, true);
    }
};



const upload = multer({
    fileFilter,
    storage,
});




router.post('/upload', upload.single('photo'), async(request, response) => {
    if (request.fileValidationError) return response.status(400).json({ error: request.fileValidationError });
    try {
        await imageProcessor(request.file.filename);
    } catch (error) {

    }

    return response.status(201).json({ success: true });
});

router.get('/photo-viewer', (request, response) => {
    response.sendFile(photoPath);
});




// //exports the router
module.exports = router;