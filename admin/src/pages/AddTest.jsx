import { useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const AddTest = ({ token }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState([""]);
  const [duration, setDuration] = useState("");
  const [maxmarks, setMaxmarks] = useState("");
  const [testDate, setTestDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const handleInstructionChange = (index, value) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Convert inputs to proper Date objects
    const testDateObj = new Date(testDate);
    const startTimeObj = new Date(startTime);
    const endTimeObj = new Date(endTime);

    // Extract time components (hours and minutes only)
    const getTimeMinutes = (date) => {
      return date.getHours() * 60 + date.getMinutes();
    };

    const startMinutes = getTimeMinutes(startTimeObj);
    const endMinutes = getTimeMinutes(endTimeObj);

    // Time validation
    if (startMinutes >= endMinutes) {
      toast.error("Start time must be before end time (minimum 1 minute difference)");
      setIsSubmitting(false);
      return;
    }

    // Date validation - check if all dates match
    const formatDate = (date) => {
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    };

    const testDateStr = formatDate(testDateObj);
    const startDateStr = formatDate(startTimeObj);
    const endDateStr = formatDate(endTimeObj);

    if (testDateStr !== startDateStr || testDateStr !== endDateStr) {
      toast.error("Test date, start time, and end time must be on the same date");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/tests`,
        {
          title,
          description,
          instructions: instructions.filter(i => i.trim() !== ""),
          duration,
          maxmarks,
          testDate: testDateObj.toISOString(),
          startTime: startTimeObj.toISOString(),
          endTime: endTimeObj.toISOString()
        },
        {
          headers: { token }
        }
      );

      if (response.data.success) {
        toast.success("Test added successfully!");
        // Reset form
        setTitle("");
        setDescription("");
        setInstructions([""]);
        setDuration("");
        setMaxmarks("");
        setTestDate("");
        setStartTime("");
        setEndTime("");
      } else {
        toast.error(response.data?.message || "Failed to add test");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding test");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Test</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title and Description */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Title*</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                type="text"
                placeholder="Enter test title"
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter test description"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
            <div className="space-y-2">
              {instructions.map((inst, i) => (
                <div key={i} className="flex items-center">
                  <span className="mr-2 text-gray-500">{i + 1}.</span>
                  <input
                    value={inst}
                    onChange={e => handleInstructionChange(i, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Enter instruction ${i + 1}`}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddInstruction}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Another Instruction
            </button>
          </div>

          {/* Duration and Max Marks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)*</label>
              <input
                value={duration}
                onChange={e => setDuration(e.target.value)}
                min={0}
                type="number"
                placeholder="Enter duration in minutes"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Marks*</label>
              <input
                value={maxmarks}
                onChange={e => setMaxmarks(e.target.value)}
                min={0}
                type="number"
                placeholder="Enter maximum marks"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Date*</label>
              <input
                value={testDate}
                onChange={e => setTestDate(e.target.value)}
                type="date"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time*</label>
              <input
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                type="datetime-local"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time*</label>
              <input
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                type="datetime-local"
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTest;