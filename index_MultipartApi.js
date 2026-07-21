const express = require('express');

const cors = require('cors');

const app = express();

const util = require('util');
const multer = require('multer');

const maxSize = 2 * 1024 * 1024;

global.__basedir = __dirname;


let storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,__basedir + "/resources/static/assets/uploads/");
        console.log(__basedir);
    },
    filename:(req,file,cb)=>{
        console.log(file.originalname);
        cb(null,file.originalname);
    },
});

let uploadFile = multer({
    storage:storage,
    limits:{fileSize:maxSize},
}).single("file");



//const uploadFile = require('./multipart_uploadFile');


app.post('/upload', async (req, resp) => {
    try {
        await uploadFile(req, resp);
        if (req.file == undefined) {
            return resp.status(400).send({ message: 'Please upload a file!' });
        }
        else {
            return resp.status(200).send({ message: "Uploaded the file successfully: " + req.file.filename });
        }
    } catch (err) {
        console.log(err);
        if (err.code == 'LIMIT_FILE_SIZE') {
            return resp.status(500).send({
                message: 'File size can not be larger than 2MB',
            });
        }
        resp.status(500).send({
            message: `Could not upload the file: ${req.file.originalname}. ${err}`,
        });
    }
});

let port = 8000;
app.listen(port, () => {
    console.log(`Running at localhost:${port}`);
});