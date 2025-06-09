import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function App() {
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [priority, setPriority] = useState('Medium');

  useEffect(() => {
    loadTasks();
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    if (Device.isDevice) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission not granted for notifications');
      }
    }
  };

  const loadTasks = async () => {
    const data = await AsyncStorage.getItem('tasks');
    if (data) {
      setTasks(JSON.parse(data));
    }
  };

  const saveTasks = async (updatedTasks) => {
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const scheduleNotification = async (taskName, taskId) => {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Reminder',
        body: `Time to complete: ${taskName}`,
      },
      trigger: { seconds: 5 },
    });
    return id;
  };

  const cancelNotification = async (notifId) => {
    if (notifId) {
      await Notifications.cancelScheduledNotificationAsync(notifId);
    }
  };

  const addTask = async () => {
    if (taskText.trim() === '') {
      Alert.alert('Task cannot be empty');
      return;
    }

    if (editIndex !== null) {
      const updatedTasks = [...tasks];
      updatedTasks[editIndex].text = taskText;
      updatedTasks[editIndex].priority = priority;
      setTasks(updatedTasks);
      setEditIndex(null);
      setTaskText('');
      setPriority('Medium');
      saveTasks(updatedTasks);
    } else {
      const notifId = await scheduleNotification(taskText);
      const newTask = {
        text: taskText,
        completed: false,
        priority: priority,
        notifId: notifId,
      };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      setTaskText('');
      setPriority('Medium');
      saveTasks(updatedTasks);
    }
  };

  const toggleComplete = async (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;

    // Cancel notification if marked complete
    if (updatedTasks[index].completed) {
      await cancelNotification(updatedTasks[index].notifId);
    }

    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const deleteTask = async (index) => {
    const updatedTasks = [...tasks];
    const notifId = updatedTasks[index].notifId;
    await cancelNotification(notifId);
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const editTask = (index) => {
    setTaskText(tasks[index].text);
    setPriority(tasks[index].priority);
    setEditIndex(index);
  };

  const renderPriority = (p) => {
    switch (p) {
      case 'High':
        return '🔴';
      case 'Medium':
        return '🟡';
      case 'Low':
        return '🟢';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 My Tasks App</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter task..."
        value={taskText}
        onChangeText={setTaskText}
      />

      <View style={styles.priorityRow}>
        {['High', 'Medium', 'Low'].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.priorityButton,
              priority === level && styles.selectedPriority,
            ]}
            onPress={() => setPriority(level)}
          >
            <Text>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={addTask}>
        <Text style={styles.addButtonText}>
          {editIndex !== null ? 'Update Task' : 'Add Task'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={tasks}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.taskItem}>
            <TouchableOpacity onPress={() => toggleComplete(index)}>
              <Text
                style={[
                  styles.taskText,
                  item.completed && styles.completedText,
                ]}
              >
                {renderPriority(item.priority)} {item.text}
              </Text>
            </TouchableOpacity>

            <View style={styles.buttons}>
              <TouchableOpacity onPress={() => editTask(index)}>
                <Text style={styles.edit}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTask(index)}>
                <Text style={styles.delete}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: { color: '#fff', fontSize: 16 },
  taskItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskText: { fontSize: 16 },
  completedText: { textDecorationLine: 'line-through', color: '#888' },
  buttons: { flexDirection: 'row', gap: 10 },
  delete: { fontSize: 18, marginLeft: 10 },
  edit: { fontSize: 18 },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  priorityButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#eee',
    width: '30%',
    alignItems: 'center',
  },
  selectedPriority: { backgroundColor: '#d1e7dd' },
});
