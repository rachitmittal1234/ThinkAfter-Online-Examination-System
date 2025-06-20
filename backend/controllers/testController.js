import TestModel from '../models/testModel.js';

// Create a new test
export const createTest = async (req, res) => {
  try {
    const { title, description, instructions, duration, maxmarks, testDate, startTime, endTime, questions } = req.body;

    // Basic validation could be enhanced
    if (!title || !duration || !maxmarks || !testDate || !startTime || !endTime) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const newTest = new TestModel({
      title,
      description,
      instructions,
      duration,
      maxmarks,
      testDate,
      startTime,
      endTime,
      questions: questions || []
    });

    await newTest.save();
    res.status(201).json({success:true, message: 'Test created successfully', test: newTest });
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({success:false, message: 'Server error while creating test' });
  }
};

// Get all tests (optionally you can add pagination/filtering)
export const getAllTests = async (req, res) => {
  try {
    const tests = await TestModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, tests });
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching tests' });
  }
};


// Get a single test by ID with populated questions
export const getTestById = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await TestModel.findById(id).populate('questions');
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.status(200).json(test);
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ message: 'Server error while fetching test' });
  }
};



// Update a test by ID (you can update fields & questions array)
export const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedTest = await TestModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updatedTest) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.status(200).json({ message: 'Test updated successfully', test: updatedTest });
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ message: 'Server error while updating test' });
  }
};

// Delete a test by ID
export const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTest = await TestModel.findByIdAndDelete(id);
    if (!deletedTest) {
      return res.status(404).json({success:false, message: 'Test not found' });
    }

    res.status(200).json({success:true, message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({success:false, message: 'Server error while deleting test' });
  }
};
