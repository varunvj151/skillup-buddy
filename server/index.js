const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = 5000;

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Multer config for audio file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });

// Helper: safely delete a file
const cleanupFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) console.error(`Failed to delete: ${filePath}`, err);
        });
    }
};

// POST /api/transcribe
app.post('/api/transcribe', upload.single('audio'), (req, res) => {
    // 1. Check if a file was uploaded
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file uploaded.' });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.filename);
    const fileBaseName = path.basename(req.file.filename, ext);
    const txtFilePath = path.join(path.dirname(filePath), `${fileBaseName}.txt`);

    // 2. Run Whisper via child_process.exec
    const whisperCmd = `py -3.11 -m whisper "${filePath}" --model base --output_format txt --output_dir "${uploadsDir}"`;

    console.log(`Running Whisper: ${whisperCmd}`);

    exec(whisperCmd, (error, stdout, stderr) => {
        if (error) {
            console.error('Whisper error:', error.message);
            console.error('Whisper stderr:', stderr);
            cleanupFile(filePath);
            return res.status(500).json({ error: 'Whisper transcription failed.' });
        }

        // 3. Read the generated .txt file
        fs.readFile(txtFilePath, 'utf-8', (readErr, data) => {
            if (readErr) {
                console.error('Failed to read transcript file:', readErr.message);
                cleanupFile(filePath);
                cleanupFile(txtFilePath);
                return res.status(500).json({ error: 'Failed to read transcript file.' });
            }

            const transcript = data.trim();

            // 4. Send response
            res.json({ transcript });

            // 5. Cleanup: delete uploaded audio & generated txt
            cleanupFile(filePath);
            cleanupFile(txtFilePath);
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
