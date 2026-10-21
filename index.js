const readline = require("readline");
const fs = require("fs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let todos = [];

// Load tasks from file (if exists)
function loadTasks() {
  if (fs.existsSync("tasks.json")) {
    todos = JSON.parse(fs.readFileSync("tasks.json"));
  }
}

// Save tasks to file
function saveTasks() {
  fs.writeFileSync("tasks.json", JSON.stringify(todos, null, 2));
}

// ------------------------ OPERATIONS ---------------------

// 1. Add Tasks
function addTask() {
  rl.question("\n Enter new task: ", (task) => {
    if (task.trim() === "") {
      console.log("Task cannot be empty.");
      return showMenu();
    }

    rl.question("Enter category (Work/Personal/study): ", (category) => {
      rl.question("Enter deadline (YYYY-MM-DD): ", (deadline) => {
        rl.question(
          "How often will this task reoccur? (none/daily/weekly/monthly) ",
          (recurrence) => {
            todos.push({
              text: task,
              done: false,
              category: category || "General",
              deadline: deadline || "No deadline",
              recurrence: recurrence || "none",
            });
            saveTasks();
            console.log("Task added successfully");
            showMenu();
          },
        );
      });
    });
  });
}

// 2. View Tasks
function viewTasks() {
  console.log("\n Your TO-DO List:");
  if (todos.length === 0) {
    console.log("No tasks yet.");
  } else {
    todos.forEach((t, i) => {
      console.log(
        `${i + 1}. ${t.done ? "✔" : "❌"} ${t.text} (Category: ${t.category}, Deadline: ${t.deadline})`,
      );
    });
  }

  showMenu();
}

// 3. Toggle Done/undone
function toggleTask() {
  rl.question("\n Enter task number to toggle: ", (num) => {
    const index = parseInt(num) - 1;
    if (isNaN(index) || index < 0 || index >= todos.length) {
      console.log("Invalid task number");
      return showMenu();
    }

    const reOccur = todos[index].recurrence.toLowerCase();

    if (reOccur === "none") todos[index].done = !todos[index].done;
    else if (reOccur === "daily") {
      const newDay = new Date(todos[index].deadline);
      newDay.setDate(newDay.getDate() + 1);
      todos[index].deadline = newDay.toISOString().split("T")[0];
      todos[index].done = false;
    } else if (reOccur === "weekly") {
      const newWeek = new Date(todos[index].deadline);
      newWeek.setDate(newWeek.getDate() + 7);
      todos[index].deadline = newWeek.toISOString().split("T")[0];
      todos[index].done = false;
    } else if (reOccur === "monthly") {
      const newMonth = new Date(todos[index].deadline);
      newMonth.setDate(newMonth.getMonth() + 1);
      todos[index].deadline = newMonth.toISOString().split("T")[0];
      todos[index].done = false;
    }

    saveTasks();
    console.log("Task status updated!");
    viewTasks();
  });
}

// 4. Edit task
function editTask() {
  rl.question("\n What task number do you want to edit: ", (num) => {
    const index = parseInt(num) - 1;
    if (isNaN(index) || index < 0 || index >= todos.length) {
      console.log("Invalid number");
      return showMenu();
    }

    rl.question("\n What text do you want to substitute: ", (text) => {
      if (text.trim() === "") {
        console.log("Input text");
        return showMenu();
      }

      todos[index].text = text;
      saveTasks();
      console.log("Edited successfully");
      showMenu();
    });
  });
}

// 5. Delete task
function deleteTask() {
  rl.question("\n Enter the number of task to delete: ", (num) => {
    const index = parseInt(num) - 1;
    if (isNaN(index) || index < 0 || index >= todos.length) {
      console.log("Invalid number");
      return showMenu();
    }

    todos.forEach((todo, i) => {
      if ((i = index)) {
        todos.splice(i, 1);
      }
    });

    saveTasks();
    console.log("Deleted successfully");
    showMenu();
  });
}

// 6. Filter by Category
function filterByCategory() {
  rl.question(
    "\n what category do you want to show (Work/Personal/Study): ",
    (category) => {
      if (category.trim() === "") {
        console.log("Enter a category (Work/Personal/Study)");
        showMenu();
      }

      const matchedCategory = todos.filter((todo) => {
        return todo.category.toLowerCase() === category.toLowerCase();
      });

      if (matchedCategory.length > 0) {
        matchedCategory.forEach((todo, i) => {
          console.log(`${i + 1}. ${todo.done ? "✔" : "❌"} ${todo.text}`);
        });
      } else {
        console.log("Enter valid category");
      }

      showMenu();
    },
  );
}

// 7. Filter by Deadline
function filterByDeadline() {
  rl.question("what date do you want to show (YYYY-MM-DD): ", (date) => {
    if (date.trim() === "") {
      console.log("Enter a date (YYYY-MM-DD)");
      showMenu();
    }

    const matchedDeadlines = todos.filter((todo) => {
      return todo.deadline === date;
    });

    if (matchedDeadlines.length > 0) {
      matchedDeadlines.forEach((todo, i) => {
        console.log(`${i + 1}. ${todo.done ? "✔" : "❌"} ${todo.text}`);
      });
    } else {
      console.log("Enter a valid date.");
    }

    // todos.filter((todo, i) => {
    //   if (todo.deadline === date) {
    //     console.log(`${i + 1}. ${todo.done ? "✔" : "❌"} ${todo.text}`);
    //   }
    // });
    showMenu();
  });
}

// 8. Search task
function searchTask() {
  rl.question("Search a task by a word: ", (word) => {
    const wordCase = word.toString().toLowerCase();
    if (wordCase.trim() === "") {
      console.log("Type something");
      return showMenu();
    }

    const matchedTodos = todos.filter((todo) => {
      return todo.text.toLowerCase().includes(wordCase);
    });

    if (matchedTodos.length > 0) {
      matchedTodos.forEach((todo, i) => {
        console.log(`${i + 1}. ${todo.done ? "✔" : "❌"} ${todo.text}`);
      });
    } else {
      console.log("There is no task that matches your description");
    }

    showMenu();
  });
}

// 9. Sort task
function sortTask() {
  rl.question(
    "How do you want to sort your tasks (Deadline, Category, Status): ",
    (sort) => {
      const choice = sort.trim().toLowerCase();

      if (choice === "") {
        console.log("Enter how you want to sort");
        return showMenu();
      }

      if (choice === "deadline") {
        todos.sort((a, b) => {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;

          return new Date(a.deadline) - new Date(b.deadline);
        });
        console.log("\nTasks sorted by deadline (earliest first)!");
        viewTasks();
      } else if (choice === "category") {
        todos.sort((a, b) => {
          const catA = a.category || "";
          const catB = b.category || "";

          return catA.localeCompare(catB);
        });
        console.log("\nTasks sorted alphabetically by category!");
        viewTasks();
      } else if (choice === "status") {
        todos.sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));
        console.log("\nTasks sorted by status (uncompleted first)!");
        viewTasks();
      } else {
        console.log(
          "Invalid sorting option. Please choose Deadline, Category, or Status.",
        );
      }
    },
  );
}

// Show menu
function showMenu() {
  console.log(`
====================================
        TO-DO LIST
====================================
1. Add Task
2. View Task
3. Toggle Task Done/Undone
4. Edit Task
5. Delete Task
6. Filter by Category
7. Filter by Deadline
8. Search Task
9. Sort Task
0. Exit
--------------------------------------
        `);

  rl.question("Choose an option: ", (choice) => {
    switch (choice) {
      case "1":
        addTask();
        break;
      case "2":
        viewTasks();
        break;
      case "3":
        toggleTask();
        break;
      case "4":
        editTask();
        break;
      case "5":
        deleteTask();
        break;
      case "6":
        filterByCategory();
        break;
      case "7":
        filterByDeadline();
        break;
      case "8":
        searchTask();
        break;
      case "9":
        sortTask();
        break;
      case "0":
        console.log("Goodbye");
        rl.close();
        break;
      default:
        console.log("Invalid option. Try again.");
        showMenu();
    }
  });
}

loadTasks();
showMenu();
