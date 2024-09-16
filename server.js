const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

mongoose.connect('mongodb://mongo:27017/outpatients', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch((error) => console.error('MongoDB connection error:', error));

const patientSchema = new mongoose.Schema({
    name: String,
    gender: String,
    mobileNumber: String,
    email: String,
    date: String,
    age: Number,
    disease: String, 
    firstTime: String,
    timeSlot: String,
    tokenNumber: Number,
});

const slotSchema = new mongoose.Schema({
    date: String,
    slotTime: String,
    tokenCount: { type: Number, default: 0 },
    maxTokens: { type: Number, default: 8 }
});

const Patient = mongoose.model('Patient', patientSchema);
const Slot = mongoose.model('Slot', slotSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static('public')); 

app.post('/patients', async (req, res) => {
    try {
        const { date, timeSlot, disease } = req.body;

        if (!date || !timeSlot || !disease) {
            return res.status(400).json({ error: 'Date, timeSlot, and disease are required.' });
        }
        let slot = await Slot.findOne({ date, slotTime: timeSlot });
        if (!slot) {
            slot = new Slot({ date, slotTime: timeSlot });
            await slot.save();
        }
        const existingPatients = await Patient.find({ date, timeSlot });
        const currentTokenCount = existingPatients.length;
        const maxTokens = slot.maxTokens;
        if (currentTokenCount >= maxTokens) {
            return res.status(400).json({ error: 'Slots are filled. Book another slot.' });
        }

        const usedTokens = existingPatients.map(patient => patient.tokenNumber);
        let tokenNumber = 1;

        while (usedTokens.includes(tokenNumber) && tokenNumber <= maxTokens) {
            tokenNumber++;
        }

        if (tokenNumber > maxTokens) {
            return res.status(400).json({ error: 'Slot is filled. Book another slot.' });
        }
        const patient = new Patient({ ...req.body, tokenNumber });
        await patient.save();

        res.status(201).json({ ...patient.toObject(), tokenNumber });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/patients/:id', async (req, res) => {
    const { id } = req.params;

    try {
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid patient ID format' });
        }
        const patient = await Patient.findById(id);

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.status(200).json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/patients/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        const { date, timeSlot } = patient;
        await Patient.findByIdAndDelete(req.params.id);
        const remainingPatients = await Patient.find({ date, timeSlot }).sort({ tokenNumber: 1 });
        let currentTokenNumber = 1;

        for (const remainingPatient of remainingPatients) {
            remainingPatient.tokenNumber = currentTokenNumber++;
            await remainingPatient.save();
        }

        res.status(200).json(patient);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
