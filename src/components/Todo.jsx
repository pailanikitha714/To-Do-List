import React, { useState, useEffect } from "react";

const Todo = () => {
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState("");

  const [user, setUser] = useState(localStorage.getItem("loggedInUser"));
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load user on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("loggedInUser");
    if (savedUser) setUser(savedUser);
  }, []);

  // Load todos for current user
  useEffect(() => {
    if (user) {
        const saved = localStorage.getItem(`todos_${user}`);
        setTodos(saved ? JSON.parse(saved) : []);
        setIsLoaded(true); // ✅ important
    }
  }, [user]);

  // Save todos
  useEffect(() => {
    if (user && isLoaded) {
        localStorage.setItem(`todos_${user}`, JSON.stringify(todos));
    }
  }, [todos, user, isLoaded]);

  // REGISTER
  const handleRegister = () => {
    setMessage("");

    if (!name || !password) {
      setMessage("Please fill all fields ⚠️");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!emailRegex.test(name)) {
      setMessage("Enter a valid Gmail address ❌");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.find((u) => u.name === name);
    if (exists) {
      setMessage("User already exists ❌");
      return;
    }

    users.push({ name, password });
    localStorage.setItem("users", JSON.stringify(users));

    setMessage("Registered successfully ✅");
    setIsRegister(false);
    setName("");
    setPassword("");
  };

  // LOGIN
  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const foundUser = users.find(
      (u) =>
        u.name.toLowerCase().trim() === name.toLowerCase().trim() &&
        u.password === password
    );

    if (foundUser) {
      localStorage.setItem("loggedInUser", name);
      setUser(name);
      setMessage("");
    } else {
      setMessage("Invalid email or password ❌");
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setUser(null);
    setTodos([]);
  };

  // TASK FUNCTIONS
  const addTask = () => {
    if (task.trim() === "") return;
    setTodos([...todos, { text: task, completed: false }]);
    setTask("");
  };

  const toggleTask = (index) => {
    const updated = [...todos];
    updated[index].completed = !updated[index].completed;
    setTodos(updated);
  };

  const deleteTask = (index) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setEditText(todos[index].text);
  };

  const saveEdit = () => {
    const updated = [...todos];
    updated[editIndex].text = editText;
    setTodos(updated);
    setEditIndex(null);
    setEditText("");
  };

  // FILTER
  const filteredTodos = todos.filter((t) => {
    if (filter === "completed") return t.completed;
    if (filter === "pending") return !t.completed;
    return true;
  });

  // LOGIN UI
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-900 to-purple-800 text-white">
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl rounded-3xl p-8 w-[350px]">

          <h1 className="text-2xl mb-6 text-center">
            {isRegister ? "Register 📝" : "Login 🔐"}
          </h1>

          {message && (
            <p className="text-red-400 text-center mb-3">{message}</p>
          )}

          <input
            type="text"
            placeholder="Enter your email"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mb-3 px-4 py-3 rounded-full bg-white/20 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded-full bg-white/20 outline-none"
          />

          {isRegister ? (
            <button
              onClick={handleRegister}
              className="bg-green-500 w-full py-2 rounded-full"
            >
              Register
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-blue-500 w-full py-2 rounded-full"
            >
              Login
            </button>
          )}

          <p
            className="text-sm mt-4 text-center cursor-pointer"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister
              ? "Already have an account? Login"
              : "New user? Register"}
          </p>
        </div>
      </div>
    );
  }

  // MAIN TODO UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-800 text-white px-6 py-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">✨ To-Do List</h1>
        
        <div className="flex items-center gap-4">
            <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-lg"
            >
            Logout
            </button>
        </div>
        </div>

        {/* INPUT */}
        <div className="flex gap-3 max-w-4xl mx-auto mb-6">
        <input
            type="text"
            placeholder="Add your task..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            className="flex-1 px-4 py-3 rounded-lg bg-white/20 outline-none"
        />
        <button
            onClick={addTask}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg"
        >
            Add
        </button>
        </div>

        {/* FILTERS */}
        <div className="flex justify-center gap-4 mb-6">
        {["All", "Completed", "Pending"].map((type) => {
            let color = "";
            if (type === "All") color = "bg-blue-500";
            if (type === "Completed") color = "bg-green-500";
            if (type === "Pending") color = "bg-yellow-500";

            return (
            <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-1 rounded-full ${
                filter === type ? color : "bg-white/20"
                }`}
            >
                {type}
            </button>
            );
        })}
        </div>

        {/* TASK LIST */}
        <div className="max-w-4xl mx-auto space-y-3">
        {filteredTodos.length === 0 && (
            <p className="text-center text-gray-300">No tasks here 🚀</p>
        )}

        {filteredTodos.map((t) => {
            const realIndex = todos.findIndex(item => item === t);

            return (
            <div
                key={realIndex}
                className="flex items-center justify-between bg-white/10 px-4 py-3 rounded-lg hover:bg-white/20 transition"
            >
                <div className="flex items-center gap-3 flex-1">
                <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleTask(realIndex)}
                />

                {editIndex === realIndex ? (
                    <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="bg-transparent border-b outline-none flex-1"
                    />
                ) : (
                    <span
                    className={`flex-1 ${
                        t.completed ? "line-through text-gray-400" : ""
                    }`}
                    >
                    {t.text}
                    </span>
                )}
                </div>

                <div className="flex gap-3 text-lg">
                {editIndex === realIndex ? (
                    <button onClick={saveEdit}>📁</button>
                ) : (
                    <button onClick={() => startEdit(realIndex)}>✍️</button>
                )}
                <button onClick={() => deleteTask(realIndex)}>❌</button>
                </div>
            </div>
            );
        })}
        </div>

        {/* CLEAR */}
        {todos.length > 0 && (
        <div className="flex justify-center mt-6">
            <button
            onClick={() => setTodos([])}
            className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg"
            >
            🧹 Clear All
            </button>
        </div>
        )}
    </div>
  );
};

export default Todo;