const apiEndpoint = "https://webapp-210-300621-toffel-arthur-hehje6c4frfxh9gd.northeurope-01.azurewebsites.net/api/tasks";

const images = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL1ARFUTwD-EhOZd_iyaLJV2yNqNFnWLxuPQ&s",
  "https://i.scdn.co/image/ab67616d00001e02058cef855b9270278a29ab4c"
];

let changeImageCounter = 0;

$(document).ready(function () {
  loadTasks();

  // Ajouter une tâche
  $("#todo-form").on("submit", async function (e) {
    e.preventDefault();
    changeImage();
    const description = $("#todo-input").val().trim();
    if (description === "") return;

    const task = { description: description };

    $("#todo-input, button").prop("disabled", true);

    try {
      await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });

      $("#todo-input").val("");
      await loadTasks();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la tâche :", error);
    } finally {
      $("#todo-input, button").prop("disabled", false);
    }
  });

  // Changer l'état de la tâche (à faire <-> réalisée)
  $("#todo-list, #completed-list").on("click", ".task-toggle", async function () {
    const $taskElement = $(this).closest("li");
    const taskId = $taskElement.data("id");
    const isCompleted = $taskElement.hasClass("completed");

    const description = $taskElement.contents().filter(function () {
      return this.nodeType === 3;
    }).text().trim();

    if (!description) {
      console.error("Erreur : la description de la tâche est vide !");
      return;
    }

    const updatedTask = { id: taskId, description: description, completed: !isCompleted };

    try {
      await fetch(apiEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });
      await loadTasks();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche :", error);
    }
  });

  // Supprimer une tâche
  $("#todo-list, #completed-list").on("click", ".delete-btn", async function (e) {
    e.stopPropagation();
    const taskId = $(this).parent().data("id");

    try {
      await fetch(`${apiEndpoint}?id=${taskId}`, {
        method: "DELETE",
      });
      await loadTasks();
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche :", error);
    }
  });

  // Charger les tâches depuis l'API
  async function loadTasks() {
    try {
      const response = await fetch(apiEndpoint);
      const tasks = await response.json();
      tasks.sort((a, b) => a.completed - b.completed);

      $("#todo-list").empty();
      $("#completed-list").empty();

      tasks.forEach((task) => {
        const listItem = $("<li>")
          .text(task.description)
          .data("id", task.id)
          .addClass(task.completed ? "completed" : "")
          .append(
            $("<button>")
              .text("Delete")
              .addClass("delete-btn")
          )
          .prepend(
            $("<input>")
              .attr("type", "checkbox")
              .addClass("task-toggle")
              .prop("checked", task.completed)
          );

        // Ajout de la tâche à la bonne liste
        if (task.completed) {
          $("#completed-list").append(listItem);
        } else {
          $("#todo-list").append(listItem);
        }

        // Animation fluide pour l'apparition de la tâche
        setTimeout(() => {
          listItem.addClass("show");
        }, 100);
      });
    } catch (error) {
      console.error("Erreur lors du chargement des tâches :", error);
    }
  }

  // Fonction pour changer l'image toutes les deux fois
  function changeImage() {
    changeImageCounter++;
    const imageIndex = changeImageCounter % 2; // Alterne entre 0 et 1
    $("#alpha-image").attr("src", images[imageIndex]);
  }
});
