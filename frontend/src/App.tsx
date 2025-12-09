import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UserList from "./components/userList";
import RewardList from "./components/rewardList";
import PreferenceList from "./components/preferenceList";
import PreferenceListB from "./components/preferenceListB";
import UserRewardList from "./components/userRewardList";
import AuthPage from "./components/auth";
import Layout from "./layout";
import { ServiceWorker } from "./serviceWorker";
import Shortcuts from "./components/shortcuts";
import Register from "./components/register";
import TaskForm from "./components/taskForm";
import TaskManager from "./components/taskManager";
import TaskFormB from "./components/taskFormB";

import PreferenceForm from "./components/preferenceForm";
import Profile from "./components/profile";
import { PreferencesProvider } from "./components/PreferencesContext";

export function showNotification(title: string, body: string) {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else {
    console.log("Notification permission not granted");
  }
}

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const IS_PRODUCTION = process.env.REACT_APP_IS_PRODUCTION === "true";

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
              <Route path="/preferences2" element={<PreferenceListB />} />
              <Route path="/preferences/add" element={<PreferenceForm />} />
              <Route path="/preferences/edit/:id" element={<PreferenceForm />}/>
              <Route path="/rewards" element={<RewardList />} />
              <Route path="/users" element={<UserList />} />
              <Route path="/myRewards" element={<UserRewardList />} />

              {/* TASKI – A VERZIJA */}
              <Route path="/tasks" element={<TaskManager />} />
              <Route path="/tasks/add" element={<TaskForm />} />
              <Route path="/tasks/edit/:id" element={<TaskForm />} />

              {/* TASKI – B VERZIJA */}
              <Route path="/tasks/add2" element={<TaskFormB />} />
              <Route path="/tasks/edit/:id" element={<TaskFormB />} />
              <Route path="/shortcuts" element={<Shortcuts />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </div>
    </PreferencesProvider>
  );
}

export default App;