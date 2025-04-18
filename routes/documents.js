const express = require('express');
const Document = require('../models/Document');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

//Get all documents for the logged-in user
router.get('/', verifyToken, async (req, res) => {
    try {
        //const documents = await Document.find({ owner: req.user.id });
        const documents = await Document.find({});
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


// Base path is '/api/documents'
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json(document);
    } catch (error) {
        console.error('Error fetching document:', error); // Log for debug
        res.status(500).json({ message: 'Server error' });
    }
});


// Create a new document
router.post('/', verifyToken, async (req, res) => {
    const { title, content } = req.body;
    try {
      const newDocument = await Document.create({
        title,
        content,
        owner: req.user.id,
      });
  
      const io = req.app.get('io'); //  access io
      io.emit('documentCreated', newDocument); //  broadcast to all clients
  
      res.json(newDocument);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

// Update a document
router.put('/:id', verifyToken, async (req, res) => {
    const { title, content } = req.body;
    try {
      const updatedDocument = await Document.findByIdAndUpdate(
        req.params.id,
        { title, content },
        { new: true }
      );
  
      const io = req.app.get('io');
      io.emit('documentUpdated', updatedDocument); // 👈 notify update
  
      res.json(updatedDocument);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

// Delete a document
router.delete('/:id', verifyToken, async (req, res) => {
    try {
      await Document.findByIdAndDelete(req.params.id);
  
      const io = req.app.get('io');
      io.emit('documentDeleted', req.params.id); // emit event with deleted doc ID
  
      res.json({ message: 'Document deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  

module.exports = router;
