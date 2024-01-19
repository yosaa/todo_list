const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const fs = require('fs/promises');
const path = require('path');

const app = express();
const port = 9995;
app.use(cors()); 
app.use(bodyParser.json());

const dataFilePath = path.join(__dirname, 'tasks.json');

app.get('/tasks', async (req, res) => {
    try {
        const data = await fs.readFile(dataFilePath, 'utf-8');
        const tasks = JSON.parse(data);

        const incompleteTasks = tasks.filter(task => !task.completed);

        const sortedTasks = incompleteTasks.sort((a, b) => {
            const dateComparison = b.sort - a.sort;
            return dateComparison;
        });

        res.json(sortedTasks);
    } catch (error) {
        console.error('Error reading tasks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.post('/addTask', async (req, res) => {
    try {
        const task = req.body;
        
        task.timestamp = new Date().toISOString(); 
        const data = await fs.readFile(dataFilePath, 'utf-8');
        const tasks = JSON.parse(data);
        tasks.push(task);
        await fs.writeFile(dataFilePath, JSON.stringify(tasks, null, 2));
        res.json({ success: true, id: task.id });
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.post('/toggleCompletion', async (req, res) => {
    try {
        const taskId = req.body.id; 
        const data = await fs.readFile(dataFilePath, 'utf-8');
        const tasks = JSON.parse(data);
        const taskIndex = tasks.findIndex(task => task.id == taskId);

        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            await fs.writeFile(dataFilePath, JSON.stringify(tasks, null, 2));
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (error) {
        console.error('Error toggling completion:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/togglePriority',async (req, res) => {
    const taskId = req.body.id;
    const priority = req.body.priority;
    const data = await fs.readFile(dataFilePath, 'utf-8');
    const tasks = JSON.parse(data);
    const taskIndex = tasks.findIndex(task => task.id == taskId);

    if (taskIndex !== -1) {
        tasks[taskIndex].sort = priority;
        await fs.writeFile(dataFilePath, JSON.stringify(tasks, null, 2));
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Task not found' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
