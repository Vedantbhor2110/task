# My Tasks App – Vedant Bhor

A simple React Native to-do app built with Expo. Add, complete, and delete tasks with local notifications and persistent storage using AsyncStorage.

## 🔧 Features

- Add tasks with one click
- Mark tasks as completed
- Delete tasks
- Local push notifications (reminds you after 10 seconds)
- Persistent storage with AsyncStorage

## 🚀 How to Run

### 1. Clone the Repo

```bash
git clone https://github.com/Vedantbhor2110/task.git
cd task

'''bash
npm install
npx expo start

'''Dependancies
npm install @react-native-async-storage/async-storage expo-notifications expo-device

**Design & Challenges**
_Used AsyncStorage to persist tasks even after app restarts.

Integrated local notifications using expo-notifications, but faced limitations in Expo Go for remote push notifications (SDK 53).

Clean UI with basic error handling for empty task input.

Used FlatList and useState/useEffect for state management and rendering tasks dynamically.
_
