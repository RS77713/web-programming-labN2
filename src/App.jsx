import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'midnight-mission-board-tasks'

const starterTasks = [
  {
    id: 'starter-1',
    title: 'Confirm the project passport',
    priority: 'low',
    completed: true,
  },
  {
    id: 'starter-2',
    title: 'Design the React component structure',
    priority: 'high',
    completed: false,
  },
  {
    id: 'starter-3',
    title: 'Prepare the local deployment screenshot',
    priority: 'medium',
    completed: false,
  },
]

const filters = ['all', 'active', 'completed']

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY)

    if (!savedTasks) {
      return starterTasks
    }

    const parsedTasks = JSON.parse(savedTasks)
    return Array.isArray(parsedTasks) ? parsedTasks : starterTasks
  } catch {
    return starterTasks
  }
}

function App() {
  const [tasks, setTasks] = useState(loadTasks)
  const [taskTitle, setTaskTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('all')
  const [formError, setFormError] = useState('')
  const [pageOpenedAt] = useState(() => new Date())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const completedCount = tasks.filter((task) => task.completed).length
  const activeCount = tasks.length - completedCount
  const completionRate = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0

  const visibleTasks = useMemo(() => {
    if (filter === 'active') {
      return tasks.filter((task) => !task.completed)
    }

    if (filter === 'completed') {
      return tasks.filter((task) => task.completed)
    }

    return tasks
  }, [filter, tasks])

  const currentHour = pageOpenedAt.getHours()
  const greeting = currentHour < 12 ? 'Morning shift' : currentHour < 18 ? 'Day shift' : 'Night shift'
  const today = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(pageOpenedAt)

  const missionMessage =
    tasks.length === 0
      ? 'The board is clear. Add the first mission.'
      : activeCount === 0
        ? 'All missions completed. Excellent work.'
        : `${activeCount} mission${activeCount === 1 ? '' : 's'} still in orbit.`

  function addTask(event) {
    event.preventDefault()
    const cleanTitle = taskTitle.trim()

    if (!cleanTitle) {
      setFormError('Write a mission before adding it to the board.')
      return
    }

    const newTask = {
      id: crypto.randomUUID(),
      title: cleanTitle,
      priority,
      completed: false,
    }

    setTasks((currentTasks) => [newTask, ...currentTasks])
    setTaskTitle('')
    setFormError('')
  }

  function toggleTask(taskId) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  function removeTask(taskId) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    )
  }

  function clearCompleted() {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => !task.completed),
    )
  }

  return (
    <div className="app-shell">
      <header className="container py-4 py-lg-5">
        <nav className="topbar" aria-label="Main navigation">
          <a className="brand" href="#top" aria-label="Midnight Mission Board home">
            <span className="brand-mark">M</span>
            <span>
              <strong>Midnight</strong>
              <small>Mission Board</small>
            </span>
          </a>

          <div className="system-status">
            <span className="status-dot" aria-hidden="true"></span>
            Local system online
          </div>
        </nav>

        <section className="mission-hero" id="top">
          <div className="row align-items-end g-4">
            <div className="col-lg-8">
              <p className="eyebrow">{greeting} / {today}</p>
              <h1>Put every mission<br />on a clear flight path.</h1>
              <p className="hero-copy">
                Plan the work, set its urgency and watch the board move from
                idea to completed mission.
              </p>
            </div>

            <div className="col-lg-4">
              <div className="hero-signal">
                <span>Current signal</span>
                <strong>{missionMessage}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="row g-3 mt-2" aria-label="Mission statistics">
          <div className="col-6 col-lg-3">
            <div className="metric-card">
              <span>Total</span>
              <strong>{tasks.length.toString().padStart(2, '0')}</strong>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="metric-card">
              <span>Active</span>
              <strong>{activeCount.toString().padStart(2, '0')}</strong>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="metric-card">
              <span>Completed</span>
              <strong>{completedCount.toString().padStart(2, '0')}</strong>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="metric-card accent-metric">
              <span>Progress</span>
              <strong>{completionRate}%</strong>
            </div>
          </div>
        </section>
      </header>

      <main className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-8">
            <section className="section-card composer-card">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">New entry</p>
                  <h2>Launch a mission</h2>
                </div>
                <span className="shortcut-hint">Enter to add</span>
              </div>

              <form onSubmit={addTask} noValidate>
                <div className="row g-3">
                  <div className="col-md-7">
                    <label className="form-label" htmlFor="taskTitle">Mission name</label>
                    <input
                      className={`form-control mission-input ${formError ? 'is-invalid' : ''}`}
                      id="taskTitle"
                      type="text"
                      value={taskTitle}
                      onChange={(event) => {
                        setTaskTitle(event.target.value)
                        setFormError('')
                      }}
                      placeholder="What needs to enter orbit?"
                      maxLength="80"
                      autoComplete="off"
                    />
                    {formError && <div className="invalid-feedback">{formError}</div>}
                  </div>

                  <div className="col-md-3">
                    <label className="form-label" htmlFor="priority">Priority</label>
                    <select
                      className="form-select mission-input"
                      id="priority"
                      value={priority}
                      onChange={(event) => setPriority(event.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="col-md-2 d-flex align-items-end">
                    <button className="btn launch-button w-100" type="submit">
                      Add
                    </button>
                  </div>
                </div>
              </form>
            </section>

            <section className="section-card board-card mt-4">
              <div className="section-heading board-heading">
                <div>
                  <p className="section-kicker">Flight queue</p>
                  <h2>Mission board</h2>
                </div>

                <div className="filter-group" aria-label="Filter missions">
                  {filters.map((filterName) => (
                    <button
                      className={filter === filterName ? 'active' : ''}
                      key={filterName}
                      type="button"
                      onClick={() => setFilter(filterName)}
                    >
                      {filterName}
                    </button>
                  ))}
                </div>
              </div>

              <div className="task-list" aria-live="polite">
                {visibleTasks.length > 0 ? (
                  visibleTasks.map((task) => (
                    <article
                      className={`task-card ${task.completed ? 'completed' : ''}`}
                      key={task.id}
                    >
                      <button
                        className="task-check"
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        aria-label={task.completed ? `Mark ${task.title} as active` : `Complete ${task.title}`}
                        aria-pressed={task.completed}
                      >
                        <span aria-hidden="true">{task.completed ? '✓' : ''}</span>
                      </button>

                      <div className="task-copy">
                        <h3>{task.title}</h3>
                        <span className={`priority-badge ${task.priority}`}>
                          {task.priority} priority
                        </span>
                      </div>

                      <button
                        className="remove-button"
                        type="button"
                        onClick={() => removeTask(task.id)}
                        aria-label={`Remove ${task.title}`}
                      >
                        Remove
                      </button>
                    </article>
                  ))
                ) : (
                  <div className="empty-state">
                    <span>00</span>
                    <h3>No missions in this view</h3>
                    <p>Change the filter or add a new mission above.</p>
                  </div>
                )}
              </div>

              <div className="board-footer">
                <span>{visibleTasks.length} shown / {tasks.length} total</span>
                <button
                  type="button"
                  onClick={clearCompleted}
                  disabled={completedCount === 0}
                >
                  Clear completed
                </button>
              </div>
            </section>
          </div>

          <aside className="col-lg-4">
            <section className="section-card pulse-card">
              <p className="section-kicker">Live overview</p>
              <h2>Mission pulse</h2>

              <div
                className="progress-orbit"
                style={{ '--progress-angle': `${completionRate * 3.6}deg` }}
                role="img"
                aria-label={`${completionRate} percent of missions completed`}
              >
                <div>
                  <strong>{completionRate}%</strong>
                  <span>complete</span>
                </div>
              </div>

              <div className="progress-bar-track" aria-hidden="true">
                <span style={{ width: `${completionRate}%` }}></span>
              </div>

              <p className="pulse-message">{missionMessage}</p>
            </section>

            <section className="section-card notes-card mt-4">
              <p className="section-kicker">Board protocol</p>
              <h2>Three simple rules</h2>
              <ol className="protocol-list">
                <li>
                  <span>01</span>
                  <p>Write one clear action for every mission.</p>
                </li>
                <li>
                  <span>02</span>
                  <p>Use priority to protect the most important work.</p>
                </li>
                <li>
                  <span>03</span>
                  <p>Complete or remove tasks to keep the board useful.</p>
                </li>
              </ol>
            </section>
          </aside>
        </div>
      </main>

      <footer className="container footer-row">
        <span>Midnight Mission Board</span>
        <span>React / Vite / Bootstrap</span>
      </footer>
    </div>
  )
}

export default App
