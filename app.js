const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.use(express.json());

app.post('/convert', upload.single('image'), (req, res) => {
  fs.mkdir('output', { recursive: true }, (err) => {
    if (err) {
      console.error(`Error creating output directory: ${err}`);
      return res.sendStatus(500);
    }

    const inputPath = path.resolve(req.file.path);
    const outputPath = path.resolve('output', `${req.file.filename}.svg`);

    // Get the parameters from the request body
    const colorMode = req.body.colorMode || 'color';
    const colorPrecision = parseInt(req.body.colorPrecision) || 8;
    const cornerThreshold = parseFloat(req.body.cornerThreshold) || 60.0;
    const filterSpeckle = parseInt(req.body.filterSpeckle) || 2;
    const gradientStep = parseInt(req.body.gradientStep) || 10;
    const hierarchical = req.body.hierarchical || 'stacked';
    const mode = req.body.mode || 'pixel';
    const pathPrecision = parseInt(req.body.pathPrecision) || 2;
    const preset = req.body.preset || 'photo';
    const segmentLength = parseFloat(req.body.segmentLength) || 5.0;
    const spliceThreshold = parseInt(req.body.spliceThreshold) || 22; // Updated to parse as integer

    // Validate the parameters
    if (isNaN(colorPrecision) || isNaN(cornerThreshold) || isNaN(filterSpeckle) || isNaN(gradientStep) || isNaN(pathPrecision) || isNaN(segmentLength) || isNaN(spliceThreshold)) {
      return res.status(400).send('Invalid parameters');
    }

    exec(`vtracer --input ${inputPath} --output ${outputPath} --colormode ${colorMode} --color_precision ${colorPrecision} --corner_threshold ${cornerThreshold} --filter_speckle ${filterSpeckle} --gradient_step ${gradientStep} --hierarchical ${hierarchical} --mode ${mode} --path_precision ${pathPrecision} --preset ${preset} --segment_length ${segmentLength} --splice_threshold ${spliceThreshold}`, (error) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.sendStatus(500);
      }

      res.sendFile(outputPath, () => {
        fs.unlink(inputPath, (err) => {
          if (err) console.error(`Error deleting input file: ${err}`);
        });

        fs.unlink(outputPath, (err) => {
          if (err) console.error(`Error deleting output file: ${err}`);
        });
      });
    });
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
