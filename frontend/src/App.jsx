
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
const API_URL = "http://localhost:5000/api/tasks";

function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get tasks from MongoDB
  async function getTasks() {
    try {
      setError("");
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      setError("Unable to load tasks. Please check the backend.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Load tasks when the page opens
  useEffect(() => {
    getTasks();
  }, []);

  // Add a new task
  async function addTask(event) {
    event.preventDefault();

    if (!task.trim()) {
      return;
    }

    try {
      setError("");

      const response = await axios.post(API_URL, {
        title: task.trim(),
      });

      setTasks((previousTasks) => [
        response.data,
        ...previousTasks,
      ]);

      setTask("");
    } catch (error) {
      setError("Unable to add task. Please try again.");
      console.error(error);
    }
  }

  // Mark a task completed or incomplete
  async function toggleTask(id, completed) {
    try {
      setError("");

      const response = await axios.patch(`${API_URL}/${id}`, {
        completed: !completed,
      });

      setTasks((previousTasks) =>
        previousTasks.map((eachTask) =>
          eachTask._id === id ? response.data : eachTask
        )
      );
    } catch (error) {
      setError("Unable to update task.");
      console.error(error);
    }
  }

  // Delete a task
  async function deleteTask(id) {
    try {
      setError("");

      await axios.delete(`${API_URL}/${id}`);

      setTasks((previousTasks) =>
        previousTasks.filter((eachTask) => eachTask._id !== id)
      );
    } catch (error) {
      setError("Unable to delete task.");
      console.error(error);
    }
  }

  const completedCount = tasks.filter(
    (eachTask) => eachTask.completed
  ).length;

  return (
    <div className="app">
      <header className="header">
        <h1>TaskFlow</h1>
        <p>Organize your day, one task at a time.</p>
      </header>

      <main className="container">
        <h2>My Tasks</h2>

        <form className="task-form" onSubmit={addTask}>
          <input
            type="text"
            placeholder="Enter a new task..."
            value={task}
            onChange={(event) => setTask(event.target.value)}
          />
          <button type="submit">Add Task</button>
        </form>

        <div className="task-summary">
          <span>Total tasks: {tasks.length}</span>
          <span>Completed: {completedCount}</span>
        </div>

        {error && <p className="error-message">{error}</p>}

        {loading ? (
          <p className="empty-message">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="empty-message">
            No tasks yet. Add your first task!
          </p>
        ) : (
          <ul className="task-list">
            {tasks.map((eachTask) => (
              <li className="task-item" key={eachTask._id}>
                <label className="task-label">
                  <input
                    type="checkbox"
                    checked={eachTask.completed}
                    onChange={() =>
                      toggleTask(eachTask._id, eachTask.completed)
                    }
                  />

                  <span
                    className={
                      eachTask.completed ? "completed" : ""
                    }
                  >
                    {eachTask.title}
                  </span>
                </label>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => deleteTask(eachTask._id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default App;
