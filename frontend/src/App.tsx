import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UserList from "./components/userList.tsx";
import RewardList from "./components/rewardList.tsx";
import PreferenceList from "./components/preferenceList.tsx";
import UserRewardList from "./components/userRewardList.tsx";
import AuthPage from "./components/auth.tsx";
import Layout from "./layout.tsx";
import { ServiceWorker } from "./serviceWorker.tsx";
import Shortcuts from "./components/shortcuts.tsx";
import Register from "./components/register.tsx";
import TaskForm from "./components/taskForm.tsx";
import PreferenceForm from "./components/preferenceForm.tsx";
import Profile from "./components/profile.tsx";
import TaskManager from "./components/taskManager.tsx";
import { PreferencesProvider } from "./components/PreferencesContext.tsx";
export function showNotification(title: string, body: string) {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else {
    console.log("Notification permission not granted");
  }
}
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  ServiceWorker();

  return (
    <PreferencesProvider>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/register" element={<Register />} />

            <Route element={<Layout />}>
              <Route path="/preferences" element={<PreferenceList />} />
              <Route path="/preferences/add" element={<PreferenceForm />} />
              <Route
                path="/preferences/edit/:id"
                element={<PreferenceForm />}
              />
              <Route path="/rewards" element={<RewardList />} />
              <Route path="/users" element={<UserList />} />
              <Route path="/tasks/add" element={<TaskForm />} />
              <Route path="/tasks/edit/:id" element={<TaskForm />} />
              <Route path="/myRewards" element={<UserRewardList />} />
              <Route path="/shortcuts" element={<Shortcuts />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/tasks" element={<TaskManager />} />
            </Route>
          </Routes>
        </Router>
      </div>
    </PreferencesProvider>
  );
}

export default App;
