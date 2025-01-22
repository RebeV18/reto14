//Se importan los paquetes necesarios para este proyecto
const yargs = require("yargs");
const fs = require("fs");
const readline = require("readline");

//Se llama el archivo json de tareas
const dbFile = "./tasks.json";

// Aseguramos que existe un archivo dbFile para guardar las tareas
if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, JSON.stringify([]));
}

//Funcion para leer las tareas que contiene el archivo tasks.json
const readTasks = () => {
  const tasks = JSON.parse(fs.readFileSync(dbFile));
  return tasks;
};

const saveTasks = (tasks) => {
  fs.writeFileSync(dbFile, JSON.stringify(tasks, null, 2));
};

// Definir comandos con yargs
//Comando 'crear' para crear y agregar una tarea al archivo de tareas tasks.json
yargs
  .command(
    "crear <tarea>",
    "Crea una nueva tarea",
    (yargs) => {
      yargs.positional("tarea", {
        describe: "Descripción de la tarea",
        type: "string",
      });
    },
    (argv) => {
      const tasks = readTasks();
      const maxId =
        tasks.length > 0 ? Math.max(...tasks.map((task) => task.id)) : 0;
      const newTask = { id: maxId + 1, tarea: argv.tarea };
      tasks.push(newTask);
      saveTasks(tasks);
      console.log("✅ Tarea creada correctamente.");
    }
  )

  //Comando 'imprimir' para mostrar las tareas que contiene el archivo tasks.json
  .command("imprimir", "Lee todas las tareas", () => {
    const tasks = readTasks();
    console.log("📋 Lista de tareas:");
    tasks.forEach((task) => console.log(`${task.id}. ${task.tarea}`));
  })

  //Comando 'editar' para alterar una de las tareas del archivo de tareas por ID
  .command(
    "editar <id> <tarea>",
    "Editar o actualizar una tarea por ID",
    (yargs) => {
      yargs
        .positional("id", {
          describe: "ID de la tarea a actualizar",
          type: "number",
        })
        .positional("tarea", {
          describe: "Nueva descripción de la tarea",
          type: "string",
        });
    },
    (argv) => {
      const tasks = readTasks();
      const updatedTasks = tasks.map((task) =>
        task.id === argv.id ? { ...task, tarea: argv.tarea } : task
      );
      saveTasks(updatedTasks);
      console.log("✅ Tarea actualizada correctamente.");
    }
  )

    //Comando 'eliminar' para eliminar una de las tareas del archivo de tareas por ID
  .command(
    "eliminar <id>",
    "Elimina una tarea por ID",
    (yargs) => {
      yargs.positional("id", {
        describe: "ID de la tarea a eliminar",
        type: "number",
      });
    },
    (argv) => {
      const tasks = readTasks();
      const taskExists = tasks.some((task) => task.id === argv.id);
      if (taskExists) {
        const updatedTasks = tasks.filter((task) => task.id !== argv.id);
        saveTasks(updatedTasks);
        console.log(`✅ Tarea con ID ${argv.id} eliminada.`);
      } else {
        console.log(`❌ No se encontró una tarea con ID ${argv.id}.`);
      }
    }
  )
  .help().argv;

// Función para mostrar el menú
function showMenu() {
  console.log(`
Seleccione una opción:
1. Crear tarea
2. Mostrar tareas
3. Editar o actualizar una tarea
4. Eliminar tarea
5. Salir
`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Seleccione una opción: ", (option) => {
    switch (option) {
      case "1":
        rl.question("Nueva tarea: ", (tarea) => {
          yargs.parse(["crear", tarea]);
          rl.close();
          showMenu();
        });
        break;
      case "2":
        yargs.parse(["imprimir"]);
        rl.close();
        showMenu();
        break;
      case "3":
        rl.question("ID de la tarea a editar: ", (id) => {
          rl.question("Nueva descripción de la tarea: ", (tarea) => {
            yargs.parse(["editar", id, tarea]);
            rl.close();
            showMenu();
          });
        });
        break;
      case "4":
        rl.question("ID de la tarea a eliminar: ", (id) => {
          const tasks = readTasks();
          const taskExists = tasks.some((task) => task.id === parseInt(id));
          if (taskExists) {
            yargs.parse(["eliminar", id]);
          } else {
            console.log(`❌ No se encontró una tarea con ID ${id}.`);
          }
          rl.close();
          showMenu();
        });
        break;
      case "5":
        console.log("👋 Saliendo...");
        rl.close();
        break;
      default:
        console.log("Opción no válida");
        rl.close();
        showMenu();
        break;
    }
  });
}

//Se llama a la función showMenu para iniciar el menú
showMenu();