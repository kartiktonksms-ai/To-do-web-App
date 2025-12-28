const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const Note = require('./models/Note');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); 
mongoose.connect('mongodb://localhost:27017/notes_app')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/notes', async (req, res) => {
  const note = new Note({
    title: req.body.title,
    content: req.body.content
  });

  try {
    const newNote = await note.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a note
app.put('/api/notes/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (note) {
      note.title = req.body.title || note.title;
      note.content = req.body.content || note.content;
      const updatedNote = await note.save();
      res.json(updatedNote);
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (note) {
       res.json({ message: 'Note deleted' });
    } else {
        res.status(404).json({ message: 'Note not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
